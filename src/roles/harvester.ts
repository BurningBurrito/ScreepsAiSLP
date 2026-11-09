/**
 * Harvester role: mine energy from sources and deliver it to structures.
 *
 * Two phases, selected by the store and the source state:
 *  1. Harvest phase: harvest the source assigned at spawn. The assignment
 *     stays stable even when the source depletes - a stable target is what
 *     lets the engine's path cache work, and re-targeting every tick would
 *     re-run expensive pathfinding. When the assigned source runs dry, the
 *     harvester flips to the closest active source (position-based, no
 *     pathfinding) so the room keeps its income; when both are dry it waits
 *     at the assigned source, which refills on the 300-tick cycle.
 *  2. Delivery phase (store full, or a partial load at a dry source): fill
 *     the spawn first (creeps must stay alive), then the extensions, then
 *     a tower only while it is below its attack reserve
 *     (TOWER_ENERGY_RESERVE - the 500 energy / 50 shots the tower manager
 *     keeps for defence, see towerManager.ts); whatever nothing can take is
 *     dropped on the ground so a builder can pick it up.
 *
 * Every move goes through utils/moveToToward, which drops the creep's cached
 * path (memory._move) when it keeps replaying a blocked one. The role does
 * NOT pass ignoreCreeps: true to pathfinding: with creeps as obstacles, a
 * recomputed path routes around a parked creep instead of re-targeting the
 * tile it occupies - that combination is what froze the RCL1 harvester on
 * the builder's tile.
 */

import {
    MAX_DELIVERY_ATTEMPTS,
    PARTIAL_DELIVERY_FRACTION,
    TOWER_ENERGY_RESERVE
} from "config";
import { moveToToward } from "utils/movement";
import { pickSourceClosestTo } from "utils/pickSource";

/**
 * Runs the harvester creep behavior for one tick.
 * @param creep The harvester creep to run
 */
export function runHarvester(creep: Creep): void
{
    const room = creep.room;
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;
    const capacity = creep.store.getCapacity(RESOURCE_ENERGY);

    // Pick the harvest target once per tick: one room.find, reused for the
    // assignment lookup and the active-source fallback. (The old code ran
    // findClosestByPath - full pathfinding - every tick for unassigned
    // creeps to make the same decision.)
    const sources = room.find(FIND_SOURCES);
    const assignedSource = creep.memory.sourceId !== undefined
        ? sources.find((candidate) => candidate.id === creep.memory.sourceId)
        : undefined;
    const activeSources = sources.filter((candidate) => candidate.energy > 0);
    const source = (assignedSource !== undefined && assignedSource.energy > 0)
        ? assignedSource
        : (activeSources.length > 0
            ? pickSourceClosestTo(activeSources, creep.pos)
            : (assignedSource ?? null));

    // Keep the assignment in memory so the creep does not flip between
    // sources when one runs dry or the code is restarted (global reset):
    // the next tick must resolve the same source from its id alone. The
    // assignment is only written for the source the creep already owns (or
    // for a first assignment): while the owned source is dry the creep works
    // the other one temporarily and must not claim it.
    if (source !== null && (assignedSource === undefined || source.id === assignedSource.id))
    {
        creep.memory.sourceId = source.id;
    }

    // Phase switch. Deliver when full, or when the source ran dry and the
    // load is worth carrying (PARTIAL_DELIVERY_FRACTION): idling here with a
    // half-full store until the refill wastes the round trip either way.
    // A null source (no sources at all) can never be dry, so it is ignored
    // here; a carried load still reaches the delivery phase below.
    const sourceDry = source !== null && source.energy === 0;
    const partialWorthDelivering =
        sourceDry && energy >= capacity * PARTIAL_DELIVERY_FRACTION;
    if (!creep.memory.working && (energy >= capacity || partialWorthDelivering))
    {
        creep.memory.working = true;
    }
    else if (creep.memory.working && energy === 0)
    {
        creep.memory.working = false;
    }

    if (!creep.memory.working)
    {
        if (source === null)
        {
            return; // nowhere to harvest and nothing worth delivering
        }
        const harvestResult = creep.harvest(source);
        if (harvestResult === ERR_NOT_IN_RANGE && creep.pos.getRangeTo(source) > 1)
        {
            moveToToward(creep, source, 1);
        }
        // ERR_NOT_IN_RANGE in range (the source moved under a mid-tick step)
        // or ERR_NOT_ENOUGH_RESOURCES (dry source): stand here and retry -
        // the source refills on its 300-tick cycle and the phase switch
        // above handles the dry-source-with-partial-load case.
        return;
    }

    // If full, transfer energy: spawns first (creeps must stay alive), then
    // the extensions, then a tower below its attack reserve, then drop.

    // Try to transfer to spawns first
    const spawns = creep.room.find(FIND_MY_SPAWNS);
    let deliveredToSpawn = false;
    
    // Track delivery attempts to prevent frozen harvester
    const deliveryAttempts = creep.memory.deliveryAttempts || 0;
    
    for (const spawn of spawns)
    {
        const freeCapacity = spawn.store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity !== null && freeCapacity > 0)
        {
            const transferResult = creep.transfer(spawn, RESOURCE_ENERGY);
            if (transferResult === ERR_NOT_IN_RANGE)
            {
                const moveResult = moveToToward(creep, spawn, 1);
                // Only ERR_NO_PATH means "cannot reach"; ERR_TIRED/ERR_BUSY/other means try again next tick
                if (moveResult === ERR_NO_PATH)
                {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.working = false;
                    creep.memory.deliveryAttempts = 0;
                    return;
                }
                // Increment delivery attempts for tracking
                creep.memory.deliveryAttempts = deliveryAttempts + 1;
                // If we've been trying for too long, drop energy and reset
                if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.working = false;
                    creep.memory.deliveryAttempts = 0;
                    return;
                }
                // If moveTo returned anything else (OK, ERR_TIRED, ERR_BUSY, or undefined),
                // try again next tick - don't drop energy or continue to next target
                return;
            }
            else if (transferResult === OK)
            {
                deliveredToSpawn = true;
                creep.memory.deliveryAttempts = 0; // Reset on success
                if (creep.store[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.working = false; // store empty: gather again
                }
            }
            // If ERR_FULL, the spawn is full but we're in range - this shouldn't happen if freeCapacity > 0
            // But handle it just in case
            break; // Only try one spawn
        }
    }
    
    // Reset delivery attempts if we successfully delivered
    if (deliveredToSpawn)
    {
        creep.memory.deliveryAttempts = 0;
    }
    
    // M4 delivery order: spawn, then extensions, then a tower that has
    // dropped below its attack reserve, and drop what nothing can take.
    // The tower's reserve (TOWER_ENERGY_RESERVE = 500 energy, 50 shots) is
    // the buffer the tower manager burns on defence; energy above the
    // reserve belongs to the economy, and a tower only dips below it while
    // it is actually fighting.
    if (!deliveredToSpawn && creep.store[RESOURCE_ENERGY] > 0)
    {
        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: (structure): structure is StructureExtension => structure.structureType === STRUCTURE_EXTENSION,
        });
        let deliveredToExtension = false;
        for (const extension of extensions)
        {
            const freeCapacity = extension.store.getFreeCapacity(RESOURCE_ENERGY);
            if (freeCapacity !== null && freeCapacity > 0)
            {
                const transferResult = creep.transfer(extension, RESOURCE_ENERGY);
                if (transferResult === ERR_NOT_IN_RANGE)
                {
                    const moveResult = moveToToward(creep, extension, 1);
                    // Only ERR_NO_PATH means "cannot reach"; ERR_TIRED/ERR_BUSY/other means try again next tick
                    if (moveResult === ERR_NO_PATH)
                    {
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.working = false;
                        creep.memory.deliveryAttempts = 0;
                        return;
                    }
                    // Increment delivery attempts for tracking
                    creep.memory.deliveryAttempts = deliveryAttempts + 1;
                    // If we've been trying for too long, drop energy and reset
                    if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                    {
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.working = false;
                        creep.memory.deliveryAttempts = 0;
                        return;
                    }
                    // If moveTo returned anything else, try again next tick
                    return;
                }
                else if (transferResult === OK)
                {
                    deliveredToExtension = true;
                    creep.memory.deliveryAttempts = 0; // Reset on success
                    if (creep.store[RESOURCE_ENERGY] === 0)
                    {
                        creep.memory.working = false; // store empty: gather again
                    }
                }
                break; // Only try one extension
            }
        }

        // A tower takes energy only while it is below the attack reserve:
        // topping it above the reserve would steal energy from the
        // extensions the room actually grows with.
        if (!deliveredToExtension && creep.store[RESOURCE_ENERGY] > 0)
        {
            const towers = creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER,
            });
            let deliveredToTower = false;
            for (const tower of towers)
            {
                const towerEnergy = (tower as StructureTower).store.getUsedCapacity(RESOURCE_ENERGY) ?? 0;
                if (towerEnergy >= TOWER_ENERGY_RESERVE)
                {
                    continue; // Reserve full: this tower's energy is its own now
                }
                const freeCapacity = (tower as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY);
                if (freeCapacity !== null && freeCapacity > 0)
                {
                    const transferResult = creep.transfer(tower, RESOURCE_ENERGY);
                    if (transferResult === ERR_NOT_IN_RANGE)
                    {
                        const moveResult = moveToToward(creep, tower, 1);
                        // Only ERR_NO_PATH means "cannot reach"; ERR_TIRED/ERR_BUSY/other means try again next tick
                        if (moveResult === ERR_NO_PATH)
                        {
                            creep.drop(RESOURCE_ENERGY);
                            creep.memory.working = false;
                            creep.memory.deliveryAttempts = 0;
                            return;
                        }
                        // Increment delivery attempts for tracking
                        creep.memory.deliveryAttempts = deliveryAttempts + 1;
                        // If we've been trying for too long, drop energy and reset
                        if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                        {
                            creep.drop(RESOURCE_ENERGY);
                            creep.memory.working = false;
                            creep.memory.deliveryAttempts = 0;
                            return;
                        }
                        // If moveTo returned anything else, try again next tick
                        return;
                    }
                    else if (transferResult === OK)
                    {
                        deliveredToTower = true;
                        creep.memory.deliveryAttempts = 0; // Reset on success
                        if (creep.store[RESOURCE_ENERGY] === 0)
                        {
                            creep.memory.working = false; // store empty: gather again
                        }
                    }
                    break; // Only try one tower
                }
            }

            // Nothing - extensions full and every tower at its reserve -
            // could take the load: drop it so a builder can pick it up.
            if (!deliveredToTower)
            {
                creep.drop(RESOURCE_ENERGY);
                creep.memory.working = false;
                creep.memory.deliveryAttempts = 0;
                return;
            }
        }
    }
    else
    {
        // Reset delivery attempts if we're not in working mode
        creep.memory.deliveryAttempts = 0;
    }
}

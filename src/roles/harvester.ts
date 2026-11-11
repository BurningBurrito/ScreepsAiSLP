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
 *  2. Delivery phase (store full, or a partial load at a dry source): top
 *     up a tower while it is below its attack reserve
 *     (TOWER_ENERGY_RESERVE - the fixed 500 energy / 50 shot buffer the
 *     tower manager keeps for defence, see towerManager.ts), then the
 *     spawn (creeps must stay alive), then the extensions; whatever
 *     nothing can take is dropped on the ground so a builder can pick it
 *     up. The tower comes first because it is a bounded buffer: it stops
 *     taking energy the moment it reaches the reserve, so it can never
 *     starve the pool - while buried last, it only filled when the pool
 *     sat completely full, which the builder's 0.5 pool floor now
 *     prevents.
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

    // If full, transfer energy. Priority order:
    //  1. A tower below its attack reserve (TOWER_ENERGY_RESERVE). The
    //     reserve is a FIXED buffer: a one-time top-up to 500 energy (50
    //     shots, see towerManager.ts) after which the tower is skipped for
    //     the rest of the run (or until defence drains it). Filling it
    //     first is safe because it stops on its own at the reserve. Burying
    //     it behind the spawn and extensions as pure overflow meant it only
    //     ever saw energy when the whole pool sat full - and the builders
    //     now drain the pool to the 0.5 floor, so the tower never filled at
    //     all (M3 maxTowerEnergy 0).
    //  2. The spawns (creeps must stay alive).
    //  3. The extensions.
    //  4. Drop what nothing can take so a builder can pick it up.

    // Track delivery attempts to prevent a frozen harvester
    const deliveryAttempts = creep.memory.deliveryAttempts || 0;

    // 1. Tower: top it up to the attack reserve while below it.
    let deliveredToTower = false;
    const towers = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER,
    });
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
                creep.memory.deliveryAttempts = deliveryAttempts + 1;
                if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.working = false;
                    creep.memory.deliveryAttempts = 0;
                    return;
                }
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
    if (deliveredToTower)
    {
        creep.memory.deliveryAttempts = 0;
    }

    // 2. Spawns: creeps must stay alive.
    if (!deliveredToTower && creep.store[RESOURCE_ENERGY] > 0)
    {
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        let deliveredToSpawn = false;
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
                    creep.memory.deliveryAttempts = deliveryAttempts + 1;
                    if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                    {
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.working = false;
                        creep.memory.deliveryAttempts = 0;
                        return;
                    }
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
                break; // Only try one spawn
            }
        }
        if (deliveredToSpawn)
        {
            creep.memory.deliveryAttempts = 0;
        }

        // 3. Extensions: the room grows with these.
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
                        creep.memory.deliveryAttempts = deliveryAttempts + 1;
                        if (deliveryAttempts >= MAX_DELIVERY_ATTEMPTS)
                        {
                            creep.drop(RESOURCE_ENERGY);
                            creep.memory.working = false;
                            creep.memory.deliveryAttempts = 0;
                            return;
                        }
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

            // 4. Nothing - no extension had free capacity and the tower
            //    (tried first) is at its reserve - could take the load:
            //    drop it so a builder can pick it up.
            if (!deliveredToExtension)
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
        // Reset delivery attempts if we didn't attempt the economy path
        creep.memory.deliveryAttempts = 0;
    }
}

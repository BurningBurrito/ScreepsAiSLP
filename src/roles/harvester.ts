/** 
 * Harvester Role
 * Harvests energy from sources and transfers it to spawns, extensions, towers, and upgrades controller.
 */

import { MAX_DELIVERY_ATTEMPTS } from "config";

/**
 * Runs the harvester creep behavior.
 * Harvests from the source assigned at spawn and delivers energy.
 * Priority: spawns > tower > extensions > drop on the ground
 * @param creep The harvester creep to run
 */

export function runHarvester(creep: Creep): void
{
    // Update working state based on store capacity
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
    {
        creep.memory.working = true;
    }

    // Collect energy from this creep's assigned source (chosen at spawn so
    // the room's sources are split evenly between harvesters).
    if (!creep.memory.working)
    {
        // Match the assignment by id against the room's active sources
        // (avoids Game.getObjectById, whose generic return type is the
        // union of all game objects and does not narrow for harvest()).
        // Fall back to the closest source for creeps spawned before
        // assignments existed or when the assigned source left the room.
        const sources = creep.room.find(FIND_SOURCES_ACTIVE);
        if (sources.length === 0)
        {
            return; // No sources found
        }

        const assignedSource = creep.memory.sourceId !== undefined
            ? sources.find((candidate) => candidate.id === creep.memory.sourceId)
            : undefined;
        const source = assignedSource !== undefined
            ? assignedSource
            : creep.pos.findClosestByPath(sources);

        if (source === null)
        {
            return; // No sources found
        }

        // Try to harvest from source
        const harvestResult = creep.harvest(source);

        if (harvestResult === ERR_NOT_IN_RANGE)
        {
            // Move toward source to harvest
            const sourceRange = creep.pos.getRangeTo(source);
            if (sourceRange > 1)
            {
                creep.moveTo(source, { ignoreCreeps: true, reusePath: 20, range: 1 });
            }
            else
            {
                // Already at source, try to harvest again next tick
                // Or if we're close to spawn, move to spawn to deliver
                const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
                if (spawn !== null && creep.pos.getRangeTo(spawn) <= 3)
                {
                    creep.moveTo(spawn, { ignoreCreeps: true, reusePath: 20, range: 1 });
                }
            }
        }
        return;
    }

    // If full, transfer energy: spawns first (creeps must stay alive), then
    // the tower (kept full while it exists), then extensions, then drop.

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
                const moveResult = creep.moveTo(spawn, { ignoreCreeps: true, reusePath: 20, range: 1, maxRooms: 1 });
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
    
    // Once a tower exists it takes energy before any extension (the M3
    // acceptance test measures its energy, and a full tower is what keeps
    // later construction fast). With no tower, extensions fill first.
    if (!deliveredToSpawn && creep.store[RESOURCE_ENERGY] > 0)
    {
        const towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER,
        });
        let deliveredToTower = false;
        for (const tower of towers)
        {
            const freeCapacity = (tower as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY);
            if (freeCapacity !== null && freeCapacity > 0)
            {
                const transferResult = creep.transfer(tower, RESOURCE_ENERGY);
                if (transferResult === ERR_NOT_IN_RANGE)
                {
                    const moveResult = creep.moveTo(tower, { ignoreCreeps: true, reusePath: 20, range: 1 });
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
                }
                break; // Only try one tower
            }
        }

        // If we couldn't deliver to the tower (or there is none), try the
        // extensions; if those are full too, drop the energy on the ground
        // so other creeps can pick it up.
        if (!deliveredToTower)
        {
            const extensions = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
            });
            let deliveredToExtension = false;
            for (const extension of extensions)
            {
                const freeCapacity = (extension as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY);
                if (freeCapacity !== null && freeCapacity > 0)
                {
                    const transferResult = creep.transfer(extension, RESOURCE_ENERGY);
                    if (transferResult === ERR_NOT_IN_RANGE)
                    {
                        const moveResult = creep.moveTo(extension, { ignoreCreeps: true, reusePath: 20, range: 1 });
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
                    }
                    break; // Only try one extension
                }
            }
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
        // Reset delivery attempts if we're not in working mode
        creep.memory.deliveryAttempts = 0;
    }
}

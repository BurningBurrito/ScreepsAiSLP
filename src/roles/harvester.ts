/** 
 * Harvester Role
 * Harvests energy from sources and transfers it to spawns, extensions, towers, and upgrades controller.
 */

import { MAX_DELIVERY_ATTEMPTS } from "config";

/**
 * Runs the harvester creep behavior.
 * Harvests from assigned sources and delivers energy to spawns/extensions/tower.
 * Priority: spawns > extensions > tower > controller
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

    // If not working (empty store), go to spawn first to check if it has energy,
    // then harvest from source if needed
    if (!creep.memory.working)
    {
        // Find the closest source to harvest from
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

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

    // If full, transfer energy to spawns first (most accessible), then extensions, then tower, then controller

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
    
    // If we couldn't deliver to spawn (no free capacity or couldn't reach), try extensions
    if (!deliveredToSpawn && creep.store[RESOURCE_ENERGY] > 0)
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
        
        // If we couldn't deliver to extension, try tower
        if (!deliveredToExtension)
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
            // If we could not deliver to tower, drop energy on ground for other creeps to pick up
            // This ensures energy is available for building when spawns/extensions are full
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

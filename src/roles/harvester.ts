/**
 * Harvester Role
 * Harvests energy from sources and transfers it to spawns, extensions, towers, and upgrades controller.
 */

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
            // Move toward source, but stay within 3 tiles of spawn when not actively harvesting
            // to quickly transfer energy when full
            const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
            if (spawn !== null && creep.pos.getRangeTo(spawn) > 3)
            {
                creep.moveTo(spawn, { ignoreCreeps: true, range: 3 });
            }
            else
            {
                creep.moveTo(source, { ignoreCreeps: true, range: 1 });
            }
        }
        return;
    }

    // If full, transfer energy to spawns first (most accessible), then extensions, then tower, then controller

    // Try to transfer to spawns first
    const spawns = creep.room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns)
    {
        const freeCapacity = spawn.store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity !== null && freeCapacity > 0)
        {
            const transferResult = creep.transfer(spawn, RESOURCE_ENERGY);
            if (transferResult === ERR_NOT_IN_RANGE)
            {
                const moveResult = creep.moveTo(spawn, { ignoreCreeps: true, range: 1, maxRooms: 1 });
                // Only drop energy if we've been trying for a while or truly can't reach
                if (moveResult === ERR_NO_PATH || moveResult === ERR_INVALID_TARGET)
                {
                    // Track consecutive failures to avoid dropping energy prematurely
                    const failedAttempts = creep.memory.failedTransferAttempts || 0;
                    if (failedAttempts >= 3)
                    {
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.working = false;
                        creep.memory.failedTransferAttempts = 0;
                    }
                    else
                    {
                        creep.memory.failedTransferAttempts = failedAttempts + 1;
                    }
                }
                else
                {
                    // Reset failure count on successful movement attempt
                    creep.memory.failedTransferAttempts = 0;
                }
            }
            else if (transferResult === ERR_NO_PATH)
            {
                const failedAttempts = creep.memory.failedTransferAttempts || 0;
                if (failedAttempts >= 3)
                {
                    creep.drop(RESOURCE_ENERGY);
                    creep.memory.working = false;
                    creep.memory.failedTransferAttempts = 0;
                }
                else
                {
                    creep.memory.failedTransferAttempts = failedAttempts + 1;
                }
            }
            else if (transferResult === OK)
            {
                // Successful transfer, reset failure count
                creep.memory.failedTransferAttempts = 0;
            }
            return;
        }
    }

    // Try to transfer to extensions
    const extensions = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
    });
    for (const extension of extensions)
    {
        const freeCapacity = (extension as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity !== null && freeCapacity > 0)
        {
            if (creep.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(extension, { ignoreCreeps: true, range: 1 });
            }
            return;
        }
    }

    // Try to transfer to towers (keep them filled for defense and repair)
    const towers = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER,
    });
    for (const tower of towers)
    {
        const freeCapacity = (tower as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity !== null && freeCapacity > 0)
        {
            if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(tower, { ignoreCreeps: true, range: 1 });
            }
            return;
        }
    }

    // If all spawns, extensions, and towers are full, upgrade the controller
    const controller = creep.room.controller;
    if (controller !== undefined && controller !== null)
    {
        // Check if all energy storage is full before upgrading
        let allStorageFull = true;

        // Check spawn
        for (const spawn of spawns)
        {
            if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            {
                allStorageFull = false;
                break;
            }
        }

        // Check extensions
        if (allStorageFull)
        {
            for (const ext of extensions)
            {
                if ((ext as StructureExtension).store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                {
                    allStorageFull = false;
                    break;
                }
            }
        }

        // Check towers
        if (allStorageFull)
        {
            for (const tower of towers)
            {
                if ((tower as StructureTower).store.getFreeCapacity(RESOURCE_ENERGY) > 0)
                {
                    allStorageFull = false;
                    break;
                }
            }
        }

        // Only upgrade if all storage is full AND we can reach the controller
        if (allStorageFull)
        {
            const upgradeResult = creep.upgradeController(controller);
            if (upgradeResult === ERR_NOT_IN_RANGE)
            {
                // If we can't reach the controller, drop the energy and switch to harvesting
                // This prevents the harvester from standing still with full energy
                creep.drop(RESOURCE_ENERGY);
                creep.memory.working = false;
            }
            else if (upgradeResult === OK)
            {
                // Successfully upgraded, check if we're still full
                if (creep.store[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.working = false;
                }
            }
        }
        else
        {
            // Storage is not full but we couldn't find a target - drop energy and switch to harvesting
            creep.drop(RESOURCE_ENERGY);
            creep.memory.working = false;
        }
    }
    else
    {
        // No controller - drop energy and switch to harvesting
        creep.drop(RESOURCE_ENERGY);
        creep.memory.working = false;
    }
}

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

    // If not working (empty store), harvest from source
    if (!creep.memory.working)
    {
        // Find the closest source to harvest from
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source === null)
        {
            return; // No sources found
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { ignoreCreeps: true, range: 1 });
        }
        return;
    }

    // If full, transfer energy to extensions first (more accessible), then spawn, then tower, then controller

    // Try to transfer to extensions first (they're more accessible than spawn)
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
                creep.moveTo(extension);
            }
            return;
        }
    }

    // Try to transfer to spawns
    const spawns = creep.room.find(FIND_MY_SPAWNS);
    for (const spawn of spawns)
    {
        const freeCapacity = spawn.store.getFreeCapacity(RESOURCE_ENERGY);
        if (freeCapacity !== null && freeCapacity > 0)
        {
            if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(spawn);
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
                creep.moveTo(tower);
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

        // Only upgrade if all storage is full
        if (allStorageFull)
        {
            if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller, { ignoreCreeps: true, range: 0 });
            }
        }
    }
}

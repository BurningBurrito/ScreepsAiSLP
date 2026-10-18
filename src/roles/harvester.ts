/**
 * Harvester Role
 * Harvests energy from sources and transfers it to spawns and extensions.
 */

/**
 * Runs the harvester creep behavior.
 * Harvests from assigned sources and delivers energy to spawns/extensions.
 * Uses the working flag to decide between gathering energy and delivering it.
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
            creep.moveTo(source);
        }
        return;
    }

    // If full, transfer energy to spawns/extensions first, then upgrade controller
    // Try to transfer to spawns first
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
                creep.moveTo(extension);
            }
            return;
        }
    }

    // If all spawns and extensions are full, upgrade the controller
    const controller = creep.room.controller;
    if (controller !== undefined && controller !== null)
    {
        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(controller);
        }
    }
}

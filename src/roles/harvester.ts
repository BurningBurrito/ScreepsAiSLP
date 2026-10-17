/**
 * Harvester Role
 * Harvests energy from sources and transfers it to spawns and extensions.
 */

/**
 * Runs the harvester creep behavior.
 * Harvests from assigned sources and delivers energy to spawns/extensions.
 * When all spawns and extensions are full, transfers energy to the controller.
 * @param creep The harvester creep to run
 */
export function runHarvester(creep: Creep): void
{
    // Find the closest source to harvest from
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

    if (source === null)
    {
        return; // No sources found
    }

    // Harvest from the source
    if (creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        creep.moveTo(source);
        return;
    }

    // If full, transfer energy to spawns/extensions first, then controller
    if (creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity(RESOURCE_ENERGY))
    {
        // Try to transfer to spawns first
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
        {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const freeCapacity = (spawn.store as any).getFreeCapacity(RESOURCE_ENERGY) || 0;
            if (freeCapacity > 0)
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const freeCapacity = (extension as any).store?.getFreeCapacity(RESOURCE_ENERGY) || 0;
            if (freeCapacity > 0)
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
            if (creep.transfer(controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller);
            }
        }
    }
}

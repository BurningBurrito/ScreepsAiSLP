/**
 * Harvester Role
 * Harvests energy from sources and transfers it to the controller or storage.
 */

/**
 * Runs the harvester creep behavior.
 * Harvests from assigned sources and transfers energy to the controller or spawns.
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

    // If full, transfer energy to the controller for upgrading
    if (creep.carry.energy >= creep.carryCapacity)
    {
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

/**
 * Builder Role
 * Builds and repairs structures in the room.
 * If no construction sites exist, upgrades the controller instead.
 */

/**
 * Runs the builder creep behavior.
 * Builds construction sites, repairs structures, and upgrades controller when idle.
 * @param creep The builder creep to run
 */
export function runBuilder(creep: Creep): void
{
    // Find the closest construction site
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if (constructionSites.length > 0)
    {
        // Build construction sites
        const site = creep.pos.findClosestByPath(constructionSites);

        if (site !== null)
        {
            if (creep.build(site) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(site);
            }
            return;
        }
    }

    // Find the closest damaged structure to repair
    const damagedStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
        {
            return structure.hits < structure.hitsMax && structure.hits < structure.hitsMax * 0.8;
        },
    });

    if (damagedStructures.length > 0)
    {
        const structure = creep.pos.findClosestByPath(damagedStructures);

        if (structure !== null)
        {
            if (creep.repair(structure) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(structure);
            }
            return;
        }
    }

    // If no construction or repair needed, upgrade the controller
    const controller = creep.room.controller;

    if (controller !== undefined && controller !== null)
    {
        if (creep.carry.energy === 0)
        {
            // Try to get energy from spawns
            const spawns = creep.room.find(FIND_MY_SPAWNS);
            for (const spawn of spawns)
            {
                if (spawn.energy > 0)
                {
                    if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn);
                    }
                    return;
                }
            }
        }

        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(controller);
        }
    }
}

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
    // Update working state based on store capacity
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
    {
        creep.memory.working = true;
    }

    // If not working (empty store), harvest from sources
    if (!creep.memory.working)
    {
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

    // Find the closest damaged structure to repair (excluding walls and ramparts)
    // Walls and ramparts have very high HP and would swallow all energy
    const damagedStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
        {
            return structure.hits < structure.hitsMax
                && structure.structureType !== STRUCTURE_WALL
                && structure.structureType !== STRUCTURE_RAMPART;
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
        if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(controller);
        }
    }
}

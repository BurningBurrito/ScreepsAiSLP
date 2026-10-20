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
            // No active sources found, switch to working state to build if we have energy
            if (creep.store[RESOURCE_ENERGY] > 0)
            {
                creep.memory.working = true;
            }
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source);
        }
        return;
    }

    // Find the closest construction site
    // Prioritize extensions over roads
    const extensionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    });

    if (extensionSite !== null)
    {
        const result = creep.build(extensionSite);
        if (result === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(extensionSite);
        }
        else if (result === ERR_NOT_ENOUGH_RESOURCES)
        {
            // No energy to build, switch to harvesting
            creep.memory.working = false;
        }
        return;
    }

    // If no extension sites, build roads
    const roadSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });

    if (roadSite !== null)
    {
        const result = creep.build(roadSite);
        if (result === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(roadSite);
        }
        else if (result === ERR_NOT_ENOUGH_RESOURCES)
        {
            // No energy to build, switch to harvesting
            creep.memory.working = false;
        }
        return;
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
            const result = creep.repair(structure);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(structure);
            }
            else if (result === ERR_NOT_ENOUGH_RESOURCES)
            {
                // No energy to repair, switch to harvesting
                creep.memory.working = false;
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

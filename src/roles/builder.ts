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

    // Try to build the closest construction site, but skip sites that cause ERR_INVALID_TARGET
    // We track which sites to skip in Memory for this tick (since sites can change between ticks)
    const skipSiteId = creep.memory.skipSiteId ;

    // Find all construction sites, sorted by distance
    const allSites = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);

    if (allSites === null)
    {
        // No sites, try repair or upgrade
        return;
    }

    // Build the closest valid site
    let site: ConstructionSite<BuildableStructureConstant> = allSites;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts)
    {
        // Skip this site if it was marked to be skipped
        if (site.id === skipSiteId)
        {
            // Find the next closest site
            const nextSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.id !== skipSiteId,
            });
            if (nextSite === null)
            {
                break; // No more sites to try
            }
            site = nextSite;
            attempts++;
            continue;
        }

        const distToSite = creep.pos.getRangeTo(site);

        if (distToSite > 1)
        {
            // Too far, move to the site
            creep.moveTo(site);
            return;
        }

        // If creep is on the site, move away first
        if (distToSite === 0)
        {
            const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            const moveDir = directions[Math.floor(Math.random() * directions.length)];
            creep.move(moveDir);
            return;
        }

        // Build the site (range 1 - adjacent)
        const result = creep.build(site);

        if (result === OK)
        {
            // Successfully built, reset skip
            if (creep.memory.skipSiteId !== undefined)
            {
                delete creep.memory.skipSiteId;
            }
            return;
        }
        else if (result === ERR_NOT_IN_RANGE)
        {
            // Move to site
            creep.moveTo(site);
            return;
        }
        else if (result === ERR_INVALID_TARGET)
        {
            // Creep is on the site (or site is invalid), skip it for this tick and move away
            creep.memory.skipSiteId = site.id;
            
            // Move away from the site in a random direction
            const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            const moveDir = directions[Math.floor(Math.random() * directions.length)];
            creep.move(moveDir);
            
            // Return immediately so we don't try to build again this tick
            return;
        }
        else if (result === ERR_NOT_ENOUGH_RESOURCES)
        {
            // No energy to build, switch to harvesting
            creep.memory.working = false;
            if (creep.memory.skipSiteId !== undefined)
            {
                delete creep.memory.skipSiteId;
            }
            return;
        }
        else
        {
            // Other error, try next site
            if (creep.memory.skipSiteId !== undefined)
            {
                delete creep.memory.skipSiteId;
            }
            const nextSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if (nextSite === null)
            {
                break;
            }
            site = nextSite;
            attempts++;
            continue;
        }
    }

    // If we couldn't build any site, try the fallback behaviors
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

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
            // No sources found or reachable
            // If we have some energy, switch to working mode to build/upgrade
            // If we have no energy, still switch to working mode to be productive
            // This prevents the builder from being stuck in harvesting mode indefinitely
            creep.memory.working = true;
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { ignoreCreeps: true });
        }
        return;
    }

    // Find the closest construction site
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if (constructionSites.length > 0)
    {
        // Filter out sites that are occupied by creeps (ERR_INVALID_TARGET will occur)
        const availableSites = constructionSites.filter((site) =>
        {
            const creepsOnSite = site.pos.lookFor(LOOK_CREEPS);
            return creepsOnSite.length === 0;
        });

        // If no sites are available (all occupied), move away from the occupied site
        // to unblock paths for other creeps
        if (availableSites.length === 0)
        {
            // Find an occupied site and move away from it
            for (const site of constructionSites)
            {
                const creepsOnSite = site.pos.lookFor(LOOK_CREEPS);
                if (creepsOnSite.length > 0)
                {
                    // Calculate direction away from the occupied site
                    const dx = site.pos.x - creep.pos.x;
                    const dy = site.pos.y - creep.pos.y;
                    
                    // Determine direction based on relative position
                    let moveDir: DirectionConstant;
                    if (Math.abs(dx) > Math.abs(dy))
                    {
                        // farther apart in X direction
                        moveDir = dx > 0 ? LEFT : RIGHT;
                    }
                    else
                    {
                        // farther apart in Y direction
                        moveDir = dy > 0 ? TOP : BOTTOM;
                    }
                    creep.move(moveDir);
                    return;
                }
            }
            // If no occupied sites found (unexpected), just wait and try again
            return;
        }

        // Build construction sites
        const selectedSite = creep.pos.findClosestByPath(availableSites);

        if (selectedSite !== null)
        {
            // Check if we're already on the site tile - if so, move away first
            if (creep.pos.x === selectedSite.pos.x && creep.pos.y === selectedSite.pos.y)
            {
                const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
                const moveDir = directions[Math.floor(Math.random() * directions.length)];
                creep.move(moveDir);
                return;
            }

            const result = creep.build(selectedSite);
            if (result === ERR_NOT_IN_RANGE)
            {
                // If we can't reach the site, switch to harvesting to refill
                // This allows the builder to continue building when it can reach the site again
                creep.memory.working = false;
                creep.moveTo(selectedSite, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the construction site (range 0), or the site is blocked
                // Just move away and try again next tick without switching modes
                const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
                const moveDir = directions[Math.floor(Math.random() * directions.length)];
                creep.move(moveDir);
                return;
            }
            else if (result !== OK)
            {
                // Other error (e.g., ERR_BUSY), skip this site and try again next tick
                // Don't switch modes as this might be a temporary issue
                return;
            }
        }
        else
        {
            // findClosestByPath returned null - no path to any site
            // Try to move away in a random direction to unblock the path
            const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
            const moveDir = directions[Math.floor(Math.random() * directions.length)];
            creep.move(moveDir);
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
        // Filter out structures that are occupied by creeps
        const availableStructures = damagedStructures.filter((structure) =>
        {
            const creepsOnTile = structure.pos.lookFor(LOOK_CREEPS);
            return creepsOnTile.length === 0;
        });

        // If no structures are available (all occupied), just wait and try again next tick
        // Don't move away randomly as this wastes CPU and can block other creeps
        if (availableStructures.length === 0)
        {
            return;
        }

        const selectedStructure = creep.pos.findClosestByPath(availableStructures);

        if (selectedStructure !== null)
        {
            const result = creep.repair(selectedStructure);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(selectedStructure, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the structure (range 0), move away
                const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
                const moveDir = directions[Math.floor(Math.random() * directions.length)];
                creep.move(moveDir);
            }
            return;
        }
    }

    // If no construction or repair needed, upgrade the controller
    const controller = creep.room.controller;

    if (controller !== undefined && controller !== null)
    {
        // Check if controller position is occupied by a creep
        const creepsOnController = controller.pos.lookFor(LOOK_CREEPS);
        if (creepsOnController.length === 0)
        {
            const result = creep.upgradeController(controller);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the controller (range 0) or controller is full
                // Move away and switch to harvesting to refill
                const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
                const moveDir = directions[Math.floor(Math.random() * directions.length)];
                creep.move(moveDir);
                creep.memory.working = false;
                return;
            }
        }
        else
        {
            // Controller is occupied by another creep, just wait and try again next tick
            // Don't move away randomly as this wastes CPU and can block other creeps
        }
    }
}

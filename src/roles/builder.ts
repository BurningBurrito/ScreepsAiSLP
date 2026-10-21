/** Builder Role
 * Builds and repairs structures in the room.
 * If no construction sites exist, upgrades the controller instead.
 * Prioritizes tower and extension sites over roads.
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

    // Find construction sites, prioritizing tower > extension > roads
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if (constructionSites.length > 0)
    {
        // Sort sites by priority: tower first, then extension, then roads
        const towerSites: ConstructionSite[] = [];
        const extensionSites: ConstructionSite[] = [];
        const roadSites: ConstructionSite[] = [];

        for (const site of constructionSites)
        {
            if (site.structureType === STRUCTURE_TOWER)
            {
                towerSites.push(site);
            }
            else if (site.structureType === STRUCTURE_EXTENSION)
            {
                extensionSites.push(site);
            }
            else
            {
                roadSites.push(site);
            }
        }

        // If we have tower sites, only build those
        let selectedSite: ConstructionSite | null = null;
        if (towerSites.length > 0)
        {
            // Get the closest tower site
            selectedSite = creep.pos.findClosestByPath(towerSites);
        }
        else if (extensionSites.length > 0)
        {
            // Get the closest extension site
            selectedSite = creep.pos.findClosestByPath(extensionSites);
        }
        else if (roadSites.length > 0)
        {
            // Only build roads if no tower or extension sites exist
            selectedSite = creep.pos.findClosestByPath(roadSites);
        }

        if (selectedSite !== null)
        {
            const result = creep.build(selectedSite);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(selectedSite, { ignoreCreeps: true, range: 1 });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the construction site (range 0)
                // Move away from the site to unblock the path
                moveAwayFromSite(creep);
            }
            else if (result === ERR_NOT_OWNER)
            {
                // This shouldn't happen, but if the creep doesn't own the site,
                // try to move to an adjacent tile
                moveAwayFromSite(creep);
            }
            return;
        }
    }

    // Find the closest damaged structure to repair (excluding walls and ramparts)
    // Prioritize: tower > roads/containers
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
        // Prioritize tower repair
        const damagedTowers = damagedStructures.filter((structure) =>
            structure.structureType === STRUCTURE_TOWER
        );

        let selectedStructure: Structure | null = null;

        if (damagedTowers.length > 0)
        {
            // Filter out towers that are occupied by creeps
            const availableTowers = damagedTowers.filter((structure) =>
            {
                const creepsOnTile = structure.pos.lookFor(LOOK_CREEPS);
                return creepsOnTile.length === 0;
            });

            if (availableTowers.length > 0)
            {
                selectedStructure = creep.pos.findClosestByPath(availableTowers);
            }
        }

        if (selectedStructure === null)
        {
            // Filter out structures that are occupied by creeps
            const availableStructures = damagedStructures.filter((structure) =>
            {
                const creepsOnTile = structure.pos.lookFor(LOOK_CREEPS);
                return creepsOnTile.length === 0;
            });

            // If no structures are available (all occupied), just wait and try again next tick
            if (availableStructures.length === 0)
            {
                return;
            }

            selectedStructure = creep.pos.findClosestByPath(availableStructures);
        }

        if (selectedStructure !== null)
        {
            const result = creep.repair(selectedStructure);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(selectedStructure, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the structure (range 0)
                // Move away from the structure to unblock the path
                moveAwayFromSite(creep);
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
                // Move away from controller to unblock the path and switch to harvesting
                moveAwayFromSite(creep);
                creep.memory.working = false;
                return;
            }
        }
        else
        {
            // Controller is occupied by another creep, just wait and try again next tick
        }
    }
}

/** Helper function to find a safe position to move to when blocked by a construction site
 * When a creep is on a construction site, it cannot move off directly using creep.move() in some cases.
 * Instead, we find an adjacent empty tile and use moveTo to move there.
 * @param creep The creep to find a safe position for
 * @returns A valid adjacent position, or null if all are blocked
 */
function getSafeMovePosition(creep: Creep): RoomPosition | null
{
    const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    
    for (const dir of directions)
    {
        // Calculate the adjacent tile position
        let dx = 0;
        let dy = 0;
        switch (dir)
        {
            case TOP:
                dy = -1;
                break;
            case TOP_RIGHT:
                dx = 1;
                dy = -1;
                break;
            case RIGHT:
                dx = 1;
                break;
            case BOTTOM_RIGHT:
                dx = 1;
                dy = 1;
                break;
            case BOTTOM:
                dy = 1;
                break;
            case BOTTOM_LEFT:
                dx = -1;
                dy = 1;
                break;
            case LEFT:
                dx = -1;
                break;
            case TOP_LEFT:
                dx = -1;
                dy = -1;
                break;
        }
        
        const targetX = creep.pos.x + dx;
        const targetY = creep.pos.y + dy;
        
        // Check if the adjacent tile is within room bounds
        if (targetX < 0 || targetX > 49 || targetY < 0 || targetY > 49)
        {
            continue;
        }
        
        // Create a RoomPosition for the adjacent tile
        const targetPos = new RoomPosition(targetX, targetY, creep.pos.roomName);
        
        // Check if this tile is occupied by another creep
        const creepsOnTile = targetPos.lookFor(LOOK_CREEPS);
        if (creepsOnTile.length > 0)
        {
            continue;
        }
        
        // Check if this tile is a construction site (we don't want to move onto another site)
        const sitesOnTile = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sitesOnTile.length > 0)
        {
            continue;
        }
        
        // Check if this tile is a structure (wall, road, etc.)
        const structuresOnTile = targetPos.lookFor(LOOK_STRUCTURES);
        if (structuresOnTile.length > 0)
        {
            continue;
        }
        
        // This tile is empty, try to move there
        // First try moveTo with range: 1 to ensure we move to the tile
        const moveToResult = creep.moveTo(targetPos, { ignoreCreeps: true, range: 1 });
        
        // If moveTo succeeded, return the target
        if (moveToResult === OK)
        {
            // Successfully started moving to the tile
            return targetPos;
        }
        
        // If moveTo failed with ERR_INVALID_TARGET (we're on the construction site),
        // try move(direction) directly to push off the site
        if (moveToResult === ERR_INVALID_TARGET)
        {
            const moveResult = creep.move(dir);
            if (moveResult === OK)
            {
                // Successfully moved away from the construction site
                return targetPos;
            }
            // If move also failed, continue to next direction
        }
        else if (moveToResult === ERR_NOT_FOUND)
        {
            // No path found, but we can still try to move in the direction
            const moveResult = creep.move(dir);
            if (moveResult === OK)
            {
                // Successfully moved
                return targetPos;
            }
        }
        // For other errors (ERR_NO_PATH, etc.), continue to next direction
    }
    
    // If all directions failed (blocked), return null
    return null;
}

/**
 * Moves the creep away from a site to unblock the path.
 * This is a legacy function - now replaced by getSafeMovePosition().
 * @param creep The creep to move
 */
function moveAwayFromSite(creep: Creep): void
{
    // Use the new getSafeMovePosition function which handles ERR_INVALID_TARGET correctly
    getSafeMovePosition(creep);
}

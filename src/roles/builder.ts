/** Builder Role
 * Builds and repairs structures in the room.
 * If no construction sites exist, upgrades the controller instead.
 * Prioritizes tower and extension sites over roads.
 */

/**
 * Runs the builder creep behavior.
 * Builds construction sites, repairs structures, and upgrades controller when idle.
 * Prioritizes picking up energy from spawn when available to reduce wait time.
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

    // If not working (empty store), get energy from extensions, spawn, dropped resources, harvest from sources
    // Note: Builders can withdraw from spawn when it has excess energy (not about to spawn).
    // This ensures builders have energy to build extensions and roads.
    if (!creep.memory.working)
    {
        const room = creep.room;

        // First, try to pick up dropped energy
        const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (droppedEnergy !== null)
        {
            const pickupResult = creep.pickup(droppedEnergy);
            if (pickupResult === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(droppedEnergy, { ignoreCreeps: true, reusePath: 20, range: 1 });
            }
            else if (pickupResult === OK)
            {
                // Energy was successfully transferred
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                {
                    creep.memory.working = true;
                }
                return;
            }
        }

        // If no energy on ground, try to withdraw from spawn (if it has excess energy)
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        if (spawn !== undefined && spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 100)
        {
            const available = spawn.store.getUsedCapacity(RESOURCE_ENERGY);
            const canTake = Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), available);
            if (canTake > 0)
            {
                const withdrawResult = creep.withdraw(spawn, RESOURCE_ENERGY);
                if (withdrawResult === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn, { ignoreCreeps: true, reusePath: 20, range: 1 });
                }
                else if (withdrawResult === OK)
                {
                    // Energy was successfully transferred
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                    {
                        creep.memory.working = true;
                    }
                    return;
                }
            }
        }

        // If no energy from spawn, pick up from extensions
        const extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
        });
        for (const ext of extensions)
        {
            const available = (ext as StructureExtension).store.getUsedCapacity(RESOURCE_ENERGY);
            const canTake = Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), available);
            if (canTake > 0)
            {
                const withdrawResult = creep.withdraw(ext, RESOURCE_ENERGY);
                if (withdrawResult === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(ext, { ignoreCreeps: true, reusePath: 20, range: 1 });
                }
                else if (withdrawResult === OK)
                {
                    // Energy was successfully transferred
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                    {
                        creep.memory.working = true;
                    }
                    return;
                }
            }
        }

        // If no energy in spawn, extensions, or on ground, harvest from sources
        // A builder that harvests must stay at the source until its store is full
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source === null)
        {
            // No sources found or reachable
            // Switch to working and upgrade controller
            creep.memory.working = true;
            return;
        }

        const harvestResult = creep.harvest(source);

        if (harvestResult === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { ignoreCreeps: true, reusePath: 20, range: 1 });
        }
        else if (harvestResult === OK)
        {
            // Energy was successfully transferred - stay at source until full
            if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
            {
                creep.memory.working = true;
            }
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

        // Count total extensions (built + sites) to determine if we need more
        const room = creep.room;
        const extensionsBuilt = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
        }).length;
        // Prioritize roads when we have at least 3 extensions built AND at least 10 extension sites
        // This ensures we build enough extensions (and energy capacity) before building roads
        const extensionsPlaced = extensionsBuilt + extensionSites.length;
        const roadsNeeded = extensionsBuilt >= 3 && extensionsPlaced >= 10;

        // If we have tower sites, only build those
        let selectedSite: ConstructionSite | null = null;
        if (towerSites.length > 0)
        {
            // Get the closest tower site
            selectedSite = creep.pos.findClosestByPath(towerSites);
        }
        else if (roadSites.length > 0 && roadsNeeded)
        {
            // Build roads when we have enough extensions and roads need building
            // Roads are needed for creep movement efficiency and energy delivery
            selectedSite = creep.pos.findClosestByPath(roadSites);
        }
        else if (extensionSites.length > 0)
        {
            // Prioritize extensions for energy capacity
            // Extensions are needed to increase room capacity and spawn larger creeps
            selectedSite = creep.pos.findClosestByPath(extensionSites);
        }

        if (selectedSite !== null)
        {
            const result = creep.build(selectedSite);
            if (result === ERR_NOT_IN_RANGE)
            {
                const moveResult = creep.moveTo(selectedSite, { ignoreCreeps: true, range: 1 });
                // Handle movement failures
                if (moveResult === ERR_NO_PATH)
                {
                    // Can't reach the site (no path), drop energy and find a new site
                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                    {
                        creep.drop(RESOURCE_ENERGY);
                    }
                    creep.memory.working = false;
                }
                else if (moveResult === ERR_INVALID_TARGET)
                {
                    // Creep is already on the construction site (range 0)
                    // Just call build again in the next tick
                    // Don't move away - we're already in position
                }
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the construction site (range 0)
                // Move away from the site to unblock the path
                moveAwayFromSite(creep);
            }
            else if (result === ERR_NOT_OWNER)
            {
                // This should never happen - the creep is a my creep
                // Just log and continue
            }
            else if (result === ERR_BUSY)
            {
                // Spawn is still building something else
            }
            else if (result === ERR_RCL_NOT_ENOUGH)
            {
                // Room controller level too low to build this
            }
            else if (result === OK || result === ERR_NOT_ENOUGH_ENERGY)
            {
                // Successfully started building or not enough energy to complete
                // Continue building in next tick
            }
        }
    }
    else
    {
        // No construction sites, upgrade controller
        const controller = creep.room.controller;
        if (controller != null)
        {
            const upgradeResult = creep.upgradeController(controller);
            if (upgradeResult === ERR_NOT_IN_RANGE)
            {
                // Move to range 3 of the controller for optimal upgrading
                creep.moveTo(controller, { ignoreCreeps: true, reusePath: 20, range: 3 });
            }
        }
    }
}

/**
 * Gets a safe position adjacent to the creep's current position to move onto.
 * This is used to unblock construction sites when the creep is on top of one.
 * @param creep The creep to get a safe move position for
 * @returns A safe position to move to, or null if no safe position is found
 */
function getSafeMovePosition(creep: Creep): RoomPosition | null
{
    // Directions to check: up, down, left, right, and diagonals
    const directions = [
        TOP,
        BOTTOM,
        LEFT,
        RIGHT,
        TOP_LEFT,
        TOP_RIGHT,
        BOTTOM_LEFT,
        BOTTOM_RIGHT,
    ];

    for (const dir of directions)
    {
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

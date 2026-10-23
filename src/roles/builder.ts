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

    // If not working (empty store), get energy from extensions, dropped resources, harvest from sources, or withdraw from spawn
    // Note: Builders withdraw from the spawn to get energy when needed. This is acceptable because:
    // 1. When the room is below full capacity, the spawn fills up from harvesters
    // 2. Withdrawals only happen when the creep needs energy, so there's no net loss
    // 3. The spawn doesn't "lose" energy - it's transferred to the builder for building
    if (!creep.memory.working)
    {
        // First, try to withdraw from the spawn (primary energy source for builders)
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
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
                }
                return;
            }
        }

        // If no energy in spawn, try to pick up energy from extensions
        const extensions = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
        });
        let pickedUp = false;
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
                    pickedUp = true;
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                    {
                        creep.memory.working = true;
                    }
                    break;
                }
            }
        }

        // If no energy in extensions, pick up dropped energy
        if (!pickedUp)
        {
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
                    pickedUp = true;
                    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                    {
                        creep.memory.working = true;
                    }
                }
            }
        }

        // If no energy in spawn, extensions, or on ground, harvest from sources
        if (!pickedUp)
        {
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
                // Energy was successfully transferred
                if (creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
                {
                    creep.memory.working = true;
                }
            }
            return;
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
                const moveResult = creep.moveTo(selectedSite, { ignoreCreeps: true, range: 0 });
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

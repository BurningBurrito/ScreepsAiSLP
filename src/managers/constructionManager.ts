/** Construction Manager
 * Manages the construction of extensions and roads in the room.
 * Extensions store energy and increase room energy capacity.
 * Roads reduce travel fatigue and speed up movement.
 */

import { ROADS_PER_INTERVAL, ROAD_BUILD_INTERVAL, TARGET_EXTENSIONS } from "config";

/**
 * Gets the number of extensions currently built in the room
 * @param room The room to check
 * @returns Number of extensions built
 */
function getExtensionsBuilt(room: Room): number
{
    const mine = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
    });
    return mine.length;
}

/**
 * Gets the number of extension construction sites in the room
 * @param room The room to check
 * @returns Number of extension construction sites
 */
function getExtensionSites(room: Room): number
{
    const sites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    });
    return sites.length;
}

/**
 * Checks if the room should build extensions based on controller level and current state
 * @param room The room to check
 * @returns True if extensions should be built
 */
function shouldBuildExtensions(room: Room): boolean
{
    const controller = room.controller;
    if (controller === undefined || controller === null)
    {
        return false;
    }

    // Only build extensions if controller is at least level 1
    if (controller.level < 1)
    {
        return false;
    }

    const extensionsBuilt = getExtensionsBuilt(room);
    const extensionSites = getExtensionSites(room);
    const totalExtensions = extensionsBuilt + extensionSites;

    // Stop building if we have the target number of extensions
    if (totalExtensions >= TARGET_EXTENSIONS)
    {
        return false;
    }

    return true;
}

/**
 * Places a construction site for an extension if possible
 * @param room The room to place the construction site in
 * @returns OK if successful, otherwise an error code
 */
function placeExtensionSite(room: Room): ScreepsReturnCode
{
    const controller = room.controller;
    if (controller === undefined || controller === null)
    {
        return ERR_INVALID_TARGET;
    }

    // Get all valid positions adjacent to the controller
    const positions: RoomPosition[] = [];
    const cx = controller.pos.x;
    const cy = controller.pos.y;

    // Check adjacent positions (8 directions)
    for (let dx = -1; dx <= 1; dx++)
    {
        for (let dy = -1; dy <= 1; dy++)
        {
            if (dx === 0 && dy === 0)
            {
                continue; // Skip controller position
            }

            const newX = cx + dx;
            const newY = cy + dy;

            // Check bounds
            if (newX < 0 || newX >= 50 || newY < 0 || newY >= 50)
            {
                continue;
            }

            positions.push(new RoomPosition(newX, newY, room.name));
        }
    }

    // Try to place extension at each position
    for (const pos of positions)
    {
        // Check if there's already a structure or construction site at this position
        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        if (structures.length === 0 && sites.length === 0)
        {
            const result = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
            if (result === OK)
            {
                return OK;
            }
        }
    }

    // If no position near controller works, try random positions
    for (let i = 0; i < 10; i++)
    {
        const x = Math.floor(Math.random() * 50);
        const y = Math.floor(Math.random() * 50);
        const pos = new RoomPosition(x, y, room.name);

        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        if (structures.length === 0 && sites.length === 0)
        {
            const result = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
            if (result === OK)
            {
                return OK;
            }
        }
    }

    return ERR_FULL; // No valid position found
}

/**
 * Places a construction site for a road if possible
 * @param room The room to place the construction site in
 * @returns OK if successful, otherwise an error code
 */
function placeRoadSite(room: Room): ScreepsReturnCode
{
    // Try to place roads in a grid pattern across the room

    const spacing = 10;
    const startX = 5;
    const startY = 5;

    for (let i = 0; i < 50; i++)
    {
        // Try different positions in a grid
        const x = startX + (i % 5) * spacing;
        const y = startY + Math.floor(i / 5) * spacing;

        if (x >= 50 || y >= 50)
        {
            continue;
        }

        const pos = new RoomPosition(x, y, room.name);

        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        if (structures.length === 0 && sites.length === 0)
        {
            const result = room.createConstructionSite(pos, STRUCTURE_ROAD);
            if (result === OK)
            {
                return OK;
            }
        }
    }

    // If no grid position works, try random positions
    for (let i = 0; i < 20; i++)
    {
        const x = Math.floor(Math.random() * 50);
        const y = Math.floor(Math.random() * 50);
        const pos = new RoomPosition(x, y, room.name);

        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        if (structures.length === 0 && sites.length === 0)
        {
            const result = room.createConstructionSite(pos, STRUCTURE_ROAD);
            if (result === OK)
            {
                return OK;
            }
        }
    }

    return ERR_FULL; // No valid position found
}

/**
 * Checks if the room should build roads based on time interval
 * @returns True if roads should be built
 */
function shouldBuildRoads(): boolean
{
    // Build roads every ROAD_BUILD_INTERVAL ticks
    return Game.time % ROAD_BUILD_INTERVAL === 0;
}

/**
 * Manages construction of extensions and roads
 * @param room The room to manage construction in
 */
export function manageConstruction(room: Room): void
{
    // Build extensions if we're at level 1+ and haven't reached the target
    if (shouldBuildExtensions(room))
    {
        const extensionsBuilt = getExtensionsBuilt(room);
        const extensionSites = getExtensionSites(room);
        const totalExtensions = extensionsBuilt + extensionSites;

        // Build more extensions if needed
        if (totalExtensions < TARGET_EXTENSIONS)
        {
            const result = placeExtensionSite(room);
            if (result !== OK && result !== ERR_FULL)
            {
                console.log(`Extension construction failed: ${result}`);
            }
        }
    }

    // Build roads periodically
    if (shouldBuildRoads())
    {
        // Try to build multiple roads per interval
        for (let i = 0; i < ROADS_PER_INTERVAL; i++)
        {
            const result = placeRoadSite(room);
            if (result !== OK)
            {
                // Stop if we can't place any more roads
                break;
            }
        }
    }
}

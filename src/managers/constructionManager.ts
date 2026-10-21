/** Construction Manager
 * Manages the construction of extensions, roads, and towers in the room.
 * Extensions store energy and increase room energy capacity.
 * Roads reduce travel fatigue and speed up movement.
 * Towers defend the room, heal creeps, and repair structures.
 *
 * This manager computes optimal placement layouts based on the room's
 * actual objects (spawn, sources, controller) rather than using fixed coordinates.
 */

/** Get the spawn position in this room */
function getSpawnPosition(room: Room): RoomPosition | null
{
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0)
    {
        return null;
    }
    return spawns[0].pos;
}

/** Get the controller position in this room */
function getControllerPosition(room: Room): RoomPosition | null
{
    if (room.controller === undefined || room.controller === null)
    {
        return null;
    }
    return room.controller.pos;
}

/** Get the controller level in this room */
function getControllerLevel(room: Room): number
{
    if (room.controller === undefined || room.controller === null)
    {
        return 0;
    }
    return room.controller.level;
}

/** Get all sources in the room */
function getSources(room: Room): Source[]
{
    return room.find(FIND_SOURCES);
}

/** Compute road paths from spawn to each source and to the controller */
function computeRoadPaths(room: Room): RoomPosition[]
{
    const paths: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return paths;
    }

    // Compute path to each source (range 1)
    const sources = getSources(room);
    for (const source of sources)
    {
        const path = room.findPath(spawn, source.pos, {
            ignoreCreeps: true,
            range: 1,
        });
        for (const pos of path)
        {
            paths.push(new RoomPosition(pos.x, pos.y, room.name));
        }
    }

    // Compute path to controller (range 3)
    const controller = getControllerPosition(room);
    if (controller !== null)
    {
        const path = room.findPath(spawn, controller, {
            ignoreCreeps: true,
            range: 3,
        });
        for (const pos of path)
        {
            paths.push(new RoomPosition(pos.x, pos.y, room.name));
        }
    }

    return paths;
}

/** Check if a position is on a wall (natural or built) */
function isWallPosition(pos: RoomPosition, room: Room): boolean
{
    const terrain = room.getTerrain();
    const terrainCode = terrain.get(pos.x, pos.y);
    if (terrainCode === TERRAIN_MASK_WALL)
    {
        return true;
    }

    // Check for built walls
    const structures = pos.lookFor(LOOK_STRUCTURES);
    for (const structure of structures)
    {
        if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART)
        {
            return true;
        }
    }

    return false;
}

/** Generate extension positions in a checkerboard pattern around the spawn */
function computeExtensionPositions(room: Room): RoomPosition[]
{
    const positions: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return positions;
    }

    // Try positions around spawn, starting from range 2 and going outward
    // Use checkerboard pattern: only positions where (x + y) % 2 === (spawnX + spawnY) % 2
    const spawnParity = (spawn.x + spawn.y) % 2;
    const maxRange = 8;

    for (let range = 2; range <= maxRange; range++)
    {
        // Generate all positions at this range
        const positionsAtRange: RoomPosition[] = [];

        for (let dx = -range; dx <= range; dx++)
        {
            const dy1 = range - Math.abs(dx);
            if (dy1 >= 0)
            {
                // Top and bottom positions
                const pos1 = new RoomPosition(spawn.x + dx, spawn.y + dy1, room.name);
                const pos2 = new RoomPosition(spawn.x + dx, spawn.y - dy1, room.name);
                positionsAtRange.push(pos1);
                if (dy1 > 0)
                {
                    positionsAtRange.push(pos2);
                }
            }
        }

        // Filter by checkerboard pattern and valid placement
        for (const pos of positionsAtRange)
        {
            // Skip if out of bounds
            if (pos.x < 0 || pos.x >= 49 || pos.y < 0 || pos.y >= 49)
            {
                continue;
            }

            // Skip if on wall terrain
            if (isWallPosition(pos, room))
            {
                continue;
            }

            // Skip if not on checkerboard pattern
            const posParity = (pos.x + pos.y) % 2;
            if (posParity !== spawnParity)
            {
                continue;
            }

            // Skip if occupied by structure or site
            const structures = pos.lookFor(LOOK_STRUCTURES);
            const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (structures.length > 0 || sites.length > 0)
            {
                continue;
            }

            // Skip if too close to source (range 1)
            const sources = getSources(room);
            let tooCloseToSource = false;
            for (const source of sources)
            {
                if (pos.getRangeTo(source.pos) <= 1)
                {
                    tooCloseToSource = true;
                    break;
                }
            }
            if (tooCloseToSource)
            {
                continue;
            }

            // Skip if too close to controller (range 1)
            const controller = getControllerPosition(room);
            if (controller !== null && pos.getRangeTo(controller) <= 1)
            {
                continue;
            }

            positions.push(pos);

            // Limit to 10 extensions (RCL 3 max)
            if (positions.length >= 10)
            {
                return positions;
            }
        }
    }

    return positions;
}

/** Get tower positions near the spawn */
function computeTowerPositions(room: Room): RoomPosition[]
{
    const positions: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return positions;
    }

    // Try positions at range 2, then 3
    const spawnParity = (spawn.x + spawn.y) % 2;
    const ranges = [2, 3, 4];

    for (const range of ranges)
    {
        const positionsAtRange: RoomPosition[] = [];

        for (let dx = -range; dx <= range; dx++)
        {
            const dy = range - Math.abs(dx);
            if (dy >= 0)
            {
                const pos1 = new RoomPosition(spawn.x + dx, spawn.y + dy, room.name);
                const pos2 = new RoomPosition(spawn.x + dx, spawn.y - dy, room.name);
                positionsAtRange.push(pos1);
                if (dy > 0)
                {
                    positionsAtRange.push(pos2);
                }
            }
        }

        for (const pos of positionsAtRange)
        {
            if (pos.x < 0 || pos.x >= 49 || pos.y < 0 || pos.y >= 49)
            {
                continue;
            }

            if (isWallPosition(pos, room))
            {
                continue;
            }

            const posParity = (pos.x + pos.y) % 2;
            if (posParity !== spawnParity)
            {
                continue;
            }

            const structures = pos.lookFor(LOOK_STRUCTURES);
            const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (structures.length > 0 || sites.length > 0)
            {
                continue;
            }

            // Skip if too close to source
            const sources = getSources(room);
            let tooCloseToSource = false;
            for (const source of sources)
            {
                if (pos.getRangeTo(source.pos) <= 1)
                {
                    tooCloseToSource = true;
                    break;
                }
            }
            if (tooCloseToSource)
            {
                continue;
            }

            // Skip if too close to controller
            const controller = getControllerPosition(room);
            if (controller !== null && pos.getRangeTo(controller) <= 1)
            {
                continue;
            }

            positions.push(pos);

            if (positions.length >= 1) // Only need 1 tower
            {
                return positions;
            }
        }
    }

    return positions;
}

/** Clean up old road construction sites that are not on the computed paths */
function cleanOldRoadSites(room: Room, validRoadPositions: RoomPosition[]): void
{
    const roadSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });

    for (const site of roadSites)
    {
        const isValid = validRoadPositions.some((pos) =>
            pos.x === site.pos.x && pos.y === site.pos.y
        );
        if (!isValid)
        {
            site.remove();
        }
    }
}

/** Place road construction sites on computed paths */
function placeRoadSites(room: Room, roadPositions: RoomPosition[]): void
{
    const existingRoadSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });

    const existingRoadPositions = existingRoadSites.map((site) => `${site.pos.x},${site.pos.y}`);

    for (const pos of roadPositions)
    {
        const key = `${pos.x},${pos.y}`;
        if (!existingRoadPositions.includes(key))
        {
            room.createConstructionSite(pos, STRUCTURE_ROAD);
        }
    }
}

/** Place extension construction sites */
function placeExtensionSites(room: Room, extensionPositions: RoomPosition[]): void
{
    const extensionsBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
    }).length;

    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    }).length;

    const totalExtensions = extensionsBuilt + extensionSites;
    const remaining = Math.min(10 - totalExtensions, extensionPositions.length);

    const controllerLevel = getControllerLevel(room);
    if (controllerLevel < 2)
    {
        return;
    }

    let placed = 0;
    for (let i = 0; i < extensionPositions.length && placed < remaining; i++)
    {
        const pos = extensionPositions[i];
        
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites.length > 0)
        {
            continue;
        }
        
        const result = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
        if (result === OK)
        {
            placed++;
        }
    }
}

/** Place tower construction sites */
function placeTowerSites(room: Room, towerPositions: RoomPosition[]): void
{
    const towersBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER,
    }).length;

    if (towersBuilt >= 1 || towerPositions.length === 0)
    {
        return;
    }

    const controllerLevel = getControllerLevel(room);
    if (controllerLevel < 3)
    {
        return;
    }

    room.createConstructionSite(towerPositions[0], STRUCTURE_TOWER);
}

/** Check if we should place road sites */
function shouldPlaceRoadSites(room: Room): boolean
{
    // Only place roads when:
    // 1. No tower or extension sites exist (tower/extension priority)
    // 2. Controller is at least level 2 (at RCL 1, priority is upgrading)
    // 3. Or when roads to sources/controller are missing (energy delivery priority)
    const towerSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_TOWER,
    });
    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    });
    const controllerLevel = getControllerLevel(room);
    
    // If tower or extension sites exist, only place roads if sources/controller aren't connected
    if (towerSites.length > 0 || extensionSites.length > 0)
    {
        const roadPaths = computeRoadPaths(room);
        return !areSourcesAndControllerConnected(room, roadPaths);
    }
    
    return towerSites.length === 0 && extensionSites.length === 0 && controllerLevel >= 2;
}

/** Check if sources and controller are connected via roads */
function areSourcesAndControllerConnected(room: Room, roadPaths: RoomPosition[]): boolean
{
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return false;
    }
    
    // Check if sources are connected (roads exist on path to sources)
    const sources = getSources(room);
    for (const source of sources)
    {
        let sourceConnected = false;
        for (const pos of roadPaths)
        {
            if (pos.x === source.pos.x && pos.y === source.pos.y)
            {
                // This position is on the road path - check if there's a road here
                const structures = pos.lookFor(LOOK_STRUCTURES);
                for (const structure of structures)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        sourceConnected = true;
                        break;
                    }
                }
                break;
            }
        }
        if (!sourceConnected)
        {
            return false;
        }
    }
    
    // Check if controller is connected
    const controllerPos = getControllerPosition(room);
    if (controllerPos !== null)
    {
        let controllerConnected = false;
        for (const pos of roadPaths)
        {
            if (pos.x === controllerPos.x && pos.y === controllerPos.y)
            {
                const structures = pos.lookFor(LOOK_STRUCTURES);
                for (const structure of structures)
                {
                    if (structure.structureType === STRUCTURE_ROAD)
                    {
                        controllerConnected = true;
                        break;
                    }
                }
                break;
            }
        }
        if (!controllerConnected)
        {
            return false;
        }
    }
    
    return true;
}

/** Manages construction of extensions, roads, and towers */
export function manageConstruction(room: Room): void
{
    // Compute and place tower positions first (highest priority)
    const towerPositions = computeTowerPositions(room);
    placeTowerSites(room, towerPositions);

    // Compute and place extension positions (second priority)
    const extensionPositions = computeExtensionPositions(room);
    placeExtensionSites(room, extensionPositions);

    // Compute road paths
    const roadPaths = computeRoadPaths(room);

    // Clean up old road sites that aren't on the computed paths
    cleanOldRoadSites(room, roadPaths);

    // Place road sites on computed paths (only when no tower/extension sites exist)
    if (shouldPlaceRoadSites(room))
    {
        placeRoadSites(room, roadPaths);
    }
}

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
        // If the controller Game object isn't available, assume the room is at RCL 1
        // (the starting level). The controller should become available after the room is scoped.
        return 1;
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
    console.log(`[Construction] computeRoadPaths called`);
    const paths: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        console.log(`[Construction] No spawn found for road paths`);
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
        console.log(`[Construction] Path to source ${source.id}: ${path.length} steps`);
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
        console.log(`[Construction] Path to controller: ${path.length} steps`);
        for (const pos of path)
        {
            paths.push(new RoomPosition(pos.x, pos.y, room.name));
        }
    }

    console.log(`[Construction] Total road paths: ${paths.length} tiles`);
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

    // Debug: log if no positions were computed
    if (positions.length === 0)
    {
        // console.log(`[Construction] No extension positions computed`);
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
function placeRoadSites(room: Room, roadPositions: RoomPosition[], extensionPositions?: RoomPosition[]): number
{
    const existingRoadSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });

    const existingRoadPositions = existingRoadSites.map((site) => `${site.pos.x},${site.pos.y}`);

    // Create a set of extension positions for quick lookup
    const extensionSet = new Set(extensionPositions?.map((pos) => `${pos.x},${pos.y}`) || []);

    const controller = getControllerPosition(room);
    const sources = getSources(room);

    for (const pos of roadPositions)
    {
        // Skip if too close to controller (range 1) - keep controller area clear
        if (controller !== null && pos.getRangeTo(controller) <= 1)
        {
            continue;
        }

        // Skip if too close to sources (range 1) - harvester needs to be on source tile,
        // but roads should be on adjacent tiles where harvesters walk to
        let tooCloseToSource = false;
        for (const source of sources)
        {
            if (pos.getRangeTo(source.pos) < 1)
            {
                tooCloseToSource = true;
                break;
            }
        }
        if (tooCloseToSource)
        {
            continue;
        }

        // Skip if this position is designated for an extension
        const key = `${pos.x},${pos.y}`;
        if (extensionSet.has(key))
        {
            continue;
        }

        if (!existingRoadPositions.includes(key))
        {
            room.createConstructionSite(pos, STRUCTURE_ROAD);
        }
    }
    return 0;  // TODO: Track actually placed roads
}

/** Place extension construction sites */
function placeExtensionSites(room: Room, extensionPositions: RoomPosition[]): void
{
    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    }).length;

    // Place up to 10 extension sites (RCL 3 max)
    // Count only sites (not built extensions) to determine how many more to place
    const remaining = Math.min(10 - extensionSites, extensionPositions.length);

    const controllerLevel = getControllerLevel(room);
    if (controllerLevel < 2)
    {
        return;
    }

    // Get existing road sites for quick lookup
    const roadSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });
    const roadSet = new Set(roadSites.map((site) => `${site.pos.x},${site.pos.y}`));

    // Debug: log if no positions available
    if (extensionPositions.length === 0)
    {
        // console.log(`[Construction] No extension positions available (controllerLevel=${controllerLevel})`);
    }

    let placed = 0;
    for (let i = 0; i < extensionPositions.length && placed < remaining; i++)
    {
        const pos = extensionPositions[i];

        // Skip if there's already a construction site (road, tower, etc.)
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites.length > 0)
        {
            continue;
        }

        // Skip if this position has a road construction site (roads should yield to extensions)
        const key = `${pos.x},${pos.y}`;
        if (roadSet.has(key))
        {
            continue;
        }

        const result = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
        if (result === OK)
        {
            placed++;
        }
    }
    
    if (placed > 0)
    {
        // console.log(`[Construction] Placed ${placed} extension sites`);
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

    // Find existing construction sites at tower positions and skip occupied ones
    for (const pos of towerPositions)
    {
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites.length === 0)
        {
            room.createConstructionSite(pos, STRUCTURE_TOWER);
            return; // Only place one tower
        }
    }
}

/** Compute container positions for each source */
function computeContainerPositions(room: Room): RoomPosition[]
{
    const positions: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        // console.log(`[Construction] No spawn found for container position computation`);
        return positions;
    }

    const sources = getSources(room);
    // console.log(`[Construction] Computing container positions for ${sources.length} sources`);
    
    // First, check which sources already have container sites or containers
    const existingContainerPositions: Set<string> = new Set();
    
    // Check existing containers
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    });
    for (const container of containers)
    {
        existingContainerPositions.add(`${container.pos.x},${container.pos.y}`);
    }
    
    // Check existing container sites
    const containerSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_CONTAINER,
    });
    for (const site of containerSites)
    {
        existingContainerPositions.add(`${site.pos.x},${site.pos.y}`);
    }
    
    // console.log(`[Construction] Existing container positions/sites: ${existingContainerPositions.size}`);
    
    for (const source of sources)
    {
        // console.log(`[Construction] Source ${source.id} at ${source.pos.x},${source.pos.y}`);
        
        // Check if this source already has a container or site
        let hasContainer = false;
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                if (dx === 0 && dy === 0)
                {
                    continue;
                }
                
                const posStr = `${source.pos.x + dx},${source.pos.y + dy}`;
                if (existingContainerPositions.has(posStr))
                {
                    hasContainer = true;
                    break;
                }
            }
            if (hasContainer)
            {
                break;
            }
        }
        
        if (hasContainer)
        {
            // console.log(`[Construction] Source ${source.id} already has container/site, skipping`);
            continue;
        }
        
        // Place container on the tile next to the source that's closest to the spawn
        // We'll try all 8 adjacent tiles and find the one closest to spawn
        let bestPos: RoomPosition | null = null;
        let bestDistance = 1000;
        
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                if (dx === 0 && dy === 0)
                {
                    continue; // Skip source tile itself
                }
                
                const containerPos = new RoomPosition(source.pos.x + dx, source.pos.y + dy, room.name);
                
                // Skip if out of bounds
                if (containerPos.x < 0 || containerPos.x >= 49 || containerPos.y < 0 || containerPos.y >= 49)
                {
                    continue;
                }
                
                // Skip if on wall terrain
                if (isWallPosition(containerPos, room))
                {
                    continue;
                }
                
                // Check if occupied by structure or site
                const structures = containerPos.lookFor(LOOK_STRUCTURES);
                const sites = containerPos.lookFor(LOOK_CONSTRUCTION_SITES);
                
                if (structures.length > 0 || sites.length > 0)
                {
                    continue;
                }
                
                // Calculate distance to spawn
                const distance = containerPos.getRangeTo(spawn);
                if (distance < bestDistance)
                {
                    bestDistance = distance;
                    bestPos = containerPos;
                }
            }
        }
        
        if (bestPos !== null)
        {
            positions.push(bestPos);
            // console.log(`[Construction] Container position for source ${source.id}: ${bestPos.x},${bestPos.y} (dist=${bestDistance})`);
        }
        else
        {
            // console.log(`[Construction] No valid container position found for source ${source.id}`);
        }
    }

    // console.log(`[Construction] Computed ${positions.length} container positions`);
    return positions;
}

/** Place container construction sites */
function placeContainerSites(room: Room, containerPositions: RoomPosition[]): void
{
    const containersBuilt = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    }).length;

    const containerLimit = 5; // Maximum containers per room
    if (containersBuilt >= containerLimit || containerPositions.length === 0)
    {
        return;
    }

    // Place container sites for sources that don't have containers or sites
    for (const pos of containerPositions)
    {
        // Check if there's already a container or site at this position
        const structures = pos.lookFor(LOOK_STRUCTURES);
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);

        const hasContainer = structures.some((s) => s.structureType === STRUCTURE_CONTAINER);
        const hasSite = sites.some((s) => s.structureType === STRUCTURE_CONTAINER);

        if (!hasContainer && !hasSite)
        {
            room.createConstructionSite(pos, STRUCTURE_CONTAINER);
            // console.log(`[Construction] Placed container site at (${pos.x}, ${pos.y})`);
            return; // Only place one container at a time
        }
    }
}

/** Check if we should place road sites */
function shouldPlaceRoadSites(room: Room): boolean
{
    // Only place roads when:
    // 1. No tower or extension sites exist (tower/extension priority)
    // 2. Or when roads to sources/controller are missing (energy delivery priority)
    //    - At RCL 1, roads are needed for upgrader to reach controller efficiently
    //    - Without roads, swamp terrain slows down movement significantly
    const towerSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_TOWER,
    });
    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    });
    
    // If tower or extension sites exist, only place roads if sources/controller aren't connected
    if (towerSites.length > 0 || extensionSites.length > 0)
    {
        return !areSourcesAndControllerConnected(room);
    }
    
    // At RCL 1, place roads to ensure upgrader can reach controller efficiently
    // Without roads, swamp terrain causes significant movement delays
    const controllerLevel = getControllerLevel(room);
    if (controllerLevel < 2)
    {
        // Place roads even at RCL 1 if they're missing
        // This ensures upgrader can upgrade efficiently
        const connected = areSourcesAndControllerConnected(room);
        console.log(`[Construction] RCL 1, sources/controller connected: ${connected}, should place roads: ${!connected}`);
        return !connected;
    }
    
    return towerSites.length === 0 && extensionSites.length === 0;
}

/** Check if sources and controller are connected via roads */
function areSourcesAndControllerConnected(room: Room): boolean
{
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return false;
    }
    
    // First, collect all tiles that have roads (built or sites)
    const roadTiles = new Set<string>();
    const structures = room.find(FIND_STRUCTURES);
    for (const structure of structures)
    {
        if (structure.structureType === STRUCTURE_ROAD)
        {
            roadTiles.add(String(structure.pos.x) + ',' + String(structure.pos.y));
        }
    }
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    for (const site of sites)
    {
        if (site.structureType === STRUCTURE_ROAD)
        {
            roadTiles.add(String(site.pos.x) + ',' + String(site.pos.y));
        }
    }
    
    // Flood fill from the spawn to find all connected road tiles
    const connectedTiles = new Set<string>();
    const queue: [number, number][] = [];
    
    // Check if spawn tile has a road
    const spawnKey = String(spawn.x) + ',' + String(spawn.y);
    if (roadTiles.has(spawnKey))
    {
        connectedTiles.add(spawnKey);
        queue.push([spawn.x, spawn.y]);
    }
    else
    {
        // If spawn doesn't have a road, start from spawn position anyway
        queue.push([spawn.x, spawn.y]);
    }
    
    while (queue.length > 0)
    {
        const item = queue.shift();
        if (!item)
        {
            break;
        }
        const x = item[0];
        const y = item[1];
        
        // Check all 8 neighbors
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                if (dx === 0 && dy === 0)
                {
                    continue;
                }
                
                const nx = x + dx;
                const ny = y + dy;
                
                // Check bounds
                if (nx < 0 || nx > 49 || ny < 0 || ny > 49)
                {
                    continue;
                }
                
                const nkey = String(nx) + ',' + String(ny);
                
                // Skip if already visited
                if (connectedTiles.has(nkey))
                {
                    continue;
                }
                
                // Check if neighbor has a road
                if (roadTiles.has(nkey))
                {
                    connectedTiles.add(nkey);
                    queue.push([nx, ny] as [number, number]);
                }
            }
        }
    }
    
    // Check if sources are connected (road tile adjacent to source)
    const sources = getSources(room);
    for (const source of sources)
    {
        let sourceConnected = false;
        // Check all tiles adjacent to source (range 1)
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                const nx = source.pos.x + dx;
                const ny = source.pos.y + dy;
                const nkey = String(nx) + ',' + String(ny);
                if (connectedTiles.has(nkey))
                {
                    sourceConnected = true;
                    break;
                }
            }
            if (sourceConnected)
            {
                break;
            }
        }
        if (!sourceConnected)
        {
            return false;
        }
    }
    
    // Check if controller is connected (road tile within range 3 of controller)
    const controllerPos = getControllerPosition(room);
    if (controllerPos !== null)
    {
        let controllerConnected = false;
        for (let dx = -3; dx <= 3; dx++)
        {
            for (let dy = -3; dy <= 3; dy++)
            {
                const nx = controllerPos.x + dx;
                const ny = controllerPos.y + dy;
                const nkey = String(nx) + ',' + String(ny);
                if (connectedTiles.has(nkey))
                {
                    controllerConnected = true;
                    break;
                }
            }
            if (controllerConnected)
            {
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

/** Manages construction of extensions, roads, towers, and containers */
export function manageConstruction(room: Room): void
{
    // Get controller level and spawn position for potential future use
    // const controllerLevel = getControllerLevel(room);
    // const spawn = getSpawnPosition(room);
    
    console.log(`[Construction] About to compute road paths`);
    // Compute road paths first (needed for cleanup)
    const roadPaths = computeRoadPaths(room);
    console.log(`[Construction] computeRoadPaths returned ${roadPaths.length} paths`);

    // Clean up old road sites that aren't on the computed paths
    cleanOldRoadSites(room, roadPaths);

    // Compute tower positions (highest priority)
    const towerPositions = computeTowerPositions(room);

    // Compute extension positions (second priority)
    const extensionPositions = computeExtensionPositions(room);

    // Compute container positions (third priority)
    const containerPositions = computeContainerPositions(room);

    // Debug: log positions
    if (extensionPositions.length === 0)
    {
        // console.log(`[Construction] No extension positions available (spawn exists: ${spawn !== null ? 'yes' : 'no'}, controllerLevel: ${controllerLevel})`);
    }
    
    // Place tower sites first (highest priority)
    placeTowerSites(room, towerPositions);

    // Place extension sites (second priority)
    placeExtensionSites(room, extensionPositions);

    // Place container sites (third priority)
    placeContainerSites(room, containerPositions);

    // Place road sites on computed paths (lowest priority)
    // Skip positions that are designated for extensions
    const shouldPlace = shouldPlaceRoadSites(room);
    if (shouldPlace)
    {
        console.log(`[Construction] Should place roads, roadPaths length: ${roadPaths.length}`);
        placeRoadSites(room, roadPaths, extensionPositions);
    }
}

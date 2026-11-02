/** Construction Manager
 * Manages the construction of towers, ramparts, extensions, containers,
 * and roads in the room.
 * Towers defend the room, heal creeps, and repair structures; the ramparts
 * on the spawn's and the towers' tiles are the shield in front of them.
 * Extensions store energy and increase room energy capacity.
 * Roads reduce travel fatigue and speed up movement.
 *
 * This manager computes optimal placement layouts based on the room's
 * actual objects (spawn, sources, controller) rather than using fixed coordinates.
 *
 * Structure limits come from the game's CONTROLLER_STRUCTURES table
 * (structureLimit below): at level 5 the room builds 2 towers and 30
 * extensions, never the RCL 3 numbers. Tower sites are placed one at a time.
 *
 * Layout invariant: the road network is the skeleton of the room. Extensions,
 * towers and containers are never placed on a road tile, because the
 * acceptance tests measure connectivity over road tiles only - a structure
 * sitting on the network would open a hole in it. Road sites that are missing
 * from the network are re-attempted every tick (existingRoadPositions check),
 * so a single failed createConstructionSite cannot permanently break the route.
 */

import { RAMPART_MIN_LEVEL } from "config";
import { isValidTile } from "utils/positions";

// TEMP-DEBUG (remove before commit): dedupe container placement diagnostics
let lastContainerDebugSig = "";
const lastNoPositionDebug: string[] = [];

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

/**
 * The maximum number of a buildable structure the controller level allows,
 * straight from the game's CONTROLLER_STRUCTURES table (the M4 spec: limits
 * come from the table, never from fixed numbers).
 *
 * The lookup goes through a function, and the fallback table is built at
 * call time, for the same reason bodyTemplates() is a function: the
 * structure constants only exist inside the Screeps sandbox, and unit tests
 * import this module in plain Node. In Node the fallback - the same values
 * the game's table holds - is used instead (string keys on purpose: they are
 * evaluated at call time, so the file stays importable outside the sandbox).
 * @param structureType The structure to look up (e.g. STRUCTURE_TOWER)
 * @param level The controller level
 * @returns The maximum number allowed at that level (0 when unknown)
 */
function structureLimit(structureType: BuildableStructureConstant, level: number): number
{
    let table: { [level: number]: number } | undefined;
    if (typeof CONTROLLER_STRUCTURES === "undefined")
    {
        const fallback: Partial<Record<BuildableStructureConstant, { [level: number]: number }>> = {
            extension: { 1: 0, 2: 5, 3: 10, 4: 20, 5: 30, 6: 40, 7: 50, 8: 60 },
            tower: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 2, 7: 3, 8: 6 },
            rampart: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 10, 6: 20, 7: 30, 8: 40 },
        };
        table = fallback[structureType];
    }
    else
    {
        table = CONTROLLER_STRUCTURES[structureType];
    }
    if (table === undefined)
    {
        return 0;
    }
    return table[level] ?? 0;
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

/**
 * Generate extension positions in a checkerboard pattern around the spawn,
 * up to `limit` (the controller level's extension allowance).
 */
function computeExtensionPositions(room: Room, excludeTiles: Set<string>, limit: number): RoomPosition[]
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

    // Look these up once for the whole search: they are fixed for the room,
    // and the candidate loop below runs hundreds of times.
    const sources = getSources(room);
    const controller = getControllerPosition(room);

    for (let range = 2; range <= maxRange; range++)
    {
        // Generate all positions at this range
        const positionsAtRange: RoomPosition[] = [];

        for (let dx = -range; dx <= range; dx++)
        {
            const dy1 = range - Math.abs(dx);
            if (dy1 >= 0)
            {
                // Top and bottom positions. isValidTile checks the numbers
                // BEFORE the RoomPosition constructor: the constructor
                // throws for coordinates outside 0..49, and a spawn near
                // the room edge pushes the ring off the map.
                const x = spawn.x + dx;
                const topY = spawn.y + dy1;
                if (isValidTile(x, topY))
                {
                    positionsAtRange.push(new RoomPosition(x, topY, room.name));
                }
                const bottomY = spawn.y - dy1;
                if (dy1 > 0 && isValidTile(x, bottomY))
                {
                    positionsAtRange.push(new RoomPosition(x, bottomY, room.name));
                }
            }
        }

        // Filter by checkerboard pattern and valid placement
        for (const pos of positionsAtRange)
        {
            // Skip if out of bounds
            if (!isValidTile(pos.x, pos.y))
            {
                continue;
            }

            // Skip if on wall terrain
            if (isWallPosition(pos, room))
            {
                continue;
            }

            // Skip if this tile belongs to the road network: a structure on a
            // road tile would break the road route's connectivity (the test
            // flood-fills road tiles only).
            if (excludeTiles.has(`${pos.x},${pos.y}`))
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
            if (controller !== null && pos.getRangeTo(controller) <= 1)
            {
                continue;
            }

            positions.push(pos);

            // Stop once the level's allowance is reached (M4: the limit
            // comes from CONTROLLER_STRUCTURES, not a fixed number).
            if (positions.length >= limit)
            {
                return positions;
            }
        }
    }

    return positions;
}

/**
 * Get tower positions near the spawn, up to `maxTowers` (the number of
 * towers the level still allows).
 */
function computeTowerPositions(room: Room, excludeTiles: Set<string>, maxTowers: number): RoomPosition[]
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

    // Look these up once for the whole search: they are fixed for the room,
    // and the candidate loop below runs hundreds of times.
    const sources = getSources(room);
    const controller = getControllerPosition(room);

    for (const range of ranges)
    {
        const positionsAtRange: RoomPosition[] = [];

        for (let dx = -range; dx <= range; dx++)
        {
            const dy = range - Math.abs(dx);
            if (dy >= 0)
            {
                // Same bounds guard as the extension search: never call the
                // RoomPosition constructor with coordinates outside 0..49.
                const x = spawn.x + dx;
                const topY = spawn.y + dy;
                if (isValidTile(x, topY))
                {
                    positionsAtRange.push(new RoomPosition(x, topY, room.name));
                }
                const bottomY = spawn.y - dy;
                if (dy > 0 && isValidTile(x, bottomY))
                {
                    positionsAtRange.push(new RoomPosition(x, bottomY, room.name));
                }
            }
        }

        for (const pos of positionsAtRange)
        {
            if (!isValidTile(pos.x, pos.y))
            {
                continue;
            }

            if (isWallPosition(pos, room))
            {
                continue;
            }

            // Never place the tower on a road tile (keeps the road network
            // connected for the acceptance flood-fill).
            if (excludeTiles.has(`${pos.x},${pos.y}`))
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
            if (controller !== null && pos.getRangeTo(controller) <= 1)
            {
                continue;
            }

            positions.push(pos);

            if (positions.length >= maxTowers)
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
function placeRoadSites(room: Room, roadPositions: RoomPosition[]): number
{
    const existingRoadSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_ROAD,
    });

    const existingRoadPositions = existingRoadSites.map((site) => `${site.pos.x},${site.pos.y}`);

    const controller = getControllerPosition(room);
    const sources = getSources(room);

    for (const pos of roadPositions)
    {
        // Skip if too close to controller (range 1) - keep controller area clear
        if (controller !== null && pos.getRangeTo(controller) <= 1)
        {
            continue;
        }

        // Skip if on a source tile itself (roads go on the adjacent tiles the
        // findPath with range 1 already produced; this is the safety net).
        let onSource = false;
        for (const source of sources)
        {
            if (pos.getRangeTo(source.pos) < 1)
            {
                onSource = true;
                break;
            }
        }
        if (onSource)
        {
            continue;
        }

        const key = `${pos.x},${pos.y}`;
        if (existingRoadPositions.includes(key))
        {
            continue;
        }

        // If something else (extension, tower, container, built structure) was
        // placed on this tile, do not stack a road site on top of it. The
        // layout invariant above keeps this from ever happening; this check
        // makes sure we do not spin on a failing createConstructionSite.
        const occupied = pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0
            || pos.lookFor(LOOK_STRUCTURES).some(
                (structure) => structure.structureType !== STRUCTURE_ROAD,
            );
        if (occupied)
        {
            continue;
        }

        // createConstructionSite queues an intent; a missing tile that failed
        // for any reason is simply re-attempted on the next tick by this
        // function, which re-runs every tick while the network is incomplete.
        room.createConstructionSite(pos, STRUCTURE_ROAD);
    }
    return 0;  // TODO: Track actually placed roads
}

/**
 * Place extension construction sites, up to the level's allowance.
 * @param room The room to place sites in
 * @param extensionPositions Candidate positions, in priority order
 * @param limit The maximum number of extensions the controller level allows
 */
function placeExtensionSites(room: Room, extensionPositions: RoomPosition[], limit: number): void
{
    // Count built extensions AND sites: the room must never hold more than
    // the level allows (CONTROLLER_STRUCTURES), so sites are only placed
    // for the missing ones.
    const extensionsBuilt = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_EXTENSION,
    }).length;
    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    }).length;

    const remaining = Math.min(limit - (extensionsBuilt + extensionSites), extensionPositions.length);
    if (remaining <= 0)
    {
        return;
    }

    const controllerLevel = getControllerLevel(room);
    if (controllerLevel < 2)
    {
        return;
    }

    for (let i = 0; i < extensionPositions.length; i++)
    {
        if (i >= remaining)
        {
            break;
        }

        const pos = extensionPositions[i];

        // Skip if there's already any construction site (road, tower, etc.)
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites.length > 0)
        {
            continue;
        }

        const result = room.createConstructionSite(pos, STRUCTURE_EXTENSION);
        if (result !== OK)
        {
            // The position is occupied or invalid right now; the next
            // recomputation of the position list will skip it.
            continue;
        }
    }
}

/**
 * Place tower construction sites, one at a time, up to the level's limit
 * (1 tower at RCL 3-4, 2 from RCL 5 on - the CONTROLLER_STRUCTURES table).
 * The builders finish the current tower before the next site is placed, so
 * construction energy never splits between two towers at once.
 * @param room The room to place a site in
 * @param towerPositions Candidate positions, in priority order
 */
function placeTowerSites(room: Room, towerPositions: RoomPosition[]): void
{
    const controllerLevel = getControllerLevel(room);
    const limit = structureLimit(STRUCTURE_TOWER, controllerLevel);
    if (limit < 1 || towerPositions.length === 0)
    {
        return;
    }

    const towersBuilt = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER,
    }).length;

    if (towersBuilt >= limit)
    {
        return;
    }

    const towerSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_TOWER,
    });
    if (towerSites.length > 0)
    {
        // The builders are already on a tower; wait for it to finish.
        return;
    }

    // Find existing construction sites at tower positions and skip occupied ones
    for (const pos of towerPositions)
    {
        const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
        if (sites.length === 0)
        {
            room.createConstructionSite(pos, STRUCTURE_TOWER);
            return; // Only one tower site at a time
        }
    }
}

/**
 * Place rampart construction sites: one on the spawn's tile and one on each
 * finished tower's tile (M4). The rampart is the shield the spawn and the
 * tower sit behind. Existing ramparts and sites are never re-placed, so the
 * cost only appears once per structure.
 *
 * Gated on the tower level (RAMPART_MIN_LEVEL = 3): below that there is no
 * tower to protect, and the spec does not require early ramparts.
 *
 * A rampart is the only structure that may be built on an already occupied
 * tile - that is why the targets ARE the spawn's and the towers' tiles, and
 * why the "already there" check looks for a rampart specifically, not for
 * any structure (the spawn and the tower are on the tile on purpose).
 * @param room The room to place rampart sites in
 * @param structures The room's own structures (passed in, found once per tick)
 */
function placeRampartSites(room: Room, structures: Structure[]): void
{
    if (getControllerLevel(room) < RAMPART_MIN_LEVEL)
    {
        return;
    }

    const targets: RoomPosition[] = [];
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length > 0)
    {
        targets.push(spawns[0].pos);
    }
    for (const structure of structures)
    {
        if (structure.structureType === STRUCTURE_TOWER)
        {
            targets.push(structure.pos);
        }
    }

    for (const pos of targets)
    {
        const ramparts = pos.lookFor(LOOK_STRUCTURES)
            .filter((structure) => structure.structureType === STRUCTURE_RAMPART);
        const hasSite = pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0;
        if (ramparts.length === 0 && !hasSite)
        {
            room.createConstructionSite(pos, STRUCTURE_RAMPART);
        }
    }
}

/** Compute container positions for each source */
function computeContainerPositions(room: Room, excludeTiles: Set<string>): RoomPosition[]
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
        const rejections: string[] = [];
        
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                if (dx === 0 && dy === 0)
                {
                    continue; // Skip source tile itself
                }
                
                const nx = source.pos.x + dx;
                const ny = source.pos.y + dy;

                // Skip if out of bounds. The numbers are checked BEFORE the
                // RoomPosition constructor: it throws for coordinates
                // outside 0..49, so constructing first would abort the
                // whole placement loop (owner feedback 2026-11-01).
                if (!isValidTile(nx, ny))
                {
                    rejections.push(`${nx},${ny}:oob`);
                    continue;
                }

                const containerPos = new RoomPosition(nx, ny, room.name);
                
                // Skip if on wall terrain
                if (isWallPosition(containerPos, room))
                {
                    rejections.push(`${source.pos.x + dx},${source.pos.y + dy}:wall`);
                    continue;
                }

                // Skip road-network tiles: a container on the route would open
                // a hole in the road flood-fill.
                if (excludeTiles.has(`${containerPos.x},${containerPos.y}`))
                {
                    rejections.push(`${source.pos.x + dx},${source.pos.y + dy}:excl`);
                    continue;
                }
                
                // Check if occupied by structure or site
                const structures = containerPos.lookFor(LOOK_STRUCTURES);
                const sites = containerPos.lookFor(LOOK_CONSTRUCTION_SITES);
                
                if (structures.length > 0 || sites.length > 0)
                {
                    rejections.push(`${source.pos.x + dx},${source.pos.y + dy}:occ(${structures.length},${sites.length})`);
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
            // TEMP-DEBUG
            const rejSig = `no:${source.pos.x},${source.pos.y}:${rejections.join(" ")}`;
            if (lastNoPositionDebug.indexOf(rejSig) === -1)
            {
                lastNoPositionDebug.push(rejSig);
                console.log(`[cdbg] ${rejSig}`);
            }
        }
    }

    // TEMP-DEBUG
    const dbgSig = `srcs=[${sources.map((s) => String(s.pos.x) + "," + String(s.pos.y)).join(";")}] pos=[${positions.map((p) => String(p.x) + "," + String(p.y)).join(";")}] excl=${excludeTiles.size} exist=${existingContainerPositions.size}`;
    if (dbgSig !== lastContainerDebugSig)
    {
        lastContainerDebugSig = dbgSig;
        console.log(`[cdbg] ${dbgSig}`);
    }
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
            const result = room.createConstructionSite(pos, STRUCTURE_CONTAINER);
            // TEMP-DEBUG
            console.log(`[cdbg] createContainerSite ${pos.x},${pos.y} -> ${result}`);
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
        return !areSourcesAndControllerConnected(room);
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
    // Compute road paths first (needed for cleanup and for the layout invariant:
    // extensions, towers and containers must not occupy road-network tiles).
    const roadPaths = computeRoadPaths(room);
    const roadNetworkTiles = new Set(roadPaths.map((pos) => `${pos.x},${pos.y}`));

    // Clean up old road sites that aren't on the computed paths
    cleanOldRoadSites(room, roadPaths);

    // Count what is built and under construction, and what the controller
    // level allows (CONTROLLER_STRUCTURES, not the RCL 3 numbers).
    const level = getControllerLevel(room);
    const structures = room.find(FIND_MY_STRUCTURES);
    const sites = room.find(FIND_CONSTRUCTION_SITES);

    const towersBuilt = structures.filter((s) => s.structureType === STRUCTURE_TOWER).length;
    const towerSites = sites.filter((s) => s.structureType === STRUCTURE_TOWER).length;
    const towerLimit = structureLimit(STRUCTURE_TOWER, level);

    const extensionsBuilt = structures.filter((s) => s.structureType === STRUCTURE_EXTENSION).length;
    const extensionSites = sites.filter((s) => s.structureType === STRUCTURE_EXTENSION).length;
    const extensionLimit = structureLimit(STRUCTURE_EXTENSION, level);

    // Skip the position searches entirely once a class is at its limit:
    // they are the most expensive part of this manager (per-tile lookFor
    // and getRangeTo over hundreds of candidates), and the M4 test runs
    // 6,000 ticks. All missing tower positions are computed (not just the
    // next one): placeTowerSites still places only one site at a time, but
    // the whole set is reserved so extensions cannot take the future tiles.
    const towerPositions = towersBuilt + towerSites < towerLimit
        ? computeTowerPositions(room, roadNetworkTiles, towerLimit - towersBuilt - towerSites)
        : [];

    // Reserve the road network plus every future tower tile from the
    // extension (and container) layout. The extension search fills the
    // checkerboard rings from range 2 outward, and at level 5 all 30 of its
    // slots fit inside ranges 2-4 - exactly the range the second tower is
    // searched for. Without this reservation the extensions occupy every
    // candidate tile and the second tower site can never be placed (M4
    // acceptance failure of 2026-10-31: towersBuilt + towerSites stuck at 1).
    const towerReserveTiles = new Set(roadNetworkTiles);
    for (const pos of towerPositions)
    {
        towerReserveTiles.add(`${pos.x},${pos.y}`);
    }
    const extensionPositions = extensionsBuilt + extensionSites < extensionLimit
        ? computeExtensionPositions(room, towerReserveTiles, extensionLimit)
        : [];

    // Compute container positions (third priority), excluding the road
    // network and the reserved tower tiles
    const containerPositions = computeContainerPositions(room, towerReserveTiles);

    // Place tower sites first (highest priority)
    placeTowerSites(room, towerPositions);

    // Place rampart sites (M4: on the spawn's and the towers' tiles)
    placeRampartSites(room, structures);

    // Place extension sites (second priority)
    placeExtensionSites(room, extensionPositions, extensionLimit);

    // Place container sites (third priority)
    placeContainerSites(room, containerPositions);

    // Place road sites on computed paths (lowest priority)
    const shouldPlace = shouldPlaceRoadSites(room);
    if (shouldPlace)
    {
        placeRoadSites(room, roadPaths);
    }
}

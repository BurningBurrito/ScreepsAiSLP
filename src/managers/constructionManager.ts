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
 * Layout invariant: the road network is the skeleton of the room. Extensions
 * and towers are never placed on a road tile, because the acceptance tests
 * measure connectivity over road tiles only. Containers may share a tile
 * with a road (the engine allows it, and real Screeps does too), but the
 * ORDER on such a tile depends on the controller level:
 *   - Below CONTAINER_BOOST_MIN_LEVEL (4) the ROAD comes first: the M3
 *     acceptance flood fill counts road objects only (sites and built
 *     roads), so while the road is still unbuilt a container site on the
 *     same tile would open a hole in the network and fail "connected roads
 *     from spawn to all sources" - the engine allows at most one
 *     construction site per tile, so both cannot sit there at once (M3
 *     failure of 2026-11-06: W0N1's source at 39,14 has exactly one
 *     walkable neighbour, 40,13, which is the road's end tile). The
 *     container follows once the road is BUILT: road and container
 *     structures may share a tile, so the pocket source still gets its
 *     container - just not before the road (placeContainerSites gates on
 *     the built road, placeRoadSites takes the tile back if an old
 *     container site stands there).
 *   - At level 4 and up (the M5 static-mining stage) the CONTAINER takes
 *     the tile directly: in those rooms the road network is gated off
 *     while the extension queue stands (shouldPlaceRoadSites), so the
 *     built road the wait below level 4 expects may never come - waiting
 *     would leave the source without a container for the whole M5 window.
 *     placeContainerSites removes an unbuilt road site on the tile and
 *     places the container there; placeRoadSites skips its legacy
 *     container-swap for that tile, so the road network keeps its gap.
 * The in-game flood fill (areSourcesAndControllerConnected) counts
 * container sites and containers as road tiles as well, so the network
 * reads as connected either way.
 * Road sites that are missing from the network are re-attempted every tick
 * (existingRoadPositions check), so a single failed createConstructionSite
 * cannot permanently break the route.
 */

import { CONTAINER_BOOST_MIN_LEVEL, RAMPART_MIN_LEVEL, SPAWN_KEEP_CLEAR_RANGE, TOWER_SITE_DEEP_CANDIDATES, TOWER_SITE_DEEP_RANGES, TOWER_SITE_RANGES } from "config";
import { isValidTile } from "utils/positions";

// "structureType@x,y" keys of failed site placements already logged this
// module lifetime. A global reset loses the set, which is exactly right:
// at most one log line per reset per tile, never one per tick (owner
// feedback 2026-11-04: log a failed placement once, then move on).
const siteFailureLog: Set<string> = new Set();

/**
 * Log a failed createConstructionSite at most once per tile per reset.
 * @param structureType What we tried to place (for the log line).
 * @param pos The tile the placement failed on.
 * @param result The error code the engine returned.
 */
function logSiteFailureOnce(structureType: string, pos: RoomPosition, result: number): void
{
    const key = `${structureType}@${pos.x},${pos.y}`;
    if (siteFailureLog.has(key))
    {
        return;
    }
    siteFailureLog.add(key);
    console.log(`[Construction] createConstructionSite ${structureType} at ${pos.x},${pos.y} failed with code ${result}`);
}

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
    // Narrow search (owner feedback 2026-11-02): extensions hug the spawn.
    // The checkerboard keeps only even rings, so this loop is really ranges
    // 2 and 4. RCL 2 (5 extensions) fits inside those two rings, so the
    // search never reaches ring 5+ where the source roads run; higher
    // levels (30 at RCL 5) still widen to range 8 as before.
    const maxRange = limit > 8 ? 8 : 4;

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

            // Skip the spawn's parking ring (SPAWN_KEEP_CLEAR_RANGE, see
            // config): the diagonal tiles of this very ring are where
            // creeps end a moveTo to the spawn - energy deliveries and
            // parked haulers. A site on one of them is unbuildable for as
            // long as a delivery sits on the tile (build() needs the
            // builder alone on the tile), and as the "focus" site (most
            // progress) that spins the whole crew: the M4
            // builder/extension deadlock, 0 of 3 extensions finished
            // (owner feedback 2026-11-05).
            if (pos.getRangeTo(spawn) <= SPAWN_KEEP_CLEAR_RANGE)
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
 *
 * The search walks the diamond rings of `ranges`, closest first, and skips
 * no parity: the checkerboard filter the extension search uses is there so
 * every extension has walkable neighbours, and a tower has no such
 * requirement. Filtering it in here was what made "search up to range 5" a
 * no-op in practice - rings 3 and 5 sit on the opposite parity from the
 * spawn and were silently skipped, so a cramped room whose even rings were
 * full by roads and extension sites could never place a second tower
 * (owner feedback 2026-11-02).
 * @param room The room to search in
 * @param excludeTiles The road network's tiles, never buildable for towers
 * @param maxTowers How many candidates to return
 * @param ranges The diamond rings to walk, closest first
 * (TOWER_SITE_RANGES by default; the placement fallback passes the primary
 * ranges plus the deeper TOWER_SITE_DEEP_RANGES)
 * @returns Up to `maxTowers` candidate positions, in priority order
 */
function computeTowerPositions(
    room: Room,
    excludeTiles: Set<string>,
    maxTowers: number,
    ranges: number[] = TOWER_SITE_RANGES,
): RoomPosition[]
{
    const positions: RoomPosition[] = [];
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return positions;
    }

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

            // Skip the spawn's parking ring (SPAWN_KEEP_CLEAR_RANGE, see
            // config): the diamond ring 2 walks the diagonal tiles of the
            // spawn's own Chebyshev range-1 ring first, and a tower site
            // there is unbuildable while deliveries occupy the tile - the
            // same deadlock the extension search avoids (owner feedback
            // 2026-11-05). The axial tiles of diamond ring 2 sit at
            // Chebyshev range 2 and stay valid tower positions.
            if (pos.getRangeTo(spawn) <= SPAWN_KEEP_CLEAR_RANGE)
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

        // If something else (extension, tower, built structure) was placed on
        // this tile, do not stack a road site on top of it. A container is
        // the exception: the engine allows a road and a container to share a
        // tile (see the file header), and a wall-pocket source needs exactly
        // that. This check makes sure we do not spin on a failing
        // createConstructionSite for any other combination.
        const occupied = pos.lookFor(LOOK_CONSTRUCTION_SITES).some(
            (site) => site.structureType !== STRUCTURE_CONTAINER,
        ) || pos.lookFor(LOOK_STRUCTURES).some(
            (structure) => structure.structureType !== STRUCTURE_ROAD
                && structure.structureType !== STRUCTURE_CONTAINER,
        );
        if (occupied)
        {
            continue;
        }

        // A container SITE on this road tile is handled by level: below
        // CONTAINER_BOOST_MIN_LEVEL it means a pre-M3-fix world (or a
        // placement order we did not expect), so the road must be there
        // first: remove the container site and take the tile for the road.
        // remove() is immediate, not an intent, so the road site goes on
        // the same tick; the container is placed again on top of the built
        // road by placeContainerSites. At level 4 and up the container is
        // the intended owner of the tile (the M5 static-mining stage, see
        // the file header) and the swap is skipped - the road keeps its
        // gap. Once the road is BUILT, a container site on the tile is the
        // finished pair (road and container structures may share a tile)
        // and is left alone at every level.
        const hasContainerSite = pos.lookFor(LOOK_CONSTRUCTION_SITES).some(
            (site) => site.structureType === STRUCTURE_CONTAINER,
        );
        if (hasContainerSite)
        {
            const hasBuiltRoad = pos.lookFor(LOOK_STRUCTURES).some(
                (structure) => structure.structureType === STRUCTURE_ROAD,
            );
            if (hasBuiltRoad)
            {
                continue; // the pair is complete - the container stays
            }
            // L4+ (M5 static-mining stage): the container owns the pocket
            // tile - placeContainerSites takes it directly, because in the
            // static-mining rooms the built road may never come. Skip the
            // legacy swap: the road keeps its gap at this tile and the
            // container site is left to be built.
            if (getControllerLevel(room) >= CONTAINER_BOOST_MIN_LEVEL)
            {
                continue;
            }
            for (const site of pos.lookFor(LOOK_CONSTRUCTION_SITES))
            {
                if (site.structureType === STRUCTURE_CONTAINER)
                {
                    site.remove();
                }
            }
        }

        // createConstructionSite queues an intent; a missing tile that failed
        // for any reason is simply re-attempted on the next tick by this
        // function, which re-runs every tick while the network is incomplete.
        // The code is checked, not assumed: a persistent failure is logged
        // once per tile so it is visible instead of silent (owner feedback
        // 2026-11-04).
        const result = room.createConstructionSite(pos, STRUCTURE_ROAD);
        if (result !== OK)
        {
            logSiteFailureOnce(STRUCTURE_ROAD, pos, result);
        }
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
 *
 * Candidates are tried in priority order and a tile the engine refuses
 * (createConstructionSite returns an error) moves on to the next one. If
 * every candidate fails - refused by the engine, or none found at all
 * because every free tile of rings 2-5 is held by a road or a construction
 * site - the whole range of rings 2-8 (primary plus deep ranges) is
 * searched. If there is still no free tile,
 * one of the room's own unbuilt extension construction sites (the one
 * closest to the spawn) is removed and the tower is built on its tile; a
 * finished extension is working infrastructure and is never touched. The
 * extension layout re-picks the freed slot on the next free tile next tick,
 * so the colony loses no extensions, it only moves one (owner feedback
 * 2026-11-02: in the owner's room the 30 extensions plus the roads filled
 * every tile of the tower search and the second tower never got placed).
 * @param room The room to place a site in
 * @param towerPositions Reserved candidate positions, in priority order
 * (all the room's future tower tiles; empty when the static search found
 * none)
 * @param roadNetworkTiles The room's road network, excluded from the search
 */
function placeTowerSites(room: Room, towerPositions: RoomPosition[], roadNetworkTiles: Set<string>): void
{
    const controllerLevel = getControllerLevel(room);
    const limit = structureLimit(STRUCTURE_TOWER, controllerLevel);
    if (limit < 1)
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

    // Try the candidates in priority order (owner feedback 2026-11-02).
    // A candidate may hold a site already (skip it), or the engine may
    // still refuse the tile even though every static check passed - a
    // foreign structure, the spawn, or a position outside the build
    // range. The old code fired createConstructionSite at the first empty
    // candidate and gave up no matter what happened; now a refused
    // placement moves on to the next candidate, so a tower never starves
    // because of one bad tile.
    const tryPositions = (candidates: RoomPosition[]): boolean =>
    {
        for (const pos of candidates)
        {
            const sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (sites.length > 0)
            {
                continue; // occupied (own or foreign site) - try the next candidate
            }
            if (room.createConstructionSite(pos, STRUCTURE_TOWER) === OK)
            {
                return true; // Only one tower site at a time
            }
        }
        return false;
    };

    if (tryPositions(towerPositions))
    {
        return;
    }

    // Every reserved candidate failed: either the engine rejected tiles the
    // static checks did not catch, or the static search found no candidate
    // at all (towerPositions is empty - every free tile of rings 2-5 is
    // held by a road or a construction site). Re-scan the primary rings
    // PLUS the deeper rings so the tower still lands this tick when any
    // tile of rings 2-8 is free: a refused tile is skipped again and the
    // search moves on to the next one. This path is rare, so the extra
    // position search costs almost nothing (owner feedback 2026-11-02).
    const fallbackRanges = [...TOWER_SITE_RANGES, ...TOWER_SITE_DEEP_RANGES];
    const fallbackCandidates = computeTowerPositions(
        room,
        roadNetworkTiles,
        TOWER_SITE_DEEP_CANDIDATES,
        fallbackRanges,
    );
    if (tryPositions(fallbackCandidates))
    {
        return;
    }

    // Last resort (owner feedback 2026-11-02): every tile in rings 2-8 is
    // occupied. Remove one of the room's OWN unbuilt extension construction
    // sites - the one closest to the spawn - and build the tower on its
    // tile. Only sites are ever removed, never a finished structure: a
    // working extension keeps the economy running, an unbuilt site is just
    // a queue entry that computeExtensionPositions re-picks on the next
    // free tile next tick (the tower's tile leaves the extension search
    // through the tower reservation).
    const spawn = getSpawnPosition(room);
    if (spawn === null)
    {
        return;
    }
    const extensionSites = room.find(FIND_CONSTRUCTION_SITES, {
        filter: (site) => site.structureType === STRUCTURE_EXTENSION,
    });
    let nearest: ConstructionSite | null = null;
    for (const site of extensionSites)
    {
        if (nearest === null || site.pos.getRangeTo(spawn) < nearest.pos.getRangeTo(spawn))
        {
            nearest = site;
        }
    }
    if (nearest === null)
    {
        return; // No unbuilt extension site to make room with - try again next tick
    }
    nearest.remove();
    if (room.createConstructionSite(nearest.pos, STRUCTURE_TOWER) !== OK)
    {
        // The engine refused the tile even though nothing stands on it any
        // more (should not happen). The freed slot is refilled by the
        // extension layout next tick; the tower search runs again then too.
        return;
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

/**
 * Compute container positions for each source.
 *
 * A container may share its tile with a road (see the layout invariant in the
 * file header), so the road network is NOT excluded here - and a tile that
 * only holds a road (built or site) is not "occupied": a wall-pocket source
 * may have exactly one walkable neighbour, and it can be the road's end
 * tile, so excluding road tiles would leave that source without any
 * container at all. The ORDER on a shared tile is enforced by
 * placeContainerSites: below level 4 it places the container only after
 * the road is built (the M3 acceptance flood fill needs the road there
 * first); at level 4 and up it takes the tile directly (see the layout
 * invariant in the file header). Every
 * other structure or site does occupy the tile, and a container site
 * already placed for this source is the success case the per-source check
 * above skips.
 */
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
                
                const nx = source.pos.x + dx;
                const ny = source.pos.y + dy;

                // Skip if out of bounds. The numbers are checked BEFORE the
                // RoomPosition constructor: it throws for coordinates
                // outside 0..49, so constructing first would abort the
                // whole placement loop (owner feedback 2026-11-01).
                if (!isValidTile(nx, ny))
                {
                    continue;
                }

                const containerPos = new RoomPosition(nx, ny, room.name);
                
                // Skip if on wall terrain
                if (isWallPosition(containerPos, room))
                {
                    continue;
                }

                // Check if occupied: a road (built or site) may share the tile
                // with the container, everything else may not.
                const structures = containerPos.lookFor(LOOK_STRUCTURES);
                const sites = containerPos.lookFor(LOOK_CONSTRUCTION_SITES);

                if (structures.some((structure) => structure.structureType !== STRUCTURE_ROAD)
                    || sites.some((site) => site.structureType !== STRUCTURE_ROAD
                        && site.structureType !== STRUCTURE_CONTAINER))
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
        }
    }

    return positions;
}

/**
 * Place container construction sites, one per tick.
 *
 * On a road-network tile the order depends on the controller level (see the
 * layout invariant in the file header): below level 4 the ROAD comes first -
 * the M3 acceptance flood fill counts road objects only, so while the road
 * is still unbuilt a container site on the same tile would open a hole in
 * the network and fail "connected roads to all sources"; the container
 * waits for the built road and is placed on top of it once the road is
 * finished (road and container structures may share a tile, so the pocket
 * source still gets its container). At level 4 and up the container takes
 * the tile directly - an unbuilt road site on it is removed, because in the
 * static-mining rooms the built road may never come (shouldPlaceRoadSites
 * gates the network off while the extension queue stands). On any non-road
 * tile the container is placed as soon as the tile is free.
 * @param room The room to place sites in.
 * @param containerPositions Candidate positions, one per source, best first.
 * @param roadNetworkTiles Every tile of the computed road paths ("x,y").
 */
function placeContainerSites(room: Room, containerPositions: RoomPosition[], roadNetworkTiles: Set<string>): void
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

        if (hasContainer || hasSite)
        {
            continue;
        }

        // On a road-network tile the container and the road contest one
        // tile (the engine allows at most one CONSTRUCTION SITE per tile):
        //   - Below CONTAINER_BOOST_MIN_LEVEL (4) the ROAD comes first:
        //     wait until the road is BUILT, then place the container on
        //     top of it. While the road is still a site - or not placed
        //     yet, this function runs before placeRoadSites on the same
        //     tick - a container here would remove the road tile the M3
        //     flood fill needs (it counts road objects only).
        //   - At level 4 and up the CONTAINER takes the tile directly:
        //     in the static-mining rooms the road network is gated off
        //     while the extension queue stands (shouldPlaceRoadSites), so
        //     the built road this branch waits for may never come -
        //     waiting would leave this source without a container for the
        //     whole M5 window. An unbuilt road site on the tile is
        //     removed (site.remove() is immediate, so the container site
        //     can be placed on this tick); the inverse of the legacy
        //     swap, which placeRoadSites skips for this tile at L4+.
        if (roadNetworkTiles.has(`${pos.x},${pos.y}`))
        {
            const hasBuiltRoad = structures.some((s) => s.structureType === STRUCTURE_ROAD);
            if (!hasBuiltRoad)
            {
                if (getControllerLevel(room) < CONTAINER_BOOST_MIN_LEVEL)
                {
                    continue;
                }
                const roadSite = sites.find((s) => s.structureType === STRUCTURE_ROAD);
                if (roadSite !== undefined)
                {
                    roadSite.remove();
                }
            }
        }

        const result = room.createConstructionSite(pos, STRUCTURE_CONTAINER);
        if (result !== OK)
        {
            // The tile is contested in a way we did not expect (another
            // structure or site type). Log once per tile, then try the next
            // candidate instead of retrying the same tile every tick.
            logSiteFailureOnce(STRUCTURE_CONTAINER, pos, result);
            continue;
        }

        return; // Only place one container at a time
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
    
    // First, collect all tiles that have roads (built or sites) or containers
    // (built or sites). Containers count because the engine allows at most one
    // construction site per tile: while a container site stands on the
    // network, the road site on that tile cannot exist yet - and once the
    // container is built, the road lands on the same tile (road and container
    // structures may share it). Without this, the network would read as
    // "disconnected" for the whole build time of every on-path container.
    const roadTiles = new Set<string>();
    const structures = room.find(FIND_STRUCTURES);
    for (const structure of structures)
    {
        if (structure.structureType === STRUCTURE_ROAD || structure.structureType === STRUCTURE_CONTAINER)
        {
            roadTiles.add(String(structure.pos.x) + ',' + String(structure.pos.y));
        }
    }
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    for (const site of sites)
    {
        if (site.structureType === STRUCTURE_ROAD || site.structureType === STRUCTURE_CONTAINER)
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
    // Tower before extensions (owner feedback 2026-11-02): at RCL 3-4 the
    // tower limit is 1 and the tower is the first thing a level 3 room
    // builds (rule 02b). While that tower is not finished - no built tower
    // and no site - the extensions do not start: the builder crew and the
    // first ~5000 energy all go to the tower. The gate is exactly "limit 1":
    // from RCL 5 on (limit 2) the M4 flow (tower site and 30 extensions side
    // by side, second tower's tile reserved) is kept unchanged.
    const towerBlocksExtensions = towerLimit === 1 && towersBuilt + towerSites < towerLimit;

    const extensionPositions = !towerBlocksExtensions && extensionsBuilt + extensionSites < extensionLimit
        ? computeExtensionPositions(room, towerReserveTiles, extensionLimit)
        : [];

    // Compute container positions (third priority). Unlike extensions and
    // towers they are NOT kept off the road network: a container may share
    // its tile with a road, which is the only option for a wall-pocket
    // source (see the layout invariant in the file header). On a road tile
    // the order depends on the level: below level 4 placeContainerSites
    // gates the placement on the BUILT road (roadNetworkTiles); at level 4
    // and up it takes the tile directly (the M5 static-mining stage).
    const containerPositions = computeContainerPositions(room);

    // Place tower sites first (highest priority)
    placeTowerSites(room, towerPositions, roadNetworkTiles);

    // Place rampart sites (M4: on the spawn's and the towers' tiles)
    placeRampartSites(room, structures);

    // Place extension sites (second priority)
    placeExtensionSites(room, extensionPositions, extensionLimit);

    // Place container sites (third priority)
    placeContainerSites(room, containerPositions, roadNetworkTiles);

    // Place road sites on computed paths (lowest priority)
    const shouldPlace = shouldPlaceRoadSites(room);
    if (shouldPlace)
    {
        placeRoadSites(room, roadPaths);
    }
}

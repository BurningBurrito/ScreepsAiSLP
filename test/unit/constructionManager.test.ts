/** Unit tests for the construction layout in src/managers/constructionManager.ts.
 *
 * Regression for the M4 acceptance failure of 2026-10-31: at level 5 all 30
 * extension slots fit inside ranges 2-4 around the spawn - exactly the range
 * the tower search covers - so the extensions occupied every candidate tile
 * and the second tower site could never be placed. The layout must reserve
 * the future tower tiles before it fills the extensions.
 *
 * The mocks below replace the game globals constructionManager.ts reads
 * (RoomPosition, FIND_*, LOOK_*, STRUCTURE_*) with the same shapes and
 * semantics (Chebyshev getRangeTo, per-tile lookFor), so the position
 * searches run exactly as they do in-game.
 */
import {assert} from "chai";
import {manageConstruction} from "../../src/managers/constructionManager";

// Screeps constants referenced as globals by constructionManager.ts. The
// mock room below dispatches on these exact numbers, so they only have to
// be unique and consistent inside this file (the game sandbox provides the
// same names in production).
const OK = 0;
const ERR_INVALID_TARGET = -8;
const FIND_SOURCES = 106;
const FIND_MY_SPAWNS = 109;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_MY_STRUCTURES = 112;
const FIND_STRUCTURES = 114;
const LOOK_STRUCTURES = 10;
const LOOK_CONSTRUCTION_SITES = 12;
const STRUCTURE_TOWER = "tower";
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_CONTAINER = "container";
const STRUCTURE_ROAD = "road";
const STRUCTURE_RAMPART = "rampart";
const STRUCTURE_WALL = "wall";
const TERRAIN_MASK_WALL = 1;

/** A tile's occupancies, shared by every PositionMock in one test. */
type Tile = { structures: any[]; sites: any[] };

let tiles: Map<string, Tile>;

function tileKey(x: number, y: number): string
{
    return `${x},${y}`;
}

/** Get (creating on demand) the occupancy record for a tile. */
function tileAt(x: number, y: number): Tile
{
    if (!tiles.has(tileKey(x, y)))
    {
        tiles.set(tileKey(x, y), {structures: [], sites: []});
    }
    return tiles.get(tileKey(x, y)) as Tile;
}

/**
 * RoomPosition mock with a working lookFor and the real getRangeTo
 * semantics (Chebyshev distance), so the position searches under test
 * behave exactly as they do in-game.
 */
class PositionMock
{
    x: number;
    y: number;
    roomName: string;

    constructor(x: number, y: number, roomName: string)
    {
        // Mirror the real game: the RoomPosition constructor throws for
        // coordinates outside 0..49. The construction searches add offsets
        // to the spawn/source position, so a spawn near the room edge builds
        // an out-of-bounds position and aborts the whole tick (owner feedback
        // 2026-11-01). Enforcing the same throw here is what makes the edge
        // tests below catch a regression: the old unguarded code throws here,
        // the fixed code filters the tile out with isValidTile first.
        if (x < 0 || x > 49 || y < 0 || y > 49)
        {
            throw new Error("Invalid arguments in RoomPosition constructor");
        }
        this.x = x;
        this.y = y;
        this.roomName = roomName;
    }

    lookFor(type: number): any[]
    {
        const tile = tileAt(this.x, this.y);
        if (type === LOOK_STRUCTURES)
        {
            return tile.structures;
        }
        if (type === LOOK_CONSTRUCTION_SITES)
        {
            return tile.sites;
        }
        return [];
    }

    getRangeTo(target: {x: number; y: number}): number
    {
        return Math.max(Math.abs(target.x - this.x), Math.abs(target.y - this.y));
    }
}

/**
 * Builds a level-5 room in the canonical test layout: spawn AND controller
 * at the center (25,25), one source in each far corner, all plain terrain,
 * no roads (findPath returns no path). The position searches walk
 * Manhattan-diamond rings (|dx| + |dy| = range): at "range 2" the four
 * diagonal tiles sit at range 1 from the controller (on the spawn's tile)
 * and are excluded, so the tower candidates are the axial tiles (23,25),
 * (25,27), (25,23), (27,25) - the first tower goes to (23,25), the second
 * to (25,27). Same saturation geometry as the M4 acceptance world.
 * @returns The mock room; its structures/sites arrays are the state.
 */
function makeRoom(): any
{
    const room: any = {
        name: "W0N1",
        controller: {level: 5, pos: new PositionMock(25, 25, "W0N1")},
        structures: [] as any[],
        sites: [] as any[],
        spawn: {pos: new PositionMock(25, 25, "W0N1")},
        sources: [
            {pos: new PositionMock(10, 10, "W0N1")},
            {pos: new PositionMock(40, 40, "W0N1")},
        ],
        find: (type: number, opts?: any): any[] => {
            let out: any[] = [];
            if (type === FIND_MY_SPAWNS)
            {
                out = [room.spawn];
            }
            else if (type === FIND_MY_STRUCTURES || type === FIND_STRUCTURES)
            {
                out = room.structures;
            }
            else if (type === FIND_CONSTRUCTION_SITES)
            {
                out = room.sites;
            }
            else if (type === FIND_SOURCES)
            {
                out = room.sources;
            }
            if (opts !== undefined && typeof opts.filter === "function")
            {
                out = out.filter(opts.filter);
            }
            return out;
        },
        findPath: (): any[] => [],
        getTerrain: (): any => ({get: (_x: number, _y: number): number => 0}),
        createConstructionSite: (pos: any, structureType: string): number => {
            const site: any = {
                structureType,
                pos,
                remove: (): void => {
                    const i = room.sites.indexOf(site);
                    if (i >= 0)
                    {
                        room.sites.splice(i, 1);
                    }
                    const tile = tileAt(pos.x, pos.y);
                    const j = tile.sites.indexOf(site);
                    if (j >= 0)
                    {
                        tile.sites.splice(j, 1);
                    }
                },
            };
            room.sites.push(site);
            tileAt(pos.x, pos.y).sites.push(site);
            return OK;
        },
    };
    return room;
}

/** Record a finished structure on a tile (both the room and the tile map). */
function addStructure(room: any, x: number, y: number, structureType: string): void
{
    const pos = new PositionMock(x, y, "W0N1");
    const structure: any = {structureType, pos};
    room.structures.push(structure);
    tileAt(x, y).structures.push(structure);
}

/**
 * Builds the canonical test room but moves the SPAWN (only the spawn) to the
 * given edge position, so the extension/tower searches walk rings that leave
 * the room. The controller stays at the center: the crash (owner feedback
 * 2026-11-01) is in the searches that offset from the spawn.
 * @param spawnX The x coordinate of the spawn, close to the room edge.
 * @param spawnY The y coordinate of the spawn, close to the room edge.
 * @returns The mock room; its structures/sites arrays are the state.
 */
function makeEdgeRoom(spawnX: number, spawnY: number): any
{
    const room = makeRoom();
    room.spawn = {pos: new PositionMock(spawnX, spawnY, "W0N1")};
    return room;
}

function setGlobal(name: string, value: any): void
{
    // @ts-ignore : the game sandbox provides these as globals
    global[name] = value;
}

/** All sites of one structure type, as "x,y" strings. */
function sitePositions(room: any, structureType: string): string[]
{
    return room.sites
        .filter((s: any) => s.structureType === structureType)
        .map((s: any) => `${s.pos.x},${s.pos.y}`);
}

describe("manageConstruction tower and extension layout (M4 regression)", () => {
    beforeEach(() => {
        tiles = new Map();
        setGlobal("OK", OK);
        setGlobal("FIND_SOURCES", FIND_SOURCES);
        setGlobal("FIND_MY_SPAWNS", FIND_MY_SPAWNS);
        setGlobal("FIND_CONSTRUCTION_SITES", FIND_CONSTRUCTION_SITES);
        setGlobal("FIND_MY_STRUCTURES", FIND_MY_STRUCTURES);
        setGlobal("FIND_STRUCTURES", FIND_STRUCTURES);
        setGlobal("LOOK_STRUCTURES", LOOK_STRUCTURES);
        setGlobal("LOOK_CONSTRUCTION_SITES", LOOK_CONSTRUCTION_SITES);
        setGlobal("STRUCTURE_TOWER", STRUCTURE_TOWER);
        setGlobal("STRUCTURE_EXTENSION", STRUCTURE_EXTENSION);
        setGlobal("STRUCTURE_CONTAINER", STRUCTURE_CONTAINER);
        setGlobal("STRUCTURE_ROAD", STRUCTURE_ROAD);
        setGlobal("STRUCTURE_RAMPART", STRUCTURE_RAMPART);
        setGlobal("STRUCTURE_WALL", STRUCTURE_WALL);
        setGlobal("TERRAIN_MASK_WALL", TERRAIN_MASK_WALL);
        setGlobal("RoomPosition", PositionMock);
    });

    it("places exactly one tower site first, on the first ring-2 tile", () => {
        const room = makeRoom();
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "one tower site at a time (M4 spec)");
        assert.include(towerSites, "23,25");
    });

    it("keeps the second tower's tile free while the 30 extensions fill up", () => {
        const room = makeRoom();
        manageConstruction(room);
        const extensionPositions = sitePositions(room, STRUCTURE_EXTENSION);
        assert.equal(extensionPositions.length, 30, "level 5 allows 30 extensions");
        // The second tower is the next free candidate after (23,25): (25,27).
        // If the extensions take it, the second tower site can never be
        // placed - the M4 acceptance failure of 2026-10-31.
        assert.notInclude(extensionPositions, "25,27", "extensions took the second tower's tile");
        assert.notInclude(extensionPositions, "23,25");
        assert.notInclude(sitePositions(room, STRUCTURE_CONTAINER), "25,27");
    });

    it("places the second tower site once the first tower is finished", () => {
        const room = makeRoom();
        addStructure(room, 23, 25, STRUCTURE_TOWER);
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "one tower site at a time");
        assert.include(towerSites, "25,27");
        // Ramparts on the spawn's and the finished tower's tiles (M4).
        const rampartPositions = sitePositions(room, STRUCTURE_RAMPART);
        assert.include(rampartPositions, "25,25");
        assert.include(rampartPositions, "23,25");
    });

    it("never places a tower site beyond the level 5 limit of two", () => {
        const room = makeRoom();
        addStructure(room, 23, 25, STRUCTURE_TOWER);
        addStructure(room, 25, 27, STRUCTURE_TOWER);
        manageConstruction(room);
        assert.equal(sitePositions(room, STRUCTURE_TOWER).length, 0);
    });
});

describe("manageConstruction edge-position robustness (RoomPosition out-of-bounds, owner feedback 2026-11-01)", () => {
    beforeEach(() => {
        tiles = new Map();
        setGlobal("OK", OK);
        setGlobal("FIND_SOURCES", FIND_SOURCES);
        setGlobal("FIND_MY_SPAWNS", FIND_MY_SPAWNS);
        setGlobal("FIND_CONSTRUCTION_SITES", FIND_CONSTRUCTION_SITES);
        setGlobal("FIND_MY_STRUCTURES", FIND_MY_STRUCTURES);
        setGlobal("FIND_STRUCTURES", FIND_STRUCTURES);
        setGlobal("LOOK_STRUCTURES", LOOK_STRUCTURES);
        setGlobal("LOOK_CONSTRUCTION_SITES", LOOK_CONSTRUCTION_SITES);
        setGlobal("STRUCTURE_TOWER", STRUCTURE_TOWER);
        setGlobal("STRUCTURE_EXTENSION", STRUCTURE_EXTENSION);
        setGlobal("STRUCTURE_CONTAINER", STRUCTURE_CONTAINER);
        setGlobal("STRUCTURE_ROAD", STRUCTURE_ROAD);
        setGlobal("STRUCTURE_RAMPART", STRUCTURE_RAMPART);
        setGlobal("STRUCTURE_WALL", STRUCTURE_WALL);
        setGlobal("TERRAIN_MASK_WALL", TERRAIN_MASK_WALL);
        setGlobal("RoomPosition", PositionMock);
    });

    /** Every "x,y" the manager placed a site on, across all structure types. */
    function allSitePositions(room: any): string[]
    {
        return room.sites.map((s: any) => `${s.pos.x},${s.pos.y}`);
    }

    /** The manager may only place on tiles 1..48: the 0/49 edge ring is exits. */
    function assertAllInsideRoom(room: any): void
    {
        for (const p of allSitePositions(room))
        {
            const parts = p.split(",");
            const x = Number(parts[0]);
            const y = Number(parts[1]);
            assert.isAtLeast(x, 1, `site x=${x} must be inside 1..48`);
            assert.isAtMost(x, 48, `site x=${x} must be inside 1..48`);
            assert.isAtLeast(y, 1, `site y=${y} must be inside 1..48`);
            assert.isAtMost(y, 48, `site y=${y} must be inside 1..48`);
        }
    }

    it("does not throw and stays in 1..48 when the spawn is near the left edge (x=3)", () => {
        const room = makeEdgeRoom(3, 25);
        // On the old unguarded code this throws: the range-8 extension search
        // reaches x = 3 - 8 = -5.
        manageConstruction(room);
        assertAllInsideRoom(room);
    });

    it("does not throw and stays in 1..48 when the spawn is near the bottom edge (y=46)", () => {
        const room = makeEdgeRoom(25, 46);
        manageConstruction(room);
        assertAllInsideRoom(room);
    });

    it("does not throw and stays in 1..48 when the spawn is in a corner (4,4)", () => {
        const room = makeEdgeRoom(4, 4);
        manageConstruction(room);
        assertAllInsideRoom(room);
    });
});

describe("manageConstruction tower before extensions (owner feedback 2026-11-02)", () => {
    beforeEach(() => {
        tiles = new Map();
        setGlobal("OK", OK);
        setGlobal("FIND_SOURCES", FIND_SOURCES);
        setGlobal("FIND_MY_SPAWNS", FIND_MY_SPAWNS);
        setGlobal("FIND_CONSTRUCTION_SITES", FIND_CONSTRUCTION_SITES);
        setGlobal("FIND_MY_STRUCTURES", FIND_MY_STRUCTURES);
        setGlobal("FIND_STRUCTURES", FIND_STRUCTURES);
        setGlobal("LOOK_STRUCTURES", LOOK_STRUCTURES);
        setGlobal("LOOK_CONSTRUCTION_SITES", LOOK_CONSTRUCTION_SITES);
        setGlobal("STRUCTURE_TOWER", STRUCTURE_TOWER);
        setGlobal("STRUCTURE_EXTENSION", STRUCTURE_EXTENSION);
        setGlobal("STRUCTURE_CONTAINER", STRUCTURE_CONTAINER);
        setGlobal("STRUCTURE_ROAD", STRUCTURE_ROAD);
        setGlobal("STRUCTURE_RAMPART", STRUCTURE_RAMPART);
        setGlobal("STRUCTURE_WALL", STRUCTURE_WALL);
        setGlobal("TERRAIN_MASK_WALL", TERRAIN_MASK_WALL);
        setGlobal("RoomPosition", PositionMock);
    });

    /** The canonical room at a different controller level. */
    function makeRoomAtLevel(level: number): any
    {
        const room = makeRoom();
        room.controller.level = level;
        return room;
    }

    it("RCL 3: the first tower site is placed and no extension starts", () => {
        const room = makeRoomAtLevel(3);
        manageConstruction(room);
        assert.equal(sitePositions(room, STRUCTURE_TOWER).length, 1, "the tower site goes out first");
        assert.equal(sitePositions(room, STRUCTURE_EXTENSION).length, 0,
            "extensions wait while the tower is unfinished (tower limit 1 at RCL 3-4)");
    });

    it("RCL 4: same gate - the tower limit is 1 until level 5", () => {
        const room = makeRoomAtLevel(4);
        manageConstruction(room);
        assert.equal(sitePositions(room, STRUCTURE_TOWER).length, 1);
        assert.equal(sitePositions(room, STRUCTURE_EXTENSION).length, 0);
    });

    it("RCL 3: once the tower is finished, all 10 extensions are placed", () => {
        const room = makeRoomAtLevel(3);
        addStructure(room, 23, 25, STRUCTURE_TOWER);
        manageConstruction(room);
        assert.equal(sitePositions(room, STRUCTURE_TOWER).length, 0, "level 3 allows exactly one tower");
        assert.equal(sitePositions(room, STRUCTURE_EXTENSION).length, 10,
            "the extension queue starts as soon as the tower exists");
    });

    it("RCL 2: no tower allowed, and the 5 extensions stay inside range 4 of the spawn", () => {
        const room = makeRoomAtLevel(2);
        manageConstruction(room);
        assert.equal(sitePositions(room, STRUCTURE_TOWER).length, 0, "no tower at level 2");
        const extensions = room.sites
            .filter((s: any) => s.structureType === STRUCTURE_EXTENSION);
        assert.equal(extensions.length, 5, "level 2 allows 5 extensions");
        // The narrow search (owner feedback 2026-11-02): with a limit of 5
        // the extension rings stop at range 4, well before the range-5+
        // tiles where the source roads run.
        for (const site of extensions)
        {
            const distance = Math.abs(site.pos.x - 25) + Math.abs(site.pos.y - 25);
            assert.isAtMost(distance, 4, `extension at ${site.pos.x},${site.pos.y} beyond the narrow search`);
        }
    });

    it("moves to the next candidate when the engine refuses a tower tile", () => {
        const room = makeRoomAtLevel(3);
        const originalCreate = room.createConstructionSite;
        const attempts: string[] = [];
        room.createConstructionSite = (pos: any, structureType: string): number => {
            attempts.push(`${pos.x},${pos.y}:${structureType}`);
            if (structureType === STRUCTURE_TOWER && pos.x === 23 && pos.y === 25)
            {
                return ERR_INVALID_TARGET; // the engine refuses the first candidate
            }
            return originalCreate(pos, structureType);
        };
        manageConstruction(room);
        assert.include(attempts, "23,25:tower", "the first candidate was tried");
        assert.include(attempts, "25,27:tower", "a refusal moves on to the next candidate");
        assert.include(sitePositions(room, STRUCTURE_TOWER), "25,27", "the tower went to the next candidate");
        assert.notInclude(sitePositions(room, STRUCTURE_TOWER), "23,25", "the refused tile holds no site");
    });
});

describe("manageConstruction tower placement in a cramped room (owner feedback 2026-11-02)", () => {
    beforeEach(() => {
        tiles = new Map();
        setGlobal("OK", OK);
        setGlobal("FIND_SOURCES", FIND_SOURCES);
        setGlobal("FIND_MY_SPAWNS", FIND_MY_SPAWNS);
        setGlobal("FIND_CONSTRUCTION_SITES", FIND_CONSTRUCTION_SITES);
        setGlobal("FIND_MY_STRUCTURES", FIND_MY_STRUCTURES);
        setGlobal("FIND_STRUCTURES", FIND_STRUCTURES);
        setGlobal("LOOK_STRUCTURES", LOOK_STRUCTURES);
        setGlobal("LOOK_CONSTRUCTION_SITES", LOOK_CONSTRUCTION_SITES);
        setGlobal("STRUCTURE_TOWER", STRUCTURE_TOWER);
        setGlobal("STRUCTURE_EXTENSION", STRUCTURE_EXTENSION);
        setGlobal("STRUCTURE_CONTAINER", STRUCTURE_CONTAINER);
        setGlobal("STRUCTURE_ROAD", STRUCTURE_ROAD);
        setGlobal("STRUCTURE_RAMPART", STRUCTURE_RAMPART);
        setGlobal("STRUCTURE_WALL", STRUCTURE_WALL);
        setGlobal("TERRAIN_MASK_WALL", TERRAIN_MASK_WALL);
        setGlobal("RoomPosition", PositionMock);
    });

    const SPAWN_X = 3;
    const SPAWN_Y = 25;

    /**
     * The cramped room shape of the owner's (owner feedback 2026-11-02)
     * without sites: the spawn sits three tiles from the room's left edge,
     * and the eight tiles of ring 1 around it are natural wall terrain.
     * @returns The mock room; its sites array is the state.
     */
    function makeWalledCrampedRoom(): any
    {
        const room = makeEdgeRoom(SPAWN_X, SPAWN_Y);

        // Ring 1 around the spawn is wall terrain (TERRAIN_MASK_WALL = 1).
        const wallTiles = new Set<string>();
        for (let dx = -1; dx <= 1; dx++)
        {
            for (let dy = -1; dy <= 1; dy++)
            {
                if (dx !== 0 || dy !== 0)
                {
                    wallTiles.add(`${SPAWN_X + dx},${SPAWN_Y + dy}`);
                }
            }
        }
        room.getTerrain = () => ({
            get: (x: number, y: number): number =>
                (wallTiles.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0),
        });
        return room;
    }

    /**
     * Fills the cramped room with unbuilt extension sites on every free
     * tile within Chebyshev range `fillDepth` of the spawn: the shape of an
     * RCL 5 room whose 30 extensions and the roads filled the whole
     * checkerboard rings of the tower search.
     * @param fillDepth The Chebyshev radius to fill with extension sites
     * @returns The mock room; its sites array is the state.
     */
    function makeCrampedRoom(fillDepth: number): any
    {
        const room = makeWalledCrampedRoom();
        for (let x = Math.max(0, SPAWN_X - fillDepth); x <= SPAWN_X + fillDepth; x++)
        {
            for (let y = Math.max(0, SPAWN_Y - fillDepth); y <= SPAWN_Y + fillDepth; y++)
            {
                if (x === SPAWN_X && y === SPAWN_Y)
                {
                    continue; // the spawn's tile
                }
                if (room.getTerrain().get(x, y) === TERRAIN_MASK_WALL)
                {
                    continue; // the ring-1 walls
                }
                room.createConstructionSite(new PositionMock(x, y, "W0N1"), STRUCTURE_EXTENSION);
            }
        }
        return room;
    }

    /** Unbuilt extension sites on every tile of the given diamond rings (|dx| + |dy| = ring) around the spawn. */
    function addRingSites(room: any, rings: number[]): void
    {
        for (const ring of rings)
        {
            for (let dx = -ring; dx <= ring; dx++)
            {
                const dy = ring - Math.abs(dx);
                const ys: number[] = [SPAWN_Y + dy];
                if (dy > 0)
                {
                    ys.push(SPAWN_Y - dy);
                }
                for (const y of ys)
                {
                    const x = SPAWN_X + dx;
                    if (x < 0 || x > 49 || y < 0 || y > 49)
                    {
                        continue;
                    }
                    room.createConstructionSite(new PositionMock(x, y, "W0N1"), STRUCTURE_EXTENSION);
                }
            }
        }
    }

    it("searches the odd ring 3 when the even rings 2 and 4 are full", () => {
        const room = makeWalledCrampedRoom();
        // Rings 2 and 4 are exactly the even-parity tiles of the old search
        // range: full, with the odd ring-3 tiles left free.
        addRingSites(room, [2, 4]);
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "a tower site is placed");
        // (1,26) is the first free ring-3 tile in scan order: (0,25) comes
        // first but sits on the room's exit ring, which the manager never
        // builds on. The old parity filter skipped every ring-3 tile, so
        // this room got no tower at all (owner feedback 2026-11-02).
        assert.include(towerSites, "1,26");
        assert.notInclude(sitePositions(room, STRUCTURE_EXTENSION), "1,26", "the tower's tile holds no extension");
    });

    it("places the tower on a free ring-5 tile when every free tile of rings 2-4 is a site (the owner's room)", () => {
        const room = makeCrampedRoom(4);
        const extensionsBefore = sitePositions(room, STRUCTURE_EXTENSION).length;
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "a tower site is placed even in the cramped room");
        // Every tile up to Chebyshev 4 is a site or a wall, so the first free
        // tile is on ring 5: (3,30) in scan order, exactly five from the
        // spawn - the farthest the M4 spec allows a tower.
        assert.include(towerSites, "3,30");
        // A free tile existed, so the site-removal last resort must not run.
        assert.equal(sitePositions(room, STRUCTURE_EXTENSION).length, extensionsBefore, "no extension was removed");
    });

    it("falls back to the deep rings 6-8 when rings 2-5 are full, without removing a site", () => {
        const room = makeCrampedRoom(5);
        const extensionsBefore = sitePositions(room, STRUCTURE_EXTENSION).length;
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "the deep search finds a tile");
        // (3,31) is the first free tile of ring 6 in scan order: the deep
        // search found it, so the site-removal last resort must not run.
        assert.include(towerSites, "3,31");
        assert.equal(sitePositions(room, STRUCTURE_EXTENSION).length, extensionsBefore, "no extension was removed");
    });

    it("removes the nearest unbuilt extension site when every tile of rings 2-8 is occupied", () => {
        const room = makeCrampedRoom(8);
        const extensionsBefore = sitePositions(room, STRUCTURE_EXTENSION).length;
        assert.equal(extensionsBefore, 195, "sanity: the 12x17 box minus the spawn and the eight walls");
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "the tower still lands, at the cost of one extension site");
        // (1,23) is the nearest site to the spawn: ring 1 is wall, ring 2 is
        // the closest free ring, and ties go to the first site in room order.
        assert.include(towerSites, "1,23");
        const extensionSites = sitePositions(room, STRUCTURE_EXTENSION);
        assert.equal(extensionSites.length, extensionsBefore - 1, "exactly one site removed");
        assert.notInclude(extensionSites, "1,23", "the removed site's slot is the tower's now");
    });

    it("never removes a finished extension - only an unbuilt site", () => {
        const room = makeCrampedRoom(8);
        // Convert the nearest site ((1,23)) into a finished extension: the
        // last resort must pick the next-nearest unbuilt site instead.
        const site = room.sites.find((s: any) => s.pos.x === 1 && s.pos.y === 23);
        assert.isOk(site, "the nearest site exists before the conversion");
        site.remove();
        addStructure(room, 1, 23, STRUCTURE_EXTENSION);
        manageConstruction(room);
        const towerSites = sitePositions(room, STRUCTURE_TOWER);
        assert.equal(towerSites.length, 1, "the tower still lands");
        // (1,24) is the next-nearest unbuilt site once (1,23) is a structure.
        assert.include(towerSites, "1,24");
        const finished = room.structures.filter((s: any) => s.structureType === STRUCTURE_EXTENSION);
        assert.equal(finished.length, 1, "the finished extension survived");
        assert.equal(`${finished[0].pos.x},${finished[0].pos.y}`, "1,23");
        const extensionSites = sitePositions(room, STRUCTURE_EXTENSION);
        assert.equal(extensionSites.length, 193, "exactly one site removed");
        assert.notInclude(extensionSites, "1,24", "the removed site's slot is the tower's now");
    });
});

describe("container site placement on a contested pocket tile (M5, owner feedback 2026-11-04)", () => {
    beforeEach(() => {
        tiles = new Map();
        setGlobal("OK", OK);
        setGlobal("FIND_SOURCES", FIND_SOURCES);
        setGlobal("FIND_MY_SPAWNS", FIND_MY_SPAWNS);
        setGlobal("FIND_CONSTRUCTION_SITES", FIND_CONSTRUCTION_SITES);
        setGlobal("FIND_MY_STRUCTURES", FIND_MY_STRUCTURES);
        setGlobal("FIND_STRUCTURES", FIND_STRUCTURES);
        setGlobal("LOOK_STRUCTURES", LOOK_STRUCTURES);
        setGlobal("LOOK_CONSTRUCTION_SITES", LOOK_CONSTRUCTION_SITES);
        setGlobal("STRUCTURE_TOWER", STRUCTURE_TOWER);
        setGlobal("STRUCTURE_EXTENSION", STRUCTURE_EXTENSION);
        setGlobal("STRUCTURE_CONTAINER", STRUCTURE_CONTAINER);
        setGlobal("STRUCTURE_ROAD", STRUCTURE_ROAD);
        setGlobal("STRUCTURE_RAMPART", STRUCTURE_RAMPART);
        setGlobal("STRUCTURE_WALL", STRUCTURE_WALL);
        setGlobal("TERRAIN_MASK_WALL", TERRAIN_MASK_WALL);
        setGlobal("RoomPosition", PositionMock);
    });

    /**
     * A wall-pocket source: the (10,10) source has exactly one walkable
     * neighbour tile, (11,11) - its other seven neighbours are natural
     * walls. The (40,40) source keeps its full open neighbourhood. The
     * road network to the pocket source runs through the pocket tile, which
     * is why the M5 room had a road site there and the container site could
     * never be created (one construction site per tile in the engine).
     */
    function makePocketRoom(): any
    {
        const room = makeRoom();
        const pocketWalls = new Set(["9,9", "9,10", "9,11", "10,9", "10,11", "11,9", "11,10"]);
        room.getTerrain = (): any => ({
            get: (x: number, y: number): number => (pocketWalls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0),
        });
        room.findPath = (_from: any, to: any, _opts?: any): any[] =>
            to.x === 10 && to.y === 10 ? [{x: 11, y: 11}] : [];
        return room;
    }

    it("removes the blocking road site and places the container site on the only free pocket tile", () => {
        const room = makePocketRoom();
        // The road site on the pocket's only free tile: the exact M5
        // deadlock, where createConstructionSite for the container returned
        // ERR_INVALID_TARGET every tick and source A kept no container.
        room.createConstructionSite(new PositionMock(11, 11, "W0N1"), STRUCTURE_ROAD);
        assert.include(sitePositions(room, STRUCTURE_ROAD), "11,11", "sanity: the road site blocks the tile");
        manageConstruction(room);
        assert.include(sitePositions(room, STRUCTURE_CONTAINER), "11,11", "the container wins the pocket tile");
        assert.notInclude(sitePositions(room, STRUCTURE_ROAD), "11,11", "the blocking road site is removed");
        assert.equal(sitePositions(room, STRUCTURE_CONTAINER).length, 1, "one container site per tick (source A's first)");
    });

    it("does not place a road site on a tile that already holds a container site", () => {
        const room = makePocketRoom();
        // The container site already owns the pocket tile (the state after
        // the first manageConstruction of the previous test).
        room.createConstructionSite(new PositionMock(11, 11, "W0N1"), STRUCTURE_CONTAINER);
        manageConstruction(room);
        assert.include(sitePositions(room, STRUCTURE_CONTAINER), "11,11", "the existing container site survives");
        assert.notInclude(sitePositions(room, STRUCTURE_ROAD), "11,11", "no road site joins the container site's tile");
        assert.include(sitePositions(room, STRUCTURE_CONTAINER), "39,39", "source B still gets its own site this tick");
    });
});

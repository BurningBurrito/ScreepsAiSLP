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

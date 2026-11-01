import {assert} from "chai";
import {runBuilder} from "../../src/roles/builder";
import {Game, Memory, OK, ERR_NOT_IN_RANGE} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const FIND_SOURCES = 105;
const FIND_SOURCES_ACTIVE = 104;
const FIND_DROPPED_RESOURCES = 106;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_MY_SPAWNS = 112;
const FIND_MY_STRUCTURES = 108;
const FIND_CREEPS = 101;
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_TOWER = "tower";
const STRUCTURE_ROAD = "road";
const STRUCTURE_CONTAINER = "container";
const TERRAIN_MASK_WALL = 1;

/**
 * Builds a position mock that measures Chebyshev distance (the real
 * RoomPosition.getRangeTo), so the source-ranking logic under test behaves
 * exactly as it does in-game.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @returns A position-like object with a working getRangeTo.
 */
function pos(x: number, y: number): any
{
    return {
        x,
        y,
        getRangeTo: (target: any) => Math.max(Math.abs(target.x - x), Math.abs(target.y - y)),
    };
}

/**
 * Builds a builder creep and the room around it, with the store empty so the
 * role runs its self-harvest phase.
 *
 * Layout mirrors the test world: the pocket source A sits next to the spawn
 * AND close to the controller (the upgrader's preferred source); the open
 * source B is far from both. Without the yield the builder (ranked by spawn
 * distance) camps A and blocks the upgrader; with it, the builder takes B.
 * @param terrain A terrain probe (x, y) => bitmask, per room.getTerrain().get.
 * @param memory Extra memory fields (e.g. the working flag).
 * @returns The mock creep, its call counters, and the two sources.
 */
type CallCounts = {
    harvest?: number;
    upgrade?: number;
    moveTo?: number;
    lastHarvested?: string;
};

function makeBuilder(
    terrain: (x: number, y: number) => number,
    memory: Record<string, any>,
    options: { neighbours?: any[]; sites?: any[]; sources?: any[] } = {},
):
    { creep: any; calls: CallCounts; sourceA: any; sourceB: any }
{
    const calls: CallCounts = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) }; // pocket: near the spawn
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) }; // open: far from the spawn
    const controller = { my: true, pos: pos(25, 25) };
    const spawn = { pos: pos(13, 20), store: { getFreeCapacity: () => 0 } };
    const neighbours = options.neighbours ?? [];
    const sites = options.sites ?? [];
    const worldSources = options.sources ?? [sourceA, sourceB];
    const creep: any = {
        id: "b1",
        memory: { working: false, role: "builder", ...memory },
        body: [
            { type: "work" },
            { type: "carry" },
            { type: "move" },
        ],
        store: {
            [RESOURCE_ENERGY]: 0,
            getFreeCapacity: () => 50,
            getCapacity: () => 50,
        },
        pos: {
            ...pos(13, 20),
            findClosestByRange: () => null, // no dropped energy around
            findClosestByPath: () => null,  // only reached while carrying
        },
        room: {
            find: (type: number) => {
                if (type === FIND_SOURCES_ACTIVE || type === FIND_SOURCES) {
                    return worldSources;
                }
                if (type === FIND_MY_SPAWNS) {
                    return [spawn];
                }
                if (type === FIND_CREEPS) {
                    return neighbours; // default: no neighbours, every source has free tiles
                }
                if (type === FIND_MY_STRUCTURES) {
                    return [];
                }
                if (type === FIND_CONSTRUCTION_SITES) {
                    return sites; // default: no construction sites
                }
                return [];
            },
            controller,
            getTerrain: () => ({ get: terrain }),
            energyAvailable: 100,
            energyCapacityAvailable: 300, // below the withdrawal floor (0.5 x 300 = 150): no withdrawal
        },
        harvest: (source: any) => {
            calls.harvest = (calls.harvest ?? 0) + 1;
            calls.lastHarvested = source.id;
            return OK;
        },
        withdraw: () => ERR_NOT_IN_RANGE,
        pickup: () => OK,
        build: () => OK,
        upgradeController: () => OK,
        moveTo: () => {
            calls.moveTo = (calls.moveTo ?? 0) + 1;
            return OK;
        },
    };
    return { creep, calls, sourceA, sourceB };
}

/**
 * Builds a builder carrying a full store, standing at the spawn, with the
 * given construction sites in the room, so the role runs its build phase.
 * The creep's pos.findClosestByPath returns the site with the smallest
 * Chebyshev distance (matching the real method for these close layouts), so
 * the tests exercise the priority classes, not the mock. room.find honours
 * the filter option, exactly like the real API does.
 * @param sites The construction sites present in the room.
 * @returns The mock creep and its call counters (lastBuilt names the site built).
 */
function makeCarryingBuilder(sites: any[]): { creep: any; calls: { build?: number; lastBuilt?: string } }
{
    const calls: { build?: number; lastBuilt?: string } = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) };
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) };
    const controller = { my: true, pos: pos(25, 25) };
    const spawn = { pos: pos(13, 20), store: { getFreeCapacity: () => 0 } };
    const creep: any = {
        id: "b1",
        memory: { working: true, role: "builder" },
        body: [
            { type: "work" },
            { type: "carry" },
            { type: "move" },
        ],
        store: {
            [RESOURCE_ENERGY]: 50,
            getFreeCapacity: () => 0,
            getCapacity: () => 50,
        },
        pos: {
            ...pos(13, 20),
            findClosestByPath: (candidates: any[]) => {
                let best: any = null;
                let bestDistance = Infinity;
                for (const candidate of candidates)
                {
                    const distance = Math.max(
                        Math.abs(candidate.pos.x - 13),
                        Math.abs(candidate.pos.y - 20),
                    );
                    if (distance < bestDistance)
                    {
                        bestDistance = distance;
                        best = candidate;
                    }
                }
                return best;
            },
            findClosestByRange: () => null,
        },
        room: {
            find: (type: number, opts?: any) => {
                if (type === FIND_SOURCES_ACTIVE || type === FIND_SOURCES)
                {
                    return [sourceA, sourceB];
                }
                if (type === FIND_MY_SPAWNS)
                {
                    return [spawn];
                }
                if (type === FIND_CONSTRUCTION_SITES)
                {
                    return opts !== undefined && opts.filter !== undefined
                        ? sites.filter(opts.filter)
                        : sites;
                }
                return [];
            },
            controller,
            energyAvailable: 300,
            energyCapacityAvailable: 300,
            getTerrain: () => ({ get: () => 0 }),
        },
        build: (site: any) => {
            calls.build = (calls.build ?? 0) + 1;
            calls.lastBuilt = site.id;
            return OK;
        },
        upgradeController: () => OK,
        harvest: () => OK,
        withdraw: () => ERR_NOT_IN_RANGE,
        pickup: () => OK,
        moveTo: () => OK,
    };
    return { creep, calls };
}
describe("builder", () => {
    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);
        // @ts-ignore
        global.FIND_SOURCES = FIND_SOURCES;
        // @ts-ignore
        global.FIND_SOURCES_ACTIVE = FIND_SOURCES_ACTIVE;
        // @ts-ignore
        global.FIND_DROPPED_RESOURCES = FIND_DROPPED_RESOURCES;
        // @ts-ignore
        global.FIND_CONSTRUCTION_SITES = FIND_CONSTRUCTION_SITES;
        // @ts-ignore
        global.FIND_MY_SPAWNS = FIND_MY_SPAWNS;
        // @ts-ignore
        global.FIND_MY_STRUCTURES = FIND_MY_STRUCTURES;
        // @ts-ignore
        global.FIND_CREEPS = FIND_CREEPS;
        // @ts-ignore
        global.STRUCTURE_EXTENSION = STRUCTURE_EXTENSION;
        // @ts-ignore
        global.STRUCTURE_TOWER = STRUCTURE_TOWER;
        // @ts-ignore
        global.STRUCTURE_ROAD = STRUCTURE_ROAD;
        // @ts-ignore
        global.STRUCTURE_CONTAINER = STRUCTURE_CONTAINER;
        // @ts-ignore
        global.RESOURCE_ENERGY = RESOURCE_ENERGY;
        // @ts-ignore
        global.ERR_NOT_IN_RANGE = ERR_NOT_IN_RANGE;
        // @ts-ignore
        global.OK = OK;
        // @ts-ignore : movement.ts counts MOVE parts in the body
        global.MOVE = "move";
        // @ts-ignore : pickSource.ts probes terrain for walls
        global.TERRAIN_MASK_WALL = TERRAIN_MASK_WALL;
    });

    it("yields the upgrader's source and self-harvests at the other one", () => {
        // The pocket source A is nearest the spawn (the builder's old pick) AND
        // nearest the controller (the upgrader's pick). The builder must rank
        // the upgrader's source last and take the open source B instead, so it
        // no longer camps the pocket and blocks the upgrader.
        const { creep, calls } = makeBuilder(() => 0, { working: false });

        runBuilder(creep);

        assert.equal(calls.harvest, 1, "the empty builder harvests from a source");
        assert.equal(calls.lastHarvested, "sB", "the builder takes the open source, not the pocket");
    });

    it("withdraws from the room above the floor instead of self-harvesting", () => {
        // With surplus spawning the room is rarely completely full; the
        // builder must withdraw once the room holds at least
        // BUILDER_WITHDRAW_FRACTION of its capacity (0.5 x 300 = 150 here)
        // instead of walking to a distant source to self-harvest (the
        // regression that dropped construction to 0.19/tick). The hold-back
        // only applies while the upgrader is missing, so an upgrader is
        // alive here.
        const { creep, calls } = makeBuilder(() => 0, { working: false });
        // @ts-ignore : give the room an upgrader so the hold-back does not
        // apply. Replace the creeps object on the CLONE (lodash's clone is
        // shallow: mutating creeps in place would leak into the shared mock
        // and pollute the next test).
        global.Game.creeps = { u1: { memory: { role: "upgrader" } } };
        creep.room.energyAvailable = 200; // above the 150 floor
        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        spawn.store.getFreeCapacity = () => 50; // the spawn can accept energy
        let withdrew = 0;
        creep.withdraw = () => { withdrew += 1; return OK; };

        runBuilder(creep);

        assert.equal(withdrew, 1, "the builder withdraws from the room above the floor");
        assert.equal(calls.harvest ?? 0, 0, "the builder does not self-harvest when it can withdraw");
    });

    it("holds back its withdrawal while the upgrader minimum is unmet", () => {
        // The upgrader's body costs the whole RCL 1 capacity (300), so the
        // 50% withdrawal floor would pin the store below its spawn cost and
        // the first upgrader would never spawn (smoke-test regression of
        // 2026-11-01). While no upgrader is alive the builder must not touch
        // the room's energy - not even above the floor - and must
        // self-harvest instead, letting the store climb to the upgrader's
        // body cost.
        const { creep, calls } = makeBuilder(() => 0, { working: false });
        assert.equal(Object.keys(global.Game.creeps).length, 0, "no creeps alive yet");
        creep.room.energyAvailable = 200; // above the 150 floor
        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        spawn.store.getFreeCapacity = () => 50; // the spawn can accept energy
        let withdrew = 0;
        creep.withdraw = () => { withdrew += 1; return OK; };

        runBuilder(creep);

        assert.equal(withdrew, 0, "the builder does not withdraw while the upgrader is missing");
        assert.equal(calls.harvest, 1, "the builder self-harvests instead, keeping the store free");
    });

    it("falls back to the upgrader's source when the other has no free tile", () => {
        // The open source B is ringed by walls (no standable tile). The yield
        // ranks it first but the standable-tile filter skips it, so the builder
        // falls back to the upgrader's pocket source rather than idling.
        const wallAroundOpen = (x: number, y: number) => {
            const dx = Math.abs(x - 39);
            const dy = Math.abs(y - 14);
            if (dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0)) {
                return TERRAIN_MASK_WALL;
            }
            return 0;
        };
        const { creep, calls } = makeBuilder(wallAroundOpen, { working: false });

        runBuilder(creep);

        assert.equal(calls.lastHarvested, "sA", "a walled-off alternative yields to the pocket");
    });

    it("prefers an unfinished tower site over a closer extension site", () => {
        // M3 fix: with tower and extensions in one "closest wins" class the
        // builders clustered on the nearby extensions and starved the tower
        // (4,959 of 5,000 at the end of the M3 window). The tower site is now
        // its own class above the extensions, so a carrying builder works it
        // even when an extension sits closer.
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 2000, pos: pos(14, 20) }, // range 1 from the creep
            { id: "tower", structureType: "tower", progress: 0, pos: pos(18, 25) },    // range 5
        ]);

        runBuilder(creep);

        assert.equal(calls.build, 1, "the builder builds while a priority site exists");
        assert.equal(calls.lastBuilt, "tower", "the tower site beats a closer, more advanced extension");
    });

    it("prefers an extension site over a closer road site", () => {
        // With no tower site left, extensions take the builders before roads
        // do: roads are only built in bootstrap (M2), never while an
        // extension site is still up.
        const { creep, calls } = makeCarryingBuilder([
            { id: "road1", structureType: "road", progress: 0, pos: pos(14, 20) },
            { id: "ext1", structureType: "extension", progress: 0, pos: pos(18, 25) },
        ]);

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext1", "the extension site beats a closer road");
    });

    it("converges on the most advanced extension, not the nearest", () => {
        // Second M3 attempt: after the tower finished, per-builder nearest
        // sites split the crew over eight extensions and none of the rest
        // ever completed. The whole crew must instead work the most advanced
        // site (here ext2, almost done) even when ext1 sits closer, so the
        // room's energy capacity actually grows when a site is COMPLETE.
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 100, pos: pos(14, 20) },  // range 1
            { id: "ext2", structureType: "extension", progress: 2900, pos: pos(18, 25) }, // range 5
        ]);

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "the nearly-finished extension beats a closer one");
    });

    it("breaks an extension progress tie by closeness to the spawn", () => {
        // With no progress anywhere yet (fresh sites) the focus is the site
        // closest to the spawn, so every builder - whatever it stands on -
        // computes the same first target from shared room state.
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 0, pos: pos(14, 20) }, // range 1 from the spawn
            { id: "ext2", structureType: "extension", progress: 0, pos: pos(18, 25) }, // range 5
        ]);

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext1", "equal progress goes to the spawn-side site");
    });

    it("keeps its latched source mid-cycle instead of re-picking", () => {
        // The builder latched the open source B last cycle. Mid-cycle the
        // standable tiles around B fill with passing creeps: the old code
        // re-ran pickSource every tick and would have switched camps (or
        // idled at the entrance), trading tiles with other builders. The
        // latch wins: the builder keeps its camp until its own cycle turns.
        const ringAroundOpen = [
            { pos: pos(38, 13) }, { pos: pos(39, 13) }, { pos: pos(40, 13) },
            { pos: pos(38, 14) }, { pos: pos(40, 14) },
            { pos: pos(38, 15) }, { pos: pos(39, 15) }, { pos: pos(40, 15) },
        ];
        const { creep, calls } = makeBuilder(() => 0, { working: false, sourceId: "sB" }, {
            neighbours: ringAroundOpen,
        });

        runBuilder(creep);

        assert.equal(calls.lastHarvested, "sB", "the latch survives a mid-cycle occupancy change");
        assert.equal(creep.memory.sourceId, "sB", "the latch is untouched");
    });

    it("re-picks the source on the tick the store empties", () => {
        // justEmptied (working was true, the store is now empty) is the
        // builder's cycle boundary: the latch is re-made there, so a source
        // whose standable tiles filled up mid-cycle is released at the next
        // cycle start - the builder re-rolls onto the free pocket source.
        const ringAroundOpen = [
            { pos: pos(38, 13) }, { pos: pos(39, 13) }, { pos: pos(40, 13) },
            { pos: pos(38, 14) }, { pos: pos(40, 14) },
            { pos: pos(38, 15) }, { pos: pos(39, 15) }, { pos: pos(40, 15) },
        ];
        const { creep, calls } = makeBuilder(() => 0, { working: true, sourceId: "sB" }, {
            neighbours: ringAroundOpen,
        });

        runBuilder(creep);

        assert.equal(calls.lastHarvested, "sA", "the emptied store re-rolls the camp onto the pocket");
        assert.equal(creep.memory.sourceId, "sA", "the new latch points at the pocket");
    });

    it("drops a latched source that vanished from the room", () => {
        // A latch is an id, not an object: after a global reset or a source
        // leaving vision the id must be validated against the room before it
        // is trusted, and re-picked when it no longer resolves.
        const { creep, calls } = makeBuilder(() => 0, { working: false, sourceId: "sA" }, {
            sources: [{ id: "sB", energy: 500, pos: pos(39, 14) }],
        });

        runBuilder(creep);

        assert.equal(calls.lastHarvested, "sB", "a missing latched source is re-picked");
        assert.equal(creep.memory.sourceId, "sB", "the latch now points at the live source");
    });

    it("takes the spawn-nearest source while priority sites exist", () => {
        // M5: the upgrader now runs the builder role only while a tower
        // site is up (extensions and roads no longer pause it), so the
        // "no source is the upgrader's to protect" yield-skip applies
        // only to towers: the builder camps the fast pocket source
        // instead of the slow open one.
        const { creep, calls } = makeBuilder(() => 0, { working: false }, {
            sites: [{ id: "tower1", structureType: "tower", progress: 0, pos: pos(14, 20) }],
        });

        runBuilder(creep);

        assert.equal(calls.lastHarvested, "sA", "no yield while the upgrader is building the tower");
        assert.equal(creep.memory.sourceId, "sA", "the pocket source is latched");
    });
});


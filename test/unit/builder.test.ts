import {assert} from "chai";
import {hasPriorityBuildSites, runBuilder} from "../../src/roles/builder";
import {Game, Memory, OK, ERR_NOT_IN_RANGE} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const ERR_INVALID_TARGET = -8;
const FIND_SOURCES = 105;
const FIND_SOURCES_ACTIVE = 104;
const FIND_DROPPED_RESOURCES = 106;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_MY_SPAWNS = 112;
const FIND_MY_STRUCTURES = 108;
const FIND_STRUCTURES = 107;
const FIND_CREEPS = 101;
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_TOWER = "tower";
const STRUCTURE_ROAD = "road";
const STRUCTURE_CONTAINER = "container";
const TERRAIN_MASK_WALL = 1;
const LOOK_CREEPS = 2;

/**
 * Builds a position mock that measures Chebyshev distance (the real
 * RoomPosition.getRangeTo), so the source-ranking logic under test behaves
 * exactly as it does in-game. lookFor reports no objects on any tile - the
 * blocked-site tests (isBlockedByWaitingCreeps) override it per site.
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
        lookFor: (): any[] => [],
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
    options: { neighbours?: any[]; sites?: any[]; sources?: any[]; structures?: any[] } = {},
):
    { creep: any; calls: CallCounts; sourceA: any; sourceB: any }
{
    const calls: CallCounts = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) }; // pocket: near the spawn
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) }; // open: far from the spawn
    const controller = { my: true, pos: pos(25, 25) };
    const spawn = {
        pos: pos(13, 20),
        store: { getFreeCapacity: () => 0, getUsedCapacity: () => 300 }, // full spawn
    };
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
            find: (type: number, opts?: any) => {
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
                if (type === FIND_STRUCTURES) {
                    const structures = options.structures ?? [];
                    return opts !== undefined && opts.filter !== undefined
                        ? structures.filter(opts.filter)
                        : structures;
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
 * @param options Room state: already-built structures (FIND_STRUCTURES -
 *        the MY_STRUCTURES union excludes containers and roads in
 *        @types/screeps) and the controller level - both drive the
 *        container-priority gate (containerFirstForRoom).
 * @returns The mock creep and its call counters (lastBuilt names the site built).
 */
function makeCarryingBuilder(
    sites: any[],
    options: { structures?: any[]; level?: number } = {},
): { creep: any; calls: { build?: number; lastBuilt?: string } }
{
    const calls: { build?: number; lastBuilt?: string } = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) };
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) };
    const controller = { my: true, level: options.level ?? 1, pos: pos(25, 25) };
    const spawn = {
        pos: pos(13, 20),
        store: { getFreeCapacity: () => 0, getUsedCapacity: () => 300 }, // full spawn
    };
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
                if (type === FIND_STRUCTURES || type === FIND_MY_STRUCTURES)
                {
                    const structures = options.structures ?? [];
                    return opts !== undefined && opts.filter !== undefined
                        ? structures.filter(opts.filter)
                        : structures;
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
        global.FIND_STRUCTURES = FIND_STRUCTURES;
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
        // @ts-ignore
        global.ERR_INVALID_TARGET = ERR_INVALID_TARGET;
        // @ts-ignore
        global.LOOK_CREEPS = LOOK_CREEPS;
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
        spawn.store.getUsedCapacity = () => 250; // and it holds energy to give
        let withdrew = 0;
        creep.withdraw = () => { withdrew += 1; return OK; };

        runBuilder(creep);

        assert.equal(withdrew, 1, "the builder withdraws from the room above the floor");
        assert.equal(calls.harvest ?? 0, 0, "the builder does not self-harvest when it can withdraw");
    });

    it("withdraws from a FULL spawn above the floor instead of self-harvesting", () => {
        // The M5 regression (2026-11-10): the level 5 world starts with the
        // spawn full (300/300), and the old free-capacity check skipped a
        // full spawn every tick, so the builders self-harvested from the far
        // source for the whole run while the room sat full and the spawn
        // idled (construction crawled at ~1-3 progress/tick, upgraded/tick
        // 0, no container before tick 5000). A full spawn holds all the
        // energy and must be the first place a builder withdraws.
        const { creep, calls } = makeBuilder(() => 0, { working: false });
        // @ts-ignore : an upgrader is alive, so the hold-back does not apply
        global.Game.creeps = { u1: { memory: { role: "upgrader" } } };
        creep.room.energyAvailable = 300; // room full, above the 150 floor
        const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
        spawn.store.getFreeCapacity = () => 0; // spawn full: nothing to accept
        spawn.store.getUsedCapacity = () => 300; // ...but everything to give
        let withdrew = 0;
        let withdrawnFrom: any = null;
        creep.withdraw = (target: any) => { withdrew += 1; withdrawnFrom = target; return OK; };

        runBuilder(creep);

        assert.equal(withdrew, 1, "the builder withdraws from the full spawn above the floor");
        assert.equal(withdrawnFrom, spawn, "the full spawn is the withdrawal target");
        assert.equal(calls.harvest ?? 0, 0, "the builder does not self-harvest when it can withdraw");
    });

    it("withdraws from a source container with 100+ energy instead of the pool or a source", () => {
        // Owner feedback 2026-11-10 fix 1, test (a): an empty builder facing
        // a source container holding 1000 energy must withdraw from the
        // container (the miner's drop point) instead of walking to the pool
        // or a source.
        const container = {
            id: "con-src",
            structureType: STRUCTURE_CONTAINER,
            pos: pos(15, 18), // next to the pocket source A (14,18)
            store: {
                [RESOURCE_ENERGY]: 1000,
                getUsedCapacity: () => 1000,
                getFreeCapacity: () => 1000,
            },
        };
        const { creep, calls } = makeBuilder(() => 0, { working: false }, { structures: [container] });
        creep.pos = {...container.pos, findClosestByRange: () => null}; // standing on the container
        let withdrew = 0;
        let withdrawnFrom: any = null;
        creep.withdraw = (target: any) => { withdrew += 1; withdrawnFrom = target; return OK; };

        runBuilder(creep);

        assert.equal(withdrew, 1, "the empty builder withdraws from the source container");
        assert.equal(withdrawnFrom.id, "con-src", "the container is the withdrawal target");
        assert.equal(calls.harvest ?? 0, 0, "no self-harvest trip while the container holds energy");
    });

    it("waits out a trickle in a source container instead of self-harvesting", () => {
        // Owner feedback 2026-11-10 fix 1: below MIN_CONTAINER_WITHDRAW_ENERGY
        // the miner (or a hauler) tops the container back up within a few
        // ticks, so idling this tick beats a round trip to a source for a
        // partial load - the regression that starved construction.
        const container = {
            id: "con-src",
            structureType: STRUCTURE_CONTAINER,
            pos: pos(15, 18), // next to the pocket source A (14,18)
            store: {
                [RESOURCE_ENERGY]: 50,
                getUsedCapacity: () => 50,
                getFreeCapacity: () => 1950,
            },
        };
        const { creep, calls } = makeBuilder(() => 0, { working: false }, { structures: [container] });

        runBuilder(creep);

        assert.equal(calls.harvest ?? 0, 0, "no source trip for a partial load");
        assert.equal(calls.moveTo ?? 0, 0, "no walk: the builder waits for the refill");
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

    it("skips an extension site whose tile is occupied by a waiting creep", () => {
        // M4 builder/extension deadlock (owner feedback 2026-11-05): the
        // layout put an extension site on a tile around the spawn, where a
        // harvester delivering energy stands to finish its moveTo. build()
        // needs the builder alone on the tile (ERR_INVALID_TARGET while the
        // delivery is there), and since the blocked site holds the most
        // progress it kept winning the focus every tick: 0 of 3 extensions
        // finished. The focus must skip the blocked tile and build the next
        // most advanced site instead; when the tile clears, the progress
        // ordering brings the crew back automatically.
        const waitingHarvester = { id: "h1", my: true };
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 2900, pos: { ...pos(14, 20), lookFor: () => [waitingHarvester] } },
            { id: "ext2", structureType: "extension", progress: 100, pos: pos(18, 25) },
        ]);

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "the blocked focus is skipped, the next extension is built");
    });

    it("keeps its load and builds the next site on ERR_INVALID_TARGET instead of refilling", () => {
        // M4 builder/extension deadlock (owner feedback 2026-11-06): while
        // another own creep stands on the site's tile the engine refuses
        // build() with ERR_INVALID_TARGET. The old code treated that like
        // "out of energy" and bailed out to refill - the loaded store was
        // wasted, and the build-refill loop restarted on the same blocked
        // tile every cycle (progress grew, nothing finished). The builder
        // must keep its store and put it on the next best site instead.
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 2900, pos: pos(14, 20) },
            { id: "ext2", structureType: "extension", progress: 100, pos: pos(18, 25) },
        ]);
        let refillActions = 0;
        creep.build = (site: any) => {
            calls.lastBuilt = site.id;
            return site.id === "ext1" ? ERR_INVALID_TARGET : OK;
        };
        creep.withdraw = () => {
            refillActions++;
            return ERR_NOT_IN_RANGE;
        };
        creep.pickup = () => {
            refillActions++;
            return OK;
        };
        creep.harvest = () => {
            refillActions++;
            return OK;
        };

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "the load goes to the next site, not to refill");
        assert.equal(refillActions, 0, "no refill action on ERR_INVALID_TARGET");
    });

    it("keeps working its own site and ignores foreign creeps on the tile", () => {
        // The block check only counts OTHER own creeps: the builder itself
        // stands next to (or on the path to) the site, and a hostile on the
        // tile does not stop the engine's build() the way our own waiting
        // creeps do. Excluding by id and requiring my: true keeps the focus
        // stable in both cases.
        const builderOnTile = { id: "b1", my: true };
        const hostile = { id: "x1", my: false };
        const { creep, calls } = makeCarryingBuilder([
            { id: "ext1", structureType: "extension", progress: 2900, pos: { ...pos(14, 20), lookFor: () => [builderOnTile, hostile] } },
            { id: "ext2", structureType: "extension", progress: 100, pos: pos(18, 25) },
        ]);

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext1", "its own presence and hostiles do not block the site");
    });

    it("keeps the extension ahead of a container site in a fresh bootstrap room", () => {
        // M2 gate fix (2026-11-01): a fresh RCL 1 room has no built
        // container, extension or road, so containerFirstForRoom is false
        // and the container site must wait behind the extension queue. The
        // unconditional container-first of the M5 commit broke M2 here: the
        // whole crew camped the first 5,000-energy container site and 0
        // extensions and 0 roads were finished after 3,000 ticks.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "road1", structureType: "road", progress: 0, pos: pos(14, 20) },
                { id: "ext1", structureType: "extension", progress: 0, pos: pos(18, 25) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(13, 20) }, // range 0: closest, must still lose
            ],
            { level: 1 },
        );

        runBuilder(creep);

        assert.equal(calls.build, 1, "the builder builds while a container site exists");
        assert.equal(calls.lastBuilt, "ext1", "the extension beats the closer container while no container is built");
    });

    it("leads with the container once a built container exists, at any level", () => {
        // M5 stage 2 (rule 02b: bootstrap ends when the first container
        // exists): the remaining container queue leads again - here at
        // level 3, where the bootstrap boost does not apply at all.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext1", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con2", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            { level: 3, structures: [{ id: "conB", structureType: "container" }] },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "con2", "a built container re-arms the container-first order");
    });

    it("keeps level-3 rooms on extensions while no container is built", () => {
        // M3/M4 contract: at controller level 3 and up the tower-plus-
        // extension density owns the crew, so a not-yet-built container
        // site waits behind the extension queue (the bootstrap boost does
        // not apply at level 3).
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext1", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            { level: 3 },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext1", "no container boost at level 3 without a built container");
    });

    it("hands the crew to the container at level 4 once the M4 extension floor is met", () => {
        // M5 static-mining stage: at controller level 4 and up the first
        // source container takes the crew (behind the towers) once the M4
        // extension floor - CONTAINER_BOOST_MIN_EXTENSIONS_L4 = 3 built
        // extensions - is finished. The floor is load-bearing: boosted
        // right after the tower, the crew camps the 5,000-energy container
        // site and the third extension never finishes (M4 failure of
        // 2026-11-09: extensionsBuilt 1, capacity 350 vs 3/450).
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            {
                level: 4,
                structures: [
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                    { id: "extB3", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "con1", "three built extensions arm the level-4 container boost");
    });

    it("keeps the extension ahead of the container at level 4 below the M4 extension floor", () => {
        // Same room with only two built extensions: the M4 safety gate
        // (three extensions by tick 6000 of the M4 window) is not met, so
        // the container stays in the fallback slot behind the extension
        // queue and the crew keeps finishing the third extension.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            {
                level: 4,
                structures: [
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "two built extensions keep the container in the fallback slot");
    });

    it("keeps the extension ahead of the first container at level 5 below the M4 extension floor", () => {
        // M4 regression guard (2026-11-10): M4 also starts at level 5, so
        // the level-4 extension floor must hold at level 5 too. While no
        // container is built and fewer than three extensions are finished,
        // the crew stays on the extension site - the 2026-11-09
        // container-first ordering (and the 2026-11-10 "scoped" version,
        // which still let the FIRST container lead at level 5) both failed
        // M4 with one finished extension and 29 extension sites still open.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext1", structureType: "extension", progress: 0, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            {
                level: 5,
                structures: [{ id: "towerB", structureType: "tower" }],
            },
        );

        runBuilder(creep);

        assert.equal(calls.build, 1, "the builder builds while extension sites exist");
        assert.equal(calls.lastBuilt, "ext1", "below the M4 extension floor the extension leads even at level 5");
    });

    it("hands the crew to the container once the bootstrap minimum is met", () => {
        // The M2 layout minimum is finished: one extension AND one road
        // are built, at level 2. The container may take the crew now -
        // that is what unlocks the stationary miner inside the M2/M5
        // window - even though a more advanced extension sits closer.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            {
                level: 2,
                structures: [
                    { id: "extB", structureType: "extension" },
                    { id: "roadB", structureType: "road" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "con1", "the finished extension + road minimum re-arms the container");
    });

    it("keeps the extension ahead of the container until the road minimum is built", () => {
        // One built extension but no built road yet (level 2): the boost
        // is not armed, the container stays in the fallback slot behind
        // the extension queue.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            { level: 2, structures: [{ id: "extB", structureType: "extension" }] },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "the missing built road keeps the container in the fallback slot");
    });

    it("keeps the extension ahead of the container until the extension minimum is built", () => {
        // One built road but no built extension yet (level 2): same
        // contract from the other side - both minimums must be met.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
                { id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) },
            ],
            { level: 2, structures: [{ id: "roadB", structureType: "road" }] },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "the missing built extension keeps the container in the fallback slot");
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

    // Minimal room for the hasPriorityBuildSites checks: only the two
    // finds the function performs (construction sites, structures) and the
    // controller level matter.
    function makeRoomForPriority(
        sites: any[],
        structures: any[],
        level: number,
        sources: any[] = [{ id: "sA", pos: pos(14, 18) }, { id: "sB", pos: pos(40, 24) }],
    ): any
    {
        return {
            find: (type: number) => {
                if (type === FIND_CONSTRUCTION_SITES)
                {
                    return sites;
                }
                if (type === FIND_STRUCTURES || type === FIND_MY_STRUCTURES)
                {
                    return structures;
                }
                if (type === FIND_SOURCES || type === FIND_SOURCES_ACTIVE)
                {
                    return sources;
                }
                return [];
            },
            controller: { my: true, level, pos: pos(25, 25) },
        };
    }

    it("pauses the upgrader for an unfinished tower site at any level", () => {
        const room = makeRoomForPriority(
            [{ id: "tower1", structureType: "tower", progress: 0, pos: pos(14, 20) }],
            [],
            2,
        );

        assert.isTrue(hasPriorityBuildSites(room), "a tower site pauses the upgrader");
    });

    it("does not pause the upgrader for a plain container site at level 5", () => {
        // Container sites of any kind never pause the upgrader (owner
        // feedback 2026-11-10 fix 2); a leftover site at (18,25) - neither
        // by a source nor within CONTROLLER_CONTAINER_RANGE of the
        // controller - must not stall the measured controller progress.
        const room = makeRoomForPriority(
            [{ id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) }],
            [],
            5,
        );

        assert.isFalse(hasPriorityBuildSites(room), "a plain leftover container site never pauses the upgrader");
    });

    it("does not pause the upgrader for container sites below level 5", () => {
        const room = makeRoomForPriority(
            [{ id: "con1", structureType: "container", progress: 0, pos: pos(18, 25) }],
            [],
            4,
        );

        assert.isFalse(hasPriorityBuildSites(room), "container sites never pause the upgrader below level 5");
    });

    // --- Level-5 static-mining ladder (M5 ideas a and d) ---------------

    it("builds the first tower before anything else at level 5", () => {
        // Rung 1: even with a container and an extension site up, the
        // first 5,000-energy tower leads the ladder (the M4 defense).
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "con-src", structureType: "container", progress: 0, pos: pos(15, 18) }, // next to source A
                { id: "ext1", structureType: "extension", progress: 900, pos: pos(14, 20) },  // range 1 from the creep
                { id: "tower1", structureType: "tower", progress: 0, pos: pos(20, 24) },      // far
            ],
            { level: 5 },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "tower1", "rung 1: the first tower leads the ladder");
    });

    it("builds the first extension once the tower is built at level 5", () => {
        // Rung 2 (the M4 extension floor): with no extension built yet the
        // floor takes the crew before any container site - one 3,000-energy
        // build of headroom before the 5,000-energy containers.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "con-src", structureType: "container", progress: 0, pos: pos(15, 18) },
                { id: "con-ctrl", structureType: "container", progress: 0, pos: pos(24, 25) }, // range 1 of the controller
                { id: "ext1", structureType: "extension", progress: 0, pos: pos(14, 20) },
            ],
            { level: 5, structures: [{ id: "towerB", structureType: "tower" }] },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext1", "rung 2: the extension floor comes before the containers");
    });

    it("holds the extension floor before any container at level 5", () => {
        // The M4 regression: the un-gated ladder let the 15,000-energy
        // source-plus-controller container pair take the crew while only one
        // extension was built, and at tick 6,000 only 1 of 3 extensions was
        // finished (capacity 350 of 450). With the floor open (fewer than
        // three built extensions) no container may take the crew - the
        // builder works the most advanced extension site instead.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "con-src", structureType: "container", progress: 0, pos: pos(15, 18) },
                { id: "con-ctrl", structureType: "container", progress: 0, pos: pos(24, 25) },
                { id: "ext2", structureType: "extension", progress: 0, pos: pos(14, 20) },
                { id: "ext3", structureType: "extension", progress: 1200, pos: pos(18, 25) },
            ],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext3", "rung 2: the floor converges on the most advanced extension, containers wait");
    });

    it("upgrades instead of building a container when the floor has no extension site at level 5", () => {
        // Floor open (two of three extensions built) and no extension site
        // left: selectBuildSite returns null, so runBuilder upgrades the
        // controller instead of idling or - the regression - working a
        // container before the floor is met.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "con-src", structureType: "container", progress: 0, pos: pos(15, 18) },
                { id: "con-ctrl", structureType: "container", progress: 0, pos: pos(24, 25) },
            ],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.isUndefined(calls.lastBuilt, "no container is built before the M4 extension floor is met");
    });

    it("takes the controller container once the source containers are done at level 5", () => {
        // Rung 4: the M4 extension floor (rung 2) is met (three extensions
        // built) and no source container site is left, so the controller's
        // energy cache takes the crew - ahead of the remaining extension
        // (rung 7), but only after the floor, which M4's contract requires
        // before any container takes the crew.
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "con-ctrl", structureType: "container", progress: 0, pos: pos(24, 25) },
                { id: "ext2", structureType: "extension", progress: 2000, pos: pos(14, 20) },
            ],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                    { id: "extB3", structureType: "extension" },
                    { id: "conA", structureType: "container", pos: pos(15, 18) }, // source A served
                    { id: "conB", structureType: "container", pos: pos(40, 14) }, // source B served
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "con-ctrl", "rung 4: the controller container follows the floor, ahead of the remaining extension");
    });

    it("finishes the most advanced extension of the floor at level 5", () => {
        // Rung 2: below three built extensions the crew converges on the
        // most advanced extension site (the M4 floor: 450 capacity).
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "ext2", structureType: "extension", progress: 800, pos: pos(18, 25) }, // far, but further along
                { id: "ext3", structureType: "extension", progress: 0, pos: pos(14, 20) },   // closer, but behind
            ],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "ext2", "rung 2: the floor converges on the most advanced extension");
    });

    it("builds the second tower after the extension floor is met at level 5", () => {
        // Rung 6: with three extensions built and no rampart left, the
        // second tower site takes the crew.
        const { creep, calls } = makeCarryingBuilder(
            [{ id: "tower2", structureType: "tower", progress: 0, pos: pos(20, 24) }],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                    { id: "extB3", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "tower2", "rung 6: the second tower follows the floor");
    });

    it("builds a rampart before the second tower at level 5", () => {
        // Rung 5: in peace mode the ramparts sit between the extension
        // floor and the second tower (the M4 spec order: towers, then
        // ramparts, then the rest).
        const { creep, calls } = makeCarryingBuilder(
            [
                { id: "rampart1", structureType: "rampart", progress: 0, pos: pos(14, 20) },
                { id: "tower2", structureType: "tower", progress: 0, pos: pos(20, 24) },
            ],
            {
                level: 5,
                structures: [
                    { id: "towerB", structureType: "tower" },
                    { id: "extB1", structureType: "extension" },
                    { id: "extB2", structureType: "extension" },
                    { id: "extB3", structureType: "extension" },
                ],
            },
        );

        runBuilder(creep);

        assert.equal(calls.lastBuilt, "rampart1", "rung 5: the rampart precedes the second tower");
    });

    it("pauses the upgrader for the first tower site at level 5", () => {
        const room = makeRoomForPriority(
            [{ id: "tower1", structureType: "tower", progress: 0, pos: pos(14, 20) }],
            [],
            5,
        );

        assert.isTrue(hasPriorityBuildSites(room), "rung 1: the first tower site pauses the upgrader");
    });

    it("does not pause the upgrader for the second tower site at level 5", () => {
        // Rung 6 is after the extension floor: by then the upgrader's
        // WORK belongs to the controller again.
        const room = makeRoomForPriority(
            [{ id: "tower2", structureType: "tower", progress: 0, pos: pos(14, 20) }],
            [{ id: "towerB", structureType: "tower" }],
            5,
        );

        assert.isFalse(hasPriorityBuildSites(room), "the second tower site does not pause the upgrader");
    });

    it("does not pause the upgrader for container sites at level 5", () => {
        // Owner feedback 2026-11-10 fix 2: with one tower and one extension
        // built, a source container site and a controller container site no
        // longer pause the upgrader. While they did, the 2026-11-09 M5 run
        // spent the whole run building (upgradePerTick 0): the upgrader ran
        // the builder role the moment a container site existed, until the
        // last container finished. The builder's own ladder still builds
        // those containers first (selectBuildSite keeps rungs 3-4); only
        // the pause is gone.
        const room = makeRoomForPriority(
            [
                { id: "con-src", structureType: "container", progress: 0, pos: pos(15, 18) },
                { id: "con-ctrl", structureType: "container", progress: 0, pos: pos(24, 25) },
            ],
            [
                { id: "towerB", structureType: "tower" },
                { id: "extB", structureType: "extension" },
            ],
            5,
        );

        assert.isFalse(hasPriorityBuildSites(room), "container sites never pause the upgrader (owner feedback 2026-11-10)");
    });

    it("does not pause the upgrader for the extension floor sites at level 5", () => {
        // Rungs 5-8 never pause it: the M5 window measures controller
        // progress in its last 1,000 ticks.
        const room = makeRoomForPriority(
            [{ id: "ext2", structureType: "extension", progress: 0, pos: pos(14, 20) }],
            [
                { id: "towerB", structureType: "tower" },
                { id: "extB1", structureType: "extension" },
                { id: "extB2", structureType: "extension" },
            ],
            5,
        );

        assert.isFalse(hasPriorityBuildSites(room), "the extension floor does not pause the upgrader");
    });
});


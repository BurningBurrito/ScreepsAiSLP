import {assert} from "chai";
import {runUpgrader} from "../../src/roles/upgrader";
import {Game, Memory, OK, ERR_NOT_IN_RANGE} from "./mock";
import {CONTROLLER_SIGN_TEXT} from "../../src/config";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const FIND_SOURCES = 105;
const FIND_CREEPS = 101;
const FIND_MY_STRUCTURES = 108;
const FIND_STRUCTURES = 107;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_MY_SPAWNS = 112;
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
        // The real getRangeTo accepts a position OR any object that carries
        // one (creeps, structures). Production code passes the container
        // itself, so the mock must resolve .pos the same way.
        getRangeTo: (target: any) => {
            const p = target.pos !== undefined ? target.pos : target;
            return Math.max(Math.abs(p.x - x), Math.abs(p.y - y));
        },
        // No dropped resources on the floor in these tests (getEnergy's
        // first step probes with findClosestByRange).
        findClosestByRange: () => null,
    };
}

/**
 * Builds an upgrader creep and the room around it.
 *
 * Layout mirrors the test world: the pocket source A sits close to the
 * controller, the open source B is far from it. The controller is the
 * upgrader's anchor, so without the latch the upgrader would always re-pick A.
 * @param memory Extra memory fields (e.g. the latched sourceId, working).
 * @returns The mock creep, its call counters, and the two sources.
 */
type CallCounts = {
    harvest?: number;
    upgrade?: number;
    moveTo?: number;
    sign?: number;
    withdraw?: number;
    lastSignText?: string;
    lastMoveOpts?: any;
    lastHarvested?: string;
    lastWithdrawn?: string;
};

function makeUpgrader(memory: Record<string, any>):
    { creep: any; calls: CallCounts; sourceA: any; sourceB: any }
{
    const calls: CallCounts = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) }; // pocket: near the controller
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) }; // open: far from the controller
    // The default sign is already correct, so every pre-existing test runs
    // the sign-free upgrade path; the sign tests below clear or change it.
    const controller: any = {
        my: true,
        pos: pos(25, 25),
        sign: { username: "player", text: CONTROLLER_SIGN_TEXT, time: 1, datetime: new Date() },
    };
    const creep: any = {
        id: "u1",
        memory: { working: false, role: "upgrader", ...memory },
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
        pos: pos(25, 25), // at the controller
        room: {
            find: (type: number) => {
                if (type === FIND_SOURCES) {
                    return [sourceA, sourceB];
                }
                if (type === FIND_CREEPS) {
                    return []; // no neighbours: every source has free tiles
                }
                if (type === FIND_MY_STRUCTURES) {
                    return [];
                }
                return [];
            },
            controller,
            getTerrain: () => ({ get: () => 0 }), // open ground, no walls
        },
        harvest: (source: any) => {
            calls.harvest = (calls.harvest ?? 0) + 1;
            calls.lastHarvested = source.id;
            return OK;
        },
        withdraw: (structure: any) => {
            calls.withdraw = (calls.withdraw ?? 0) + 1;
            calls.lastWithdrawn = structure.id;
            return OK;
        },
        upgradeController: () => {
            calls.upgrade = (calls.upgrade ?? 0) + 1;
            return OK;
        },
        signController: (_target: any, text: string) => {
            calls.sign = (calls.sign ?? 0) + 1;
            calls.lastSignText = text;
            return OK;
        },
        moveTo: (_target: any, opts?: any) => {
            calls.moveTo = (calls.moveTo ?? 0) + 1;
            calls.lastMoveOpts = opts;
            return OK;
        },
    };
    return { creep, calls, sourceA, sourceB };
}
/**
 * Builds a carrying upgrader standing at the controller with the given
 * construction sites in the room, so runUpgrader reaches the M3 delegation
 * (carry energy, priority sites present). The creep's
 * pos.findClosestByPath returns the closest site by Chebyshev distance;
 * room.find honours the filter option like the real API.
 * @param sites The construction sites present in the room.
 * @returns The mock creep and its call counters (lastBuilt names the site built).
 */
function makeUpgraderWithSites(sites: any[]):
    { creep: any; calls: { build?: number; upgrade?: number; lastBuilt?: string } }
{
    const calls: { build?: number; upgrade?: number; lastBuilt?: string } = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) };
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) };
    // Correct sign by default: the non-priority-sites test reaches the
    // upgrade phase and must run the sign-free path like the other tests.
    const controller = {
        my: true,
        pos: pos(25, 25),
        sign: { username: "player", text: CONTROLLER_SIGN_TEXT, time: 1, datetime: new Date() },
    };
    const spawn = { pos: pos(13, 20), store: { getFreeCapacity: () => 0 } };
    const creep: any = {
        id: "u1",
        memory: { working: true, role: "upgrader" },
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
            ...pos(25, 25),
            findClosestByPath: (candidates: any[]) => {
                let best: any = null;
                let bestDistance = Infinity;
                for (const candidate of candidates)
                {
                    const distance = Math.max(
                        Math.abs(candidate.pos.x - 25),
                        Math.abs(candidate.pos.y - 25),
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
                if (type === FIND_SOURCES)
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
        upgradeController: () => {
            calls.upgrade = (calls.upgrade ?? 0) + 1;
            return OK;
        },
        harvest: () => OK,
        withdraw: () => ERR_NOT_IN_RANGE,
        pickup: () => OK,
        moveTo: () => OK,
    };
    return { creep, calls };
}

describe("upgrader", () => {
    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);
        // @ts-ignore
        global.FIND_SOURCES = FIND_SOURCES;
        // @ts-ignore
        global.FIND_CREEPS = FIND_CREEPS;
        // @ts-ignore
        global.FIND_MY_STRUCTURES = FIND_MY_STRUCTURES;
        // @ts-ignore
        global.FIND_STRUCTURES = FIND_STRUCTURES;
        // @ts-ignore
        global.FIND_CONSTRUCTION_SITES = FIND_CONSTRUCTION_SITES;
        // @ts-ignore
        global.FIND_MY_SPAWNS = FIND_MY_SPAWNS;
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

    it("keeps the latched source mid-cycle instead of re-picking the closer one", () => {
        // Latched to the far source B (as a transition would latch it when the
        // pocket was full), walking back to it with an empty store. The pocket
        // A is closer to the controller and free - the old re-pick-every-tick
        // code would flip to A here and oscillate between the two sources.
        const { creep, calls } = makeUpgrader({ sourceId: "sB", working: false });

        runUpgrader(creep);

        assert.equal(calls.harvest, 1, "the upgrader keeps working its latched source");
        assert.equal(calls.lastHarvested, "sB", "no flip to the closer source mid-cycle");
        assert.equal(creep.memory.sourceId, "sB", "the latch is left untouched mid-cycle");
    });

    it("re-picks the source on the transition tick that empties the store", () => {
        // Store just emptied after an upgrade (working still true, the phase
        // switch below flips it): a new cycle, so the latch is dropped and the
        // source nearest the controller is chosen again.
        const { creep, calls } = makeUpgrader({ sourceId: "sB", working: true });
        creep.store[RESOURCE_ENERGY] = 0;

        runUpgrader(creep);

        assert.equal(creep.memory.sourceId, "sA", "the new cycle re-latches the pocket source");
        assert.equal(calls.lastHarvested, "sA", "the upgrader heads for the pocket on the new cycle");
        assert.isFalse(creep.memory.working, "an empty store switches back to harvesting");
    });

    it("drops a latched source that ran dry while another source is live", () => {
        // Mid-cycle, the latched pocket source hits zero while the open source
        // still has energy: waiting here for the 300-tick refill would idle,
        // so the upgrader moves to the live source.
        const { creep, calls, sourceA } = makeUpgrader({ sourceId: "sA", working: false });
        sourceA.energy = 0;
        creep.store[RESOURCE_ENERGY] = 0;

        runUpgrader(creep);

        assert.equal(calls.lastHarvested, "sB", "a dry latched source is abandoned for a live one");
        assert.equal(creep.memory.sourceId, "sB", "the latch follows the live source");
    });

    it("builds the tower site instead of upgrading while it is unfinished", () => {
        // M3: while a tower or extension site exists, the upgrader is a
        // fourth builder - the WORK energy goes into the construction, not
        // the controller. It must work the tower even when an extension sits
        // closer (same priority as the builder role).
        const { creep, calls } = makeUpgraderWithSites([
            { id: "ext1", structureType: "extension", pos: pos(24, 24) }, // range 1 from the creep
            { id: "tower", structureType: "tower", pos: pos(18, 25) },    // range 7
        ]);

        runUpgrader(creep);

        assert.equal(calls.build, 1, "the upgrader builds while a priority site exists");
        assert.equal(calls.lastBuilt, "tower", "it works the tower, not the closer extension");
        assert.equal(calls.upgrade, undefined, "it does not touch the controller");
    });

    it("keeps upgrading when only non-priority sites (roads) remain", () => {
        // The pause condition is tower or extension sites only: road sites
        // must not send the upgrader off to build them.
        const { creep, calls } = makeUpgraderWithSites([
            { id: "road1", structureType: "road", pos: pos(24, 24) },
        ]);

        runUpgrader(creep);

        assert.equal(calls.upgrade, 1, "no tower or extension site: the upgrader upgrades");
        assert.equal(calls.build, undefined, "it does not build the road site");
    });

    describe("controller sign (owner request 2026-11-02)", () => {
        /**
         * An upgrader in the upgrade phase (full store, no priority sites) so
         * the sign check runs; makeUpgrader's default sign is already correct.
         * @returns The carrying mock creep and its call counters.
         */
        function makeSigningUpgrader(): { creep: any; calls: CallCounts }
        {
            const { creep, calls } = makeUpgrader({ working: true });
            creep.store[RESOURCE_ENERGY] = 50;
            return { creep, calls };
        }

        it("signs a missing controller sign, then resumes upgrading", () => {
            const { creep, calls } = makeSigningUpgrader();
            creep.room.controller.sign = undefined;

            runUpgrader(creep);

            assert.equal(calls.sign, 1, "the upgrader signs once");
            assert.equal(calls.lastSignText, CONTROLLER_SIGN_TEXT, "with the exact owner text");
            assert.equal(calls.upgrade, undefined, "the sign tick does not also upgrade");

            // The sign landed: the next tick upgrades as usual.
            creep.room.controller.sign = {
                username: "player",
                text: CONTROLLER_SIGN_TEXT,
                time: 1,
                datetime: new Date(),
            };
            runUpgrader(creep);

            assert.equal(calls.upgrade, 1, "the upgrade resumes once the sign is right");
            assert.equal(calls.sign, 1, "and the sign is not applied twice");
        });

        it("never re-signs when the sign text is already correct", () => {
            const { creep, calls } = makeSigningUpgrader();

            runUpgrader(creep);

            assert.equal(calls.sign, undefined, "no signController call");
            assert.equal(calls.upgrade, 1, "the upgrade runs untouched");
        });

        it("re-signs when the sign text differs from the owner text", () => {
            const { creep, calls } = makeSigningUpgrader();
            creep.room.controller.sign = {
                username: "someone",
                text: "old text",
                time: 1,
                datetime: new Date(),
            };

            runUpgrader(creep);

            assert.equal(calls.sign, 1, "a foreign sign is replaced");
            assert.equal(calls.lastSignText, CONTROLLER_SIGN_TEXT, "with the owner text");
            assert.equal(calls.upgrade, undefined, "the sign takes the action this tick");
        });

        it("walks in to range 1 to sign when out of range, instead of upgrading", () => {
            // signController needs an adjacent tile while the upgrade walk
            // stops at range 3: a pending sign must walk two tiles closer.
            const { creep, calls } = makeSigningUpgrader();
            creep.room.controller.sign = undefined;
            creep.signController = (_t: any, text: string) => {
                calls.sign = (calls.sign ?? 0) + 1;
                calls.lastSignText = text;
                return ERR_NOT_IN_RANGE;
            };

            runUpgrader(creep);

            assert.equal(calls.sign, 1, "it still tries the sign");
            assert.equal(calls.moveTo, 1, "and walks toward the controller");
            assert.equal(calls.lastMoveOpts.range, 1, "to range 1 - signController's range");
            assert.equal(calls.upgrade, undefined, "no upgrade while the sign is pending");
        });
    });

    describe("controller container cycle (M5, owner feedback 2026-11-09 idea d)", () => {
        /**
         * A container mock with the store shape the cycle reads.
         * @param energy The energy currently in the container.
         * @param x The x coordinate (Chebyshev distance to the controller
         *        at 25,25 decides whether the lookup finds it).
         * @param y The y coordinate.
         * @returns The container mock.
         */
        function makeContainer(energy: number, x: number, y: number): any
        {
            return {
                id: `container-${x}-${y}`,
                structureType: STRUCTURE_CONTAINER,
                pos: pos(x, y),
                store: {
                    [RESOURCE_ENERGY]: energy,
                    getUsedCapacity: () => energy,
                    getFreeCapacity: () => 2000 - energy,
                },
            };
        }

        /**
         * Patches the room's find so FIND_STRUCTURES (the lookup
         * findControllerContainer uses, filter honoured) returns the
         * container; every other type keeps the original dispatch.
         * @param creep The mock creep to patch.
         * @param container The container to report (or null for none).
         */
        function withContainer(creep: any, container: any): void
        {
            const originalFind = creep.room.find;
            creep.room.find = (type: number, opts?: any): any[] =>
            {
                if (type === FIND_STRUCTURES)
                {
                    const candidates = container !== null ? [container] : [];
                    return opts !== undefined && typeof opts.filter === "function"
                        ? candidates.filter(opts.filter)
                        : candidates;
                }
                return originalFind(type);
            };
        }

        it("walks to the controller container (range 0) instead of harvesting", () => {
            const { creep, calls } = makeUpgrader({});
            withContainer(creep, makeContainer(100, 25, 23)); // range 2 from the controller

            runUpgrader(creep);

            assert.equal(calls.withdraw, undefined, "no withdraw until it reaches the container");
            assert.equal(calls.harvest, undefined, "the container cycle pre-empts the source cycle");
            assert.equal(calls.moveTo, 1, "it walks to the container");
            assert.equal(calls.lastMoveOpts.range, 0, "onto the container tile (the upgrade works from there)");
        });

        it("withdraws from the container it stands on - one action per tick", () => {
            const { creep, calls } = makeUpgrader({});
            const container = makeContainer(100, 25, 23);
            withContainer(creep, container);
            creep.pos = container.pos; // arrived on the container's tile

            runUpgrader(creep);

            assert.equal(calls.withdraw, 1, "it withdraws on the container tile");
            assert.equal(calls.lastWithdrawn, container.id, "from the controller container");
            assert.equal(calls.harvest, undefined, "and never walks to a source");
            assert.equal(calls.moveTo, undefined, "no walk: the zero-walk criterion");
        });

        it("upgrades with a full store while standing on the container tile", () => {
            const { creep, calls } = makeUpgrader({});
            const container = makeContainer(100, 25, 23);
            withContainer(creep, container);
            creep.pos = container.pos;
            creep.store[RESOURCE_ENERGY] = 50;

            runUpgrader(creep);

            assert.equal(calls.upgrade, 1, "the full store upgrades from the container tile");
            assert.equal(calls.withdraw, undefined, "nothing left to withdraw");
            assert.equal(calls.moveTo, undefined, "still standing on the container tile");
        });

        it("falls back to the source cycle when the container is empty", () => {
            const { creep, calls } = makeUpgrader({working: true, sourceId: "sA"});
            withContainer(creep, makeContainer(0, 25, 23));

            runUpgrader(creep);

            assert.equal(calls.harvest, 1, "the empty container is skipped");
            assert.equal(calls.lastHarvested, "sA", "back to the latched source");
            assert.equal(calls.withdraw, undefined, "nothing to withdraw");
        });

        it("keeps upgrading a full store even when the container is empty", () => {
            const { creep, calls } = makeUpgrader({working: true, sourceId: "sA"});
            withContainer(creep, makeContainer(0, 25, 23));
            creep.store[RESOURCE_ENERGY] = 50;

            runUpgrader(creep);

            assert.equal(calls.upgrade, 1, "the carried energy is burned at the controller");
            assert.equal(calls.harvest, undefined, "no detour to a source while carrying");
            assert.equal(calls.withdraw, undefined, "the empty container holds nothing");
        });

        it("ignores a container out of CONTROLLER_CONTAINER_RANGE of the controller", () => {
            const { creep, calls } = makeUpgrader({working: true, sourceId: "sA"});
            withContainer(creep, makeContainer(100, 20, 25)); // range 5 from the controller

            runUpgrader(creep);

            assert.equal(calls.harvest, 1, "an out-of-range container is not the delivery point");
            assert.equal(calls.lastHarvested, "sA", "the upgrader stays on its source cycle");
            assert.equal(calls.withdraw, undefined, "no withdraw from it");
        });
    });

    describe("source container cycle (M5, owner feedback 2026-11-10 fix 1)", () => {
        /**
         * A source container mock: next to the pocket source A (14,18) and
         * far from the controller (25,25), so it is a SOURCE container, not
         * the controller's fuel stop.
         * @param energy The energy currently in the container.
         * @returns The container mock.
         */
        function makeSourceContainer(energy: number): any
        {
            return {
                id: "con-src",
                structureType: STRUCTURE_CONTAINER,
                pos: pos(15, 18),
                store: {
                    [RESOURCE_ENERGY]: energy,
                    getUsedCapacity: () => energy,
                    getFreeCapacity: () => 2000 - energy,
                },
            };
        }

        /**
         * Patches the room's find so FIND_STRUCTURES (the lookup the
         * container branches use, filter honoured) returns the container;
         * every other type keeps the original dispatch (same patch as the
         * controller-container cycle above).
         * @param creep The mock creep to patch.
         * @param container The container to report (or null for none).
         */
        function withContainer(creep: any, container: any): void
        {
            const originalFind = creep.room.find;
            creep.room.find = (type: number, opts?: any): any[] =>
            {
                if (type === FIND_STRUCTURES)
                {
                    const candidates = container !== null ? [container] : [];
                    return opts !== undefined && typeof opts.filter === "function"
                        ? candidates.filter(opts.filter)
                        : candidates;
                }
                return originalFind(type);
            };
        }

        it("withdraws from a source container when no controller container exists", () => {
            // Owner feedback 2026-11-10 fix 1, test (b): an empty upgrader
            // with no controller container and a source container holding
            // 1000 energy must withdraw from the container instead of
            // walking to a source.
            const { creep, calls } = makeUpgrader({});
            const container = makeSourceContainer(1000);
            withContainer(creep, container);
            creep.pos = container.pos; // standing on the container's tile

            runUpgrader(creep);

            assert.equal(calls.withdraw, 1, "the empty upgrader withdraws from the source container");
            assert.equal(calls.lastWithdrawn, container.id, "the source container is the withdrawal target");
            assert.equal(calls.harvest, undefined, "no self-harvest trip while the container holds energy");
            assert.equal(calls.upgrade, undefined, "no upgrade while the store is still empty");
        });

        it("waits out a trickle in a source container instead of self-harvesting", () => {
            // Below MIN_CONTAINER_WITHDRAW_ENERGY the miner tops the
            // container back up within a few ticks; idling this tick beats
            // a round trip to a source for a partial load.
            const { creep, calls } = makeUpgrader({});
            withContainer(creep, makeSourceContainer(50));

            runUpgrader(creep);

            assert.equal(calls.harvest, undefined, "no source trip for a partial load");
            assert.equal(calls.withdraw, undefined, "below the threshold the container is skipped");
            assert.equal(calls.upgrade, undefined, "nothing carried to spend");
            assert.equal(calls.moveTo, undefined, "no walk: the upgrader waits for the refill");
        });
    });

    describe("pool rung (2026-11-12 M5 gate: the upgrader spends the spawn pool)", () => {
        /**
         * A spawn mock that holds energy in its store (the pool part the
         * new upgrader rung withdraws from).
         * @param energy The energy currently in the spawn.
         * @returns The spawn mock.
         */
        function makeSpawn(energy: number): any
        {
            return {
                id: "spawn1",
                pos: pos(13, 20),
                store: {
                    [RESOURCE_ENERGY]: energy,
                    getUsedCapacity: () => energy,
                    getFreeCapacity: () => 300 - energy,
                },
            };
        }

        /**
         * Patches the mock room for the pool-rung tests: the controller gets
         * a level (the rung is gated on CONTAINER_BOOST_MIN_LEVEL), the room
         * gets an energyAvailable / energyCapacityAvailable pair (the pool
         * floor check reads both), and FIND_MY_SPAWNS returns the spawn.
         * @param creep The mock creep to patch.
         * @param spawn The spawn to report (or null for an empty pool).
         * @param level The controller level (3: below the gate, 5: armed).
         * @param energyAvailable The room's stored energy (the floor check).
         */
        function withPool(creep: any, spawn: any, level: number, energyAvailable: number): void
        {
            creep.room.controller.level = level;
            creep.room.energyAvailable = energyAvailable;
            creep.room.energyCapacityAvailable = 300;
            const originalFind = creep.room.find;
            creep.room.find = (type: number, opts?: any): any[] =>
            {
                if (type === FIND_MY_SPAWNS)
                {
                    return spawn !== null ? [spawn] : [];
                }
                return originalFind(type, opts);
            };
        }

        /**
         * A source container mock: next to the pocket source A (14,18) and
         * far from the controller (25,25), so it is a SOURCE container the
         * old rung (4) would withdraw from. Same geometry as the cycle
         * tests above.
         * @param energy The energy currently in the container.
         * @returns The container mock.
         */
        function makeSourceContainer(energy: number): any
        {
            return {
                id: "con-src",
                structureType: STRUCTURE_CONTAINER,
                pos: pos(15, 18),
                store: {
                    [RESOURCE_ENERGY]: energy,
                    getUsedCapacity: () => energy,
                    getFreeCapacity: () => 2000 - energy,
                },
            };
        }

        /**
         * Patches the room's find so FIND_STRUCTURES (the lookup the
         * container branches use, filter honoured) returns the container;
         * every other type keeps the original dispatch (same patch as the
         * controller-container cycle above).
         * @param creep The mock creep to patch.
         * @param container The container to report (or null for none).
         */
        function withContainer(creep: any, container: any): void
        {
            const originalFind = creep.room.find;
            creep.room.find = (type: number, opts?: any): any[] =>
            {
                if (type === FIND_STRUCTURES)
                {
                    const candidates = container !== null ? [container] : [];
                    return opts !== undefined && typeof opts.filter === "function"
                        ? candidates.filter(opts.filter)
                        : candidates;
                }
                return originalFind(type, opts);
            };
        }

        it("withdraws from the pool ABOVE the source container at RCL 4+", () => {
            // The 2026-11-12 M5 gate: with a full pool and a source
            // container holding 1000, an old-tree upgrader took the
            // container rung (20+ tiles away) and the pool sat at 450/450
            // until the income crew's deliveries dropped on the floor. The
            // new rung (3) is above the container: the upgrader stands next
            // to the controller, so the pool is its cheapest fuel. Both
            // hold-backs must be off - with the one source container the
            // level-5 minimums are upgrader 1, miner 1, harvester 2
            // (UNCOVERED_SOURCE_HARVESTERS_L4), hauler 2 (per-container
            // plus CONTAINER_HAULER_SPARE) - and the pool above the 50%
            // floor. Without the rung this test fails: the container wins.
            const { creep, calls } = makeUpgrader({});
            const container = makeSourceContainer(1000);
            withContainer(creep, container);
            withPool(creep, makeSpawn(300), 5, 300);
            // One upgrader and five income creeps are alive,
            // so neither hold-back applies.
            global.Game.creeps = {
                u1: {memory: {role: "upgrader", working: false}},
                m1: {memory: {role: "miner", working: false}},
                h1: {memory: {role: "harvester", working: false}},
                h2: {memory: {role: "harvester", working: false}},
                l1: {memory: {role: "hauler", working: false}},
                l2: {memory: {role: "hauler", working: false}},
            } as any;

            runUpgrader(creep);

            assert.equal(calls.withdraw, 1, "the empty upgrader withdraws somewhere");
            assert.equal(calls.lastWithdrawn, "spawn1", "the pool beats the full source container");
            assert.equal(calls.harvest, undefined, "no self-harvest trip while the pool holds energy");
            assert.equal(calls.upgrade, undefined, "no upgrade while the store is still empty");
        });

        it("ignores the pool below CONTAINER_BOOST_MIN_LEVEL (M1-M3 economy unchanged)", () => {
            // The rung is level-gated: at RCL 3 the upgrader keeps the old
            // behavior (container rung, then self-harvest). Same room as
            // above, level 3, crew at the level-3 minimums (upgrader 1,
            // income 3: one miner, one harvester, one hauler - the
            // uncovered source counts ONE harvester below level 4).
            const { creep, calls } = makeUpgrader({});
            const container = makeSourceContainer(1000);
            withContainer(creep, container);
            withPool(creep, makeSpawn(300), 3, 300);
            creep.pos = container.pos; // standing on the container's tile
            // One upgrader and three income creeps are alive.
            global.Game.creeps = {
                u1: {memory: {role: "upgrader", working: false}},
                m1: {memory: {role: "miner", working: false}},
                h1: {memory: {role: "harvester", working: false}},
                l1: {memory: {role: "hauler", working: false}},
            } as any;

            runUpgrader(creep);

            assert.equal(calls.withdraw, 1, "the empty upgrader withdraws somewhere");
            assert.equal(calls.lastWithdrawn, container.id, "below RCL 4 the source container is still the rung");
            assert.notEqual(calls.lastWithdrawn, "spawn1", "the pool is not touched below the gate");
            assert.equal(calls.harvest, undefined, "no self-harvest trip while the container holds energy");
        });

        it("skips the pool below the 50% floor even at RCL 5", () => {
            // The floor is a hold-back, not decoration: with the store
            // under BUILDER_WITHDRAW_FRACTION of capacity a full-size
            // income replacement could no longer be spawned, so the
            // upgrader falls back to the container rung and leaves the
            // pool for the respawn queue.
            const { creep, calls } = makeUpgrader({});
            const container = makeSourceContainer(1000);
            withContainer(creep, container);
            withPool(creep, makeSpawn(300), 5, 100); // 100 < 150 (50% of 300)
            creep.pos = container.pos; // standing on the container's tile
            // @ts-ignore : one upgrader and five income creeps are alive.
            global.Game.creeps = {
                u1: {memory: {role: "upgrader", working: false}},
                m1: {memory: {role: "miner", working: false}},
                h1: {memory: {role: "harvester", working: false}},
                h2: {memory: {role: "harvester", working: false}},
                l1: {memory: {role: "hauler", working: false}},
                l2: {memory: {role: "hauler", working: false}},
            } as any;

            runUpgrader(creep);

            assert.equal(calls.withdraw, 1, "the empty upgrader withdraws somewhere");
            assert.equal(calls.lastWithdrawn, container.id, "below the floor the source container is the rung");
            assert.notEqual(calls.lastWithdrawn, "spawn1", "the pool is not drained below the floor");
        });
    });

    describe("work latch (owner feedback v9.4, URGENT 1)", () => {
        /**
         * Reports a single source container through FIND_STRUCTURES with the
         * filter honoured (same patch as the describes above).
         * @param creep The mock creep to patch.
         * @param container The container to report.
         */
        function withSourceContainer(creep: any, container: any): void
        {
            const originalFind = creep.room.find;
            creep.room.find = (type: number, opts?: any): any[] =>
            {
                if (type === FIND_STRUCTURES)
                {
                    return opts !== undefined && typeof opts.filter === "function"
                        ? [container].filter(opts.filter)
                        : [container];
                }
                return originalFind(type);
            };
        }

        function makeFullSourceContainer(): any
        {
            return {
                id: "con-src",
                structureType: STRUCTURE_CONTAINER,
                pos: pos(15, 18), // next to the pocket source A, far from the controller
                store: {
                    [RESOURCE_ENERGY]: 1000,
                    getUsedCapacity: () => 1000,
                    getFreeCapacity: () => 1000,
                },
            };
        }

        it("burns a half-full store instead of walking back for a top-up", () => {
            // Owner feedback v9.4, URGENT 1 (a): 30 of 50 energy, working,
            // at the controller, a full source container in the room. The
            // v9.3 code asked getEnergy before the latch, so the upgrader
            // left the controller for a container top-up after every single
            // upgrade tick - walk, withdraw, walk back, upgrade one tick,
            // repeat (M5 upgradePerTick 0.05 with full containers). Now the
            // store burns down to zero: the one action per tick is the
            // upgrade, not the walk.
            const { creep, calls } = makeUpgrader({ working: true });
            creep.store[RESOURCE_ENERGY] = 30;
            withSourceContainer(creep, makeFullSourceContainer());

            runUpgrader(creep);

            assert.equal(calls.upgrade, 1, "the half-full store keeps upgrading at the controller");
            assert.equal(calls.withdraw, undefined, "no container top-up mid-cycle");
            assert.equal(calls.harvest, undefined, "no source trip mid-cycle");
            assert.equal(calls.moveTo, undefined, "no walk: the upgrader stays at the controller");
            assert.equal(creep.memory.working, true, "the work cycle stays open while energy remains");
        });

        it("closes the work cycle on an empty store and tops up from the container", () => {
            // Owner feedback v9.4, URGENT 1 (b): an upgrade just emptied the
            // store. The latch closes (working = false) and the fetch phase
            // runs: standing on a full source container, the upgrader
            // withdraws instead of keeping a stale "working" latch (the v9.3
            // code left working = true through the whole fetch phase).
            const { creep, calls } = makeUpgrader({ working: true });
            creep.store[RESOURCE_ENERGY] = 0;
            const container = makeFullSourceContainer();
            withSourceContainer(creep, container);
            creep.pos = container.pos; // standing on the container's tile

            runUpgrader(creep);

            assert.equal(creep.memory.working, false, "an empty store closes the work cycle");
            assert.equal(calls.withdraw, 1, "the fetch phase tops up from the container");
            assert.equal(calls.lastWithdrawn, "con-src", "the source container is the withdrawal target");
            assert.equal(calls.upgrade, undefined, "nothing to burn this tick");
        });
    });
});


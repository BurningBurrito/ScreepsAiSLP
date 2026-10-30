import {assert} from "chai";
import {runUpgrader} from "../../src/roles/upgrader";
import {Game, Memory, OK, ERR_NOT_IN_RANGE} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const FIND_SOURCES = 105;
const FIND_CREEPS = 101;
const FIND_MY_STRUCTURES = 108;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_MY_SPAWNS = 112;
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_TOWER = "tower";
const STRUCTURE_ROAD = "road";
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
    lastHarvested?: string;
};

function makeUpgrader(memory: Record<string, any>):
    { creep: any; calls: CallCounts; sourceA: any; sourceB: any }
{
    const calls: CallCounts = {};
    const sourceA = { id: "sA", energy: 500, pos: pos(14, 18) }; // pocket: near the controller
    const sourceB = { id: "sB", energy: 500, pos: pos(39, 14) }; // open: far from the controller
    const controller = { my: true, pos: pos(25, 25) };
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
        upgradeController: () => {
            calls.upgrade = (calls.upgrade ?? 0) + 1;
            return OK;
        },
        moveTo: () => {
            calls.moveTo = (calls.moveTo ?? 0) + 1;
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
    const controller = { my: true, pos: pos(25, 25) };
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
});


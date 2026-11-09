import {assert} from "chai";
import {runHauler} from "../../src/roles/hauler";
import {Game, Memory, OK} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const FIND_SOURCES = 105;
const FIND_DROPPED_RESOURCES = 106;
const FIND_MY_STRUCTURES = 108;
const FIND_STRUCTURES = 107;
const FIND_HOSTILE_CREEPS = 103;
const STRUCTURE_SPAWN = "spawn";
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_TOWER = "tower";
const STRUCTURE_CONTAINER = "container";
const ERR_FULL = -7;

/**
 * Builds a position mock that measures Chebyshev distance (the real
 * RoomPosition.getRangeTo), so the target-ranking logic under test behaves
 * exactly as it does in-game. Also accepts objects that carry a .pos
 * (structures), like the real getRangeTo does.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @returns A position-like object with a working getRangeTo.
 */
function pos(x: number, y: number): any
{
    return {
        x,
        y,
        getRangeTo: (target: any) => {
            const p = target !== null && target.pos !== undefined ? target.pos : target;
            return Math.max(Math.abs(p.x - x), Math.abs(p.y - y));
        },
    };
}

/**
 * Builds a structure mock with a LIVE energy store: the game code reads
 * getUsedCapacity() each tick, so the mock keeps the number in one place
 * (store.energy) and the transfer and withdraw mocks mutate it.
 * @param id A unique name for assertions (lastTransferTo / lastWithdrawFrom).
 * @param structureType The Screeps structure type constant.
 * @param energy Energy currently in the structure.
 * @param capacity The structure's energy capacity.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @returns A structure-like mock.
 */
function makeStructure(id: string, structureType: string, energy: number, capacity: number, x: number, y: number): any
{
    const store: any = {
        energy,
        getUsedCapacity: () => store.energy,
        getCapacity: () => capacity,
    };
    return {id, structureType, store, pos: pos(x, y)};
}

type HaulerCalls = {
    withdraw?: number;
    transfer?: number;
    pickup?: number;
    moveTo?: number;
    lastWithdrawFrom?: string;
    lastTransferTo?: string;
};

/**
 * Builds a hauler creep ([CARRY x2, MOVE] = 100 energy) and the room
 * around it. The creep stands at (13, 20), next to the spawn area.
 * @param energy Energy currently in the creep's store.
 * @param options The room contents: built structures (spawn, extensions,
 *        towers), containers, sources, hostiles, dropped energy, the
 *        controller, and extra memory fields.
 * @returns The mock creep, its call counters, and its store.
 */
function makeHauler(
    energy: number,
    options: {
        structures?: any[];
        containers?: any[];
        sources?: any[];
        hostiles?: any[];
        dropped?: any[];
        controller?: any;
        memory?: Record<string, any>;
    } = {},
): {creep: any; calls: HaulerCalls; store: any}
{
    const calls: HaulerCalls = {};
    const CAPACITY = 100; // [CARRY x2]
    const store: any = {
        energy,
        getUsedCapacity: () => store.energy,
        getCapacity: () => CAPACITY,
    };
    const creep: any = {
        id: "h1",
        memory: {role: "hauler", working: true, ...options.memory},
        body: [{type: "carry"}, {type: "move"}],
        store,
        pos: {
            ...pos(13, 20),
            // The hauler hands findClosestByPath either an ARRAY of
            // candidates (its own filtered lists) or a FIND_* constant
            // (dropped energy). Both overloads pick the closest object by
            // Chebyshev distance.
            findClosestByPath: (candidates: any, _opts?: any) => {
                const objects: any[] = Array.isArray(candidates)
                    ? candidates
                    : creep.room.find(candidates);
                let best: any = null;
                let bestDistance = Infinity;
                for (const candidate of objects)
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
        },
        room: {
            name: "W0N1",
            find: (type: number, opts?: any) => {
                if (type === FIND_MY_STRUCTURES)
                {
                    const structures = options.structures ?? [];
                    return opts !== undefined && opts.filter !== undefined
                        ? structures.filter(opts.filter)
                        : structures;
                }
                if (type === FIND_STRUCTURES)
                {
                    // FIND_MY_STRUCTURES excludes containers, so the game
                    // code looks them up via FIND_STRUCTURES.
                    const structures = (options.structures ?? []).concat(options.containers ?? []);
                    return opts !== undefined && opts.filter !== undefined
                        ? structures.filter(opts.filter)
                        : structures;
                }
                if (type === FIND_SOURCES)
                {
                    return options.sources ?? [];
                }
                if (type === FIND_DROPPED_RESOURCES)
                {
                    return options.dropped ?? [];
                }
                if (type === FIND_HOSTILE_CREEPS)
                {
                    return options.hostiles ?? [];
                }
                return [];
            },
            controller: options.controller,
        },
        transfer: (target: any) => {
            calls.transfer = (calls.transfer ?? 0) + 1;
            calls.lastTransferTo = target.id;
            const free = target.store.getCapacity() - target.store.getUsedCapacity();
            if (free <= 0)
            {
                return ERR_FULL;
            }
            const moved = Math.min(store.energy, free);
            store.energy -= moved;
            target.store.energy += moved;
            return OK;
        },
        withdraw: (target: any) => {
            calls.withdraw = (calls.withdraw ?? 0) + 1;
            calls.lastWithdrawFrom = target.id;
            const free = store.getCapacity() - store.getUsedCapacity();
            const available = target.store.getUsedCapacity();
            if (free <= 0 || available <= 0)
            {
                return ERR_FULL;
            }
            const moved = Math.min(free, available);
            store.energy += moved;
            target.store.energy -= moved;
            return OK;
        },
        pickup: (resource: any) => {
            calls.pickup = (calls.pickup ?? 0) + 1;
            const free = store.getCapacity() - store.getUsedCapacity();
            const moved = Math.min(free, resource.amount);
            if (moved <= 0)
            {
                return ERR_FULL;
            }
            store.energy += moved;
            resource.amount -= moved;
            return OK;
        },
        moveTo: () => {
            calls.moveTo = (calls.moveTo ?? 0) + 1;
            return OK;
        },
    };
    return {creep, calls, store};
}

function installGlobals(): void
{
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    // @ts-ignore
    global.FIND_SOURCES = FIND_SOURCES;
    // @ts-ignore
    global.FIND_DROPPED_RESOURCES = FIND_DROPPED_RESOURCES;
    // @ts-ignore
    global.FIND_MY_STRUCTURES = FIND_MY_STRUCTURES;
    // @ts-ignore
    global.FIND_STRUCTURES = FIND_STRUCTURES;
    // @ts-ignore
    global.FIND_HOSTILE_CREEPS = FIND_HOSTILE_CREEPS;
    // @ts-ignore
    global.STRUCTURE_SPAWN = STRUCTURE_SPAWN;
    // @ts-ignore
    global.STRUCTURE_EXTENSION = STRUCTURE_EXTENSION;
    // @ts-ignore
    global.STRUCTURE_TOWER = STRUCTURE_TOWER;
    // @ts-ignore
    global.STRUCTURE_CONTAINER = STRUCTURE_CONTAINER;
    // @ts-ignore
    global.RESOURCE_ENERGY = RESOURCE_ENERGY;
    // @ts-ignore
    global.OK = OK;
    // @ts-ignore : movement.ts counts MOVE parts in the body
    global.MOVE = "move";
}

describe("hauler (M5 rewrite, fault 1: delivery state)", () => {
    beforeEach(() => {
        installGlobals();
    });

    it("delivers a partial load instead of walking back to the container", () => {
        // Store 50/100 (NOT full), source container with energy nearby,
        // empty spawn. Old code: not full -> back to the container.
        // New code: deliver the 50, latch back to collecting.
        const container = makeStructure("c1", STRUCTURE_CONTAINER, 100, 2000, 14, 18);
        const spawn = makeStructure("sp", STRUCTURE_SPAWN, 0, 3000, 20, 20);
        const {creep, calls, store} = makeHauler(50, {
            structures: [spawn],
            containers: [container],
            sources: [{id: "s1", pos: pos(14, 19)}],
        });
        runHauler(creep);
        assert.equal(calls.transfer, 1, "transferred its load");
        assert.equal(calls.lastTransferTo, "sp", "to the spawn");
        assert.equal(calls.withdraw ?? 0, 0, "did NOT walk back to the container");
        assert.equal(store.energy, 0, "store empty after delivery");
        assert.equal(creep.memory.delivering, false, "unlatched back to collecting");
    });

    it("collects from the source container until full, then delivers", () => {
        const container = makeStructure("c1", STRUCTURE_CONTAINER, 200, 2000, 14, 18);
        const spawn = makeStructure("sp", STRUCTURE_SPAWN, 0, 3000, 20, 20);
        const {creep, calls, store} = makeHauler(0, {
            structures: [spawn],
            containers: [container],
            sources: [{id: "s1", pos: pos(14, 19)}],
        });
        runHauler(creep);
        assert.equal(calls.withdraw, 1, "withdrew from the source container");
        assert.equal(calls.lastWithdrawFrom, "c1");
        assert.equal(store.energy, 100, "store full");
        assert.equal(creep.memory.delivering, true, "latched into delivery");
        runHauler(creep);
        assert.equal(calls.transfer, 1, "delivered the full load");
        assert.equal(store.energy, 0, "store empty");
        assert.equal(creep.memory.delivering, false, "back to collecting");
        assert.equal(spawn.store.energy, 100, "spawn received the load");
    });

    it("never withdraws from the controller container (that energy is for the upgraders)", () => {
        // Only the controller container holds energy; no source container
        // energy, no dropped energy. The hauler must not touch it.
        const cc = makeStructure("cc", STRUCTURE_CONTAINER, 1500, 2000, 24, 25);
        const spawn = makeStructure("sp", STRUCTURE_SPAWN, 0, 3000, 13, 21);
        const {creep, calls, store} = makeHauler(0, {
            structures: [spawn],
            containers: [cc],
            sources: [
                {id: "s1", pos: pos(14, 19)},
                {id: "s2", pos: pos(38, 36)},
            ],
            controller: {level: 5, pos: pos(25, 25)},
        });
        runHauler(creep);
        assert.equal(calls.withdraw ?? 0, 0, "did not touch the controller container");
        assert.equal(store.energy, 0, "still empty");
    });

    it("picks up dropped energy and then delivers it", () => {
        const spawn = makeStructure("sp", STRUCTURE_SPAWN, 0, 3000, 13, 21);
        const dropped = {id: "d1", resourceType: RESOURCE_ENERGY, amount: 30, pos: pos(15, 20)};
        const {creep, calls, store} = makeHauler(0, {
            structures: [spawn],
            sources: [{id: "s1", pos: pos(14, 19)}],
            dropped: [dropped],
        });
        runHauler(creep);
        assert.equal(calls.pickup, 1, "picked up the dropped energy");
        assert.equal(store.energy, 30, "store holds the picked-up load");
        assert.equal(creep.memory.delivering, true, "picked load latches into delivery");
        runHauler(creep);
        assert.equal(spawn.store.energy, 30, "delivered the picked-up energy");
        assert.equal(creep.memory.delivering, false);
    });
});
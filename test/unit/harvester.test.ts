import {assert} from "chai";
import {runHarvester} from "../../src/roles/harvester";
import {Game, Memory, OK, ERR_NOT_IN_RANGE} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define Screeps constants for tests (real values from @types/screeps)
const RESOURCE_ENERGY = "energy";
const FIND_SOURCES = 105;
const FIND_MY_SPAWNS = 112;
const FIND_MY_STRUCTURES = 108;
const STRUCTURE_EXTENSION = "extension";
const STRUCTURE_TOWER = "tower";

describe("harvester", () => {
    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : allow adding Memory to global
        global.Memory = _.clone(Memory);
        // @ts-ignore
        global.FIND_SOURCES = FIND_SOURCES;
        // @ts-ignore
        global.FIND_SOURCES_ACTIVE = 104;
        // @ts-ignore
        global.FIND_MY_SPAWNS = FIND_MY_SPAWNS;
        // @ts-ignore
        global.FIND_MY_STRUCTURES = FIND_MY_STRUCTURES;
        // @ts-ignore
        global.STRUCTURE_EXTENSION = STRUCTURE_EXTENSION;
        // @ts-ignore
        global.STRUCTURE_TOWER = STRUCTURE_TOWER;
        // @ts-ignore
        global.RESOURCE_ENERGY = RESOURCE_ENERGY;
        // @ts-ignore
        global.ERR_NOT_IN_RANGE = ERR_NOT_IN_RANGE;
        // @ts-ignore
        global.ERR_NO_PATH = -4;
        // @ts-ignore
        global.OK = OK;
        // @ts-ignore : movement.ts counts MOVE parts in the body
        global.MOVE = "move";
    });

    /**
     * Builds a harvester creep mock.
     * @param energy - Energy currently in the store
     * @param capacity - Store capacity
     * @param working - The working flag to start with
     * @param sources - The sources returned by room.find(FIND_SOURCES)
     * @param spawnFree - Free capacity of the (single) spawn
     * @param memory - Extra memory fields (e.g. sourceId)
     * @returns The mock creep and its call counters
     */
    function makeCreep(
        energy: number,
        capacity: number,
        working: boolean,
        sources: any[],
        spawnFree: number,
        memory: Record<string, any> = {},
    ): { creep: any; calls: { [key: string]: number } }
    {
        const calls: { [key: string]: number } = {};
        const creep: any = {
            memory: { working, role: "harvester", ...memory },
            body: [
                { type: "work" },
                { type: "carry" },
                { type: "move" },
            ],
            store: {
                [RESOURCE_ENERGY]: energy,
                getFreeCapacity: () => capacity - energy,
                getCapacity: () => capacity,
            },
            pos: {
                x: 14,
                y: 19,
                getRangeTo: (target: any) => target.rangeFromCreep ?? 1,
            },
            room: {
                find: (type: number) => {
                    if (type === FIND_SOURCES) {
                        return sources;
                    }
                    if (type === FIND_MY_SPAWNS) {
                        return [{ store: { getFreeCapacity: () => spawnFree }, rangeFromCreep: 1 }];
                    }
                    return []; // no towers or extensions in these tests
                },
                controller: null,
            },
            moveTo: () => {
                calls.moveTo = (calls.moveTo ?? 0) + 1;
                return OK;
            },
            transfer: function (this: any) {
                calls.transfer = (calls.transfer ?? 0) + 1;
                this.store[RESOURCE_ENERGY] = 0; // the engine moves the whole load
                return OK;
            },
            harvest: () => {
                calls.harvest = (calls.harvest ?? 0) + 1;
                return OK;
            },
            drop: () => {
                calls.drop = (calls.drop ?? 0) + 1;
            },
        };
        return { creep, calls };
    }
    it("harvests from the active source when the store is empty", () => {
        const source = { id: "s1", energy: 1000, pos: { getRangeTo: () => 1 }, rangeFromCreep: 1 };
        const { creep, calls } = makeCreep(0, 50, false, [source], 10);

        runHarvester(creep);

        assert.equal(calls.harvest, 1, "harvest should be called when the store is empty");
        assert.isFalse(creep.memory.working, "creep should stay in gather mode while empty");
        assert.equal(calls.transfer ?? 0, 0, "no transfer while empty");
    });

    it("moves to the source when out of range", () => {
        const source = { id: "s1", energy: 1000, pos: { getRangeTo: () => 3 }, rangeFromCreep: 3 };
        const { creep, calls } = makeCreep(0, 50, false, [source], 10);
        creep.harvest = () => ERR_NOT_IN_RANGE;

        runHarvester(creep);

        assert.equal(calls.moveTo, 1, "moveTo should be called when harvest is out of range");
        assert.equal(creep.memory.sourceId, "s1", "the creep should keep its source assignment");
    });

    it("delivers to spawn when the store is full", () => {
        const source = { id: "s1", energy: 1000, pos: { getRangeTo: () => 1 }, rangeFromCreep: 1 };
        const { creep, calls } = makeCreep(50, 50, false, [source], 10);

        runHarvester(creep);

        assert.equal(calls.transfer, 1, "the full load should be delivered to the spawn");
        assert.isFalse(creep.memory.working, "after delivering, the creep returns to gathering");
        assert.equal(calls.drop ?? 0, 0, "no drop when delivery succeeds");
    });

    it("drops the load when spawn is full and no tower or extension exists", () => {
        const source = { id: "s1", energy: 0, pos: { getRangeTo: () => 1 }, rangeFromCreep: 1 };
        const { creep, calls } = makeCreep(50, 50, true, [source], 0);

        runHarvester(creep);

        assert.equal(calls.transfer ?? 0, 0, "transfer should not be called when the spawn is full");
        assert.equal(calls.drop, 1, "energy should be dropped as last resort");
        assert.isFalse(creep.memory.working, "creep should stop working after dropping");
    });

    it("delivers a partial load when the assigned source ran dry", () => {
        const dryAssigned = { id: "s1", energy: 0, pos: { getRangeTo: () => 1 }, rangeFromCreep: 1 };
        const dryOther = { id: "s2", energy: 0, pos: { getRangeTo: () => 5 }, rangeFromCreep: 5 };
        // 30 of 50 is above PARTIAL_DELIVERY_FRACTION (0.5 * 50 = 25)
        const { creep, calls } = makeCreep(30, 50, false, [dryAssigned, dryOther], 10, { sourceId: "s1" });

        runHarvester(creep);

        assert.equal(calls.transfer, 1, "the worth-while partial load should go to the spawn");
        assert.equal(calls.harvest ?? 0, 0, "no harvesting while delivering");
    });

    it("keeps harvesting with a small partial load at a dry source", () => {
        const dryAssigned = { id: "s1", energy: 0, pos: { getRangeTo: () => 1 }, rangeFromCreep: 1 };
        const { creep, calls } = makeCreep(10, 50, false, [dryAssigned], 10, { sourceId: "s1" });

        runHarvester(creep);

        assert.isFalse(creep.memory.working, "a small load is not worth a round trip");
        assert.equal(calls.harvest, 1, "the creep should wait at its source and keep harvesting");
        assert.equal(calls.transfer ?? 0, 0, "no transfer for a small load");
    });
});


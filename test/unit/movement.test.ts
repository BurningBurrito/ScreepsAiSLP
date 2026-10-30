import {assert} from "chai";
import {moveToToward} from "../../src/utils/movement";
import {Game, OK} from "./mock";

describe("moveToToward", () => {
    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = _.clone(Game);
        // @ts-ignore : movement.ts counts MOVE parts in the body
        global.MOVE = "move";
        // @ts-ignore
        global.OK = OK;
    });

    /**
     * Builds a creep mock on a fixed tile with the given stuck memory.
     * @param memory - The creep memory (may carry stuckPos/stuckSince/_move)
     * @returns The mock creep and moveTo call counter
     */
    function makeCreep(memory: Record<string, any>): { creep: any; calls: { [key: string]: number } }
    {
        const calls: { [key: string]: number } = {};
        const creep: any = {
            body: [
                { type: "work" },
                { type: "carry" },
                { type: "move" },
            ],
            memory,
            pos: { x: 14, y: 19 },
            moveTo: () => {
                calls.moveTo = (calls.moveTo ?? 0) + 1;
                return OK;
            },
        };
        return { creep, calls };
    }

    it("drops the stale path cache when the creep is stuck past its fatigue cycle", () => {
        // 2 non-MOVE parts -> threshold = 2 * 2 + STUCK_CLEAR_BASE (2) = 6
        const memory = {
            stuckPos: "14,19",
            stuckSince: Game.time - 6,
            _move: { path: [{ x: 14, y: 18 }], targetRoom: "W1N1" },
        };
        const { creep, calls } = makeCreep(memory);

        const result = moveToToward(creep, creep.pos, 1);

        assert.equal(result, OK, "moveTo should still be called to re-path");
        assert.equal(calls.moveTo, 1, "moveTo should be called");
        assert.isUndefined(creep.memory._move, "the stale _move cache must be deleted");
        assert.equal(creep.memory.stuckSince, Game.time, "the stuck timer resets after a clear");
    });

    it("keeps the cache while the creep is still within its fatigue cycle", () => {
        const memory = {
            stuckPos: "14,19",
            stuckSince: Game.time - 3, // below the 6-tick threshold
            _move: { path: [{ x: 14, y: 18 }] },
        };
        const { creep } = makeCreep(memory);

        moveToToward(creep, creep.pos, 1);

        assert.isDefined(creep.memory._move, "a fresh cache must not be dropped");
    });

    it("resets the stuck timer when the creep changes tiles", () => {
        const memory = {
            stuckPos: "13,19",
            stuckSince: Game.time - 100,
            _move: { path: [{ x: 14, y: 18 }] },
        };
        const { creep } = makeCreep(memory);

        moveToToward(creep, creep.pos, 1);

        assert.equal(creep.memory.stuckPos, "14,19", "the stuck position follows the creep");
        assert.equal(creep.memory.stuckSince, Game.time, "the timer resets on movement");
        assert.isDefined(creep.memory._move, "a walking creep keeps its cached path");
    });

    it("drops the cache when the creep ping-pongs between two tiles", () => {
        // The failure the detector must catch: the engine replays a path
        // whose end is blocked and single-steps the creep back and forth
        // between two tiles (the measured upgrader at the pocket entrance).
        // The position at the window edge repeats every threshold ticks, so
        // no net progress is detected and a cache written by one moveTo()
        // must be gone before the next one.
        const creep: any = {
            body: [
                { type: "work" },
                { type: "carry" },
                { type: "move" },
            ],
            memory: {},
            pos: { x: 14, y: 19 },
            moveTo: () => {
                // Engine-faithful: moveTo() only computes (writes) a new
                // cached path when there is none; otherwise it replays the
                // cache, so the same object survives the call.
                if (creep.memory._move === undefined)
                {
                    creep.memory._move = { path: "" };
                }
                return OK;
            },
        };
        let cleared = false;
        for (let i = 0; i < 14; i += 1)
        {
            // @ts-ignore : advance the global game clock the code reads
            global.Game.time += 1;
            creep.pos.x = i % 2 === 0 ? 14 : 15;
            const before = creep.memory._move;
            moveToToward(creep, creep.pos, 1);
            if (before !== undefined && creep.memory._move !== before)
            {
                cleared = true;
            }
        }
        assert.isTrue(cleared, "the 2-tile oscillation must be detected as stuck");
    });

    it("keeps the cache of a creep that keeps making progress", () => {
        // A straight walk visits a new tile every tick; no tile repeats
        // within the sliding window, so no cache may be dropped.
        const creep: any = {
            body: [
                { type: "work" },
                { type: "carry" },
                { type: "move" },
            ],
            memory: {},
            pos: { x: 10, y: 19 },
            moveTo: () => {
                // Engine-faithful: a replayed cache is the same object.
                if (creep.memory._move === undefined)
                {
                    creep.memory._move = { path: "" };
                }
                return OK;
            },
        };
        let cleared = false;
        for (let i = 0; i < 14; i += 1)
        {
            // @ts-ignore : advance the global game clock the code reads
            global.Game.time += 1;
            creep.pos.x += 1;
            const before = creep.memory._move;
            moveToToward(creep, creep.pos, 1);
            if (before !== undefined && creep.memory._move !== before)
            {
                cleared = true;
            }
        }
        assert.isFalse(cleared, "a walking creep must keep its cached path");
    });
});

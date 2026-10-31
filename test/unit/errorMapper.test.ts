import {assert} from "chai";
import {ErrorMapper} from "../../src/utils/ErrorMapper";

// wrapLoop is the colony's last line of defence: whatever the game code throws,
// the wrapped loop must return so the next tick still runs. In the game runtime
// require("main.js.map") throws (the map file is not uploaded), so the
// source-mapped path must fall back to the original stack instead of rethrowing
// from inside the catch block - a throw there used to mask the real error and
// abort the whole tick, which also skipped the engine's console commands.
describe("ErrorMapper.wrapLoop", () => {
    beforeEach(() => {
        // @ts-ignore : allow adding Game to global
        global.Game = {rooms: {}};
    });

    function withCapturedConsole(fn: () => void): string[] {
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: unknown[]) => { logs.push(args.join(" ")); };
        try {
            fn();
        } finally {
            console.log = originalLog;
        }
        return logs;
    }

    it("swallows an Error thrown by the loop and logs a stack", () => {
        const logs = withCapturedConsole(() => {
            const wrapped = ErrorMapper.wrapLoop(() => { throw new Error("boom"); });
            assert.doesNotThrow(wrapped);
        });
        assert.lengthOf(logs, 1);
        assert.include(logs[0], "boom");
    });

    it("falls back to the original stack when the source map is unavailable", () => {
        // Craft a stack whose first frame points into the bundled module,
        // the way the game runtime throws it (module name "main", no .js):
        // without that exact frame sourceMappedStackTrace() never touches the
        // consumer, and the require("main.js.map") failure it hides is never
        // reached. The require fails in plain Node (no map file), so the
        // fallback message must be logged instead of the require error
        // propagating out of the catch block (which used to mask the real
        // error and abort the tick).
        const err = new Error("inner failure");
        err.stack = "Error: inner failure\n    at doWork (main:42:10)";
        const logs = withCapturedConsole(() => {
            const wrapped = ErrorMapper.wrapLoop(() => { throw err; });
            assert.doesNotThrow(wrapped);
        });
        assert.lengthOf(logs, 1);
        assert.include(logs[0], "inner failure");
        assert.include(logs[0], "Source maps unavailable");
    });

    it("logs non-Error throws instead of rethrowing them", () => {
        const logs = withCapturedConsole(() => {
            const wrapped = ErrorMapper.wrapLoop(() => { throw "a plain string"; });
            assert.doesNotThrow(wrapped);
        });
        assert.lengthOf(logs, 1);
        assert.include(logs[0], "a plain string");
    });
});

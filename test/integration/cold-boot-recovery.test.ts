/*
 * Cold-boot recovery integration test (owner feedback 2026-11-02, URGENT item 5).
 *
 * The owner's live room died out: no creeps alive, spawn and extensions still
 * holding energy, and the spawn waiting for a capacity-sized body nobody could
 * ever pay for. The fix (cold boot + income floor in src/managers/spawnManager.ts)
 * must make a wiped colony recover by itself. This test reproduces the wipe:
 * the colony runs 1,500 ticks, every creep is killed through the bot's own
 * sandbox (Game.creeps[name].suicide(), exactly as the feedback describes it),
 * and the colony must have at least 3 creeps again by tick 2,500.
 *
 * The wipe runs inside the sandbox because a dead colony cannot be probed from
 * outside: if the spawn ever stops making creeps, only the colony's own console
 * (and this count) shows it.
 */
import { assert } from "chai";
import { helper } from "./helper";

/** Tick at which every creep is killed. */
const WIPE_AT = 1500;

/** Tick at which the colony must have recovered (3+ creeps). */
const CHECK_AT = 2500;

/** The colony size the recovery must reach by CHECK_AT. */
const REQUIRED_CREEPS = 3;

/**
 * The wipe command. ES5 string on purpose: it is evaluated by the game runtime
 * inside the bot's sandbox (same mechanism as the scorecard's probe), so it
 * uses nothing the sandbox might not have.
 */
const WIPE_ALL =
    "(function () {" +
    " var names = Object.keys(Game.creeps);" +
    " for (var i = 0; i < names.length; i += 1) { Game.creeps[names[i]].suicide(); }" +
    " return 'wiped ' + names.length + ' creeps';" +
    "})()";

/**
 * Queues a command in the sandbox, ticks until its result arrives on the
 * console event, and returns the result once the tick that produced it has
 * FULLY completed. The game evaluates queued console commands during the
 * NEXT tick, so the command is queued before the tick that resolves it
 * (same order as the sign probe in
 * test/integration/controller-sign.test.ts).
 *
 * The result is only returned after that tick's rooms stage has run: the
 * console result is sent during the tick's users stage, but intents written
 * in the same tick (e.g. suicide) are applied by the room processor only in
 * the rooms stage. Resolving the moment the result arrives would let the
 * next probe start a new server.tick() while the previous tick is still
 * running - two concurrent ticks race on the queue and the probe reads
 * stale state (measured: a wiped crew of 8 still read 8 alive). Finishing
 * the tick first makes every probe see the world exactly as the processor
 * left it.
 * @param command The expression to evaluate in the sandbox
 * @param marker A marker substring only this command's result contains
 * @param tickFn The tick function to run until the result arrives (the test
 *               counts every tick, including these)
 * @returns The raw JSON result string
 */
async function probeUntilResult(command: string, marker: string, tickFn: () => Promise<void>): Promise<string>
{
    return new Promise<string>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let found: string | undefined;
        const done = (error: Error | null, value?: string): void => {
            if (timer !== undefined)
            {
                clearTimeout(timer);
                timer = undefined;
            }
            helper.player.removeListener("console", onConsole);
            if (error !== null)
            {
                reject(error);
            }
            else
            {
                resolve(value as string);
            }
        };
        const onConsole = (logs: string[], results: unknown[]): void => {
            // The scorecard's own probe rides the same event - take the result
            // that carries this probe's marker, wherever it sits. The value is
            // only recorded here; done() fires after the tick completes.
            for (const r of results || [])
            {
                if (typeof r === "string" && r.indexOf(marker) !== -1)
                {
                    found = r;
                    return;
                }
            }
        };
        timer = setTimeout(
            () => {
                done(new Error("timed out waiting for the probe result"));
            },
            30000
        );
        helper.player.on("console", onConsole);
        void (async (): Promise<void> => {
            try
            {
                await helper.player.console(command);
                // Keep ticking until the queued command is evaluated; resolve
                // only once the tick that carried the result has fully
                // finished (users stage AND rooms stage), so the probe that
                // follows never overlaps the tick that changed the world.
                for (let i = 0; i < 5; i += 1)
                {
                    await tickFn();
                    if (found !== undefined)
                    {
                        done(null, found);
                        return;
                    }
                }
                done(new Error("probe returned no result within 5 ticks"));
            }
            catch (err)
            {
                done(new Error("probe tick failed: " + String(err)));
            }
        })();
    });
}

/**
 * Counts the living creeps through a sandbox probe.
 * @param tickFn The tick function to run until the result arrives
 * @returns The number of living creeps in the world
 */
async function countCreeps(tickFn: () => Promise<void>): Promise<number>
{
    const raw = await probeUntilResult(
        "(function () {" +
        " return JSON.stringify({ __recoverprobe: 1, creeps: Object.keys(Game.creeps).length });" +
        "})()",
        "\"__recoverprobe\":1",
        tickFn
    );
    const parsed = JSON.parse(raw) as { creeps: number };
    return parsed.creeps;
}

describe("cold-boot recovery (owner feedback 2026-11-02, URGENT item 5)", function ()
{
    it("recovers a fully wiped colony: 3+ creeps again within 1,000 ticks", async function ()
    {
        this.timeout(1200000);

        // Every tick goes through this counter, including the ticks the
        // sandbox probes consume, so the wipe and the check land on the
        // exact ticks the feedback names.
        let ticksRun = 0;
        const tick = async (): Promise<void> => {
            await helper.server.tick();
            ticksRun += 1;
        };

        // Phase 1: run the colony normally up to the wipe tick.
        while (ticksRun < WIPE_AT)
        {
            await tick();
        }

        const before = await countCreeps(tick);
        assert.isAtLeast(
            before,
            2,
            "the colony has a crew before the wipe (actual " + before + "), so the wipe is meaningful"
        );

        // Phase 2: kill every creep, exactly as the feedback describes it.
        // The suicide resolves after the player code of that tick, so the
        // bot still saw the full crew - the cold boot fires on the next one.
        await probeUntilResult(WIPE_ALL, "wiped ", tick);

        // Right after the wipe tick at most one leftover creep can exist;
        // any spawn intent from the wipe tick is still in spawn.spawning.
        const afterWipe = await countCreeps(tick);
        assert.isAtMost(
            afterWipe,
            1,
            "the wipe killed the whole crew (actual " + afterWipe + " creeps left right after the wipe)"
        );

        // Phase 3: let the colony recover until CHECK_AT, then check size.
        while (ticksRun < CHECK_AT)
        {
            await tick();
        }

        const recovered = await countCreeps(tick);
        assert.isAtLeast(
            recovered,
            REQUIRED_CREEPS,
            "the wiped colony recovers by itself: " + recovered + " creeps at tick " + CHECK_AT +
            ", required " + REQUIRED_CREEPS +
            " (a dead colony that cannot refill its own store must not happen)"
        );
    });
});


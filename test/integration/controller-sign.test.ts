/*
 * Controller sign integration test (owner request, feedback 2026-11-02):
 * the upgrader signs every owned room's controller with CONTROLLER_SIGN_TEXT
 * while already on the upgrade round trip - a harvester is never diverted.
 * Runs the colony on the stub world for a few hundred ticks, then reads the
 * controller's sign from inside the sandbox with the same probe mechanism
 * the scorecard uses (queue an expression, read the console event).
 */
import { assert } from "chai";
import { CONTROLLER_SIGN_TEXT } from "../../src/config";
import { helper } from "./helper";

/**
 * How long the colony runs before the sign is checked. The smoke run shows
 * the upgrader making controller progress within 500 ticks on this world, so
 * 800 ticks leaves margin for the first upgrader to spawn, walk to the
 * controller and sign it (one extra tick: the sign is read after the tick
 * that queues the probe, never inside it).
 */
const SIGN_CHECK_TICKS = 800;

/**
 * The probe that runs inside the bot's sandbox. ES5 string on purpose: it is
 * a plain string evaluated by the game runtime (same as the scorecard's
 * probe), so nothing the sandbox might not have. Returns a JSON string with
 * the controller's current sign text, its level and the upgrader count.
 */
const SIGN_PROBE =
    "(function () {" +
    " var room = Game.rooms['W0N1'];" +
    " var c = room ? room.controller : null;" +
    " var up = 0;" +
    " for (var n in Game.creeps) { if (Game.creeps[n].memory && Game.creeps[n].memory.role === 'upgrader') { up++; } }" +
    " return JSON.stringify({ __signprobe: 1, sign: c && c.sign ? c.sign.text : null, level: c ? c.level : 0, upgraders: up });" +
    "})()";

/**
 * Queues the sign probe in the sandbox and waits for its result. The game
 * evaluates queued console commands during the NEXT tick (actions and
 * console commands are resolved after the player code runs), so one tick is
 * started after queuing.
 * @returns The parsed probe result: sign text (null when unsigned), controller level, upgrader count.
 */
async function readControllerSign(): Promise<{ sign: string | null; level: number; upgraders: number }>
{
    const raw = await new Promise<string>((resolve, reject) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const done = (error: Error | null, value?: string): void => {
            if (timer !== undefined)
            {
                clearTimeout(timer);
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
            // that carries the sign probe's marker, wherever it sits.
            for (const r of results || [])
            {
                if (typeof r === "string" && r.indexOf("\"__signprobe\":1") !== -1)
                {
                    done(null, r);
                    return;
                }
            }
        };
        timer = setTimeout(
            () => {
                done(new Error("timed out waiting for the sign probe result"));
            },
            30000
        );
        helper.player.on("console", onConsole);
        void (async (): Promise<void> => {
            try
            {
                // Await the queue insert BEFORE ticking: the game evaluates
                // queued console commands during the next tick, so the
                // command must already be in the queue when that tick starts.
                await helper.player.console(SIGN_PROBE);
                await helper.server.tick();
            }
            catch (err)
            {
                done(new Error("sign probe tick failed: " + String(err)));
            }
        })();
    });
    return JSON.parse(raw) as { sign: string | null; level: number; upgraders: number };
}

describe("controller sign (owner request, feedback 2026-11-02)", function ()
{
    it("the upgrader signs the controller with CONTROLLER_SIGN_TEXT", async function ()
    {
        this.timeout(900000);

        for (let i = 0; i < SIGN_CHECK_TICKS; i += 1)
        {
            await helper.server.tick();
        }

        const s = await readControllerSign();
        assert.isAtLeast(
            s.upgraders,
            1,
            "at least one upgrader is alive when the sign is checked (actual " + s.upgraders + ")"
        );
        assert.equal(
            s.sign,
            CONTROLLER_SIGN_TEXT,
            "the controller carries the project sign (actual: " + JSON.stringify(s.sign) + ")"
        );
    });
});

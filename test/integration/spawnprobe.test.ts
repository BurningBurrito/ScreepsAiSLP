/*
 * Diagnostic test (temporary): dumps the spawn state of the first ticks to find out
 * why the first cold-boot harvester does not spawn on tick 1. It sends one probe
 * expression per tick through the player's console (the same channel the scorecard
 * uses) and prints the collected lines.
 */
import { helper } from "./helper";

const PROBE = "(function () { " +
    "var r = Game.rooms['W0N1']; " +
    "if (!r) { return JSON.stringify({ err: 'no room' }); } " +
    "var s = r.find(FIND_MY_SPAWNS)[0]; " +
    "var o = { " +
    "  t: Game.time, " +
    "  e: r.energyAvailable, " +
    "  cap: r.energyCapacityAvailable, " +
    "  se: s ? s.store.energy : null, " +
    "  busy: s && s.spawning ? s.spawning.name + ':' + s.spawning.body.length : null, " +
    "  cc: Memory.creepCounter, " +
    "  creeps: Object.keys(Game.creeps), " +
    "  dry300: s ? s.spawnCreep([WORK, WORK, CARRY, MOVE], 'dry300', { dryRun: true }) : -99, " +
    "  dry200: s ? s.spawnCreep([WORK, CARRY, MOVE], 'dry200', { dryRun: true }) : -99 " +
    "}; " +
    "return JSON.stringify(o); " +
    "})()";

describe("spawnprobe: first-tick spawn diagnostics", function ()
{
    it("logs spawn state for the first 40 ticks", async function ()
    {
        this.timeout(600000);

        const lines: string[] = [];
        const onConsole = (logs: string[], results: unknown[]): void =>
        {
            for (const result of results)
            {
                const text = String(result);
                if (text.indexOf("dry300") !== -1)
                {
                    lines.push(text);
                }
            }
        };
        helper.player.on("console", onConsole);

        try
        {
            for (let i = 0; i < 40; i += 1)
            {
                await helper.player.console(PROBE);
                await helper.server.tick();
            }
        }
        finally
        {
            helper.player.removeListener("console", onConsole);
        }

        for (const line of lines)
        {
            console.log("SPAWNPROBE " + line);
        }
    });
});

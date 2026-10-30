/*
 * Diagnostic test (temporary): measures the real travel costs between the
 * two sources and the controller, plus the upgrader's position and the
 * controller progress over time, to decide which source the upgrader should
 * serve in this world.
 */
import { helper } from "./helper";

const PROBE = "(function () { " +
    " var room = Game.rooms['W0N1']; " +
    " if (!room) { return JSON.stringify({ err: 'no room' }); } " +
    " var terr = room.getTerrain(); " +
    " var sources = room.find(FIND_SOURCES); " +
    " var ctrl = room.controller; " +
    " var out = { t: Game.time, progress: ctrl ? ctrl.progress : -1, level: ctrl ? ctrl.level : -1 }; " +
    " function leg(from, to) { " +
    "   var r = room.findPath({ x: from.x, y: from.y }, { x: to.x, y: to.y }, { plainCost: 1, swampCost: 5 }); " +
    "   var swamp = 0; " +
    "   for (var i = 0; i < r.path.length; i += 1) { if (terr.get(r.path[i].x, r.path[i].y) === TERRAIN_MASK_SWAMP) { swamp += 1; } } " +
    "   return { cost: r.cost, steps: r.path.length, swampSteps: swamp }; " +
    " } " +
    " if (out.t === 250) { " +
    "   out.aToCtrl = leg(sources[0].pos, ctrl.pos); " +
    "   out.bToCtrl = leg(sources[1].pos, ctrl.pos); " +
    "   var spawn = room.find(FIND_MY_SPAWNS)[0]; " +
    "   out.spawnToA = leg(spawn.pos, sources[0].pos); " +
    "   out.spawnToB = leg(spawn.pos, sources[1].pos); " +
    " } " +
    " var up = null; " +
    " _.forEach(Game.creeps, function (c) { if (c.memory.role === 'upgrader' && !up) { up = c; } }); " +
    " if (up) { out.up = { n: up.name, x: up.pos.x, y: up.pos.y, store: up.store[RESOURCE_ENERGY] || 0, ttl: up.ticksToLive }; } " +
    " return JSON.stringify(out); " +
    "})()";

describe("spawnprobe: source vs controller travel costs", function ()
{
    it("measures leg costs and tracks the upgrader", async function ()
    {
        this.timeout(600000);

        await helper.server.world.load();

        const onConsole = (logs: string[], results: unknown[]): void =>
        {
            for (const result of results)
            {
                const text = String(result);
                if (text.indexOf('"t":') !== -1)
                {
                    console.log("PROBE " + text);
                }
            }
        };
        helper.player.on("console", onConsole);

        try
        {
            for (let i = 0; i < 800; i += 1)
            {
                await helper.player.console(PROBE);
                await helper.server.tick();
            }
        }
        finally
        {
            helper.player.removeListener("console", onConsole);
        }
    });
});

/**
 * Debug probe (temporary, not a real test): reproduces the M4 starting
 * conditions (room W0N1 at controller level 5) and dumps, every 100 ticks,
 * the occupancy of every checkerboard tile at Manhattan range 2-4 from the
 * spawn - exactly the tiles computeTowerPositions considers for the second
 * tower. Used to find out why the second tower site is never placed.
 */
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 2600;

// Runs inside the bot's sandbox: tags each candidate tile
// F = free, W = wall terrain, S:<type> = structure, C:<type> = site.
const PROBE =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var s = room.find(FIND_MY_SPAWNS)[0];" +
    " if (!s) { return; }" +
    " var sx = s.pos.x, sy = s.pos.y;" +
    " var parity = (sx + sy) % 2;" +
    " var out = { t: Game.time, tiles: [] };" +
    " for (var r = 2; r <= 4; r++) {" +
    "  for (var dx = -r; dx <= r; dx++) {" +
    "   var dy = r - Math.abs(dx);" +
    "   var pts = [[dx, dy]];" +
    "   if (dy > 0) { pts.push([dx, -dy]); }" +
    "   for (var p = 0; p < pts.length; p++) {" +
    "    var x = sx + pts[p][0], y = sy + pts[p][1];" +
    "    if (x < 0 || x >= 49 || y < 0 || y >= 49) { continue; }" +
    "    if ((x + y) % 2 !== parity) { continue; }" +
    "    var pos = new RoomPosition(x, y, room.name);" +
    "    var terr = room.getTerrain().get(x, y);" +
    "    var structs = pos.lookFor(LOOK_STRUCTURES);" +
    "    var sites = pos.lookFor(LOOK_CONSTRUCTION_SITES);" +
    "    var tag = 'F';" +
    "    if (terr === 1) { tag = 'W'; }" +
    "    else if (structs.length > 0) { tag = 'S:' + structs[0].structureType; }" +
    "    else if (sites.length > 0) { tag = 'C:' + sites[0].structureType; }" +
    "    out.tiles.push(x + ',' + y + ':' + tag);" +
    "   }" +
    "  }" +
    " }" +
    " console.log('PROBE ' + JSON.stringify(out));" +
    "})()";

describe("probe: second tower placement", function ()
{
    it("dumps spawn ring-2/4 tile occupancy for 2600 ticks", async function ()
    {
        this.timeout(3000000);

        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update(
            { room: ROOM, type: "controller" },
            { $set: { level: 5, progress: 0, safeMode: 0 } },
        );

        for (let t = 1; t <= TICKS; t += 1)
        {
            if (t % 100 === 0)
            {
                await helper.player.console(PROBE);
            }
            await helper.server.tick();
        }
        await helper.player.console(PROBE);
    });
});

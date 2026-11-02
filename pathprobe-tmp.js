/* Throwaway diagnostic: measure real path lengths in the W0N1 stub world.
 * Not part of the project; deleted before commit. */
const { ScreepsServer, stdHooks } = require("screeps-server-mockup");

const PROBE = "(function () {" +
    " var room = Game.rooms['W0N1'];" +
    " var srcs = room.find(FIND_SOURCES);" +
    " var spawn = room.find(FIND_MY_SPAWNS)[0];" +
    " var ctl = room.controller;" +
    " var terrain = room.getTerrain();" +
    " var out = { spawn: [spawn.pos.x, spawn.pos.y], ctl: [ctl.pos.x, ctl.pos.y], srcs: srcs.map(function (s) { return [s.pos.x, s.pos.y, s.energy, s.energyCapacity, s.ticksToRegeneration]; }) };" +
    " function cost(x, y) { return terrain.get(x, y) === TERRAIN_MASK_SWAMP ? 5 : 1; }" +
    " function pathLen(a, b, plainCost, swampCost) {" +
    "   var p = PathFinder.search(a, { pos: b }, { plainCost: plainCost, swampCost: swampCost, maxOps: 500, maxRooms: 1 });" +
    "   return p.opcosts === Infinity ? 'NOPATH' : p.opcosts;" +
    " }" +
    " for (var i = 0; i < srcs.length; i++) {" +
    "   var s = srcs[i];" +
    "   out['src' + i + 'toSpawn_plain'] = pathLen(s.pos, spawn.pos, 1, 5);" +
    "   out['src' + i + 'toCtl_plain'] = pathLen(s.pos, ctl.pos, 1, 5);" +
    "   out['src' + i + 'toCtl_swamp2'] = pathLen(s.pos, ctl.pos, 1, 2);" +
    "   out['src' + i + 'toSpawn_swamp2'] = pathLen(s.pos, spawn.pos, 1, 2);" +
    "   var adj = [];" +
    "   for (var dx = -1; dx <= 1; dx++) { for (var dy = -1; dy <= 1; dy++) { if (dx === 0 && dy === 0) continue; var nx = s.pos.x + dx, ny = s.pos.y + dy; if (nx < 0 || ny < 0 || nx > 49 || ny > 49) continue; if (terrain.get(nx, ny) === TERRAIN_MASK_WALL) continue; var t = new RoomPosition(nx, ny, room.name); adj.push([nx, ny, t.getRangeTo(spawn.pos), pathLen(t, spawn.pos, 1, 2), pathLen(t, ctl.pos, 1, 2)]); } }" +
    "   out['src' + i + 'Adj'] = adj;" +
    " }" +
    " out['spawnToCtl_plain'] = pathLen(spawn.pos, ctl.pos, 1, 5);" +
    " out['spawnToCtl_swamp2'] = pathLen(spawn.pos, ctl.pos, 1, 2);" +
    " out['src0ToSrc1_swamp2'] = pathLen(srcs[0].pos, srcs[1].pos, 1, 2);" +
    " return JSON.stringify(out);" +
    "})()";

(async () => {
    const server = new ScreepsServer();
    await server.world.reset();
    await server.world.stubWorld();
    const player = await server.world.addBot({
        username: "player",
        room: "W0N1",
        x: 13,
        y: 20,
        modules: { main: "export const loop = () => {};" },
    });
    stdHooks.hookWrite();
    let done = false;
    player.on("console", (logs, results) => {
        for (const line of logs || []) {
            if (line.indexOf("__PATHPROBE__") !== -1) {
                console.log(line);
                done = true;
            }
        }
        for (const r of results || []) {
            if (typeof r === "string" && r.indexOf('"spawn"') !== -1) {
                console.log(r);
                done = true;
            }
        }
    });
    await player.console(PROBE);
    await server.tick();
    if (!done) {
        console.log("PROBE DID NOT RETURN");
    }
    await server.stop();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

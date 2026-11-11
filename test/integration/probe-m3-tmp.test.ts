/*
 * Temporary diagnostic probe for the M3 gate failure (maxTowerEnergy 0,
 * creeps 3 at end). NOT an acceptance test; delete after the investigation.
 * Mirrors the M3 world (RCL 3, fresh room) and logs, every 25 ticks, the
 * pool, the tower/rampart/container sites (position and progress), the
 * dropped-energy piles (total and the single biggest pile with position)
 * and every creep (role, position, carried energy, working flag, latched
 * source index) so the energy flow (pool vs drops vs sources) can be read
 * directly from the console.
 */
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 1700;

// Runs inside the bot's own sandbox (through the console) every 25 ticks.
const SAMPLE =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var o = { t: Game.time, p: room.energyAvailable + '/' + room.energyCapacityAvailable };" +
    " var sp = room.find(FIND_MY_SPAWNS)[0];" +
    " o.s = sp && sp.spawning !== null ? 1 : 0;" +
    " var srcs = room.find(FIND_SOURCES).slice().sort(function (a, b) { return a.pos.x + a.pos.y * 50 - (b.pos.x + b.pos.y * 50); });" +
    " var si = {};" +
    " srcs.forEach(function (s, i) { si[s.id] = i; });" +
    " o.tw = ''; o.rp = ''; o.ct = '';" +
    " room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (st) {" +
    "   if (st.structureType === STRUCTURE_TOWER) { o.tw = st.pos.x + ',' + st.pos.y + ':' + st.progress; }" +
    "   else if (st.structureType === STRUCTURE_RAMPART) { o.rp = o.rp + st.pos.x + ',' + st.pos.y + ':' + st.progress + ';'; }" +
    "   else if (st.structureType === STRUCTURE_CONTAINER) { o.ct = st.pos.x + ',' + st.pos.y + ':' + st.progress; }" +
    " });" +
    " var dt = 0, dn = 0, ma = 0, dm = '';" +
    " room.find(FIND_DROPPED_RESOURCES).forEach(function (r) {" +
    "   if (r.resourceType !== RESOURCE_ENERGY) { return; }" +
    "   dn++; dt += r.amount;" +
    "   if (r.amount > ma) { ma = r.amount; dm = r.pos.x + ',' + r.pos.y + ':' + r.amount; }" +
    " });" +
    " o.d = dn + '/' + dt + (dm !== '' ? '@' + dm : '');" +
    " o.c = [];" +
    " _.values(Game.creeps).forEach(function (c) {" +
    "   if (c.room.name !== room.name) { return; }" +
    "   var e = c.store.getUsedCapacity(RESOURCE_ENERGY);" +
    "   var s = '-';" +
    "   if (c.memory.sourceId !== undefined && si[c.memory.sourceId] !== undefined) { s = si[c.memory.sourceId]; }" +
    "   o.c.push(c.memory.role[0] + c.name.slice(-2) + '@' + c.pos.x + ',' + c.pos.y + 'e' + e + (c.memory.working ? 'w' : '') + 's' + s);" +
    " });" +
    " console.log('PX ' + JSON.stringify(o));" +
    "})()";

describe("probe m3 tower energy", function ()
{
    it("logs economy and crew state for the collapse window", async function ()
    {
        this.timeout(1800000);

        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 3, progress: 0 } });

        for (let i = 1; i <= TICKS; i += 1)
        {
            if (i % 25 === 0)
            {
                await helper.player.console(SAMPLE);
            }
            await helper.server.tick();
        }
    });
});

/*
 * Temporary diagnostic probe for the M5 build-pace investigation. NOT an
 * acceptance test; delete after the investigation. Mirrors the M5 world
 * (RCL 5, fresh room) for 700 ticks and logs, every 25 ticks, the
 * construction sites (type, progress, position) and the state of every
 * builder/upgrader creep (position, energy, memory flags) so we can see
 * exactly what the build crew is doing while the first extension is built.
 */
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 700;

// Runs inside the bot's own sandbox (through the console) every 25 ticks.
const SAMPLE =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var out = { t: Game.time, pool: room.energyAvailable + '/' + room.energyCapacityAvailable };" +
    " room.find(FIND_MY_CONSTRUCTION_SITES).forEach(function (s) {" +
    "  if (s.progress > 0 || s.structureType === 'tower' || s.structureType === 'container' || s.structureType === 'rampart') { out[s.structureType + '@' + s.pos.x + ',' + s.pos.y] = s.progress; } " +
    " });" +
    " var drops = {};" +
    " room.find(FIND_DROPPED_RESOURCES).forEach(function (r) {" +
    "  if (r.resourceType === RESOURCE_ENERGY) { drops[r.pos.x + ',' + r.pos.y] = (drops[r.pos.x + ',' + r.pos.y] || 0) + r.amount; }" +
    " });" +
    " out.drops = drops;" +
    " out.crew = [];" +
    " _.values(Game.creeps).forEach(function (c) {" +
    "  if (c.room.name !== room.name) { return; }" +
    "  var r = c.memory.role;" +
    "  if (r !== 'builder' && r !== 'upgrader') { return; }" +
    "  out.crew.push(r[0] + c.name.slice(-1) + '@' + c.pos.x + ',' + c.pos.y + 'e' + c.store.getUsedCapacity(RESOURCE_ENERGY) + 'w' + (c.memory.working ? 1 : 0) + 's' + (c.memory.sourceId !== undefined ? 1 : 0));" +
    " });" +
    " console.log('PROBE ' + JSON.stringify(out));" +
    "})()";

describe("probe m5 builder pace", function ()
{
    it("logs sites and crew state for 700 ticks", async function ()
    {
        this.timeout(1800000);

        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 5, progress: 0 } });

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

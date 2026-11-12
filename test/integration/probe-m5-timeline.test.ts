/*
 * Temporary M5 timeline probe (delete after use). Mirrors the M5 world
 * (RCL 5, fresh room, 5,000 ticks) and logs every 100 ticks the full
 * construction state (built structures, sites with progress, dropped
 * energy, crew) plus the scorecard at the end, so the exact completion
 * ticks of tower / containers / extension floor / controller container
 * are visible. NOT an acceptance test.
 */
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 5000;

// Runs inside the bot's own sandbox (through the console) every 100 ticks.
const SAMPLE =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var o = { t: Game.time };" +
    " o.level = room.controller ? room.controller.level + '/' + Math.floor(room.controller.progress) : '?';" +
    " o.room = room.energyAvailable + '/' + room.energyCapacityAvailable;" +
    " var towers = room.find(FIND_MY_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_TOWER; } });" +
    " o.towers = towers.length + (towers.length ? ':' + towers.map(function (t) { return t.store[RESOURCE_ENERGY]; }).join(',') : '');" +
    " o.ext = room.find(FIND_MY_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_EXTENSION; } }).length;" +
    " var sources = room.find(FIND_SOURCES);" +
    " var containers = room.find(FIND_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_CONTAINER; } });" +
    " o.containers = containers.map(function (c) {" +
    "   var k = sources.some(function (s) { return c.pos.getRangeTo(s) <= 1; }) ? 'S' : (room.controller && c.pos.getRangeTo(room.controller) <= 3 ? 'C' : '?');" +
    "   return k + c.pos.x + ',' + c.pos.y + ':' + Math.floor(c.store[RESOURCE_ENERGY]);" +
    " }).join(';');" +
    " var sites = room.find(FIND_MY_CONSTRUCTION_SITES);" +
    " var byType = {};" +
    " sites.forEach(function (s) {" +
    "   var k = s.structureType + '@' + s.pos.x + ',' + s.pos.y;" +
    "   byType[k] = (byType[k] || 0) + s.progress;" +
    " });" +
    " o.sites = _.map(_.pairs(byType), function (p) { return p[0] + '=' + Math.floor(p[1]); }).join(';');" +
    " var drops = room.find(FIND_DROPPED_RESOURCES, { filter: function (r) { return r.resourceType === RESOURCE_ENERGY; } });" +
    " o.dropped = _.sum(drops, function (r) { return r.amount; });" +
    " o.crew = {};" +
    " _.values(Game.creeps).forEach(function (c) {" +
    "   if (c.room.name !== room.name) { return; }" +
    "   o.crew[c.memory.role] = (o.crew[c.memory.role] || 0) + 1;" +
    " });" +
    " console.log('TL ' + JSON.stringify(o));" +
    "})()";

describe("probe m5 timeline", function ()
{
    it("logs construction state for 5000 ticks", async function ()
    {
        this.timeout(2400000);

        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 5, progress: 0 } });

        for (let i = 1; i <= TICKS; i += 1)
        {
            if (i % 100 === 0)
            {
                await helper.player.console(SAMPLE);
            }
            await helper.server.tick();
        }
        await helper.server.tick();
        await helper.scorecard.settle();
        const s = helper.scorecard.compute();
        console.log("TL SCORECARD " + JSON.stringify({
            window: s.window,
            harvestedPerTick: s.harvestedPerTick,
            upgradePerTick: s.upgradePerTick,
            buildPerTick: s.buildPerTick,
            spawnIdleFullShare: s.spawnIdleFullShare,
            creepIdleShare: s.creepIdleShare,
            wastedEnergy: s.wastedEnergy,
        }));
    });
});

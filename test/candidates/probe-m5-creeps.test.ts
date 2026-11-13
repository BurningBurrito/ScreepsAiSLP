/*
 * Temporary M5 harvest-stall probe (delete after use). Mirrors the M5 world
 * (RCL 5, 5,000 ticks) and logs every 100 ticks, per creep: role, name,
 * position, carried energy, ticksToLive, distance to the nearest source,
 * the harvester's assigned source (A suffix of the id) and the hauler's
 * phase (D=delivering, C=collecting). Alongside: both source energies,
 * every container's energy with its position, the spawn-plus-extensions
 * pool, and the dropped energy total.
 *
 * Goal: explain why the M5 window (4,000-5,000) harvests 9.36/tick instead
 * of 13+ - where the income crew stands and what it does during the stall
 * (the M4 run of 2026-11-11 shows the same crew jumping from ~5/tick to
 * ~14.5/tick between ticks 4,400 and 4,500 with no structure completing).
 * NOT an acceptance test.
 */
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 5000;

// Runs inside the bot's own sandbox (through the console) every 100 ticks.
const SAMPLE =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var sources = room.find(FIND_SOURCES);" +
    " var srcs = sources.map(function (s) { return Math.floor(s.energy); });" +
    " var containers = room.find(FIND_STRUCTURES, { filter: function (c) { return c.structureType === STRUCTURE_CONTAINER; } });" +
    " var conts = containers.map(function (c) {" +
    "   return Math.floor(c.store[RESOURCE_ENERGY]) + '@' + c.pos.x + ',' + c.pos.y;" +
    " }).join(';');" +
    " var pool = 0;" +
    " room.find(FIND_MY_STRUCTURES, { filter: function (s) {" +
    "   return s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_EXTENSION;" +
    " } }).forEach(function (s) { pool += s.store[RESOURCE_ENERGY]; });" +
    " var drops = room.find(FIND_DROPPED_RESOURCES, { filter: function (r) { return r.resourceType === RESOURCE_ENERGY; } });" +
    " var dropped = _.sum(drops, function (r) { return r.amount; });" +
    " var parts = [];" +
    " _.values(Game.creeps).forEach(function (c) {" +
    "   if (c.room.name !== room.name) { return; }" +
    "   var near = '';" +
    "   for (var i = 0; i < sources.length; i++) {" +
    "     var r = c.pos.getRangeTo(sources[i]);" +
    "     if (r <= 2) { near = 's' + i + r; }" +
    "   }" +
    "   var part = c.memory.role + '(' + c.name + ')' + c.pos.x + ',' + c.pos.y" +
    "     + 'e' + c.store.getUsedCapacity(RESOURCE_ENERGY) + 't' + c.ticksToLive;" +
    "   if (near) { part += near; }" +
    "   if (c.memory.sourceId) { part += 'A' + c.memory.sourceId.slice(-2); }" +
    "   if (c.memory.delivering !== undefined) { part += (c.memory.delivering ? 'D' : 'C'); }" +
    "   parts.push(part);" +
    " });" +
    " console.log('CP ' + Game.time + ' src=' + srcs.join('/') + ' cont=' + conts + ' pool=' + pool + ' drop=' + dropped + ' | ' + parts.join(' '));" +
    "})()";

describe("probe m5 creeps", function ()
{
    it("dumps per-creep state for 5000 ticks", async function ()
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
        console.log("CP SCORECARD " + JSON.stringify({
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

/*
 * Diagnostic test (temporary): traces every creep's position, store and memory
 * flags every 10 ticks, plus sources/controller/spawn state, to pin down the
 * harvester freeze and the upgrader wandering.
 *
 * Also dumps the room event log every tick (EV lines) so each creep's actual
 * game-world actions are visible, and the cached moveTo paths (memory._move)
 * plus dropped resources every 50 ticks (STATE lines).
 */
import { helper } from "./helper";

const PROBE = "(function () { " +
    " var room = Game.rooms['W0N1']; " +
    " if (!room) { return; } " +
    " var t = Game.time; " +
    " var nameById = {}; " +
    " _.forEach(Game.creeps, function (c) { nameById[c.id] = c.name; }); " +
    " var spawn0 = room.find(FIND_MY_SPAWNS)[0]; " +
    " if (spawn0) { nameById[spawn0.id] = 'SPAWN'; } " +
    " room.find(FIND_CONSTRUCTION_SITES).forEach(function (s) { nameById[s.id] = 'site:' + s.structureType; }); " +
    " room.find(FIND_MY_STRUCTURES).forEach(function (s) { nameById[s.id] = s.structureType; }); " +
    " if (room.controller) { nameById[room.controller.id] = 'CTRL'; } " +
    " var ev = room.getEventLog(); " +
    " if (ev.length) { " +
    "   var parts = []; " +
    "   for (var i = 0; i < ev.length; i++) { " +
    "     var e = ev[i]; " +
    "     parts.push((nameById[e.objectId] || e.objectId) + ':' + e.event + ':' + ((e.data && e.data.amount) || 0)); " +
    "   } " +
    "   console.log('EV t:' + t + ' ' + parts.join(';')); " +
    " } " +
    " if (t % 10 !== 0) { return; } " +
    " var out = { t: t }; " +
    " var ctrl = room.controller; " +
    " out.ctrl = ctrl ? ctrl.pos.x + ',' + ctrl.pos.y + '|' + ctrl.level + ':' + ctrl.progress : 'none'; " +
    " var sources = room.find(FIND_SOURCES); " +
    " out.src = []; " +
    " sources.forEach(function (s, i) { " +
    "   out.src.push(i + '@' + s.pos.x + ',' + s.pos.y + 'e' + s.energy + 'r' + (s.ticksToRegeneration || 0)); " +
    " }); " +
    " var spawn = spawn0; " +
    " out.spawn = spawn ? spawn.pos.x + ',' + spawn.pos.y + 'c' + spawn.store.getFreeCapacity(RESOURCE_ENERGY) : 'none'; " +
    " out.energy = room.energyAvailable + '/' + room.energyCapacityAvailable; " +
    " out.creeps = []; " +
    " _.forEach(Game.creeps, function (c) { " +
    "   out.creeps.push(c.name + '@' + c.pos.x + ',' + c.pos.y + 'e' + (c.store[RESOURCE_ENERGY] || 0) + " +
    "     'w' + (c.memory.working ? 1 : 0) + " +
    "     's' + (c.memory.sourceId ? c.memory.sourceId.slice(-3) : '-') + " +
    "     'd' + (c.memory.deliveryAttempts || 0) + " +
    "     'ttl' + c.ticksToLive); " +
    " }); " +
    " console.log('TRACE ' + JSON.stringify(out)); " +
    " if (t % 50 === 0) { " +
    "   var drops = room.find(FIND_DROPPED_RESOURCES); " +
    "   var dm = []; " +
    "   drops.forEach(function (d) { dm.push(d.x + ',' + d.y + ':' + d.amount); }); " +
    "   var mv = []; " +
    "   _.forEach(Game.creeps, function (c) { " +
    "     var m = c.memory && c.memory._move; " +
    "     mv.push(c.name + '=' + (m " +
    "       ? (m.dest ? (m.dest.x + ',' + m.dest.y) : '?') + '|' + (typeof m.path === 'string' ? m.path : JSON.stringify(m.path)) " +
    "       : 'none')); " +
    "   }); " +
    "   console.log('STATE t:' + t + ' drops:[' + dm.join(',') + '] move:' + mv.join(' | ')); " +
    " } " +
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
                if (text.indexOf("TRACE ") !== -1)
                {
                    console.log(text);
                }
            }
        };
        helper.player.on("console", onConsole);

        try
        {
            for (let i = 0; i < 700; i += 1)
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

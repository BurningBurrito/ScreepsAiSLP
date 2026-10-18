/*
 * Acceptance test for milestone M1 (core economy). Version 2 (2026-10-18): adds a frozen-harvester check.
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 800;
const MAX_STILL = 30; // ticks a delivering harvester may stand still with unchanged energy

// Runs inside the bot's own sandbox every tick (through the console):
// counts energy transfers into spawns and extensions from the previous tick's event log.
const COUNT_TRANSFERS =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var acc = Memory.acceptance || (Memory.acceptance = { transfers: 0 });" +
    " room.getEventLog().forEach(function (e) {" +
    "  if (e.event === EVENT_TRANSFER && e.data && e.data.resourceType === RESOURCE_ENERGY) {" +
    "   var target = Game.getObjectById(e.data.targetId);" +
    "   if (target && (target.structureType === STRUCTURE_SPAWN || target.structureType === STRUCTURE_EXTENSION)) { acc.transfers++; }" +
    "  }" +
    " });" +
    // Freeze detector: a harvester in delivery mode (working) should always be doing something
    // (moving, transferring or upgrading). Count how many ticks in a row each one keeps the same
    // energy and the same position, and remember the longest streak.
    " var still = acc.still || (acc.still = {});" +
    " if (!acc.maxStill) { acc.maxStill = 0; }" +
    " _.forEach(Game.creeps, function (c) {" +
    "  if (c.memory.role !== 'harvester' || !c.memory.working || c.spawning) { delete still[c.name]; return; }" +
    "  var key = c.store[RESOURCE_ENERGY] + ':' + c.pos.x + ':' + c.pos.y;" +
    "  var s = still[c.name];" +
    "  if (s && s.key === key) { s.n++; } else { s = still[c.name] = { key: key, n: 0 }; }" +
    "  if (s.n > acc.maxStill) { acc.maxStill = s.n; }" +
    " });" +
    "})()";

// Takes a snapshot of the colony from inside the bot's sandbox and stores it in Memory.
const SNAPSHOT =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " var creeps = _.values(Game.creeps);" +
    " Memory.acceptanceSnapshot = {" +
    "  roles: _.countBy(creeps, function (c) { return c.memory.role; })," +
    "  creeps: creeps.length," +
    "  withoutMove: _.filter(creeps, function (c) { return c.getActiveBodyparts(MOVE) === 0; }).length," +
    "  nanNames: _.filter(Object.keys(Game.creeps), function (n) { return n.indexOf('NaN') >= 0; }).length," +
    "  level: room && room.controller ? room.controller.level : 0," +
    "  progress: room && room.controller ? room.controller.progress : 0" +
    " };" +
    "})()";

describe("M1 acceptance: core economy", function ()
{
    it("spawns every role, delivers energy to the spawn, upgrades the controller and never freezes a harvester", async function ()
    {
        this.timeout(300000);

        for (let i = 0; i < TICKS; i += 1)
        {
            await helper.player.console(COUNT_TRANSFERS);
            await helper.server.tick();
        }
        await helper.player.console(SNAPSHOT);
        await helper.server.tick();

        const memory = JSON.parse(await helper.player.memory);
        const acc = memory.acceptance || { transfers: 0 };
        const snap = memory.acceptanceSnapshot || {};
        const roles = snap.roles || {};
        console.log("M1 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({ transfers: acc.transfers, maxStill: acc.maxStill || 0, snapshot: snap }));

        assert.isAtLeast(acc.transfers, 1, "harvesters delivered energy to a spawn or extension");
        assert.isAtLeast(roles.harvester || 0, 1, "at least one harvester exists");
        assert.isAtLeast(roles.upgrader || 0, 1, "at least one upgrader exists");
        assert.isAtLeast(roles.builder || 0, 1, "at least one builder exists");
        assert.equal(snap.withoutMove, 0, "every creep has at least one MOVE part");
        assert.equal(snap.nanNames, 0, "no creep name contains NaN");
        assert.isTrue(snap.level > 1 || snap.progress > 0, "the controller made progress");
        assert.isBelow(acc.maxStill || 0, MAX_STILL, "no delivering harvester stood still with unchanged energy for " + MAX_STILL + " ticks (frozen harvester)");
    });
});

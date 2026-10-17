/*
 * Acceptance test for milestone M1 (core economy).
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 800;

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
    it("spawns every role, delivers energy to the spawn and upgrades the controller", async function ()
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
        console.log("M1 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({ transfers: acc.transfers, snapshot: snap }));

        assert.isAtLeast(acc.transfers, 1, "harvesters delivered energy to a spawn or extension");
        assert.isAtLeast(roles.harvester || 0, 1, "at least one harvester exists");
        assert.isAtLeast(roles.upgrader || 0, 1, "at least one upgrader exists");
        assert.isAtLeast(roles.builder || 0, 1, "at least one builder exists");
        assert.equal(snap.withoutMove, 0, "every creep has at least one MOVE part");
        assert.equal(snap.nanNames, 0, "no creep name contains NaN");
        assert.isTrue(snap.level > 1 || snap.progress > 0, "the controller made progress");
    });
});

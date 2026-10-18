/*
 * Acceptance test for milestone M2 (extensions and roads). Version 1 (2026-10-18).
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 3000;

// Takes a snapshot of the colony from inside the bot's sandbox and stores it in Memory.
const SNAPSHOT =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { Memory.m2Snapshot = { noRoom: true }; return; }" +
    " var mine = room.find(FIND_MY_STRUCTURES);" +
    " var all = room.find(FIND_STRUCTURES);" +
    " var sites = room.find(FIND_MY_CONSTRUCTION_SITES);" +
    " Memory.m2Snapshot = {" +
    "  level: room.controller ? room.controller.level : 0," +
    "  extensionsBuilt: _.filter(mine, function (s) { return s.structureType === STRUCTURE_EXTENSION; }).length," +
    "  extensionSites: _.filter(sites, function (s) { return s.structureType === STRUCTURE_EXTENSION; }).length," +
    "  roadsBuilt: _.filter(all, function (s) { return s.structureType === STRUCTURE_ROAD; }).length," +
    "  roadSites: _.filter(sites, function (s) { return s.structureType === STRUCTURE_ROAD; }).length," +
    "  energyCapacity: room.energyCapacityAvailable," +
    "  creeps: _.values(Game.creeps).length" +
    " };" +
    "})()";

describe("M2 acceptance: extensions and roads", function ()
{
    it("places all extensions allowed at RCL2, builds at least one, and builds roads", async function ()
    {
        this.timeout(1200000);

        for (let i = 0; i < TICKS; i += 1)
        {
            await helper.server.tick();
        }
        await helper.player.console(SNAPSHOT);
        await helper.server.tick();

        const memory = JSON.parse(await helper.player.memory);
        const snap = memory.m2Snapshot || {};
        console.log("M2 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify(snap));

        assert.isAtLeast(snap.level || 0, 2, "the controller reached level 2");
        assert.isAtLeast((snap.extensionsBuilt || 0) + (snap.extensionSites || 0), 5, "all 5 extensions allowed at level 2 are built or placed as construction sites");
        assert.isAtLeast(snap.extensionsBuilt || 0, 1, "at least one extension is finished");
        assert.isAbove(snap.energyCapacity || 0, 300, "room energy capacity grew above the spawn's 300");
        assert.isAtLeast((snap.roadsBuilt || 0) + (snap.roadSites || 0), 5, "at least 5 road tiles are built or placed");
        assert.isAtLeast(snap.roadsBuilt || 0, 1, "at least one road tile is finished");
        assert.isAtLeast(snap.creeps || 0, 3, "the colony still has creeps");
    });
});

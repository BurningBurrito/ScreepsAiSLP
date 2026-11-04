/*
 * Acceptance test for milestone M5 (containers, static mining, and spending the energy).
 * Version 1 (2026-11-02). Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 *
 * The room starts at controller level 5, like the owner's real room. The test checks that every
 * source gets a container, that a miner stands on a container and harvests into it, that the
 * colony harvests well, and that the energy is used instead of piling up: the controller keeps
 * getting upgraded, the spawn does not sit idle with full energy, and little energy lies on the
 * ground. Numbers marked "window" come from the scorecard and cover the last 1000 ticks.
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 5000;
const SAMPLE_EVERY = 50;          // ticks between two samples
const STEADY_FROM = 3000;         // samples from this tick on count for "steady state" checks
const MIN_MINED_SHARE = 0.6;      // share of steady samples with a miner standing on a source container
const MAX_AVG_DROPPED = 300;      // average energy lying on the ground in steady samples
const MIN_HARVEST_PER_TICK = 13;  // window; the two sources give at most 20
const MIN_UPGRADE_PER_TICK = 1;   // window
const MAX_SPAWN_IDLE_FULL = 0.3;  // window share of ticks the spawn sat idle with full room energy

// Runs inside the bot's own sandbox (through the console) every SAMPLE_EVERY ticks.
const SAMPLE =
    "(function (steady) {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " var acc = Memory.m5 || (Memory.m5 = { samples: 0, steadySamples: 0, minedSamples: 0, droppedSum: 0, maxContainerEnergy: 0 });" +
    " acc.samples += 1;" +
    " if (!room) { return; }" +
    " var containers = room.find(FIND_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_CONTAINER; } });" +
    " var sites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: function (s) { return s.structureType === STRUCTURE_CONTAINER; } });" +
    " var sources = room.find(FIND_SOURCES);" +
    " var withContainer = 0; var withBuilt = 0; var mined = false;" +
    " sources.forEach(function (src) {" +
    "  var built = _.filter(containers, function (c) { return c.pos.getRangeTo(src) <= 1; });" +
    "  var placed = _.filter(sites, function (c) { return c.pos.getRangeTo(src) <= 1; });" +
    "  if (built.length + placed.length > 0) { withContainer += 1; }" +
    "  if (built.length > 0) { withBuilt += 1; }" +
    "  built.forEach(function (c) {" +
    "   if (c.store[RESOURCE_ENERGY] > acc.maxContainerEnergy) { acc.maxContainerEnergy = c.store[RESOURCE_ENERGY]; }" +
    "   if (_.some(c.pos.lookFor(LOOK_CREEPS), function (cr) { return cr.my && cr.getActiveBodyparts(WORK) > 0; })) { mined = true; }" +
    "  });" +
    " });" +
    " var dropped = _.sum(room.find(FIND_DROPPED_RESOURCES, { filter: function (r) { return r.resourceType === RESOURCE_ENERGY; } }), function (r) { return r.amount; });" +
    " if (steady) { acc.steadySamples += 1; acc.droppedSum += dropped; if (mined) { acc.minedSamples += 1; } }" +
    " acc.last = {" +
    "  level: room.controller ? room.controller.level : 0," +
    "  sources: sources.length," +
    "  sourcesWithContainer: withContainer," +
    "  sourcesWithBuiltContainer: withBuilt," +
    "  droppedNow: dropped," +
    "  energy: room.energyAvailable + '/' + room.energyCapacityAvailable," +
    "  roles: _.countBy(_.filter(_.values(Game.creeps), function (c) { return c.room.name === room.name; }), function (c) { return c.memory.role; })," +
    "  creeps: _.filter(_.values(Game.creeps), function (c) { return c.room.name === room.name; }).length" +
    " };" +
    "})";

describe("M5 acceptance: containers, static mining, and spending the energy", function ()
{
    it("mines statically into source containers and spends the energy instead of letting it pile up", async function ()
    {
        this.timeout(2400000);

        // Start the room at controller level 5, like the owner's real room.
        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 5, progress: 0 } });

        for (let i = 1; i <= TICKS; i += 1)
        {
            if (i % SAMPLE_EVERY === 0)
            {
                await helper.player.console(SAMPLE + "(" + (i >= STEADY_FROM ? "true" : "false") + ")");
            }
            await helper.server.tick();
        }
        await helper.server.tick();
        await helper.scorecard.settle();

        const s = helper.scorecard.compute();
        const memory = JSON.parse(await helper.player.memory);
        const acc = memory.m5 || {};
        const last = acc.last || {};
        const minedShare = acc.steadySamples ? acc.minedSamples / acc.steadySamples : 0;
        const avgDropped = acc.steadySamples ? acc.droppedSum / acc.steadySamples : 0;
        console.log("M5 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({
            window: s.window,
            harvestedPerTick: s.harvestedPerTick,
            upgradePerTick: s.upgradePerTick,
            buildPerTick: s.buildPerTick,
            spawnIdleFullShare: s.spawnIdleFullShare,
            creepIdleShare: s.creepIdleShare,
            wastedEnergyInWindow: s.wastedEnergy,
            minedShare: Math.round(minedShare * 100) / 100,
            avgDroppedEnergy: Math.round(avgDropped),
            maxContainerEnergy: acc.maxContainerEnergy || 0,
            last: last,
        }));

        assert.isAtLeast(last.level || 0, 5, "the controller is at level 5 or higher");
        assert.equal(last.sourcesWithContainer || 0, last.sources || -1, "every source has a container next to it (built or placed)");
        assert.isAtLeast(last.sourcesWithBuiltContainer || 0, 1, "at least one source container is finished");
        assert.isAtLeast(acc.maxContainerEnergy || 0, 1, "harvested energy ended up in a source container");
        assert.isAtLeast(minedShare, MIN_MINED_SHARE, "from tick " + STEADY_FROM + " on, a creep with WORK parts stood on a source container in at least " + (MIN_MINED_SHARE * 100) + "% of the samples (static mining)");
        assert.isAtLeast(s.harvestedPerTick, MIN_HARVEST_PER_TICK, "at least " + MIN_HARVEST_PER_TICK + " energy harvested per tick over the last " + s.window + " ticks (of 20 possible)");
        assert.isAtLeast(s.upgradePerTick, MIN_UPGRADE_PER_TICK, "the controller got at least " + MIN_UPGRADE_PER_TICK + " progress per tick over the last " + s.window + " ticks (spare energy is spent)");
        assert.isAtMost(s.spawnIdleFullShare, MAX_SPAWN_IDLE_FULL, "the spawn sat idle with full room energy in at most " + (MAX_SPAWN_IDLE_FULL * 100) + "% of the last " + s.window + " ticks");
        assert.isAtMost(avgDropped, MAX_AVG_DROPPED, "on average at most " + MAX_AVG_DROPPED + " energy lay on the ground from tick " + STEADY_FROM + " on");
        assert.isAtLeast(last.creeps || 0, 3, "the colony still has creeps");
    });
});

/*
 * Acceptance test for milestone M4 (hold the room at level 5). Version 2 (2026-10-31).
 * v2: the starting safe mode of a new room is switched off (it made the safe-mode check fail by
 * itself), the intruder is tougher (1000 hits, so it lives for more than one tick), and defend mode
 * counts if Memory.mode is 'defend' or 'war' at any tick within 5 ticks of the first sighting.
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 *
 * The room starts at controller level 5 with no tower and no extensions, like the owner's real
 * room (which has 5 extensions and no tower). At level 5 a room may have 2 towers and 30 extensions.
 * The test checks that the bot builds for the level it is at (not just level 3), that a tower is
 * built and filled first, that the spawn and towers get ramparts, and that one intruder
 * near the end is noticed (Memory.mode switches to 'defend' by itself) and killed quickly,
 * without spending safe mode on it.
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 6000;              // whole test
const INTRUDER_AT = 5400;        // tick at which the intruder appears
const INTRUDER = "m4-intruder";
const INVADER_USER = "2";        // the game's built-in NPC "Invader" player
const KILL_WITHIN = 100;         // ticks
const DEFEND_WITHIN = 5;         // ticks from first sighting to Memory.mode === 'defend'
const MAX_RANGE_FROM_SPAWN = 10; // extensions and towers (built or placed)

// Runs inside the bot's own sandbox every tick (through the console).
const TRACK =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var acc = Memory.m4 || (Memory.m4 = { maxTowerEnergy: 0, hostileTicks: 0, defendTicks: 0, firstHostile: 0, firstDefend: 0, safeModeTicks: 0 });" +
    " var defending = Memory.mode === 'defend' || Memory.mode === 'war';" +
    " room.find(FIND_MY_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_TOWER; } }).forEach(function (t) {" +
    "  var energy = t.store[RESOURCE_ENERGY];" +
    "  if (energy > acc.maxTowerEnergy) { acc.maxTowerEnergy = energy; }" +
    " });" +
    " if (room.find(FIND_HOSTILE_CREEPS).length > 0) {" +
    "  acc.hostileTicks += 1;" +
    "  if (!acc.firstHostile) { acc.firstHostile = Game.time; }" +
    " }" +
    " if (acc.firstHostile && Game.time - acc.firstHostile <= " + DEFEND_WITHIN + " && defending) {" +
    "  acc.defendTicks += 1;" +
    "  if (!acc.firstDefend) { acc.firstDefend = Game.time; }" +
    " }" +
    " if (room.controller && room.controller.safeMode) { acc.safeModeTicks += 1; }" +
    "})()";

// Takes a snapshot of the room at the end.
const SNAPSHOT =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { Memory.m4Snapshot = { noRoom: true }; return; }" +
    " var mine = room.find(FIND_MY_STRUCTURES);" +
    " var sites = room.find(FIND_MY_CONSTRUCTION_SITES);" +
    " var ofType = function (list, type) { return _.filter(list, function (s) { return s.structureType === type; }); };" +
    " var spawn = room.find(FIND_MY_SPAWNS)[0];" +
    " var hasRampart = function (pos) {" +
    "  return _.some(pos.lookFor(LOOK_STRUCTURES), function (s) { return s.structureType === STRUCTURE_RAMPART; }) ||" +
    "   _.some(pos.lookFor(LOOK_CONSTRUCTION_SITES), function (s) { return s.structureType === STRUCTURE_RAMPART; });" +
    " };" +
    " var towers = ofType(mine, STRUCTURE_TOWER);" +
    " var nearSpawn = ofType(mine, STRUCTURE_EXTENSION).concat(ofType(sites, STRUCTURE_EXTENSION))" +
    "  .concat(towers).concat(ofType(sites, STRUCTURE_TOWER));" +
    " Memory.m4Snapshot = {" +
    "  level: room.controller ? room.controller.level : 0," +
    "  towersBuilt: towers.length," +
    "  towerSites: ofType(sites, STRUCTURE_TOWER).length," +
    "  towersWithRampart: _.filter(towers, function (t) { return hasRampart(t.pos); }).length," +
    "  extensionsBuilt: ofType(mine, STRUCTURE_EXTENSION).length," +
    "  extensionSites: ofType(sites, STRUCTURE_EXTENSION).length," +
    "  energyCapacity: room.energyCapacityAvailable," +
    "  creeps: _.filter(_.values(Game.creeps), function (c) { return c.room.name === room.name; }).length," +
    "  spawnHits: spawn ? spawn.hits : 0," +
    "  spawnHasRampart: spawn ? hasRampart(spawn.pos) : false," +
    "  hostilesAtEnd: room.find(FIND_HOSTILE_CREEPS).length," +
    "  mode: Memory.mode || null," +
    "  farthestFromSpawn: spawn ? _.max([0].concat(nearSpawn.map(function (s) { return s.pos.getRangeTo(spawn); }))) : 99" +
    " };" +
    "})()";

// Finds a free plain tile 6 to 9 tiles from the spawn for the intruder.
async function findIntruderTile(db: any): Promise<{ x: number, y: number }>
{
    const terrain = (await db["rooms.terrain"].findOne({ room: ROOM })).terrain as string;
    const spawn = await db["rooms.objects"].findOne({ room: ROOM, type: "spawn" });
    for (let range = 6; range <= 9; range += 1)
    {
        for (let x = 2; x <= 47; x += 1)
        {
            for (let y = 2; y <= 47; y += 1)
            {
                if (Math.max(Math.abs(x - spawn.x), Math.abs(y - spawn.y)) !== range) { continue; }
                if (terrain.charAt(y * 50 + x) !== "0") { continue; }   // '0' = plain
                const taken = await db["rooms.objects"].findOne({ room: ROOM, x, y });
                if (taken) { continue; }
                return { x, y };
            }
        }
    }
    throw new Error("no free plain tile 6 to 9 tiles from the spawn for the intruder");
}

describe("M4 acceptance: hold the room at level 5", function ()
{
    it("builds towers and extensions for level 5, adds ramparts, and kills an intruder in defend mode", async function ()
    {
        this.timeout(2700000);

        // Start the room at controller level 5 (2 towers and 30 extensions allowed).
        const { db } = await helper.server.world.load();
        // A new room starts with safe mode on; switch it off so the room has to defend itself
        // and so the test can tell whether the bot used safe mode.
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 5, progress: 0, safeMode: 0 } });

        for (let i = 0; i < INTRUDER_AT; i += 1)
        {
            await helper.player.console(TRACK);
            await helper.server.tick();
        }

        // One NPC intruder appears near the spawn: 1000 hits (5 TOUGH, 1 ATTACK, 4 MOVE).
        const tile = await findIntruderTile(db);
        const now = await helper.server.world.gameTime;
        await db["rooms.objects"].insert({
            type: "creep", room: ROOM, x: tile.x, y: tile.y, name: INTRUDER, user: INVADER_USER,
            body: [{ type: "tough", hits: 100 }, { type: "tough", hits: 100 }, { type: "tough", hits: 100 }, { type: "tough", hits: 100 }, { type: "tough", hits: 100 },
                { type: "attack", hits: 100 }, { type: "move", hits: 100 }, { type: "move", hits: 100 }, { type: "move", hits: 100 }, { type: "move", hits: 100 }],
            hits: 1000, hitsMax: 1000, ticksToLive: 1500, ageTime: now + 1500,
            spawning: false, fatigue: 0, store: {}, storeCapacity: 0, notifyWhenAttacked: false, actionLog: {},
        });

        let goneAfter = -1;
        let leftRoom = false;
        for (let i = INTRUDER_AT; i < TICKS; i += 1)
        {
            await helper.player.console(TRACK);
            await helper.server.tick();
            if (goneAfter < 0)
            {
                const intruder = await db["rooms.objects"].findOne({ type: "creep", name: INTRUDER });
                if (!intruder) { goneAfter = i - INTRUDER_AT + 1; }
                else if (intruder.room !== ROOM) { leftRoom = true; }
            }
        }
        await helper.player.console(SNAPSHOT);
        await helper.server.tick();

        const memory = JSON.parse(await helper.player.memory);
        const acc = memory.m4 || {};
        const snap = memory.m4Snapshot || {};
        console.log("M4 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({
            intruderTile: tile, intruderGoneAfterTicks: goneAfter, intruderLeftRoom: leftRoom,
            maxTowerEnergy: acc.maxTowerEnergy || 0, hostileTicks: acc.hostileTicks || 0, defendTicks: acc.defendTicks || 0,
            firstHostile: acc.firstHostile || 0, firstDefend: acc.firstDefend || 0, safeModeTicks: acc.safeModeTicks || 0,
            snapshot: snap,
        }));

        assert.isAtLeast(snap.level || 0, 5, "the controller is at level 5 or higher");
        assert.isAtLeast(snap.towersBuilt || 0, 1, "a tower is finished");
        assert.isAtLeast(acc.maxTowerEnergy || 0, 500, "a tower held at least 500 energy at some point");
        assert.isAtLeast((snap.towersBuilt || 0) + (snap.towerSites || 0), 2, "both towers allowed at level 5 are built or placed");
        assert.isAtLeast(snap.extensionsBuilt || 0, 3, "at least 3 extensions are finished");
        assert.isAtLeast((snap.extensionsBuilt || 0) + (snap.extensionSites || 0), 15, "more extensions than level 3 allows (10) are built or placed: the code builds for the current level");
        assert.isAtLeast(snap.energyCapacity || 0, 450, "room energy capacity reached at least 450");
        assert.isAtMost(snap.farthestFromSpawn, MAX_RANGE_FROM_SPAWN, "every extension and tower (built or placed) is within " + MAX_RANGE_FROM_SPAWN + " tiles of the spawn");
        assert.isTrue(snap.spawnHasRampart, "the spawn has a rampart (built or placed)");
        assert.equal(snap.towersWithRampart, snap.towersBuilt, "every finished tower has a rampart (built or placed)");
        assert.isAbove(acc.hostileTicks || 0, 0, "the intruder was seen in the room (test setup)");
        assert.isAbove(acc.defendTicks || 0, 0, "Memory.mode switched to 'defend' by itself within " + DEFEND_WITHIN + " ticks of the first sighting");
        assert.isFalse(leftRoom, "the intruder did not just walk out of the room");
        assert.isAbove(goneAfter, 0, "the intruder was killed");
        assert.isAtMost(goneAfter, KILL_WITHIN, "the intruder was killed within " + KILL_WITHIN + " ticks");
        assert.equal(acc.safeModeTicks || 0, 0, "safe mode was not used against one intruder the towers can handle");
        assert.isAbove(snap.spawnHits || 0, 0, "the spawn survived");
        assert.isAtLeast(snap.creeps || 0, 3, "the colony still has creeps");
    });
});

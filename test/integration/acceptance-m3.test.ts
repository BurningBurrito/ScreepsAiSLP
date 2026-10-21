/*
 * Acceptance test for milestone M3 (build priorities, layout and a tower). Version 1 (2026-10-20).
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy from /etc/agent-acceptance before running the tests.
 *
 * The room starts at controller level 3 (set directly in the test world, because a short test
 * never gets there on its own). At level 3 a room may have 10 extensions and 1 tower.
 * The test checks that builders put their energy into the tower and the extensions before roads,
 * that the tower gets built and filled, and that the layout makes sense
 * (roads as connected routes, extensions and tower close to the spawn).
 */
import { assert } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";
const TICKS = 4000;
const MAX_ROAD_TILES = 90;       // built + placed; the routes spawn -> sources and spawn -> controller need about 60 here
const MAX_STRAY_ROADS = 5;       // road tiles not connected to the road network at the spawn
const MAX_RANGE_FROM_SPAWN = 8;  // every extension and the tower (built or placed) within this range of the spawn
const MAX_ROAD_SHARE = 0.1;      // share of build energy that may go into roads while a tower or extension site exists

// Runs inside the bot's own sandbox every tick (through the console).
// Reads the previous tick's event log and adds up the energy builders spent,
// split into "roads" and "everything else", but only while a tower or extension site exists.
// Also remembers the most energy the tower ever held.
const COUNT_BUILDS =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { return; }" +
    " var acc = Memory.m3 || (Memory.m3 = { roadEnergy: 0, otherEnergy: 0, maxTowerEnergy: 0 });" +
    " var prioritySites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: function (s) {" +
    "  return s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION; } }).length;" +
    " if (prioritySites > 0) {" +
    "  room.getEventLog().forEach(function (e) {" +
    "   if (e.event !== EVENT_BUILD || !e.data) { return; }" +
    "   var type = e.data.structureType;" +
    "   if (!type) { var site = Game.getObjectById(e.data.targetId); type = site ? site.structureType : 'unknown'; }" +
    "   var spent = e.data.energySpent || e.data.amount || 0;" +
    "   if (type === STRUCTURE_ROAD) { acc.roadEnergy += spent; } else { acc.otherEnergy += spent; }" +
    "  });" +
    " }" +
    " room.find(FIND_MY_STRUCTURES, { filter: function (s) { return s.structureType === STRUCTURE_TOWER; } }).forEach(function (t) {" +
    "  var energy = t.store[RESOURCE_ENERGY];" +
    "  if (energy > acc.maxTowerEnergy) { acc.maxTowerEnergy = energy; }" +
    " });" +
    "})()";

// Takes a snapshot of the colony and its layout at the end.
const SNAPSHOT =
    "(function () {" +
    " var room = Game.rooms['" + ROOM + "'];" +
    " if (!room) { Memory.m3Snapshot = { noRoom: true }; return; }" +
    " var mine = room.find(FIND_MY_STRUCTURES);" +
    " var all = room.find(FIND_STRUCTURES);" +
    " var sites = room.find(FIND_MY_CONSTRUCTION_SITES);" +
    " var ofType = function (list, type) { return _.filter(list, function (s) { return s.structureType === type; }); };" +
    " var spawn = room.find(FIND_MY_SPAWNS)[0];" +
    " var terrain = room.getTerrain();" +
    " var roads = ofType(all, STRUCTURE_ROAD).concat(ofType(sites, STRUCTURE_ROAD));" +
    " var key = function (p) { return p.x + ':' + p.y; };" +
    " var roadSet = {}; roads.forEach(function (r) { roadSet[key(r.pos)] = r.pos; });" +
    " var roadTiles = Object.keys(roadSet).length;" +
    " var reached = {}; var queue = [];" +
    " if (spawn) { _.values(roadSet).forEach(function (p) { if (p.getRangeTo(spawn) <= 1) { reached[key(p)] = true; queue.push(p); } }); }" +
    " while (queue.length > 0) { var p = queue.shift();" +
    "  for (var dx = -1; dx <= 1; dx++) { for (var dy = -1; dy <= 1; dy++) {" +
    "   var k = (p.x + dx) + ':' + (p.y + dy);" +
    "   if (roadSet[k] && !reached[k]) { reached[k] = true; queue.push(roadSet[k]); } } } }" +
    " var reachedTiles = _.filter(_.values(roadSet), function (p) { return reached[key(p)]; });" +
    " var connects = function (target, range) { return _.some(reachedTiles, function (p) { return p.getRangeTo(target) <= range; }); };" +
    " var sources = room.find(FIND_SOURCES);" +
    " var nearSpawn = ofType(mine, STRUCTURE_EXTENSION).concat(ofType(sites, STRUCTURE_EXTENSION))" +
    "  .concat(ofType(mine, STRUCTURE_TOWER)).concat(ofType(sites, STRUCTURE_TOWER));" +
    " Memory.m3Snapshot = {" +
    "  level: room.controller ? room.controller.level : 0," +
    "  towersBuilt: ofType(mine, STRUCTURE_TOWER).length," +
    "  towerSites: ofType(sites, STRUCTURE_TOWER).length," +
    "  extensionsBuilt: ofType(mine, STRUCTURE_EXTENSION).length," +
    "  extensionSites: ofType(sites, STRUCTURE_EXTENSION).length," +
    "  energyCapacity: room.energyCapacityAvailable," +
    "  creeps: _.values(Game.creeps).length," +
    "  roadTiles: roadTiles," +
    "  roadsOnWalls: _.filter(_.values(roadSet), function (p) { return terrain.get(p.x, p.y) === TERRAIN_MASK_WALL; }).length," +
    "  strayRoads: roadTiles - reachedTiles.length," +
    "  sources: sources.length," +
    "  sourcesConnected: _.filter(sources, function (s) { return connects(s, 1); }).length," +
    "  controllerConnected: room.controller ? connects(room.controller, 3) : false," +
    "  farthestFromSpawn: spawn ? _.max([0].concat(nearSpawn.map(function (s) { return s.pos.getRangeTo(spawn); }))) : 99" +
    " };" +
    "})()";

describe("M3 acceptance: build priorities, layout and a tower", function ()
{
    it("builds the tower and extensions before roads, fills the tower, and keeps a sensible layout", async function ()
    {
        this.timeout(1800000);

        // Start the room at controller level 3 (tower and 10 extensions allowed).
        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update({ room: ROOM, type: "controller" }, { $set: { level: 3, progress: 0 } });

        for (let i = 0; i < TICKS; i += 1)
        {
            await helper.player.console(COUNT_BUILDS);
            await helper.server.tick();
        }
        await helper.player.console(SNAPSHOT);
        await helper.server.tick();

        const memory = JSON.parse(await helper.player.memory);
        const acc = memory.m3 || {};
        const snap = memory.m3Snapshot || {};
        const buildEnergy = (acc.roadEnergy || 0) + (acc.otherEnergy || 0);
        const roadShare = buildEnergy > 0 ? (acc.roadEnergy || 0) / buildEnergy : 0;
        console.log("M3 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({
            roadEnergyWhilePrioritySites: acc.roadEnergy || 0,
            otherEnergyWhilePrioritySites: acc.otherEnergy || 0,
            roadShare: Math.round(roadShare * 100) / 100,
            maxTowerEnergy: acc.maxTowerEnergy || 0,
            snapshot: snap,
        }));

        assert.isAtLeast(snap.level || 0, 3, "the controller is at level 3 or higher");
        assert.isAtLeast(snap.towersBuilt || 0, 1, "a tower is finished");
        assert.isAtLeast(acc.maxTowerEnergy || 0, 500, "the tower was filled with at least 500 energy at some point");
        assert.isAtLeast(snap.extensionsBuilt || 0, 3, "at least 3 extensions are finished");
        assert.isAtLeast((snap.extensionsBuilt || 0) + (snap.extensionSites || 0), 10, "all 10 extensions allowed at level 3 are built or placed");
        assert.isAtLeast(snap.energyCapacity || 0, 450, "room energy capacity reached at least 450");
        assert.isAtMost(roadShare, MAX_ROAD_SHARE, "while tower or extension sites existed, at most " + (MAX_ROAD_SHARE * 100) + "% of the build energy went into roads (priorities)");
        assert.isAtMost(snap.farthestFromSpawn, MAX_RANGE_FROM_SPAWN, "every extension and the tower (built or placed) is within " + MAX_RANGE_FROM_SPAWN + " tiles of the spawn");
        assert.equal(snap.roadsOnWalls, 0, "no road tile is placed on a terrain wall");
        assert.isAtMost(snap.roadTiles, MAX_ROAD_TILES, "at most " + MAX_ROAD_TILES + " road tiles (built or placed): roads only where creeps actually walk");
        assert.equal(snap.sourcesConnected, snap.sources, "a connected road leads from the spawn to every source (ending next to it)");
        assert.isTrue(snap.controllerConnected, "a connected road leads from the spawn to within 3 tiles of the controller");
        assert.isAtMost(snap.strayRoads, MAX_STRAY_ROADS, "at most " + MAX_STRAY_ROADS + " road tiles are not connected to the road network at the spawn");
        assert.isAtLeast(snap.creeps || 0, 3, "the colony still has creeps");
    });
});

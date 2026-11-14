/**
 * Temporary diagnostic probe for the M4 floor-window failure (run 97).
 *
 * Replays acceptance-m4's world (RCL 5, no safe mode, no intruder) and logs
 * compact state every 50 ticks from tick 3500 to 5300 - the window in which
 * the first extension was built at ~2.5 progress/tick while 10 builders and
 * a full pool sat idle. The probe accumulates its lines in the bot's Memory
 * (m4b) and the test prints them every 100 ticks, so they survive even if
 * the run is stopped early. Delete this file when the diagnosis is in.
 */

import { expect } from "chai";
import { helper } from "./helper";

const ROOM = "W0N1";

/**
 * Sandbox script: every 50 ticks, appends one compact line to Memory.m4b:
 * pool energy/capacity, container energies, source energies, built
 * extension count, top-3 extension site progress, and every creep with
 * role letter, position and store.
 */
const PROBE = `(function () {
  var room = Game.rooms['${ROOM}'];
  if (!room) { return; }
  var log = Memory.m4b || (Memory.m4b = []);
  if (Game.time < 3500 || log.length >= 40) { return; }
  var spawn = room.find(FIND_MY_SPAWNS)[0];
  var my = room.find(FIND_MY_STRUCTURES);
  var exts = _.filter(my, function (s) { return s.structureType === STRUCTURE_EXTENSION; });
  var conts = _.filter(my, function (s) { return s.structureType === STRUCTURE_CONTAINER; });
  var srcs = room.find(FIND_SOURCES).map(function (s) { return s.store.getUsed(); });
  var cap = 300 + exts.length * 50;
  var poolE = (spawn ? spawn.store.getUsed() : 0) + _.reduce(exts, function (a, e) { return a + e.store.getUsed(); }, 0);
  var cs = conts.map(function (c) { return c.pos.x + ',' + c.pos.y + ':' + c.store.getUsed(); }).sort();
  var es = _.filter(room.find(FIND_MY_CONSTRUCTION_SITES), function (s) { return s.structureType === STRUCTURE_EXTENSION; });
  es.sort(function (a, b) { return b.progress - a.progress; });
  var top = es.slice(0, 3).map(function (s) { return s.progress; });
  var R = { builder: 'B', miner: 'M', hauler: 'H', harvester: 'R', upgrader: 'U' };
  var crs = room.find(FIND_MY_CREEPS).map(function (c) {
    return (R[c.memory.role] || '?') + c.pos.x + ',' + c.pos.y + ':' + c.store.getUsed();
  }).sort();
  log.push('t=' + Game.time + ' pool=' + poolE + '/' + cap + ' cont=[' + cs.join(' ') + '] src=[' + srcs.join(',') + '] ext=' + exts.length + ' top=' + top.join('/') + ' | ' + crs.join(' '));
})()`;

describe("probe M4b floor window", function () {
    it("logs builder and energy state every 50 ticks from 3500 to 5300", async function () {
        this.timeout(2700000);
        const { db } = await helper.server.world.load();
        await db["rooms.objects"].update(
            { room: ROOM, type: "controller" },
            { $set: { level: 5, progress: 0, safeMode: 0 } },
        );

        let printed = 0;
        for (let i = 0; i < 5300; i += 1) {
            await helper.player.console(PROBE);
            await helper.server.tick();
            if (i > 0 && i % 100 === 0) {
                const memory = JSON.parse(await helper.player.memory);
                const lines: string[] = memory.m4b || [];
                for (let j = printed; j < lines.length; j += 1) {
                    console.log(lines[j]);
                }
                printed = lines.length;
            }
        }
        const memory = JSON.parse(await helper.player.memory);
        const lines: string[] = memory.m4b || [];
        for (let j = printed; j < lines.length; j += 1) {
            console.log(lines[j]);
        }
        expect(lines.length).to.be.greaterThan(0);
    });
});
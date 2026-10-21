/*
 * Offline verification of criteria.ts: synthetic timelines and room objects, plus a scan of the
 * real repository's src/ folder (expected: Math.random in roles/builder.ts is flagged, and the
 * computed RoomPosition calls in constructionManager.ts are not).
 */
import { assert } from "chai";
import { ceilingPerTick, chebyshev, containersBySource, maxSpawnIdleFullStreak, minerStaysPut, scanSourceFiles } from "../integration/criteria";
import { CreepRow, TickRecord } from "../integration/scorecard";

function rec(t: number, cr: CreepRow[], sp: [number, number, number]): TickRecord
{
    return { __sc: 1, t, cpu: 1, h: 0, u: 0, b: 0, rp: 0, tr: 0, w: 0, act: [], bt: {}, cr, sp, lvl: 1, prog: 0 };
}

const sources = [{ type: "source", x: 14, y: 18, energyCapacity: 1000 }, { type: "source", x: 39, y: 14, energyCapacity: 3000 }];

// distances and ceiling
assert.equal(chebyshev({ x: 1, y: 1 }, { x: 3, y: 2 }), 2);
assert.closeTo(ceilingPerTick([1000, 3000]), 13.33, 0.01);
assert.equal(ceilingPerTick([3000, 3000]), 20);

// containers: one adjacent to each source passes; two next to the same source do not
assert.deepEqual(containersBySource([...sources, { type: "container", x: 15, y: 19 }, { type: "container", x: 38, y: 14 }]), { containers: 2, sourcesWithContainer: 2 });
assert.deepEqual(containersBySource([...sources, { type: "container", x: 15, y: 19 }, { type: "container", x: 13, y: 17 }]), { containers: 2, sourcesWithContainer: 1 });
assert.deepEqual(containersBySource([...sources, { type: "container", x: 16, y: 19 }]), { containers: 1, sourcesWithContainer: 0 });

// miners: m1 walks to source 1 and stays; m2 arrives at source 2 then wanders off; h1 is a hauler and ignored
const miner = (id: string, role: string, x: number, y: number, spawning = 0): CreepRow => [id, id, role, x, y, 0, spawning, 1000];
const timeline: TickRecord[] = [
    rec(1, [miner("m1", "miner", 13, 20, 1), miner("m2", "miner", 13, 20, 1)], [1, 300, 300]),
    rec(2, [miner("m1", "miner", 13, 19), miner("m2", "miner", 20, 18), miner("h1", "hauler", 13, 21)], [0, 300, 300]),
    rec(3, [miner("m1", "miner", 14, 19), miner("m2", "miner", 38, 15), miner("h1", "hauler", 30, 30)], [0, 300, 300]),
    rec(4, [miner("m1", "miner", 14, 19), miner("m2", "miner", 38, 15), miner("h1", "hauler", 40, 40)], [0, 300, 300]),
    rec(5, [miner("m1", "miner", 14, 19), miner("m2", "miner", 36, 15), miner("h1", "hauler", 40, 40)], [0, 250, 300]),
    rec(6, [miner("m1", "miner", 14, 19), miner("m2", "miner", 35, 15), miner("h1", "hauler", 40, 40)], [0, 300, 300]),
    rec(7, [miner("m1", "miner", 14, 19)], [0, 300, 300]),
    rec(8, [miner("m1", "miner", 14, 19)], [0, 300, 300])
];
const report = minerStaysPut(timeline, sources);
assert.equal(report.miners, 2, "two distinct miners");
assert.equal(report.arrived, 2, "both reached a source");
assert.equal(report.violations.length, 2, "m2 left its source on ticks 5 and 6");
assert.deepEqual(report.violations[0], { name: "m2", tick: 5, distance: 3 });
assert.equal(minerStaysPut(timeline, sources, "hauler").arrived, 0, "haulers never count as arrived");

// spawn idle streaks: ticks 2-4 idle at capacity (3), tick 5 not full, ticks 6-8 idle (3); best is the first, from tick 2
assert.deepEqual(maxSpawnIdleFullStreak(timeline), { streak: 3, startTick: 2 });
assert.deepEqual(maxSpawnIdleFullStreak([]), { streak: 0, startTick: 0 });

// source scan against the real repository
const repoSrc = process.argv[2];
if (repoSrc)
{
    const scan = scanSourceFiles(repoSrc);
    console.log("scan of " + repoSrc + ": " + JSON.stringify(scan));
    console.log("(informational: " + scan.randomInRoles.length + " Math.random call(s) in role files, " + scan.hardcodedPositions.length + " literal position(s))");
}
assert.deepEqual(scanSourceFiles("/nonexistent/dir"), { hardcodedPositions: [], randomInRoles: [] });

console.log("criteria ok");

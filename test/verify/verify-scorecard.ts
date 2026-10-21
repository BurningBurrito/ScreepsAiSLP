/*
 * Offline verification of scorecard.ts without the Screeps engine.
 * Part A evaluates the probe expression inside a Node vm context with a stubbed Game.
 * Part B drives a Scorecard with a fake server and player for 300 ticks, then checks the
 * computed summary and the files finish() writes.
 */
import { assert } from "chai";
import { EventEmitter } from "events";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vm from "vm";
import { buildProbe, parseProbeResult, Scorecard } from "../integration/scorecard";

// ---------- a tiny fake game world ----------
interface FakeCreep { id: string; name: string; role: string; x: number; y: number; energy: number; ttl: number; spawning: boolean; }

function makeContext(time: number, creeps: FakeCreep[], events: any[], opts: { spawning: boolean; energy: number; capacity: number; level: number; progress: number; sitesOnWall: number })
{
    const sources = [
        { id: "s1", energy: 900, energyCapacity: 1000, ticksToRegeneration: time % 300 === 0 ? 1 : 50, pos: { x: 14, y: 18 } },
        { id: "s2", energy: 0, energyCapacity: 3000, ticksToRegeneration: 120, pos: { x: 39, y: 14 } }
    ];
    const controller = { level: opts.level, progress: opts.progress, structureType: "controller", pos: { x: 8, y: 43 } };
    const nearTo = (a: any, b: any): boolean => Math.abs(a.x - b.pos.x) <= 1 && Math.abs(a.y - b.pos.y) <= 1;
    const site = (structureType: string, x: number, y: number) => ({ structureType, pos: { x, y, isNearTo: function (o: any) { return nearTo(this, o); } } });
    // extension site next to source 1; two road sites on wall terrain, not connected; a tower site far from the spawn
    const sites = [site("extension", 15, 18), site("road", 30, 30), site("road", 31, 31), site("tower", 30, 5)];
    const spawnPos = { x: 13, y: 20 };
    const structures = [
        { structureType: "spawn", pos: spawnPos },
        { structureType: "extension", pos: { x: 16, y: 20 } },
        { structureType: "road", pos: { x: 14, y: 20 } },   // next to the spawn
        { structureType: "road", pos: { x: 15, y: 20 } },   // connected
        { structureType: "road", pos: { x: 14, y: 19 } },   // connected, adjacent to source 1
        { structureType: "road", pos: { x: 40, y: 40 } },   // disconnected
        { structureType: "controller", pos: controller.pos }
    ];
    const byId: Record<string, any> = { sp1: { structureType: "spawn" }, ext1: { structureType: "extension" }, ctl: controller, site: { structureType: "road" } };
    const room = {
        name: "W0N1",
        energyAvailable: opts.energy,
        energyCapacityAvailable: opts.capacity,
        controller,
        getEventLog: () => events,
        find: (kind: number) =>
        {
            if (kind === 105) { return sources; }
            if (kind === 112) { return [{ spawning: opts.spawning ? { name: "x" } : null, pos: spawnPos }]; }
            if (kind === 114) { return sites; }
            if (kind === 107) { return structures; }
            return [];
        },
        getTerrain: () => ({ get: (x: number, y: number) => ((x === 30 && y === 30) || (x === 31 && y === 31 && opts.sitesOnWall > 1) ? 1 : 0) })
    };
    const gameCreeps: Record<string, any> = {};
    for (const c of creeps)
    {
        gameCreeps[c.name] = { id: c.id, memory: { role: c.role }, pos: { x: c.x, y: c.y }, store: { energy: c.energy }, spawning: c.spawning, ticksToLive: c.ttl, room };
    }
    return vm.createContext({
        JSON, Object, Math,
        Game: { time, cpu: { getUsed: () => 2.5, bucket: 9000 }, rooms: { W0N1: room }, creeps: gameCreeps, getObjectById: (id: string) => byId[id] || null },
        RawMemory: { get: () => "x".repeat(2048) },
        EVENT_HARVEST: 4, EVENT_UPGRADE_CONTROLLER: 8, EVENT_BUILD: 3, EVENT_REPAIR: 7, EVENT_TRANSFER: 11,
        RESOURCE_ENERGY: "energy", STRUCTURE_SPAWN: "spawn", STRUCTURE_EXTENSION: "extension", STRUCTURE_CONTROLLER: "controller",
        STRUCTURE_ROAD: "road", STRUCTURE_TOWER: "tower",
        FIND_SOURCES: 105, FIND_MY_SPAWNS: 112, FIND_MY_CONSTRUCTION_SITES: 114, FIND_STRUCTURES: 107, TERRAIN_MASK_WALL: 1
    });
}

const PROBE = buildProbe("W0N1", 100);

// ---------- Part A: the probe itself ----------
(function partA()
{
    const creeps: FakeCreep[] = [
        { id: "c1", name: "harvester_1", role: "harvester", x: 15, y: 19, energy: 20, ttl: 1400, spawning: false },
        { id: "c2", name: "upgrader_1", role: "upgrader", x: 9, y: 42, energy: 0, ttl: 900, spawning: false }
    ];
    const events = [
        { event: 4, objectId: "c1", data: { targetId: "s1", amount: 4 } },
        { event: 8, objectId: "c2", data: { targetId: "ctl", amount: 2, energySpent: 2 } },
        { event: 11, objectId: "c1", data: { targetId: "sp1", resourceType: "energy", amount: 10 } },
        { event: 11, objectId: "c1", data: { targetId: "ctl", resourceType: "energy", amount: 99 } },
        { event: 3, objectId: "c1", data: { targetId: "site", amount: 5, energySpent: 5 } }
    ];
    const ctx = makeContext(300, creeps, events, { spawning: true, energy: 250, capacity: 300, level: 2, progress: 120, sitesOnWall: 2 });
    const raw = vm.runInContext(PROBE, ctx);
    assert.isString(raw, "probe returns a string");
    const rec = parseProbeResult(raw);
    assert.isNotNull(rec, "probe result parses");
    if (rec === null) { return; }
    assert.equal(rec.t, 300);
    assert.equal(rec.h, 4, "harvest sum");
    assert.equal(rec.u, 2, "upgrade sum");
    assert.equal(rec.b, 5, "build sum");
    assert.equal(rec.tr, 10, "only transfers into spawn/extension count");
    assert.deepEqual(rec.bt, { road: 5 }, "build energy attributed to the target's structure type");
    assert.equal(rec.w, 900, "energy left in a source one tick before regeneration counts as wasted");
    assert.sameMembers(rec.act, ["c1", "c2"], "actors from the event log");
    assert.equal(rec.cr.length, 2);
    assert.deepEqual(rec.cr[0], ["c1", "harvester_1", "harvester", 15, 19, 20, 0, 1400]);
    assert.deepEqual(rec.sp, [1, 250, 300]);
    assert.equal(rec.lvl, 2);
    assert.isDefined(rec.snap, "snapshot on a multiple of 100");
    if (rec.snap !== undefined)
    {
        assert.equal(rec.snap.sitesTotal, 4);
        assert.equal(rec.snap.onWall, 2, "two road sites on wall terrain");
        assert.equal(rec.snap.extNear, 1, "extension site next to a source; the tower does not count");
        assert.deepEqual(rec.snap.sites, { extension: 1, road: 2, tower: 1 });
        assert.deepEqual(rec.snap.structures, { spawn: 1, extension: 1, road: 4 }, "controller excluded");
        assert.deepEqual(rec.snap.srcCap, [1000, 3000]);
        assert.equal(rec.snap.memKb, 2);
        assert.deepEqual(rec.snap.roads, { total: 6, onWall: 2, disconnected: 3, reachesSources: 1, sourcesTotal: 2, reachesController: false },
            "6 road tiles, 3 connected to the spawn (one touching source 1), 2 sites and 1 built road disconnected");
        assert.equal(rec.snap.extTowerFar, 1, "only the tower site is farther than 8 from the spawn");
    }
    // non-snapshot tick, no room
    const ctx2 = makeContext(301, creeps, [], { spawning: false, energy: 300, capacity: 300, level: 2, progress: 121, sitesOnWall: 0 });
    const rec2 = parseProbeResult(vm.runInContext(PROBE, ctx2));
    assert.isNotNull(rec2);
    if (rec2 !== null) { assert.isUndefined(rec2.snap); assert.equal(rec2.h, 0); }
    // parser tolerates a quoted-once string and ignores foreign results
    assert.isNotNull(parseProbeResult(JSON.stringify(raw)), "double-encoded string parses");
    assert.isNull(parseProbeResult("bot"));
    assert.isNull(parseProbeResult(undefined));
    assert.isNull(parseProbeResult("{\"foo\":1}"));
    console.log("Part A ok: probe evaluates and parses");
}());

// ---------- Part B: the recorder end to end with a fake server ----------
(async function partB()
{
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "scorecard-verify-"));
    const ticksToRun = 300;

    const makeRun = async (rate: number): Promise<any> =>
    {
        let time = 1;
        const creeps: FakeCreep[] = [
            { id: "c1", name: "harvester_1", role: "harvester", x: 15, y: 19, energy: 0, ttl: 1500, spawning: false },
            { id: "c2", name: "upgrader_1", role: "upgrader", x: 9, y: 42, energy: 0, ttl: 1500, spawning: false },
            { id: "c3", name: "builder_1", role: "builder", x: 20, y: 20, energy: 0, ttl: 1500, spawning: false }
        ];
        const player = new EventEmitter() as any;
        let pending: string[] = [];
        player.console = async (cmd: string) => { pending.push(cmd); };
        const server: any = {
            tick: async () =>
            {
                // the engine runs the queued console commands during the tick and emits the results
                const events: any[] = [
                    { event: 4, objectId: "c1", data: { targetId: "s1", amount: rate } },
                    { event: 8, objectId: "c2", data: { targetId: "ctl", amount: 1 } }
                ];
                if (time % 2 === 0) { events.push({ event: 11, objectId: "c1", data: { targetId: "sp1", resourceType: "energy", amount: 6 } }); }
                // harvester moves every tick, upgrader acts, builder does nothing after tick 100 (idle)
                creeps[0].x = 15 + (time % 3);
                if (time <= 100) { creeps[2].x = 20 + (time % 2); }
                const level = time >= 200 ? 2 : 1;
                const ctx = makeContext(time, creeps, events, { spawning: time % 10 < 3, energy: time % 10 >= 3 ? 300 : 100, capacity: 300, level, progress: time, sitesOnWall: 1 });
                const results = pending.map((cmd) => vm.runInContext(cmd, ctx));
                pending = [];
                const logs = time % 50 === 0 ? ["=== CPU Summary (Tick " + time + ") ===", time === 150 ? "TypeError: boom" : "ok"] : [];
                setImmediate(() => player.emit("console", logs, results, "u1", "player"));
                // the real tick awaits storage I/O many times, so events are delivered during the loop
                await new Promise<void>((resolve) => setImmediate(resolve));
                time += 1;
            }
        };
        const sc = new Scorecard(server, player, { name: "verify", room: "W0N1", dir, windowTicks: 100, minTicks: 50 });
        sc.attach();
        for (let i = 0; i < ticksToRun; i += 1) { await server.tick(); }
        await sc.settle(50);
        const live = sc.compute();
        const summary = await sc.finish();
        return { live, summary, sc };
    };

    const first = await makeRun(4);
    const s = first.summary;
    assert.equal(s.ticks, ticksToRun, "every tick recorded");
    assert.equal(s.window, 100, "window capped by option (40 % of 300 = 120 > 100)");
    assert.equal(s.harvestedPerTick, 4);
    assert.equal(s.harvestedTotal, 4 * ticksToRun);
    assert.equal(s.upgradePerTick, 1);
    assert.equal(s.transferToSpawnPerTick, 3, "6 energy every second tick");
    assert.equal(s.level, 2);
    assert.equal(s.ticksToRcl2, 199, "level 2 first seen at tick 200, run started at tick 1");
    assert.isNull(s.ticksToRcl3);
    assert.equal(s.creepsAtEnd, 3);
    assert.deepEqual(s.creepsByRole, { harvester: 1, upgrader: 1, builder: 1 });
    assert.closeTo(s.spawnBusyShare, 0.3, 0.01);
    assert.closeTo(s.spawnIdleFullShare, 0.7, 0.01, "idle while energy full on 7 of 10 ticks");
    assert.closeTo(s.creepIdleShare, 1 / 3, 0.01, "the builder is idle for the whole window, the other two are active");
    assert.equal(s.cpuPerTick, 2.5);
    assert.equal(s.sitesOnWall, 1);
    assert.equal(s.roadBuildShare, 0, "no build events in part B");
    assert.deepEqual(s.buildByType, {});
    assert.equal(s.roadsTotal, 6);
    assert.equal(s.roadsDisconnected, 3);
    assert.equal(s.roads.reachesSources, 1);
    assert.equal(s.extensionsTowersFarFromSpawn, 1);
    assert.equal(s.consoleErrors, 1, "one TypeError line counted");
    assert.equal(s.consoleLines, 12, "six log batches of two lines");
    assert.equal(s.probeMisses, 0);
    assert.equal(first.live.ticks, ticksToRun, "after settle(), compute() sees every tick");

    const files = fs.readdirSync(dir).sort();
    assert.includeMembers(files, ["history.csv", "latest.md", "verify-console.log", "verify-creeps.txt", "verify.json", "verify.md"]);
    const md = fs.readFileSync(path.join(dir, "verify.md"), "utf8");
    assert.include(md, "# Scorecard: verify");
    assert.include(md, "| Energy harvested / tick | 4 | - |  |", "no previous run yet");
    assert.include(md, "| Road tiles: total / on wall / disconnected from the spawn network (end) | 6 / 1 / 3 | - |  |");
    assert.include(md, "| Roads reach (end): sources, controller | 1 of 2, no | - |  |");
    assert.include(md, "Timeline, every 100 ticks");
    const creepsTxt = fs.readFileSync(path.join(dir, "verify-creeps.txt"), "utf8");
    assert.include(creepsTxt, "tick 250:");
    assert.match(creepsTxt, /builder_1 builder \(20,20\) e=0 ttl=1500 idle \d+/);
    const consoleLog = fs.readFileSync(path.join(dir, "verify-console.log"), "utf8");
    assert.include(consoleLog, "TypeError: boom");
    const history1 = fs.readFileSync(path.join(dir, "history.csv"), "utf8").trim().split("\n");
    assert.equal(history1.length, 2, "header plus one row");
    assert.match(history1[1], /^verify,/);

    // second run with a better rate: comparison column and prev.json
    const second = await makeRun(6);
    assert.equal(second.summary.harvestedPerTick, 6);
    const md2 = fs.readFileSync(path.join(dir, "latest.md"), "utf8");
    assert.include(md2, "| Energy harvested / tick | 6 | 4 | +2 |", "previous run shown with delta");
    assert.isTrue(fs.existsSync(path.join(dir, "verify.prev.json")));
    const prev = JSON.parse(fs.readFileSync(path.join(dir, "verify.prev.json"), "utf8"));
    assert.equal(prev.harvestedPerTick, 4);
    const history2 = fs.readFileSync(path.join(dir, "history.csv"), "utf8").trim().split("\n");
    assert.equal(history2.length, 3);
    assert.equal(server_tick_restored(second.sc), true);

    console.log("Part B ok: recorder, summary and files behave; reports in " + dir);
    console.log("\n" + md2.split("\n").slice(0, 22).join("\n"));
}()).catch((err) => { console.error(err); process.exit(1); });

function server_tick_restored(sc: any): boolean
{
    return sc.originalTick === null;
}

/*
 * Scorecard recorder for the integration tests.
 *
 * Owner-owned: protect and restore this file exactly like helper.ts. The agent reads the
 * reports it writes and never edits it.
 *
 * How it measures: every tick it sends one probe expression through the player's console
 * (the same channel acceptance-m1 uses). The probe runs inside the bot's sandbox, reads
 * room.getEventLog() and the room's state, and returns one JSON object. The result comes back
 * through the player's 'console' event. Nothing is stored in the bot's Memory, so the bot
 * cannot game the numbers, and the bot's code is not touched.
 *
 * What it writes (directory: SCORECARD_DIR, default reports/ under the working directory):
 *   <name>.md           the scorecard the agent reads; also copied to latest.md
 *   <name>.json         summary plus the full per-tick timeline of this run
 *   <name>.prev.json    summary of the previous run of the same test (comparison column)
 *   <name>-creeps.txt   per-creep table every N ticks (the debug snapshot the owner asked for)
 *   <name>-console.log  the bot's own console output during the run (capped)
 *   history.csv         one line per run, appended; the trend across commits
 *
 * Usage from a test: numbers are available at any time through helper.scorecard.compute();
 * helper.afterEach() calls finish(), which writes the files and prints the scorecard.
 */
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface ScorecardOptions
{
    /** Report file prefix, for example "acceptance-m2" or "smoke". */
    name: string;
    /** The bot's home room. */
    room: string;
    /** Directory for the reports. Default: SCORECARD_DIR or reports/ under the working directory. */
    dir?: string;
    /** Ticks between structure snapshots taken by the probe. Default 100. */
    snapshotEvery?: number;
    /** Ticks between rows of the per-creep debug table. Default 50. */
    creepTableEvery?: number;
    /** Averaging window in ticks (capped at 40 % of the run). Default 1000. */
    windowTicks?: number;
    /** Consecutive ticks without an action or a move after which a creep counts as idle. Default 5. */
    idleAfterTicks?: number;
    /** Runs that recorded fewer ticks than this write no report. Default 50. */
    minTicks?: number;
    /** Maximum bot console lines kept. Default 5000. */
    maxConsoleLines?: number;
}

/** id, name, role, x, y, energy carried, spawning (0/1), ticksToLive */
export type CreepRow = [string, string, string, number, number, number, number, number];

export interface RoadNetwork
{
    /** Road tiles, built or sites. */
    total: number;
    /** Road tiles on wall terrain. */
    onWall: number;
    /** Road tiles not connected (8-neighbour) to a road tile next to a spawn. */
    disconnected: number;
    /** Sources with a connected road tile on an adjacent tile. */
    reachesSources: number;
    sourcesTotal: number;
    /** A connected road tile within range 3 of the controller. */
    reachesController: boolean;
}

export interface Snapshot
{
    sites: Record<string, number>;
    sitesTotal: number;
    onWall: number;
    extNear: number;
    structures: Record<string, number>;
    srcCap: number[];
    srcEnergy: number[];
    bucket: number;
    memKb: number;
    roads: RoadNetwork;
    /** Extensions and towers, built or sites, farther than 8 tiles from every spawn. */
    extTowerFar: number;
    /** Our towers and the energy they hold. */
    towers: { count: number; energy: number };
    safeModeAvailable: number;
}

/** One probe result. Events (h, u, b, rp, tr, act) describe the previous tick; the rest is the state at tick t. */
export interface TickRecord
{
    __sc: number;
    t: number;
    cpu: number;
    noRoom?: boolean;
    h: number;
    u: number;
    b: number;
    rp: number;
    tr: number;
    w: number;
    act: string[];
    /** Build energy of the previous tick by target structure type ("completed" when the site finished that tick). */
    bt: Record<string, number>;
    /** Attacks on our creeps and structures in the previous tick. */
    atk: number;
    /** Damage taken by our objects and dealt by our objects in the previous tick. */
    dmgT: number;
    dmgD: number;
    /** Healing done in the previous tick. */
    heal: number;
    /** Objects destroyed in the previous tick, by type ("creep" or a structure type). */
    ds: Record<string, number>;
    /** Hostile creeps in the room at tick t. */
    hc: number;
    /** 1 while safe mode is active. */
    sm: number;
    cr: CreepRow[];
    sp: [number, number, number];
    lvl: number;
    prog: number;
    snap?: Snapshot;
}

export interface ScorecardSummary
{
    name: string;
    date: string;
    commit: string;
    ticks: number;
    firstTick: number;
    lastTick: number;
    window: number;
    harvestedPerTick: number;
    harvestedTotal: number;
    wastedEnergy: number;
    wastedEnergyTotal: number;
    upgradePerTick: number;
    upgradeTotal: number;
    buildPerTick: number;
    buildTotal: number;
    /** Build energy by target type over the window. */
    buildByType: Record<string, number>;
    /** Share of build energy that went into roads over the window (0 when nothing was built). */
    roadBuildShare: number;
    roads: RoadNetwork;
    roadsTotal: number;
    roadsDisconnected: number;
    extensionsTowersFarFromSpawn: number;
    /** Combat and losses, whole run (events are sparse, so no window). */
    hostileTicks: number;
    attacksReceived: number;
    damageTaken: number;
    damageDealt: number;
    healing: number;
    /** Our creeps that disappeared with more than one tick to live: killed, suicided or recycled. */
    creepsLostEarly: number;
    /** Objects destroyed in the room by type, including hostile creeps killed. */
    destroyedByType: Record<string, number>;
    structuresDestroyed: number;
    safeModeTicks: number;
    towerCount: number;
    towerEnergy: number;
    safeModeAvailable: number;
    repairPerTick: number;
    transferToSpawnPerTick: number;
    transferToSpawnTotal: number;
    spawnIdleFullShare: number;
    spawnBusyShare: number;
    creepIdleShare: number;
    cpuPerTick: number;
    cpuMax: number;
    level: number;
    progress: number;
    ticksToRcl2: number | null;
    ticksToRcl3: number | null;
    creepsAtEnd: number;
    creepsByRole: Record<string, number>;
    peakCreeps: number;
    structures: Record<string, number>;
    sites: Record<string, number>;
    sitesTotal: number;
    sitesOnWall: number;
    extensionSitesNearSourceOrController: number;
    sourceCapacity: number[];
    energyCapacity: number;
    memoryKb: number;
    bucket: number;
    consoleLines: number;
    consoleErrors: number;
    probeMisses: number;
}

interface IdleState
{
    x: number;
    y: number;
    streak: number;
}

const HISTORY_COLUMNS = [
    "name", "date", "commit", "ticks", "harvestedPerTick", "wastedEnergy", "upgradePerTick", "buildPerTick",
    "roadBuildShare", "spawnIdleFullShare", "creepIdleShare", "cpuPerTick", "level", "progress", "ticksToRcl2", "creepsAtEnd",
    "sitesOnWall", "roadsTotal", "roadsDisconnected", "extensionsTowersFarFromSpawn", "hostileTicks", "damageTaken", "damageDealt",
    "creepsLostEarly", "structuresDestroyed", "towerEnergy", "consoleErrors"
];

const EMPTY_ROADS: RoadNetwork = { total: 0, onWall: 0, disconnected: 0, reachesSources: 0, sourcesTotal: 0, reachesController: false };
const EMPTY_SNAPSHOT: Snapshot = {
    sites: {}, sitesTotal: 0, onWall: 0, extNear: 0, structures: {}, srcCap: [], srcEnergy: [], bucket: 0, memKb: 0,
    roads: EMPTY_ROADS, extTowerFar: 0, towers: { count: 0, energy: 0 }, safeModeAvailable: 0
};

/**
 * Builds the probe expression that runs inside the bot's sandbox. ES5 on purpose: it is a plain
 * string evaluated by the game runtime, so keep it free of anything the sandbox might not have.
 */
export function buildProbe(room: string, snapshotEvery: number): string
{
    return "(function () {" +
        " var cpu0 = Game.cpu.getUsed();" +
        " var out = { __sc: 1, t: Game.time, cpu: Math.round(cpu0 * 100) / 100 };" +
        " var room = Game.rooms['" + room + "'];" +
        " if (!room) { out.noRoom = true; out.cr = []; out.act = []; out.bt = {}; out.ds = {}; out.sp = [0, 0, 0]; out.h = 0; out.u = 0; out.b = 0; out.rp = 0; out.tr = 0; out.w = 0; out.lvl = 0; out.prog = 0; out.atk = 0; out.dmgT = 0; out.dmgD = 0; out.heal = 0; out.hc = 0; out.sm = 0; return JSON.stringify(out); }" +
        " var h = 0, u = 0, b = 0, rp = 0, tr = 0, i, k;" +
        " var act = {}; var bt = {};" +
        " var atk = 0, dmgT = 0, dmgD = 0, heal = 0, ds = {};" +
        " var ev = room.getEventLog();" +
        " for (i = 0; i < ev.length; i++) {" +
        "  var e = ev[i]; var d = e.data || {};" +
        "  if (e.event === EVENT_HARVEST) { h += d.amount || 0; act[e.objectId] = 1; }" +
        "  else if (e.event === EVENT_UPGRADE_CONTROLLER) { u += d.amount || 0; act[e.objectId] = 1; }" +
        "  else if (e.event === EVENT_BUILD) {" +
        "   b += d.amount || 0; act[e.objectId] = 1;" +
        "   var bs = Game.getObjectById(d.targetId); var btype = bs && bs.structureType ? bs.structureType : 'completed';" +
        "   bt[btype] = (bt[btype] || 0) + (d.energySpent || d.amount || 0);" +
        "  }" +
        "  else if (e.event === EVENT_REPAIR) { rp += d.amount || 0; act[e.objectId] = 1; }" +
        // Combat: damage on our objects counts as taken, damage by our objects as dealt. Objects destroyed
        // in the same tick no longer resolve and are skipped; EVENT_OBJECT_DESTROYED counts them by type.
        "  else if (e.event === EVENT_ATTACK) {" +
        "   act[e.objectId] = 1; var atkr = Game.getObjectById(e.objectId); var victim = Game.getObjectById(d.targetId); var dmg = d.damage || 0;" +
        "   if (victim && victim.my) { atk++; dmgT += dmg; } else if (atkr && atkr.my) { dmgD += dmg; }" +
        "  }" +
        "  else if (e.event === EVENT_HEAL) { heal += d.amount || 0; act[e.objectId] = 1; }" +
        "  else if (e.event === EVENT_OBJECT_DESTROYED) { var dty = d.type || 'unknown'; ds[dty] = (ds[dty] || 0) + 1; }" +
        "  else if (e.event === EVENT_TRANSFER) {" +
        "   act[e.objectId] = 1;" +
        "   if (d.resourceType === RESOURCE_ENERGY) {" +
        "    var tg = Game.getObjectById(d.targetId);" +
        "    if (tg && (tg.structureType === STRUCTURE_SPAWN || tg.structureType === STRUCTURE_EXTENSION)) { tr += d.amount || 0; }" +
        "   }" +
        "  }" +
        " }" +
        " out.h = h; out.u = u; out.b = b; out.rp = rp; out.tr = tr; out.act = Object.keys(act); out.bt = bt;" +
        " out.atk = atk; out.dmgT = dmgT; out.dmgD = dmgD; out.heal = heal; out.ds = ds;" +
        " out.hc = room.find(FIND_HOSTILE_CREEPS).length;" +
        " out.sm = room.controller && room.controller.safeMode ? 1 : 0;" +
        " var srcs = room.find(FIND_SOURCES); var w = 0;" +
        " for (i = 0; i < srcs.length; i++) { if (srcs[i].ticksToRegeneration === 1) { w += srcs[i].energy; } }" +
        " out.w = w;" +
        " var cr = [];" +
        " for (var n in Game.creeps) { var c = Game.creeps[n]; if (c.room.name !== room.name) { continue; }" +
        "  cr.push([c.id, n, (c.memory && c.memory.role) || '?', c.pos.x, c.pos.y, c.store[RESOURCE_ENERGY] || 0, c.spawning ? 1 : 0, c.ticksToLive || 0]); }" +
        " out.cr = cr;" +
        " var sp = room.find(FIND_MY_SPAWNS);" +
        " out.sp = [sp.length > 0 && sp[0].spawning ? 1 : 0, room.energyAvailable, room.energyCapacityAvailable];" +
        " out.lvl = room.controller ? room.controller.level : 0;" +
        " out.prog = room.controller ? room.controller.progress : 0;" +
        " if (Game.time % " + snapshotEvery + " === 0 || Game.time <= 2) {" +
        "  var terrain = room.getTerrain();" +
        "  var sites = room.find(FIND_MY_CONSTRUCTION_SITES); var sc = {}; var onWall = 0; var near = 0;" +
        "  var anchors = srcs.slice(); if (room.controller) { anchors.push(room.controller); }" +
        "  for (i = 0; i < sites.length; i++) {" +
        "   var st = sites[i]; sc[st.structureType] = (sc[st.structureType] || 0) + 1;" +
        "   if (terrain.get(st.pos.x, st.pos.y) === TERRAIN_MASK_WALL) { onWall++; }" +
        "   if (st.structureType === STRUCTURE_EXTENSION) { for (k = 0; k < anchors.length; k++) { if (st.pos.isNearTo(anchors[k])) { near++; break; } } }" +
        "  }" +
        "  var str = {}; var all = room.find(FIND_STRUCTURES); var twc = 0, twe = 0;" +
        "  for (i = 0; i < all.length; i++) { if (all[i].structureType === STRUCTURE_CONTROLLER) { continue; } str[all[i].structureType] = (str[all[i].structureType] || 0) + 1;" +
        "   if (all[i].structureType === STRUCTURE_TOWER && all[i].my) { twc++; twe += (all[i].store && all[i].store[RESOURCE_ENERGY]) || 0; } }" +
        "  var caps = [], ens = []; for (i = 0; i < srcs.length; i++) { caps.push(srcs[i].energyCapacity); ens.push(srcs[i].energy); }" +
        // Road network: every road tile (built or site), then a flood fill from the tiles next to a spawn.
        "  var roadKeys = {}, roadTotal = 0, roadOnWall = 0, seenKeys = {}, queue = [], reached = 0, key, rpos, dx, dy;" +
        "  var addRoad = function (o) { if (o.structureType !== STRUCTURE_ROAD) { return; } var rk = o.pos.x * 50 + o.pos.y; if (roadKeys[rk]) { return; }" +
        "   roadKeys[rk] = [o.pos.x, o.pos.y]; roadTotal++; if (terrain.get(o.pos.x, o.pos.y) === TERRAIN_MASK_WALL) { roadOnWall++; } };" +
        "  for (i = 0; i < all.length; i++) { addRoad(all[i]); } for (i = 0; i < sites.length; i++) { addRoad(sites[i]); }" +
        "  for (key in roadKeys) { rpos = roadKeys[key]; for (k = 0; k < sp.length; k++) { if (Math.abs(rpos[0] - sp[k].pos.x) <= 1 && Math.abs(rpos[1] - sp[k].pos.y) <= 1) { seenKeys[key] = true; queue.push(rpos); break; } } }" +
        "  while (queue.length > 0) { var cur = queue.pop(); reached++;" +
        "   for (dx = -1; dx <= 1; dx++) { for (dy = -1; dy <= 1; dy++) { if (dx === 0 && dy === 0) { continue; } var nx = cur[0] + dx, ny = cur[1] + dy;" +
        "    if (nx < 0 || ny < 0 || nx > 49 || ny > 49) { continue; } var nk = nx * 50 + ny; if (roadKeys[nk] && !seenKeys[nk]) { seenKeys[nk] = true; queue.push(roadKeys[nk]); } } } }" +
        "  var reachSrc = 0; for (i = 0; i < srcs.length; i++) { var hit = false; for (dx = -1; dx <= 1 && !hit; dx++) { for (dy = -1; dy <= 1 && !hit; dy++) { if (seenKeys[(srcs[i].pos.x + dx) * 50 + (srcs[i].pos.y + dy)]) { hit = true; } } } if (hit) { reachSrc++; } }" +
        "  var reachCtl = false; if (room.controller) { for (dx = -3; dx <= 3 && !reachCtl; dx++) { for (dy = -3; dy <= 3 && !reachCtl; dy++) { if (seenKeys[(room.controller.pos.x + dx) * 50 + (room.controller.pos.y + dy)]) { reachCtl = true; } } } }" +
        // Extensions and towers (built or sites) farther than 8 tiles from every spawn.
        "  var far = 0; var checkFar = function (o) { if (o.structureType !== STRUCTURE_EXTENSION && o.structureType !== STRUCTURE_TOWER) { return; } var best = 99;" +
        "   for (k = 0; k < sp.length; k++) { var dd = Math.max(Math.abs(o.pos.x - sp[k].pos.x), Math.abs(o.pos.y - sp[k].pos.y)); if (dd < best) { best = dd; } } if (sp.length > 0 && best > 8) { far++; } };" +
        "  for (i = 0; i < all.length; i++) { checkFar(all[i]); } for (i = 0; i < sites.length; i++) { checkFar(sites[i]); }" +
        "  out.snap = { sites: sc, sitesTotal: sites.length, onWall: onWall, extNear: near, structures: str, srcCap: caps, srcEnergy: ens, bucket: Game.cpu.bucket, memKb: Math.round(RawMemory.get().length / 1024)," +
        "   roads: { total: roadTotal, onWall: roadOnWall, disconnected: roadTotal - reached, reachesSources: reachSrc, sourcesTotal: srcs.length, reachesController: reachCtl }, extTowerFar: far," +
        "   towers: { count: twc, energy: twe }, safeModeAvailable: room.controller ? (room.controller.safeModeAvailable || 0) : 0 };" +
        " }" +
        " return JSON.stringify(out);" +
        "})()";
}

/**
 * Turns one console result into a TickRecord, or null when it is not a probe result.
 * The runtime may hand the probe's JSON string back as is, or quoted once more; both parse.
 */
export function parseProbeResult(raw: unknown): TickRecord | null
{
    let value: unknown = raw;
    for (let round = 0; round < 3 && typeof value === "string"; round++)
    {
        const text = value.trim();
        if (text.indexOf("__sc") < 0)
        {
            return null;
        }
        try
        {
            value = JSON.parse(text);
        }
        catch (err)
        {
            const a = text.indexOf("{");
            const b = text.lastIndexOf("}");
            if (a < 0 || b <= a)
            {
                return null;
            }
            try
            {
                value = JSON.parse(text.slice(a, b + 1).replace(/\\"/g, "\""));
            }
            catch (err2)
            {
                return null;
            }
        }
    }
    if (value !== null && typeof value === "object" && (value as TickRecord).__sc === 1 && typeof (value as TickRecord).t === "number")
    {
        return value as TickRecord;
    }
    return null;
}

function round(value: number, digits: number): number
{
    const f = Math.pow(10, digits);
    return Math.round(value * f) / f;
}

function pct(share: number): string
{
    return Math.round(share * 100) + " %";
}

function fmt(value: number | null | undefined): string
{
    if (value === null || value === undefined)
    {
        return "-";
    }
    return Math.abs(value) >= 1000 ? Math.round(value).toLocaleString("en-US") : String(value);
}

function delta(now: number, before: number | null | undefined, digits: number): string
{
    if (before === null || before === undefined)
    {
        return "";
    }
    const d = round(now - before, digits);
    if (d === 0)
    {
        return "0";
    }
    return (d > 0 ? "+" : "") + fmt(d);
}

function deltaPct(now: number, before: number | null | undefined): string
{
    if (before === null || before === undefined)
    {
        return "";
    }
    const d = Math.round((now - before) * 100);
    return (d > 0 ? "+" : "") + d + " pts";
}

function countBy(rows: CreepRow[]): Record<string, number>
{
    const out: Record<string, number> = {};
    for (const row of rows)
    {
        out[row[2]] = (out[row[2]] || 0) + 1;
    }
    return out;
}

function rolesText(byRole: Record<string, number>): string
{
    const keys = Object.keys(byRole).sort();
    return keys.length === 0 ? "none" : keys.map((k) => k + " " + byRole[k]).join(", ");
}

function recordText(obj: Record<string, number>): string
{
    const keys = Object.keys(obj).sort();
    return keys.length === 0 ? "none" : keys.map((k) => k + " " + obj[k]).join(", ");
}

function gitCommit(): string
{
    try
    {
        return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    }
    catch (err)
    {
        return "unknown";
    }
}

export class Scorecard
{
    private readonly opts: Required<ScorecardOptions>;
    private readonly probe: string;
    private readonly records = new Map<number, TickRecord>();
    private readonly consoleLog: string[] = [];
    private consoleTotal = 0;
    private consoleErrors = 0;
    private probeMisses = 0;
    private ticksSent = 0;
    private originalTick: (() => Promise<void>) | null = null;
    private readonly onConsole: (logs: string[], results: unknown[]) => void;
    private creepStatus = new Map<number, string[]>();

    public constructor(private readonly server: any, private readonly player: any, options: ScorecardOptions)
    {
        this.opts = {
            name: options.name,
            room: options.room,
            dir: options.dir || process.env.SCORECARD_DIR || path.resolve("reports"),
            snapshotEvery: options.snapshotEvery || 100,
            creepTableEvery: options.creepTableEvery || 50,
            windowTicks: options.windowTicks || 1000,
            idleAfterTicks: options.idleAfterTicks || 5,
            minTicks: options.minTicks === undefined ? 50 : options.minTicks,
            maxConsoleLines: options.maxConsoleLines || 5000
        };
        this.probe = buildProbe(this.opts.room, this.opts.snapshotEvery);
        this.onConsole = (logs: string[], results: unknown[]) => this.handleConsole(logs, results);
    }

    /** Starts recording: listens to the player's console and wraps server.tick() so every tick carries the probe. */
    public attach(): void
    {
        if (this.originalTick !== null)
        {
            return;
        }
        this.player.on("console", this.onConsole);
        const original: () => Promise<void> = this.server.tick.bind(this.server);
        this.originalTick = original;
        this.server.tick = async (): Promise<void> =>
        {
            await this.player.console(this.probe);
            await original();
            this.ticksSent += 1;
            if (this.ticksSent % 100 === 0)
            {
                console.log(this.progressLine());
            }
        };
    }

    /** Stops recording and restores server.tick(). */
    public detach(): void
    {
        if (this.originalTick === null)
        {
            return;
        }
        this.server.tick = this.originalTick;
        this.originalTick = null;
        this.player.removeListener("console", this.onConsole);
    }

    /** The per-tick records collected so far, in tick order. Acceptance tests may compute their own criteria from these. */
    public timeline(): TickRecord[]
    {
        return Array.from(this.records.values()).sort((a, b) => a.t - b.t);
    }

    /** Number of ticks the probe has been sent for. */
    public get ticks(): number
    {
        return this.ticksSent;
    }

    /** Computes the summary from what has been recorded so far. Does not write anything. */
    public compute(): ScorecardSummary
    {
        const recs = this.timeline();
        const ticks = recs.length;
        const name = this.opts.name;
        const date = new Date().toISOString().slice(0, 16).replace("T", " ");
        const commit = gitCommit();
        if (ticks === 0)
        {
            return {
                name, date, commit, ticks: 0, firstTick: 0, lastTick: 0, window: 0,
                harvestedPerTick: 0, harvestedTotal: 0, wastedEnergy: 0, wastedEnergyTotal: 0,
                upgradePerTick: 0, upgradeTotal: 0, buildPerTick: 0, buildTotal: 0, buildByType: {}, roadBuildShare: 0,
                roads: EMPTY_ROADS, roadsTotal: 0, roadsDisconnected: 0, extensionsTowersFarFromSpawn: 0,
                hostileTicks: 0, attacksReceived: 0, damageTaken: 0, damageDealt: 0, healing: 0, creepsLostEarly: 0, destroyedByType: {},
                structuresDestroyed: 0, safeModeTicks: 0, towerCount: 0, towerEnergy: 0, safeModeAvailable: 0, repairPerTick: 0,
                transferToSpawnPerTick: 0, transferToSpawnTotal: 0, spawnIdleFullShare: 0, spawnBusyShare: 0,
                creepIdleShare: 0, cpuPerTick: 0, cpuMax: 0, level: 0, progress: 0, ticksToRcl2: null, ticksToRcl3: null,
                creepsAtEnd: 0, creepsByRole: {}, peakCreeps: 0, structures: {}, sites: {}, sitesTotal: 0, sitesOnWall: 0,
                extensionSitesNearSourceOrController: 0, sourceCapacity: [], energyCapacity: 0, memoryKb: 0, bucket: 0,
                consoleLines: this.consoleTotal, consoleErrors: this.consoleErrors, probeMisses: this.ticksSent
            };
        }

        const windowTicks = Math.min(this.opts.windowTicks, Math.max(1, Math.floor(ticks * 0.4)));
        const win = recs.slice(ticks - windowTicks);
        const windowStart = win[0].t;
        const sum = (rows: TickRecord[], f: (r: TickRecord) => number): number => rows.reduce((acc, r) => acc + f(r), 0);
        const per = (rows: TickRecord[], f: (r: TickRecord) => number): number => (rows.length === 0 ? 0 : sum(rows, f) / rows.length);

        // Idle creeps: a creep is idle after idleAfterTicks consecutive ticks in which it neither acted
        // (no event with its id) nor moved, while not spawning.
        const idle = new Map<string, IdleState>();
        let idleTicks = 0;
        let creepTicks = 0;
        let peakCreeps = 0;
        this.creepStatus = new Map<number, string[]>();
        for (const rec of recs)
        {
            const acted = new Set(rec.act || []);
            const seen = new Set<string>();
            const statuses: string[] = [];
            peakCreeps = Math.max(peakCreeps, rec.cr.length);
            for (const row of rec.cr)
            {
                const [id, creepName, role, x, y, energy, spawning, ttl] = row;
                seen.add(id);
                const prev = idle.get(id);
                const moved = prev !== undefined && (prev.x !== x || prev.y !== y);
                const active = acted.has(id) || moved || spawning === 1;
                const streak = active ? 0 : (prev === undefined ? 0 : prev.streak + 1);
                idle.set(id, { x, y, streak });
                const isIdle = streak >= this.opts.idleAfterTicks;
                if (rec.t >= windowStart)
                {
                    creepTicks += 1;
                    if (isIdle)
                    {
                        idleTicks += 1;
                    }
                }
                const state = spawning === 1 ? "spawning" : (acted.has(id) ? "acted" : (moved ? "moved" : (isIdle ? "idle " + streak : "still " + streak)));
                statuses.push(creepName + " " + role + " (" + x + "," + y + ") e=" + energy + " ttl=" + ttl + " " + state);
            }
            for (const id of Array.from(idle.keys()))
            {
                if (!seen.has(id))
                {
                    idle.delete(id);
                }
            }
            this.creepStatus.set(rec.t, statuses);
        }

        const firstLevel2 = recs.find((r) => r.lvl >= 2);
        const firstLevel3 = recs.find((r) => r.lvl >= 3);
        const last = recs[ticks - 1];
        const lastSnap = recs.slice().reverse().find((r) => r.snap !== undefined);
        const snap: Snapshot = lastSnap !== undefined && lastSnap.snap !== undefined ? lastSnap.snap : EMPTY_SNAPSHOT;
        const roads: RoadNetwork = snap.roads || EMPTY_ROADS;
        const towers = snap.towers || { count: 0, energy: 0 };

        // Our creeps that vanished between two consecutive records with more than one tick left to live.
        let creepsLostEarly = 0;
        for (let i = 1; i < recs.length; i++)
        {
            const prev = recs[i - 1];
            const cur = recs[i];
            if (cur.t !== prev.t + 1)
            {
                continue;
            }
            const alive = new Set(cur.cr.map((row) => row[0]));
            for (const row of prev.cr)
            {
                if (!alive.has(row[0]) && row[6] === 0 && row[7] > 1)
                {
                    creepsLostEarly += 1;
                }
            }
        }
        const destroyedByType: Record<string, number> = {};
        for (const r of recs)
        {
            for (const type of Object.keys(r.ds || {}))
            {
                destroyedByType[type] = (destroyedByType[type] || 0) + r.ds[type];
            }
        }
        const structuresDestroyed = Object.keys(destroyedByType).filter((type) => type !== "creep").reduce((acc, type) => acc + destroyedByType[type], 0);

        const buildByType: Record<string, number> = {};
        for (const r of win)
        {
            for (const type of Object.keys(r.bt || {}))
            {
                buildByType[type] = (buildByType[type] || 0) + r.bt[type];
            }
        }
        const buildEnergy = Object.keys(buildByType).reduce((acc, type) => acc + buildByType[type], 0);
        const roadBuildShare = buildEnergy === 0 ? 0 : round((buildByType.road || 0) / buildEnergy, 3);

        return {
            name,
            date,
            commit,
            ticks,
            firstTick: recs[0].t,
            lastTick: last.t,
            window: windowTicks,
            harvestedPerTick: round(per(win, (r) => r.h), 2),
            harvestedTotal: sum(recs, (r) => r.h),
            wastedEnergy: sum(win, (r) => r.w),
            wastedEnergyTotal: sum(recs, (r) => r.w),
            upgradePerTick: round(per(win, (r) => r.u), 2),
            upgradeTotal: sum(recs, (r) => r.u),
            buildPerTick: round(per(win, (r) => r.b), 2),
            buildTotal: sum(recs, (r) => r.b),
            buildByType,
            roadBuildShare,
            roads,
            roadsTotal: roads.total,
            roadsDisconnected: roads.disconnected,
            extensionsTowersFarFromSpawn: snap.extTowerFar || 0,
            hostileTicks: recs.filter((r) => (r.hc || 0) > 0).length,
            attacksReceived: sum(recs, (r) => r.atk || 0),
            damageTaken: sum(recs, (r) => r.dmgT || 0),
            damageDealt: sum(recs, (r) => r.dmgD || 0),
            healing: sum(recs, (r) => r.heal || 0),
            creepsLostEarly,
            destroyedByType,
            structuresDestroyed,
            safeModeTicks: recs.filter((r) => r.sm === 1).length,
            towerCount: towers.count,
            towerEnergy: towers.energy,
            safeModeAvailable: snap.safeModeAvailable || 0,
            repairPerTick: round(per(win, (r) => r.rp), 2),
            transferToSpawnPerTick: round(per(win, (r) => r.tr), 2),
            transferToSpawnTotal: sum(recs, (r) => r.tr),
            spawnIdleFullShare: round(win.filter((r) => r.sp[0] === 0 && r.sp[2] > 0 && r.sp[1] >= r.sp[2]).length / win.length, 3),
            spawnBusyShare: round(win.filter((r) => r.sp[0] === 1).length / win.length, 3),
            creepIdleShare: creepTicks === 0 ? 0 : round(idleTicks / creepTicks, 3),
            cpuPerTick: round(per(win, (r) => r.cpu), 2),
            cpuMax: round(Math.max(...recs.map((r) => r.cpu)), 2),
            level: last.lvl,
            progress: last.prog,
            ticksToRcl2: firstLevel2 === undefined ? null : firstLevel2.t - recs[0].t,
            ticksToRcl3: firstLevel3 === undefined ? null : firstLevel3.t - recs[0].t,
            creepsAtEnd: last.cr.length,
            creepsByRole: countBy(last.cr),
            peakCreeps,
            structures: snap.structures,
            sites: snap.sites,
            sitesTotal: snap.sitesTotal,
            sitesOnWall: snap.onWall,
            extensionSitesNearSourceOrController: snap.extNear,
            sourceCapacity: snap.srcCap,
            energyCapacity: last.sp[2],
            memoryKb: snap.memKb,
            bucket: snap.bucket,
            consoleLines: this.consoleTotal,
            consoleErrors: this.consoleErrors,
            probeMisses: Math.max(0, this.ticksSent - ticks)
        };
    }

    /** Renders the scorecard as Markdown, with the previous run beside it when available. */
    public markdown(summary: ScorecardSummary, previous: ScorecardSummary | null): string
    {
        const p = previous;
        const prevHead = p === null ? "Previous run" : "Previous run (" + p.date + ", " + p.commit + ")";
        const row = (label: string, now: string, before: string, change: string): string =>
            "| " + label + " | " + now + " | " + before + " | " + change + " |";
        const lines: string[] = [];
        lines.push("# Scorecard: " + summary.name + " · " + summary.date + " · " + summary.ticks + " ticks · commit " + summary.commit);
        lines.push("");
        lines.push("| Metric (last " + summary.window + " ticks unless noted) | This run | " + prevHead + " | Change |");
        lines.push("| --- | --- | --- | --- |");
        lines.push(row("Energy harvested / tick", fmt(summary.harvestedPerTick), p ? fmt(p.harvestedPerTick) : "-", p ? delta(summary.harvestedPerTick, p.harvestedPerTick, 2) : ""));
        lines.push(row("Energy wasted at source regeneration (sum)", fmt(summary.wastedEnergy), p ? fmt(p.wastedEnergy) : "-", p ? delta(summary.wastedEnergy, p.wastedEnergy, 0) : ""));
        lines.push(row("Controller progress / tick", fmt(summary.upgradePerTick), p ? fmt(p.upgradePerTick) : "-", p ? delta(summary.upgradePerTick, p.upgradePerTick, 2) : ""));
        lines.push(row("Construction progress / tick", fmt(summary.buildPerTick), p ? fmt(p.buildPerTick) : "-", p ? delta(summary.buildPerTick, p.buildPerTick, 2) : ""));
        lines.push(row("Energy delivered to spawn and extensions / tick", fmt(summary.transferToSpawnPerTick), p ? fmt(p.transferToSpawnPerTick) : "-", p ? delta(summary.transferToSpawnPerTick, p.transferToSpawnPerTick, 2) : ""));
        lines.push(row("Spawn idle while energy is full", pct(summary.spawnIdleFullShare), p ? pct(p.spawnIdleFullShare) : "-", p ? deltaPct(summary.spawnIdleFullShare, p.spawnIdleFullShare) : ""));
        lines.push(row("Spawn busy", pct(summary.spawnBusyShare), p ? pct(p.spawnBusyShare) : "-", p ? deltaPct(summary.spawnBusyShare, p.spawnBusyShare) : ""));
        lines.push(row("Creep ticks idle (no action, no move for " + this.opts.idleAfterTicks + "+ ticks)", pct(summary.creepIdleShare), p ? pct(p.creepIdleShare) : "-", p ? deltaPct(summary.creepIdleShare, p.creepIdleShare) : ""));
        lines.push(row("CPU / tick (average, max)", fmt(summary.cpuPerTick) + ", " + fmt(summary.cpuMax), p ? fmt(p.cpuPerTick) + ", " + fmt(p.cpuMax) : "-", p ? delta(summary.cpuPerTick, p.cpuPerTick, 2) : ""));
        lines.push(row("RCL / progress at end (whole run)", summary.level + " / " + fmt(summary.progress), p ? p.level + " / " + fmt(p.progress) : "-", p ? delta(summary.progress, p.progress, 0) : ""));
        lines.push(row("Ticks to RCL 2 / RCL 3 (whole run)", fmt(summary.ticksToRcl2) + " / " + fmt(summary.ticksToRcl3), p ? fmt(p.ticksToRcl2) + " / " + fmt(p.ticksToRcl3) : "-", p && summary.ticksToRcl2 !== null && p.ticksToRcl2 !== null ? delta(summary.ticksToRcl2, p.ticksToRcl2, 0) : ""));
        lines.push(row("Energy harvested (whole run)", fmt(summary.harvestedTotal), p ? fmt(p.harvestedTotal) : "-", p ? delta(summary.harvestedTotal, p.harvestedTotal, 0) : ""));
        lines.push(row("Build energy spent on roads (share of all build energy)", pct(summary.roadBuildShare), p ? pct(p.roadBuildShare) : "-", p ? deltaPct(summary.roadBuildShare, p.roadBuildShare) : ""));
        lines.push(row("Road tiles: total / on wall / disconnected from the spawn network (end)", summary.roads.total + " / " + summary.roads.onWall + " / " + summary.roads.disconnected,
            p && p.roads ? p.roads.total + " / " + p.roads.onWall + " / " + p.roads.disconnected : "-", p && p.roads ? delta(summary.roads.disconnected, p.roads.disconnected, 0) : ""));
        lines.push(row("Roads reach (end): sources, controller", summary.roads.reachesSources + " of " + summary.roads.sourcesTotal + ", " + (summary.roads.reachesController ? "yes" : "no"),
            p && p.roads ? p.roads.reachesSources + " of " + p.roads.sourcesTotal + ", " + (p.roads.reachesController ? "yes" : "no") : "-", ""));
        lines.push(row("Extensions and towers farther than 8 tiles from the spawn (end)", fmt(summary.extensionsTowersFarFromSpawn), p ? fmt(p.extensionsTowersFarFromSpawn) : "-", p ? delta(summary.extensionsTowersFarFromSpawn, p.extensionsTowersFarFromSpawn, 0) : ""));
        lines.push(row("Construction sites on wall terrain (end)", fmt(summary.sitesOnWall), p ? fmt(p.sitesOnWall) : "-", p ? delta(summary.sitesOnWall, p.sitesOnWall, 0) : ""));
        lines.push(row("Extension sites next to a source or the controller (end)", fmt(summary.extensionSitesNearSourceOrController), p ? fmt(p.extensionSitesNearSourceOrController) : "-", p ? delta(summary.extensionSitesNearSourceOrController, p.extensionSitesNearSourceOrController, 0) : ""));
        lines.push(row("Creeps at end (peak)", summary.creepsAtEnd + " (" + summary.peakCreeps + ")", p ? p.creepsAtEnd + " (" + p.peakCreeps + ")" : "-", p ? delta(summary.creepsAtEnd, p.creepsAtEnd, 0) : ""));
        lines.push(row("Ticks with hostile creeps in the room (whole run)", fmt(summary.hostileTicks), p ? fmt(p.hostileTicks) : "-", p ? delta(summary.hostileTicks, p.hostileTicks, 0) : ""));
        lines.push(row("Attacks on us / damage taken / damage dealt (whole run)", summary.attacksReceived + " / " + fmt(summary.damageTaken) + " / " + fmt(summary.damageDealt),
            p ? p.attacksReceived + " / " + fmt(p.damageTaken) + " / " + fmt(p.damageDealt) : "-", p ? delta(summary.damageTaken, p.damageTaken, 0) : ""));
        lines.push(row("Our creeps lost before old age / structures destroyed (whole run)", summary.creepsLostEarly + " / " + summary.structuresDestroyed,
            p ? p.creepsLostEarly + " / " + p.structuresDestroyed : "-", p ? delta(summary.creepsLostEarly, p.creepsLostEarly, 0) : ""));
        lines.push(row("Towers at end: count, energy held", summary.towerCount + ", " + fmt(summary.towerEnergy), p ? p.towerCount + ", " + fmt(p.towerEnergy) : "-", p ? delta(summary.towerEnergy, p.towerEnergy, 0) : ""));
        lines.push(row("Safe mode ticks (whole run), activations left", fmt(summary.safeModeTicks) + ", " + summary.safeModeAvailable, p ? fmt(p.safeModeTicks) + ", " + p.safeModeAvailable : "-", ""));
        lines.push("");
        lines.push("Creeps at end by role: " + rolesText(summary.creepsByRole) + ".");
        lines.push("Structures at end: " + recordText(summary.structures) + ". Construction sites: " + summary.sitesTotal + " (" + recordText(summary.sites) + "). Build energy in the window by target: " + recordText(summary.buildByType) + ".");
        lines.push("Room energy capacity " + summary.energyCapacity + "; source capacity " + (summary.sourceCapacity.length ? summary.sourceCapacity.join(" and ") : "unknown") +
            "; Memory " + summary.memoryKb + " KB; bucket " + summary.bucket + ".");
        lines.push("Destroyed in the room during the run, by type: " + recordText(summary.destroyedByType) + ". Healing done: " + fmt(summary.healing) + ".");
        lines.push("Bot console: " + summary.consoleLines + " lines, " + summary.consoleErrors + " with errors (reports/" + summary.name + "-console.log). Probe results missing for " + summary.probeMisses + " ticks.");
        lines.push("");
        lines.push("Timeline, every " + this.opts.snapshotEvery + " ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu");
        lines.push("");
        lines.push("    " + this.timelineLines().join("\n    "));
        lines.push("");
        return lines.join("\n");
    }

    /**
     * Waits for the last console events to arrive from the storage process. Call it before
     * compute() when a test asserts on the final ticks; finish() calls it itself.
     */
    public async settle(ms = 300): Promise<void>
    {
        await new Promise<void>((resolve) => setTimeout(resolve, ms));
    }

    /** Writes all report files, prints the scorecard, restores server.tick() and returns the summary. */
    public async finish(): Promise<ScorecardSummary>
    {
        await this.settle();
        this.detach();
        const summary = this.compute();
        if (summary.ticks < this.opts.minTicks)
        {
            return summary;
        }
        const dir = this.opts.dir;
        fs.mkdirSync(dir, { recursive: true });
        const base = path.join(dir, this.opts.name);
        const jsonPath = base + ".json";
        const prevPath = base + ".prev.json";

        let previous: ScorecardSummary | null = null;
        if (fs.existsSync(jsonPath))
        {
            try
            {
                const old = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
                previous = old.summary || null;
                if (previous !== null)
                {
                    fs.writeFileSync(prevPath, JSON.stringify(previous, null, 2));
                }
            }
            catch (err)
            {
                previous = null;
            }
        }
        else if (fs.existsSync(prevPath))
        {
            try
            {
                previous = JSON.parse(fs.readFileSync(prevPath, "utf8"));
            }
            catch (err)
            {
                previous = null;
            }
        }

        const md = this.markdown(summary, previous);
        fs.writeFileSync(jsonPath, JSON.stringify({ summary, timeline: this.timeline() }));
        fs.writeFileSync(base + ".md", md);
        fs.writeFileSync(path.join(dir, "latest.md"), md);
        fs.writeFileSync(base + "-creeps.txt", this.creepTable());
        fs.writeFileSync(base + "-console.log", this.consoleLog.join("\n") + "\n");
        this.appendHistory(summary);
        console.log("\n" + md);
        return summary;
    }

    private handleConsole(logs: string[], results: unknown[]): void
    {
        for (const line of logs || [])
        {
            this.consoleTotal += 1;
            if (/\bError\b|TypeError|ReferenceError|RangeError/.test(line))
            {
                this.consoleErrors += 1;
            }
            if (this.consoleLog.length < this.opts.maxConsoleLines)
            {
                this.consoleLog.push("[~tick " + this.ticksSent + "] " + line);
            }
        }
        for (const result of results || [])
        {
            const rec = parseProbeResult(result);
            if (rec !== null)
            {
                this.records.set(rec.t, rec);
            }
        }
    }

    private progressLine(): string
    {
        const recs = this.timeline();
        if (recs.length === 0)
        {
            return "[scorecard] tick " + this.ticksSent + " | no probe results yet";
        }
        const last = recs[recs.length - 1];
        const recent = recs.slice(Math.max(0, recs.length - 100));
        const avg = (f: (r: TickRecord) => number): number => round(recent.reduce((a, r) => a + f(r), 0) / recent.length, 2);
        return "[scorecard] tick " + last.t + " | creeps " + last.cr.length + " (" + rolesText(countBy(last.cr)) + ") | harvested/tick " + avg((r) => r.h) +
            " | upgraded/tick " + avg((r) => r.u) + " | energy " + last.sp[1] + "/" + last.sp[2] + " | spawn " + (last.sp[0] === 1 ? "busy" : "idle") +
            " | cpu " + avg((r) => r.cpu) + " | RCL " + last.lvl + " (" + last.prog + ")";
    }

    private timelineLines(): string[]
    {
        const recs = this.timeline();
        const lines: string[] = [];
        const every = this.opts.snapshotEvery;
        let bucket: TickRecord[] = [];
        for (const rec of recs)
        {
            bucket.push(rec);
            if (rec.t % every === 0 || rec === recs[recs.length - 1])
            {
                const n = bucket.length;
                const h = round(bucket.reduce((a, r) => a + r.h, 0) / n, 1);
                const u = round(bucket.reduce((a, r) => a + r.u, 0) / n, 1);
                const cpu = round(bucket.reduce((a, r) => a + r.cpu, 0) / n, 1);
                lines.push(String(rec.t).padStart(5) + " | " + rolesText(countBy(rec.cr)).padEnd(40) + " | " + String(h).padStart(5) + " | " + String(u).padStart(5) +
                    " | " + (rec.sp[1] + "/" + rec.sp[2]).padStart(9) + " | " + (rec.sp[0] === 1 ? "busy" : "idle") + " | " + cpu);
                bucket = [];
            }
        }
        return lines;
    }

    private creepTable(): string
    {
        const lines: string[] = ["Per-creep status every " + this.opts.creepTableEvery + " ticks: name role (x,y) energy ticksToLive state", ""];
        const recs = this.timeline();
        for (const rec of recs)
        {
            if (rec.t % this.opts.creepTableEvery !== 0)
            {
                continue;
            }
            lines.push("tick " + rec.t + ": energy " + rec.sp[1] + "/" + rec.sp[2] + ", spawn " + (rec.sp[0] === 1 ? "busy" : "idle") + ", RCL " + rec.lvl + " (" + rec.prog + ")");
            const statuses = this.creepStatus.get(rec.t) || [];
            for (const s of statuses)
            {
                lines.push("    " + s);
            }
        }
        return lines.join("\n") + "\n";
    }

    private appendHistory(summary: ScorecardSummary): void
    {
        const file = path.join(this.opts.dir, "history.csv");
        const values = HISTORY_COLUMNS.map((col) =>
        {
            const v = (summary as unknown as Record<string, unknown>)[col];
            return v === null || v === undefined ? "" : String(v);
        });
        if (!fs.existsSync(file))
        {
            fs.writeFileSync(file, HISTORY_COLUMNS.join(",") + "\n");
        }
        fs.appendFileSync(file, values.join(",") + "\n");
    }
}

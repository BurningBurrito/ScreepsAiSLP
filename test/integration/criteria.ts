/*
 * Pure checks shared by the acceptance tests. Owner-owned: protect and restore this file like
 * helper.ts and scorecard.ts. Nothing here touches the server; every function takes data the
 * test already has (the scorecard timeline, the room objects from the world database, the
 * source tree) and returns numbers with enough detail for a useful failure message.
 */
import * as fs from "fs";
import * as path from "path";
import { TickRecord } from "./scorecard";

/** A room object as the mockup's world.roomObjects() returns it (a database row). */
export interface RoomObjectLike
{
    type: string;
    x: number;
    y: number;
    [key: string]: unknown;
}

export interface Pos
{
    x: number;
    y: number;
}

export interface MinerViolation
{
    name: string;
    tick: number;
    distance: number;
}

export interface MinerReport
{
    /** Distinct creeps with the miner role seen in the timeline. */
    miners: number;
    /** Miners that reached range 1 of a source at least once. */
    arrived: number;
    /** Ticks on which a miner that had reached its source was farther than range 1 from it. */
    violations: MinerViolation[];
}

export interface ContainerReport
{
    containers: number;
    sourcesWithContainer: number;
}

export interface IdleStreak
{
    streak: number;
    startTick: number;
}

export interface SourceScan
{
    hardcodedPositions: string[];
    randomInRoles: string[];
}

/** Chebyshev distance: the game's range between two positions. */
export function chebyshev(a: Pos, b: Pos): number
{
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

/** Energy per tick the sources can give: the sum of their capacities over one regeneration period. */
export function ceilingPerTick(capacities: number[], regenTicks = 300): number
{
    return capacities.reduce((acc, c) => acc + c, 0) / regenTicks;
}

/** Counts containers in the room and how many sources have at least one container on an adjacent tile. */
export function containersBySource(objects: RoomObjectLike[]): ContainerReport
{
    const sources = objects.filter((o) => o.type === "source");
    const containers = objects.filter((o) => o.type === "container");
    let covered = 0;
    for (const source of sources)
    {
        if (containers.some((c) => chebyshev(c, source) <= 1))
        {
            covered += 1;
        }
    }
    return { containers: containers.length, sourcesWithContainer: covered };
}

/**
 * A miner, once within range 1 of a source, is expected to stay within range 1 of that source
 * for the rest of its life. Spawning creeps are ignored. Each miner is tied to the first source
 * it reaches.
 */
export function minerStaysPut(timeline: TickRecord[], sources: Pos[], role = "miner"): MinerReport
{
    const assigned = new Map<string, number>();
    const seen = new Set<string>();
    const violations: MinerViolation[] = [];
    for (const rec of timeline)
    {
        for (const row of rec.cr)
        {
            const [id, name, creepRole, x, y, , spawning] = row;
            if (creepRole !== role || spawning === 1)
            {
                continue;
            }
            seen.add(id);
            const pos = { x, y };
            const index = assigned.get(id);
            if (index === undefined)
            {
                const near = sources.findIndex((s) => chebyshev(pos, s) <= 1);
                if (near >= 0)
                {
                    assigned.set(id, near);
                }
            }
            else
            {
                const distance = chebyshev(pos, sources[index]);
                if (distance > 1)
                {
                    violations.push({ name, tick: rec.t, distance });
                }
            }
        }
    }
    return { miners: seen.size, arrived: assigned.size, violations };
}

/** Longest run of consecutive ticks on which the spawn was not spawning while energyAvailable was at capacity. */
export function maxSpawnIdleFullStreak(timeline: TickRecord[]): IdleStreak
{
    let best = 0;
    let bestStart = 0;
    let current = 0;
    let currentStart = 0;
    for (const rec of timeline)
    {
        const idleFull = rec.sp[0] === 0 && rec.sp[2] > 0 && rec.sp[1] >= rec.sp[2];
        if (idleFull)
        {
            if (current === 0)
            {
                currentStart = rec.t;
            }
            current += 1;
            if (current > best)
            {
                best = current;
                bestStart = currentStart;
            }
        }
        else
        {
            current = 0;
        }
    }
    return { streak: best, startTick: bestStart };
}

function walk(dir: string): string[]
{
    const out: string[] = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }))
    {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory())
        {
            out.push(...walk(full));
        }
        else if (entry.isFile())
        {
            out.push(full);
        }
    }
    return out;
}

/**
 * Scans the bot's source tree for the two anti-patterns the milestone spec names:
 * positions written as number literals, and Math.random in role files.
 * Returns file:line references relative to srcDir.
 */
export function scanSourceFiles(srcDir: string): SourceScan
{
    const hardcodedPositions: string[] = [];
    const randomInRoles: string[] = [];
    if (!fs.existsSync(srcDir))
    {
        return { hardcodedPositions, randomInRoles };
    }
    const files = walk(srcDir).filter((f) => f.endsWith(".ts"));
    for (const file of files)
    {
        const rel = path.relative(srcDir, file).replace(/\\/g, "/");
        const lines = fs.readFileSync(file, "utf8").split("\n");
        lines.forEach((line, i) =>
        {
            const ref = rel + ":" + (i + 1);
            if (/new\s+RoomPosition\s*\(\s*\d/.test(line) || /createConstructionSite\s*\(\s*\d+\s*,\s*\d/.test(line))
            {
                hardcodedPositions.push(ref);
            }
            if (rel.startsWith("roles/") && /\bMath\.random\s*\(/.test(line))
            {
                randomInRoles.push(ref);
            }
        });
    }
    return { hardcodedPositions, randomInRoles };
}

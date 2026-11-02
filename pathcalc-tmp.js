/* Throwaway diagnostic: A* over the W0N1 stub terrain, no engine.
 * Not part of the project; deleted before commit. */
const rooms = require("./node_modules/screeps-server-mockup/assets/rooms.json");

const serial = rooms.W0N1.serial;
const WALL = 1;
const SWAMP = 2;
const isWall = (x, y) => x < 0 || y < 0 || x > 49 || y > 49 || serial[y * 50 + x] === String(WALL);
const isSwamp = (x, y) => x >= 0 && y >= 0 && x <= 49 && y <= 49 && serial[y * 50 + x] === String(SWAMP);

/** Extra tiles that block movement (sources; the spawn is walkable). */
function makeBlocked(blocked) {
    const set = new Set(blocked.map((b) => b.x + "," + b.y));
    return (x, y) => set.has(x + "," + y);
}

/**
 * Dijkstra over the 8-neighbourhood with screeps corner-cut rules.
 * @param {object} from start {x,y}
 * @param {object} to goal {x,y}
 * @param {number} swampCost cost of entering a swamp tile
 * @param {function} isBlocked predicate
 * @returns {number} total opcosts, or Infinity
 */
function pathCost(from, to, swampCost, isBlocked) {
    const startKey = from.y * 50 + from.x;
    const goalKey = to.y * 50 + to.x;
    const dist = new Map([[startKey, 0]]);
    const prev = new Map();
    // Simple priority queue by array sort (50x50 grid is tiny).
    const open = [[0, startKey]];
    while (open.length > 0) {
        open.sort((a, b) => a[0] - b[0]);
        const [d, cur] = open.shift();
        if (cur === goalKey) {
            return d;
        }
        if (d > (dist.get(cur) ?? Infinity)) {
            continue;
        }
        const cx = cur % 50;
        const cy = Math.floor(cur / 50);
        for (let dx = -1; dx <= 1; dx += 1) {
            for (let dy = -1; dy <= 1; dy += 1) {
                if (dx === 0 && dy === 0) {
                    continue;
                }
                const nx = cx + dx;
                const ny = cy + dy;
                if (isWall(nx, ny) || isBlocked(nx, ny)) {
                    continue;
                }
                if (dx !== 0 && dy !== 0 && (isWall(cx + dx, cy) || isWall(cx, cy + dy))) {
                    continue; // corner cut through walls is not walkable
                }
                const cost = isSwamp(nx, ny) ? swampCost : 1;
                const nd = d + cost;
                const nk = ny * 50 + nx;
                if (nd < (dist.get(nk) ?? Infinity)) {
                    dist.set(nk, nd);
                    prev.set(nk, cur);
                    open.push([nd, nk]);
                }
            }
        }
    }
    return Infinity;
}

const SPAWN = { x: 13, y: 20 };
const CTR = { x: 8, y: 43 };
const SRC_A = { x: 14, y: 18 };
const SRC_B = { x: 39, y: 14 };
const SOURCES = [SRC_A, SRC_B];

const blocked = makeBlocked(SOURCES);
function paths(label, from) {
    const out = {};
    for (const [sw, name] of [[5, "swamp5"], [2, "swamp2"]]) {
        out[label + "toSpawn_" + name] = pathCost(from, SPAWN, sw, blocked);
        out[label + "toCtl_" + name] = pathCost(from, CTR, sw, blocked);
    }
    return out;
}

console.log(JSON.stringify({
    spawnToSrcA: paths("spawn", SPAWN),
    spawnToSrcB: paths("spawnB", SPAWN),
    spawnToCtl: paths("spawn", SPAWN),
    srcA: { ...paths("srcA", SRC_A), toSpawn5: pathCost(SRC_A, SPAWN, 5, blocked) },
    srcB: { ...paths("srcB", SRC_B), toSpawn5: pathCost(SRC_B, SPAWN, 5, blocked) },
    srcAToSrcB_swamp5: pathCost(SRC_A, SRC_B, 5, blocked),
    srcAToCtl_swamp2: pathCost(SRC_A, CTR, 2, blocked),
    srcBToCtl_swamp2: pathCost(SRC_B, CTR, 2, blocked),
    adjA: adjTiles(SRC_A),
    adjB: adjTiles(SRC_B),
}));

function adjTiles(src) {
    const out = [];
    for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
            if (dx === 0 && dy === 0) {
                continue;
            }
            const x = src.x + dx;
            const y = src.y + dy;
            if (isWall(x, y) || blocked(x, y)) {
                continue;
            }
            out.push({
                x,
                y,
                swamp: isSwamp(x, y),
                dSpawn2: pathCost({ x, y }, SPAWN, 2, blocked),
                dSpawn5: pathCost({ x, y }, SPAWN, 5, blocked),
                dCtl2: pathCost({ x, y }, CTR, 2, blocked),
            });
        }
    }
    return out;
}

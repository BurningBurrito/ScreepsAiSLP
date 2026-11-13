/**
 * Spawn manager - decides when to spawn creeps and with which bodies.
 *
 * Body sizing (owner rule #5):
 *   Every role is sized from room.energyCapacityAvailable - the long-term
 *   maximum the room will support - never from the temporarily low
 *   room.energyAvailable. We pick the largest template that fits the capacity
 *   and only tell the spawn to spawn when the room can pay for the body, so
 *   a creep is never shrunken because the store happens to be low this tick.
 *   The exceptions are a WIPED income crew (no harvester AND no miner alive:
 *   the first income is sized from energyAvailable, or the store is never
 *   refilled and the colony cannot recover) and a wiped hauler crew in a
 *   container room (same one-tick logic, owner feedback 2026-11-02).
 *   The one tick of waiting is deliberate: while income is ALIVE but below
 *   its minimum, sizing from the partially filled store ratchets the income
 *   body down (a 1-WORK harvester) and never replaces it at full size, which
 *   cost M3 its 1-WORK ratchet in 2026-11-11 (commit 1404382). What protects
 *   that waiting tick now is the income hold-back in utils/energy: the pool
 *   rung refuses to serve builders while the income crew is below its
 *   minimum, so the store climbs to capacity and the full-size replacement
 *   starts instead of the shrunken one.
 *
 * Income protection (owner feedback 2026-11-02):
 *   1. Cold boot: no harvester AND no miner alive means nothing can harvest,
 *      so the store is never refilled and no capacity-sized body can ever
 *      start - a wiped colony would stay dead. The first thing the spawn
 *      does is start the largest harvester the store can pay for right now
 *      (sized from energyAvailable, see sizingBudgetFor).
 *   2. Income floor: while fewer than ENERGY_INCOME_FLOOR of the income
 *      roles (harvester + miner + hauler) are alive, the next spawn goes to
 *      one of them before any upgrader, builder or defender. Single
 *      exception: not in peace mode and no tower can fire, in which case a
 *      defender below its minimum takes priority over income.
 *
 * Spawn order (owner rule #5): harvester, then builder, then upgrader, then
 * defender, then hauler. At most ONE spawn is started per tick: a spawnCreep
 * call is stored as an engine "intent" that only resolves at the end of the
 * tick, and the engine keeps at most one createCreep intent per spawn - a
 * second spawnCreep call in the same tick overwrites the first one and the
 * first creep is silently never spawned. The remaining roles are picked up
 * from the next tick onward (the spawn is busy for three ticks per body part
 * anyway).
 *
 * Surplus spawning (owner feedback 2026-10-30, ratio 2026-11-12):
 *   The minimums keep the colony alive, not busy. While every minimum is
 *   met AND the store has climbed to the surplus gate, checkAndSpawn spends
 *   the idle energy on one extra creep, in this order:
 *     1. Harvester - the source no living harvester is assigned to (one per
 *        source, never more). The source is passed to the spawn explicitly:
 *        assignSource's score would re-pick the covered source on a tie.
 *     2. Upgrader - the fixed 2-per-tick (more with a bigger body) energy
 *        sink at the controller; this is what keeps the store cycling
 *        instead of sitting full.
 *     3. Builder - while sites exist, one more beyond the minimum crew.
 *   The gate and the caps depend on the controller level (M2 gate failure
 *   of 2026-11-12 20:11, see SURPLUS_VALVE_MIN_LEVEL in config.ts): at
 *   SURPLUS_VALVE_MIN_LEVEL and above the gate is 90 % of capacity
 *   (SURPLUS_SPAWN_ENERGY_RATIO - a pressure valve) and the caps are
 *   SURPLUS_UPGRADER_MAX / SURPLUS_BUILDER_MAX; below it the store must be
 *   completely full and the pre-2026-11-12 caps apply
 *   (SURPLUS_UPGRADER_MAX_LOW / SURPLUS_BUILDER_MAX_LOW) - the M5 valve and
 *   caps would starve the builder at RCL 1-2, where the 300-energy pool
 *   refills at only ~3-4 energy per tick.
 *   This deliberately inverts rule 02b's builder-before-upgrader order for
 *   the surplus step: an upgrader parks within range 3 and spends
 *   reliably, a builder's spend is walk-limited, and the surplus upgrader
 *   is what lands RCL 2 inside the 500-tick smoke window.
 */

import { CONTAINER_BOOST_MIN_LEVEL, CONTAINER_HAULER_SPARE, CONTROLLER_CONTAINER_RANGE, ENERGY_INCOME_FLOOR, MIN_CREEPS_BY_LEVEL, SURPLUS_BUILDER_MAX, SURPLUS_BUILDER_MAX_LOW, SURPLUS_SPAWN_ENERGY_RATIO, SURPLUS_UPGRADER_MAX, SURPLUS_UPGRADER_MAX_LOW, SURPLUS_VALVE_MIN_LEVEL, UNCOVERED_SOURCE_HARVESTERS_L4 } from "config";
import { collectOccupiedTiles, countStandableTiles } from "utils/pickSource";

/** Roles checked each tick, highest priority first (owner rule #5). The miner
 *  leads from M5 on: once a source has a built container its worker is the
 *  stationary miner, and it must be out before another bootstrap harvester is
 *  queued for the still-container-less source. */
const SPAWN_ORDER: Role[] = ["miner", "harvester", "builder", "upgrader", "defender", "hauler"];

/**
 * Surplus spawn order (see the file header): only runs once every role is at
 * its minimum AND the energy store is full, so the spawn never idles with an
 * unused store. Harvester first (it covers a source nobody mines), then the
 * upgrader (the room's fixed energy sink), then one more builder while sites
 * exist.
 */
const SURPLUS_ORDER: Role[] = ["harvester", "upgrader", "builder"];

/**
 * Income roles, in spawn priority order: the creeps that keep energy flowing
 * (miner and harvester pull it out of the sources, hauler moves it to the
 * store). The income floor (ENERGY_INCOME_FLOOR, owner feedback 2026-11-02)
 * keeps this crew ahead of every other role while it is short.
 */
const INCOME_ROLES: Role[] = ["miner", "harvester", "hauler"];

/**
 * Body templates per role, largest first. The first template whose cost fits
 * the sizing budget (the room's energy capacity) is used, so bodies are
 * always sized for the long term. Costs follow the game's body part prices:
 * WORK 100, CARRY 50, MOVE 50.
 *
 * This is a function, not a const: the part constants (WORK, CARRY, MOVE)
 * only exist inside the Screeps sandbox, and unit tests import this module
 * in plain Node where they are undefined. Evaluating the tables only when
 * spawning keeps the module import safe.
 *
 * @param room The room to spawn in: the upgrader's table depends on whether
 * its energy is brought to it by a controller container
 */
function bodyTemplates(room: Room): Record<Role, BodyPartConstant[][]>
{
    return {
    miner: [
        // Stationary miner (M5): five WORK empties a source in exactly its
        // 300-tick refill cycle, so the source never accumulates energy that
        // the refill would waste. The CARRY buffer only sets how often the
        // miner pauses to dump into its container; one MOVE reaches the
        // container tile and the miner never moves again.
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], // 800
        [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE], // 700
        [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE], // 600
        [WORK, WORK, WORK, CARRY, CARRY, MOVE], // 450
        [WORK, WORK, CARRY, CARRY, MOVE], // 350
        [WORK, CARRY, MOVE], // 200
    ],
    harvester: [
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 500
        // M5 (2026-11-12): the second CARRY halves the delivery round
        // trips - a 3-WORK harvester fills 100 energy in ~17 ticks instead
        // of 50 in ~8, and the extra 50 of spawn cost is paid back inside
        // one trip. The M5 window needs ~13 harvested per tick and the
        // 1-CARRY body caps each harvester near 1 per tick on the source
        // round trip.
        [WORK, WORK, WORK, CARRY, CARRY, MOVE], // 450
        [WORK, WORK, WORK, CARRY, MOVE], // 400
        [WORK, WORK, CARRY, MOVE], // 300
        [WORK, CARRY, MOVE], // 200
    ],
    builder: [
        // M5 (2026-11-12): the RCL 5 capacity (550) buys the full
        // 4-WORK body - 200 build per tick at RCL 4+ - which is what the
        // static-mining build wave (tower, two source containers, the
        // extension floor, controller container) needs inside its window.
        [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], // 550
        [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], // 500
        [WORK, WORK, WORK, CARRY, MOVE], // 400
        [WORK, WORK, CARRY, MOVE], // 300
        [WORK, CARRY, MOVE], // 200
    ],
    upgrader: hasControllerContainer(room)
        ? [
            // Energy comes to the upgrader: a filled container within range 3
            // of the controller means it only walks there once, so one MOVE
            // reaches it and every spare part is WORK (owner feedback
            // 2026-11-02: a big upgrader with few MOVE parts only makes
            // sense when energy comes to it).
            [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], // 800
            [WORK, WORK, WORK, WORK, CARRY, MOVE], // 500
            [WORK, WORK, CARRY, MOVE], // 300
            [WORK, CARRY, MOVE], // 200
        ]
        : [
            // No controller container yet: the upgrader walks to fetch its
            // energy, so it keeps at least one MOVE part per two other parts
            // (road walking) plus the CARRY that makes each trip pay - a
            // 7-WORK / 1-MOVE body crawled one tile per several ticks in the
            // owner's room (owner feedback 2026-11-02).
            // The 300 row is the historical pre-container body (2 WORK, 1
            // MOVE) and must stay as expensive as the whole RCL 1 capacity:
            // a cheaper body lets the upgrader spawn while only one or two
            // harvesters are alive, and its building work - limited by the
            // 50% withdrawal floor in the builder role - pins the store at
            // 150, below the 200 the next harvester costs, so the income
            // crew never grows and construction stalls (the M4 regression
            // of 2026-11-03). Once the first extension raises the capacity
            // to 350, the balanced 350 body takes over.
            [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], // 750
            [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], // 500
            // M5 (2026-11-12): fills the 400-energy gap between the 350
            // and 500 rows - at RCL 4 (400 capacity) the walking upgrader
            // used to stay on the 350 body and waste 50 of capacity. One
            // MOVE is enough from RCL 4 on: the pool rung (rung 3 of
            // getEnergy in utils/energy.ts) hands it energy a few tiles
            // from the controller, so the long walk to the source
            // container is gone and the spare part is WORK.
            [WORK, WORK, WORK, CARRY, MOVE], // 400
            [WORK, WORK, CARRY, MOVE, MOVE], // 350
            [WORK, WORK, CARRY, MOVE], // 300
            [WORK, CARRY, MOVE], // 200
        ],
    hauler: [
        // Haulers: pairs of CARRY+MOVE, one MOVE per two CARRY is enough on
        // roads. Haulers never carry WORK parts (owner rule #1).
        // 1000 energy per trip (M5 fault 4): at RCL 5 the two source
        // containers hold 20 energy per tick, and one hauler with the 600
        // body below empties a cycle in ~60 ticks = 10 per tick - the
        // containers stay full and the miners drop. Two haulers with this
        // body move 25 per tick, ahead of the income. 10 MOVE keeps the 20
        // CARRY moving every tick on roads (2 fatigue per part per step vs
        // 2 per MOVE part per tick).
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], // 1500
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // 800
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 550
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 500
        [CARRY, CARRY, MOVE, MOVE], // 200
    ],
    defender: [
        // The defender is a last-resort attacker (M4): it never harvests and
        // never transfers energy, so the old CARRY part was dead weight.
        // Bodies are ATTACK+MOVE pairs, as many pairs as the energy allows:
        // one MOVE per ATTACK part reaches a hostile on plain ground (owner
        // feedback 2026-11-02: bodies must match the job).
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], // 520
        [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], // 390
        [ATTACK, ATTACK, MOVE, MOVE], // 260
        [ATTACK, MOVE], // 130
    ],
    };
}

/**
 * Ensures creepCounter is initialized in Memory (it can be missing right
 * after a fresh world or a global reset).
 */
function ensureCreepCounter(): void
{
    if (Memory.creepCounter === undefined)
    {
        Memory.creepCounter = 0;
    }
}

/**
 * Counts the alive creeps of a role.
 * @param role The role to count
 * @returns The number of alive creeps with that role
 */
function getCreepCount(role: Role): number
{
    return Object.values(Game.creeps).filter((creep) => creep.memory.role === role).length;
}

/**
 * Total energy cost of a body (WORK 100, CARRY 50, MOVE 50, ...).
 * @param body The body to price
 * @returns The energy cost
 */
function bodyCost(body: BodyPartConstant[]): number
{
    let cost = 0;
    for (const part of body)
    {
        cost += BODYPART_COST[part];
    }
    return cost;
}

/**
 * Whether a finished container sits within range 3 of the controller.
 * From M5 on that container is the upgrader's energy source, and it is also
 * the switch that decides how the upgrader's body is built (see
 * bodyTemplates): once the energy comes to the upgrader, WORK is maximised
 * and one MOVE part is enough.
 * @param room The room to check
 * @returns True when a container feeds the controller's neighbourhood
 */
function hasControllerContainer(room: Room): boolean
{
    const controller = room.controller;
    if (controller === undefined)
    {
        return false;
    }
    return room.find(FIND_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_CONTAINER &&
            // A container supplies energy to a creep standing on or next to
            // it; range 3 is the M5 spec's distance ("a container within
            // range 3 of the controller").
            structure.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE,
    }).length > 0;
}

/**
 * Picks the largest body template that fits the sizing budget.
 * @param room The room to spawn in (the upgrader's table depends on it)
 * @param role The role to build a body for
 * @param budget The energy capacity the body must fit into
 * @returns The chosen body and its cost, or null when nothing fits
 */
function pickBody(room: Room, role: Role, budget: number): { body: BodyPartConstant[]; cost: number } | null
{
    for (const template of bodyTemplates(room)[role])
    {
        if (template.length <= MAX_CREEP_SIZE && bodyCost(template) <= budget)
        {
            return { body: template, cost: bodyCost(template) };
        }
    }
    return null;
}

/**
 * Whether any of the room's towers has enough energy to fire (M4: the
 * defender slot exists only when the towers are dry).
 *
 * Guarded for plain Node: the engine constant TOWER_POWER_ATTACK is missing
 * outside the sandbox, and the mock rooms never hold a loaded tower, so
 * "cannot fire" is the safe answer there.
 * @param room The room to check
 * @returns True when at least one tower can fire one shot
 */
function towerCanFire(room: Room): boolean
{
    if (typeof TOWER_POWER_ATTACK !== "number")
    {
        return false;
    }
    return room.find(FIND_MY_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_TOWER &&
            structure.store.getUsedCapacity(RESOURCE_ENERGY) >= TOWER_POWER_ATTACK,
    }).length > 0;
}

/**
 * Computes the minimum population per role for this room.
 *
 * The base row comes from the controller level (see MIN_CREEPS_BY_LEVEL):
 * the bootstrap phase needs a short queue (harvester, builder, upgrader -
 * the upgrader has to be alive within the first 500 ticks or the smoke
 * test sees no controller progress), while the RCL 3 world needs five
 * harvesters to feed the builders. A room without a controller (unit test
 * mocks) counts as level 1.
 *
 * Builders: only while something is under construction.
 * Haulers: only once a container is actually built (stage 2 economy) -
 * until then they would just park next to the spawn (owner rule #1).
 * @param room The room to compute minimums for
 * @returns The minimum number of alive creeps per role
 */
function minCreepsPerRole(room: Room): Record<Role, number>
{
    const siteCount = room.find(FIND_CONSTRUCTION_SITES).length;

    const level = room.controller !== undefined ? room.controller.level : 1;
    // The last row whose level is at or below the controller's level: the
    // table is sorted ascending, so later rows overwrite earlier ones.
    let row = MIN_CREEPS_BY_LEVEL[0];
    for (const entry of MIN_CREEPS_BY_LEVEL)
    {
        if (level >= entry.level)
        {
            row = entry;
        }
    }

    const containerCount = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    }).length;

    // M5: split the source workers by source state instead of a level table.
    // A source that has a built container on a neighbour tile is mined by a
    // stationary miner; every other source is still served by bootstrap
    // harvesters. The two counts sum to the number of sources, so the colony
    // transitions source by source as the containers come up - there is never
    // an unmined source (waste) and never a miner and a harvester stacked on
    // the same source. Until the first container this is simply "all
    // harvesters", which keeps the M1-M4 bootstrap unchanged.
    //
    // M5 (2026-11-10, owner feedback v9.2 idea a): at level 4 and up an
    // uncovered source keeps TWO harvesters, not one. By RCL 4-5 the miner
    // body tops out at 2-3 WORK (4-6 energy per tick - the room holds
    // 300-450 energy) and can no longer drain a source's 10-per-tick refill
    // on its own, so a source still needs a walking harvester beside the
    // miner to get its energy out. This is what idea-a's run was missing:
    // harvestedShare 0.488 and harvest 9.08/tick with the first container
    // built in tick 3369. Below level 4 the bootstrap table rows (row.max
    // below) already cover every source, so the split stays at one worker
    // per container-less source there.
    const sources = room.find(FIND_SOURCES);
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    });
    let minerCount = 0;
    let harvesterCount = 0;
    for (const source of sources)
    {
        const hasContainer = containers.some((container) => container.pos.getRangeTo(source) <= 1);
        if (hasContainer)
        {
            minerCount += 1;
        }
        else
        {
            harvesterCount += level >= CONTAINER_BOOST_MIN_LEVEL
                ? UNCOVERED_SOURCE_HARVESTERS_L4
                : 1;
        }
    }

    // While no container is built (bootstrap stage), the level-table row
    // adds surplus harvesters on top of the per-source coverage: the
    // pre-M5 economy. The M3 contract (tower plus extensions before roads
    // inside 4,000 ticks from an RCL 3 start) was tuned to the level 3 row
    // (five harvesters feeding the builder crew); the per-source split alone
    // leaves two harvesters in that world and ends the run with one finished
    // extension and capacity 350 instead of 3 (M3 regression of 2026-11-01,
    // introduced by the source-state minimums of d108b29). Once the first
    // container is up, the miners take the covered sources over and the
    // split alone suffices again - a surplus harvester on a mined source
    // would only fight the stationary miner (M5 design).
    if (containerCount === 0)
    {
        harvesterCount = Math.max(harvesterCount, row.harvester);
    }

    // M4: a defender is a last-resort attacker. It exists only while the
    // colony is in defend or war mode AND no tower can fire - if any tower
    // still has a shot, the tower handles the hostile and the energy stays
    // with the economy. In peace the minimum is zero.
    const mode = Memory.mode ?? "peace";
    const defender = mode !== "peace" ? (towerCanFire(room) ? 0 : 1) : 0;

    return {
        miner: minerCount,
        harvester: harvesterCount,
        builder: siteCount > 0 ? row.builder : 0,
        upgrader: row.upgrader,
        // M5 fault 4: at least ONE hauler per source container (2 at level
        // 5) - minerCount counts exactly the sources with a built neighbour
        // container. A single hauler cannot serve 30 extensions, 2 towers
        // and the spawn (owner feedback 2026-11-04).
        // M5 (2026-11-10, owner feedback v9.2 idea a): from level 4 up the
        // colony also keeps CONTAINER_HAULER_SPARE (two, raised from one
        // for the 2026-11-12 build wave) extra haulers on top of the
        // per-container minimum: a hauler that dies is only replaced on
        // the next spawn tick, and at RCL 5 a dead hauler is the single
        // point of failure between the source containers and every
        // consumer - the containers drop while it is out.
        hauler: minerCount > 0
            ? Math.max(row.hauler, minerCount)
                + (level >= CONTAINER_BOOST_MIN_LEVEL ? CONTAINER_HAULER_SPARE : 0)
            : 0,
        defender,
    };
}

/**
 * True while fewer upgraders are alive than this room's minimum.
 *
 * The builder reads this to hold back its energy withdrawals (see the
 * energy-loop paragraph in src/roles/builder.ts): the upgrader's body costs
 * the whole RCL 1 capacity (300), and the builder's 50% withdrawal floor
 * pins the store below that, so without the hold-back the first upgrader -
 * and with it the controller progress the smoke test measures - never
 * spawns. Same minimum the spawn manager itself enqueues against, so the
 * hold-back ends exactly when the upgrader can spawn.
 * @param room The room to check
 * @returns True when the alive upgrader count is below its minimum
 */
export function upgraderBelowMinimum(room: Room): boolean
{
    return getCreepCount("upgrader") < minCreepsPerRole(room).upgrader;
}

/**
 * True while fewer income creeps (miner, harvester, hauler) are alive than
 * this room's minimum.
 *
 * The builder reads this to hold back its pool withdrawals (see the pool
 * rung in utils/energy.ts): the income replacements are sized from the
 * room's CAPACITY (owner rule #5), and the builder's own drain keeps the
 * store below that body cost, so without the hold-back a dead harvester's
 * full-size replacement never starts and the crew ratchets down one
 * shrunken body at a time (the M3 death spiral of 2026-11-11: 2 creeps at
 * tick 4000 while the store never reached the 300-energy body). While the
 * hold-back is on, the builder refuels from a source instead, the store
 * climbs to capacity, and the full-size replacement starts. Same minimums
 * the spawn manager enqueues against, so the hold-back ends exactly when
 * the crew is back.
 * @param room The room to check
 * @returns True while the income crew is below its minimum
 */
export function incomeBelowMinimum(room: Room): boolean
{
    const minimums = minCreepsPerRole(room);
    const income =
        getCreepCount("miner") + getCreepCount("harvester") + getCreepCount("hauler");
    return income < minimums.miner + minimums.harvester + minimums.hauler;
}

/**
 * Assigns a source to a new harvester.
 *
 * Balance by remaining capacity, not by count: a source in a wall pocket
 * has very few standable tiles (the test room's pocket source has exactly
 * two), so a plain fewest-harvesters rule would keep sending a third
 * harvester to the pocket that is already full. Each candidate source is
 * scored as standable tiles minus living harvesters already assigned to it,
 * and the highest score wins. Only when every source is full (all scores
 * zero or below) does it fall back to the fewest-assigned source - someone
 * still has to be assigned somewhere.
 *
 * The assignment is stored in the creep's Memory and survives global
 * resets; when a harvester dies, its slot frees up and the next spawn
 * rebalances.
 * @param room The room to assign a source in
 * @returns The id of the chosen source, or undefined when the room has none
 */
function assignSource(room: Room): string | undefined
{
    const sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length === 0)
    {
        return undefined;
    }

    const counts: Record<string, number> = {};
    for (const source of sources)
    {
        counts[source.id] = 0;
    }
    for (const name in Game.creeps)
    {
        const creep = Game.creeps[name];
        if (creep.memory.role === "harvester" && creep.memory.sourceId !== undefined)
        {
            if (counts[creep.memory.sourceId] !== undefined)
            {
                counts[creep.memory.sourceId] += 1;
            }
        }
    }

    const occupied = collectOccupiedTiles(room, "");
    let best = sources[0];
    let bestScore = -1;
    for (const source of sources)
    {
        const score = countStandableTiles(source, room, occupied) - counts[source.id];
        if (score > bestScore)
        {
            bestScore = score;
            best = source;
        }
    }
    if (bestScore <= 0)
    {
        // Every source is crowded: fall back to the least-assigned one, it
        // frees up whenever one of its harvesters dies.
        for (const source of sources)
        {
            if (counts[source.id] < counts[best.id])
            {
                best = source;
            }
        }
    }
    return best.id;
}

/**
 * Finds a source that no living harvester is assigned to.
 *
 * This is the surplus harvester's target (see the file header): unlike
 * assignSource's score, which would re-pick the covered source on a tie,
 * this only returns a source with ZERO assignments, so a surplus harvester
 * always covers a new source instead of doubling an already-mined one.
 * @param room The room to search
 * @returns The uncovered source, or undefined when every source has one
 */
function sourceWithoutHarvester(room: Room): Source | undefined
{
    const sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length === 0)
    {
        return undefined;
    }

    const counts: Record<string, number> = {};
    for (const source of sources)
    {
        counts[source.id] = 0;
    }
    for (const name in Game.creeps)
    {
        const creep = Game.creeps[name];
        if (creep.memory.role === "harvester" && creep.memory.sourceId !== undefined)
        {
            if (counts[creep.memory.sourceId] !== undefined)
            {
                counts[creep.memory.sourceId] += 1;
            }
        }
    }

    for (const source of sources)
    {
        if (counts[source.id] === 0)
        {
            return source;
        }
    }
    return undefined; // Every source already has a harvester
}

/**
 * Assigns a source to a new miner (M5).
 *
 * A miner can only work a source that already has a built container on a
 * neighbour tile, and each such source takes exactly one miner. The counts
 * come from the living miners' memory, so a dead miner frees its source for
 * the next spawn. Returns undefined when every container'd source already has
 * a miner; the caller then skips the spawn for this tick.
 *
 * @param room The room to assign a source in
 * @returns The id of the chosen source, or undefined when none is free
 */
function assignMinerSource(room: Room): string | undefined
{
    const sources = room.find(FIND_SOURCES);
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    });

    const counts: Record<string, number> = {};
    for (const source of sources)
    {
        // -1 marks a source without a container: it is never a miner target,
        // it belongs to the harvester side of the split.
        const hasContainer = containers.some((container) => container.pos.getRangeTo(source) <= 1);
        counts[source.id] = hasContainer ? 0 : -1;
    }
    for (const name in Game.creeps)
    {
        const creep = Game.creeps[name];
        if (creep.memory.role === "miner" && creep.memory.sourceId !== undefined)
        {
            if (counts[creep.memory.sourceId] !== undefined && counts[creep.memory.sourceId] >= 0)
            {
                counts[creep.memory.sourceId] += 1;
            }
        }
    }

    for (const source of sources)
    {
        if (counts[source.id] === 0)
        {
            return source.id;
        }
    }
    return undefined; // Every container'd source already has a miner
}

/**
 * The energy budget a new creep's body is sized against for the given role.
 *
 * The default is the room's energy CAPACITY - the long-term size of the crew,
 * never the temporarily low stored energy. The only exception is a WIPED
 * income crew: with no harvester AND no miner alive (or no hauler alive in a
 * container room) nothing can refill the store, so the first replacement of
 * that crew is sized from the energy stored RIGHT NOW (owner feedback
 * 2026-11-02, the wipe scenario: sized against the capacity, the largest
 * body would wait for energy that nothing can ever deliver).
 *
 * Why income that is merely BELOW ITS MINIMUM is not an exception: sizing a
 * replacement from the partially filled store ratchets the body down. On a
 * store of 200-299 (capacity 300) the income templates have no 250 body, so
 * the "largest that fits" is the 200-energy 1-WORK harvester; when it dies
 * the store holds less than when the 2-WORK one did, and the next
 * replacement is 1-WORK again forever. M3 regression of 2026-11-11 (commit
 * 1404382, which sized every income role from the stored energy): the income
 * crew ratcheted to 1-WORK bodies, harvest fell to ~3.5/tick in the M2
 * world, and M3 finished with 2 extensions at tick 4000 (4 in the
 * pre-regression de5c985 run). The one tick of waiting for a full-size
 * replacement is safe because the income hold-back in utils/energy refuses
 * to serve builders from the pool while the income crew is below its
 * minimum - the store climbs to capacity and the 2-WORK replacement starts
 * instead of the 1-WORK one. (The old income-dead / hauler-dead exceptions
 * above are exactly the same "crew is short and the store cannot refill
 * without it" logic for the fully dead case.)
 *
 * Surplus spawns are unaffected: checkAndSpawn only runs them while every
 * minimum is met AND the store is full, where available == capacity.
 *
 * @param room The room to spawn in
 * @param role The role being spawned (only the wiped-crew exceptions use the stored energy)
 * @param energyAvailable room.energyAvailable at the start of this tick
 * @returns The energy budget to size the body against
 */
function sizingBudgetFor(room: Room, role: Role, energyAvailable: number): number
{
    const incomeDead = getCreepCount("harvester") === 0 && getCreepCount("miner") === 0;
    const haulerDead = getCreepCount("hauler") === 0 &&
        room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
        }).length > 0;

    const sizeFromAvailable =
        (incomeDead && (role === "harvester" || role === "miner")) ||
        (role === "hauler" && haulerDead);

    return sizeFromAvailable ? energyAvailable : room.energyCapacityAvailable;
}

/**
 * Attempts to start one spawn of the given role on a known-free spawn.
 *
 * The body is the largest template the sizing budget allows (owner rule #5,
 * see sizingBudgetFor): the room's capacity for every role - the only
 * stored-energy exception is a wiped income or hauler crew, whose store
 * nothing else can refill. The spawn only starts when the room can actually
 * pay for the picked body; while the store is short it waits (the income
 * hold-back in utils/energy keeps the store climbing, so the wait is short)
 * instead of starting a shrunken body.
 * @param room The room to spawn in
 * @param spawn The free spawn to use
 * @param role The role to spawn
 * @param energyAvailable room.energyAvailable at the start of this tick
 * @param sourceId For harvesters only: the source to bind the new creep to.
 * The surplus path passes the uncovered source explicitly; when omitted, the
 * assignment is balanced by assignSource.
 * @returns True if a spawn intent was started (no other role may then attempt
 * a spawn this tick), false if this role could not start a spawn this tick
 */
function trySpawnRole(room: Room, spawn: StructureSpawn, role: Role, energyAvailable: number, sourceId?: string): boolean
{
    const sizingBudget = sizingBudgetFor(room, role, energyAvailable);

    const picked = pickBody(room, role, sizingBudget);
    if (picked === null)
    {
        return false; // Nothing affordable - not even a minimal body
    }

    if (energyAvailable < picked.cost)
    {
        // Wait until the room can pay for the body it is sized to. A shrunken
        // creep is permanently smaller, so waiting is always worth it for a
        // capacity-sized role; an available-sized role (its crew just died)
        // always fits the budget by construction, so this check only stops
        // the capacity-sized spawns.
        return false;
    }

    // A miner must be bound to a free container'd source before it can be
    // named. If none is free (a dying miner still holds its slot in memory)
    // the spawn is skipped for this tick and retried once the slot frees.
    if (role === "miner" && sourceId === undefined)
    {
        sourceId = assignMinerSource(room);
        if (sourceId === undefined)
        {
            return false;
        }
    }

    ensureCreepCounter();
    const name = `${role}-${Memory.creepCounter}`;
    Memory.creepCounter += 1;

    // Upgraders start with working=true (straight to the controller once
    // they have energy); all other roles start collecting. Harvesters and
    // miners get a fixed source assignment so the sources are split evenly
    // (see above).
    const memory: CreepMemory = { role, working: role === "upgrader" };
    if (role === "harvester")
    {
        // The surplus path binds the creep to the uncovered source (see the
        // file header); the minimums path balances by score.
        memory.sourceId = sourceId !== undefined ? sourceId : assignSource(room);
    }
    else if (role === "miner")
    {
        memory.sourceId = sourceId;
    }

    const result = spawn.spawnCreep(picked.body, name, {
        memory,
    });

    // ERR_NOT_ENOUGH_ENERGY / ERR_BUSY: retry next tick. No log here - this
    // path is hit every tick while waiting for energy (console.log costs CPU).
    if (result !== OK)
    {
        // Name is simply unused; gaps in the counter are fine.
        return false;
    }

    console.log("Spawned " + name + " (" + picked.body.join(",") + ") for " + room.name);
    return true;
}

/**
 * Spawns creeps for one room so every role stays at its minimum.
 *
 * Roles are checked in the order harvester -> builder -> upgrader -> hauler
 * (owner rule #5). At most one spawn is started per tick: the engine resolves
 * spawnCreep calls as intents at the end of the tick and keeps only the last
 * intent per spawn, so a second call in the same tick would silently drop the
 * first creep. The spawn must therefore be checked once up front, and the loop
 * stops after the first role that actually started a spawn - the remaining
 * roles are picked up from the next tick (the spawn is busy for three ticks
 * per body part anyway).
 * @param room The room to spawn for
 */
export function checkAndSpawn(room: Room): void
{
    const spawn = room.find(FIND_MY_SPAWNS)[0];
    if (spawn === undefined || spawn.spawning !== null)
    {
        return; // No spawn yet, or the spawn is busy with another creep
    }

    const minimums = minCreepsPerRole(room);
    const energyAvailable = room.energyAvailable;

    // Roles whose spawn attempt already failed this tick. A rejected
    // spawnCreep returns its error immediately without creating an intent
    // (the spawn is still free) - but the energy and the room state cannot
    // change within a tick, so retrying the same role would only burn creep
    // names.
    const attempted = new Set<Role>();

    // Cold boot (owner feedback 2026-11-02): no harvester AND no miner
    // alive means nothing can harvest, so the energy store is never
    // refilled - waiting for it to reach capacity would wait forever and a
    // wiped colony could never recover. Highest-priority spawn in the
    // room: start the largest harvester the store can pay for right now,
    // this tick (sized from energyAvailable while the income is dead, see
    // sizingBudgetFor).
    if (getCreepCount("harvester") === 0 && getCreepCount("miner") === 0)
    {
        if (trySpawnRole(room, spawn, "harvester", energyAvailable))
        {
            return;
        }
        attempted.add("harvester");
    }

    // Income floor (owner feedback 2026-11-02): the colony needs at least
    // ENERGY_INCOME_FLOOR income creeps (harvester + miner + hauler) alive.
    // Below that, the next spawn goes to one of them - before any upgrader,
    // builder or defender - because a room with one income creep is one death
    // away from a state where the store is never refilled again and no
    // capacity-sized body can ever start. Single exception: not in peace mode
    // and no tower can fire, in which case a defender below its minimum takes
    // priority over income (a colony that does not defend itself defends no
    // one). minimums.defender is 0 in peace mode and while any tower can
    // fire, so the below-minimum check alone covers "the slot exists".
    const incomeAlive = getCreepCount("harvester") + getCreepCount("miner") + getCreepCount("hauler");
    if (incomeAlive < ENERGY_INCOME_FLOOR)
    {
        const needDefender =
            (Memory.mode ?? "peace") !== "peace" && !towerCanFire(room) &&
            getCreepCount("defender") < minimums.defender;

        const floorRoles: Role[] = needDefender ? ["defender", ...INCOME_ROLES] : INCOME_ROLES;
        for (const role of floorRoles)
        {
            if (attempted.has(role))
            {
                continue; // failed already this tick - nothing has changed
            }
            if (getCreepCount(role) >= minimums[role])
            {
                continue; // at minimum - the main loop keeps it topped up
            }
            if (trySpawnRole(room, spawn, role, energyAvailable))
            {
                return;
            }
            attempted.add(role);
        }
    }

    for (const role of SPAWN_ORDER)
    {
        if (attempted.has(role))
        {
            continue; // already failed this tick (the cold boot above)
        }
        const minimum = minimums[role];
        if (minimum === 0)
        {
            continue;
        }

        if (getCreepCount(role) >= minimum)
        {
            continue; // At minimum, do not over-spawn
        }

        if (trySpawnRole(room, spawn, role, energyAvailable))
        {
            return; // One spawn intent per tick - the rest wait for the next tick
        }
    }

    // The loop started nothing. If every role is at its minimum (the loop
    // never needed to spawn) and the store has climbed to the surplus gate,
    // spend the idle energy on a surplus creep instead of idling (owner
    // feedback 2026-10-30). The gate is level-dependent (see
    // SURPLUS_VALVE_MIN_LEVEL in config.ts): at RCL 5 and above it opens at
    // SURPLUS_SPAWN_ENERGY_RATIO of capacity (90 % - the M5 pressure valve,
    // which keeps the peak below capacity so "spawn idle while full" and the
    // dropped piles at a full spawn both shrink); below it the store must be
    // completely full, the pre-2026-11-12 behavior - the M5 valve plus the
    // raised caps starved the builder's withdrawal floor at RCL 1-2 (M2 gate
    // failure of 2026-11-12 20:11: 19 road energy instead of 1,126 in the
    // RCL 1 road phase, zero finished roads).
    const minimumsMet = SPAWN_ORDER.every((role) => getCreepCount(role) >= minimums[role]);
    const level = room.controller !== undefined ? room.controller.level : 1;
    const valveOpen = level >= SURPLUS_VALVE_MIN_LEVEL
        ? energyAvailable >= room.energyCapacityAvailable * SURPLUS_SPAWN_ENERGY_RATIO
        : energyAvailable >= room.energyCapacityAvailable;

    if (minimumsMet && valveOpen)
    {
        spawnSurplus(room, spawn, energyAvailable, level, attempted);
    }
}

/**
 * Starts one surplus spawn (see the file header). Called only while every
 * role is at its minimum and the store has reached the surplus gate:
 * walks SURPLUS_ORDER and starts the first role whose cap and
 * preconditions hold. The caps are level-dependent too (see
 * SURPLUS_VALVE_MIN_LEVEL in config.ts): the M5 caps (5 upgraders / 10
 * builders) apply at SURPLUS_VALVE_MIN_LEVEL and above, the pre-2026-11-12
 * caps (2 / 5) below it.
 * @param room The room to spawn in
 * @param spawn The free spawn to use
 * @param energyAvailable room.energyAvailable at the start of this tick
 * @param level The controller's level (1 when there is no controller)
 * @param attempted Roles whose spawn attempt already failed this tick
 */
function spawnSurplus(room: Room, spawn: StructureSpawn, energyAvailable: number, level: number, attempted: Set<Role>): void
{
    const upgraderMax = level >= SURPLUS_VALVE_MIN_LEVEL
        ? SURPLUS_UPGRADER_MAX : SURPLUS_UPGRADER_MAX_LOW;
    const builderMax = level >= SURPLUS_VALVE_MIN_LEVEL
        ? SURPLUS_BUILDER_MAX : SURPLUS_BUILDER_MAX_LOW;

    for (const role of SURPLUS_ORDER)
    {
        if (attempted.has(role))
        {
            continue; // failed already this tick - nothing has changed
        }
        if (role === "harvester")
        {
            // One per uncovered source, never more: sourceWithoutHarvester
            // returns undefined while every source already has a harvester.
            const source = sourceWithoutHarvester(room);
            if (source !== undefined && trySpawnRole(room, spawn, role, energyAvailable, source.id))
            {
                return;
            }
        }
        else if (role === "upgrader")
        {
            if (getCreepCount(role) < upgraderMax && trySpawnRole(room, spawn, role, energyAvailable))
            {
                return;
            }
        }
        else // builder
        {
            // Only while there is something to build; the minimum crew
            // already covers the baseline builder.
            const hasSites = room.find(FIND_CONSTRUCTION_SITES).length > 0;
            if (hasSites && getCreepCount(role) < builderMax && trySpawnRole(room, spawn, role, energyAvailable))
            {
                return;
            }
        }
    }
}

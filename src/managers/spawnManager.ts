/**
 * Spawn manager - decides when to spawn creeps and with which bodies.
 *
 * Body sizing (owner rule #5):
 *   Bodies are sized from room.energyCapacityAvailable - the long-term
 *   maximum the room will support - never from the temporarily low
 *   room.energyAvailable. We pick the largest template that fits the
 *   capacity and only tell the spawn to spawn when the room can pay for the
 *   body, so a creep is never shrunken because the store happens to be low
 *   this tick. Exception: when an income crew has just died (no harvester
 *   and no miner alive, or no hauler alive while a container exists) that
 *   role is sized down to what the store holds right now - the store will
 *   not refill until the crew is back, so waiting for capacity would wait
 *   forever (owner feedback 2026-11-02).
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
 * Surplus spawning (owner feedback 2026-10-30):
 *   The minimums keep the colony alive, not busy. While every minimum is met
 *   AND the store is full (energyAvailable >= energyCapacityAvailable),
 *   checkAndSpawn spends the idle energy on one extra creep, in this order:
 *     1. Harvester - the source no living harvester is assigned to (one per
 *        source, never more). The source is passed to the spawn explicitly:
 *        assignSource's score would re-pick the covered source on a tie.
 *     2. Upgrader - the fixed 2-per-tick (more with a bigger body) energy
 *        sink at the controller; this is what keeps the store cycling
 *        instead of sitting full. Capped at SURPLUS_UPGRADER_MAX total.
 *     3. Builder - while sites exist, one more beyond the minimum crew,
 *        capped at SURPLUS_BUILDER_MAX total.
 *   This deliberately inverts rule 02b's builder-before-upgrader order for
 *   the surplus step: an upgrader parks within range 3 and spends
 *   reliably, a builder's spend is walk-limited, and the surplus upgrader
 *   is what lands RCL 2 inside the 500-tick smoke window.
 */

import { CONTROLLER_CONTAINER_RANGE, ENERGY_INCOME_FLOOR, MIN_CREEPS_BY_LEVEL, SURPLUS_BUILDER_MAX, SURPLUS_UPGRADER_MAX } from "config";
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
        [WORK, WORK, WORK, CARRY, MOVE], // 400
        [WORK, WORK, CARRY, MOVE], // 300
        [WORK, CARRY, MOVE], // 200
    ],
    builder: [
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
            [WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], // 750
            [WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], // 500
            [WORK, WORK, CARRY, MOVE, MOVE], // 350
            [WORK, CARRY, MOVE], // 200
        ],
    hauler: [
        // Haulers: pairs of CARRY+MOVE, one MOVE per two CARRY is enough on
        // roads. Haulers never carry WORK parts (owner rule #1).
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // 800
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 550
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 450
        [CARRY, CARRY, MOVE, MOVE], // 200
    ],
    defender: [
        // The defender is a last-resort attacker (M4): it never harvests and
        // never transfers energy, so the old CARRY part was dead weight.
        // Bodies are ATTACK+MOVE pairs, as many pairs as the energy allows:
        // one MOVE per ATTACK part reaches a hostile on plain ground (owner
        // feedback 2026-11-02: bodies must match the job).
        [ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE], // 620
        [ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE], // 420
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
    // stationary miner; every other source is still served by a bootstrap
    // harvester. The two counts sum to the number of sources, so the colony
    // transitions source by source as the containers come up - there is never
    // an unmined source (waste) and never a miner and a harvester stacked on
    // the same source. Until the first container this is simply "all
    // harvesters", which keeps the M1-M4 bootstrap unchanged.
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
            harvesterCount += 1;
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
        hauler: containerCount > 0 ? row.hauler : 0,
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
 * The default is the room's energy capacity: the long-term maximum the
 * existing crew will keep refilling, so bodies are always sized for the long
 * run and never shrunken because the store happens to be low this tick
 * (owner rule #5).
 *
 * The exception is a crew that has just died. Capacity is a promise the
 * living crew delivers; with no harvester and no miner alive nothing can
 * harvest, the store is never refilled, and waiting for capacity would wait
 * forever - that is how a wiped colony stays dead. While the income is dead,
 * harvesters and miners are sized from the energy available right now. The
 * same holds for the hauler: once a container exists but no hauler is alive,
 * the transport crew is gone, so the first hauler is sized from available
 * (owner feedback 2026-11-02).
 *
 * @param room The room to spawn in
 * @param role The role being spawned
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
 * see sizingBudgetFor): normally the room's capacity, or the energy available
 * right now when the role's crew has just died and capacity is a promise
 * nobody can keep. The spawn only starts when the room can actually pay for
 * the picked body.
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
    // never needed to spawn) and the store is full, spend the idle energy on
    // a surplus creep instead of idling (owner feedback 2026-10-30).
    const minimumsMet = SPAWN_ORDER.every((role) => getCreepCount(role) >= minimums[role]);
    if (minimumsMet && energyAvailable >= room.energyCapacityAvailable)
    {
        spawnSurplus(room, spawn, energyAvailable, attempted);
    }
}

/**
 * Starts one surplus spawn (see the file header). Called only while every
 * role is at its minimum and the store is full: walks SURPLUS_ORDER and
 * starts the first role whose cap and preconditions hold.
 * @param room The room to spawn in
 * @param spawn The free spawn to use
 * @param energyAvailable room.energyAvailable at the start of this tick
 */
function spawnSurplus(room: Room, spawn: StructureSpawn, energyAvailable: number, attempted: Set<Role>): void
{
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
            if (getCreepCount(role) < SURPLUS_UPGRADER_MAX && trySpawnRole(room, spawn, role, energyAvailable))
            {
                return;
            }
        }
        else // builder
        {
            // Only while there is something to build; the minimum crew
            // already covers the baseline builder.
            const hasSites = room.find(FIND_CONSTRUCTION_SITES).length > 0;
            if (hasSites && getCreepCount(role) < SURPLUS_BUILDER_MAX && trySpawnRole(room, spawn, role, energyAvailable))
            {
                return;
            }
        }
    }
}

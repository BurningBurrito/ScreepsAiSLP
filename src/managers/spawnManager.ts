/**
 * Spawn manager - decides when to spawn creeps and with which bodies.
 *
 * Body sizing (owner rule #5):
 *   Bodies are sized from room.energyCapacityAvailable - the long-term
 *   maximum the room will support - never from the temporarily low
 *   room.energyAvailable. We pick the largest template that fits the
 *   capacity and only tell the spawn to spawn when the room can pay for the
 *   body, so a creep is never shrunken because the store happens to be low
 *   this tick. Exception: on a cold boot (no harvester alive) there is no
 *   income at all, so the first harvester is sized down to what the store
 *   holds right now - otherwise nothing would ever be spawned.
 *
 * Spawn order (owner rule #5): harvester, then builder, then upgrader, then
 * hauler. At most ONE spawn is started per tick: a spawnCreep call is stored
 * as an engine "intent" that only resolves at the end of the tick, and the
 * engine keeps at most one createCreep intent per spawn - a second spawnCreep
 * call in the same tick overwrites the first one and the first creep is
 * silently never spawned. The remaining roles are picked up from the next
 * tick onward (the spawn is busy for three ticks per body part anyway).
 */

import { BUILDER_COUNT_BY_CAPACITY, MIN_CREEPS_PER_ROLE } from "config";

/** Roles checked each tick, highest priority first (owner rule #5). */
const SPAWN_ORDER: Role[] = ["harvester", "builder", "upgrader", "hauler"];

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
 */
function bodyTemplates(): Record<Role, BodyPartConstant[][]>
{
    return {
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
    upgrader: [
        // The upgrader parks within range 3 of the controller, so one MOVE
        // part is enough; maximise WORK instead.
        [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], // 800
        [WORK, WORK, WORK, WORK, CARRY, MOVE], // 500
        [WORK, WORK, CARRY, MOVE], // 300
        [WORK, CARRY, MOVE], // 200
    ],
    hauler: [
        // Haulers: pairs of CARRY+MOVE, one MOVE per two CARRY is enough on
        // roads. Haulers never carry WORK parts (owner rule #1).
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // 800
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 550
        [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // 450
        [CARRY, CARRY, MOVE, MOVE], // 200
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
 * Picks the largest body template that fits the sizing budget.
 * @param role The role to build a body for
 * @param budget The energy capacity the body must fit into
 * @returns The chosen body and its cost, or null when nothing fits
 */
function pickBody(role: Role, budget: number): { body: BodyPartConstant[]; cost: number } | null
{
    for (const template of bodyTemplates()[role])
    {
        if (template.length <= MAX_CREEP_SIZE && bodyCost(template) <= budget)
        {
            return { body: template, cost: bodyCost(template) };
        }
    }
    return null;
}

/**
 * Computes the minimum population per role for this room.
 *
 * Builders: only while something is under construction, and only as many as
 * the energy capacity can support full-size (see BUILDER_COUNT_BY_CAPACITY).
 * Haulers: only once a container is actually built (stage 2 economy) - until
 * then they would just park next to the spawn (owner rule #1).
 * @param room The room to compute minimums for
 * @returns The minimum number of alive creeps per role
 */
function minCreepsPerRole(room: Room): Record<Role, number>
{
    const siteCount = room.find(FIND_CONSTRUCTION_SITES).length;
    const capacity = room.energyCapacityAvailable;

    let builderMin = 0;
    if (siteCount > 0)
    {
        for (const entry of BUILDER_COUNT_BY_CAPACITY)
        {
            if (capacity >= entry.capacity)
            {
                builderMin = entry.builders;
                break;
            }
        }
    }

    const containerCount = room.find(FIND_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
    }).length;

    return {
        harvester: MIN_CREEPS_PER_ROLE.harvester,
        builder: builderMin,
        upgrader: MIN_CREEPS_PER_ROLE.upgrader,
        hauler: containerCount > 0 ? MIN_CREEPS_PER_ROLE.hauler : 0,
    };
}

/**
 * Assigns a source to a new harvester.
 *
 * Every harvester gets the source with the fewest living harvesters already
 * assigned to it, so the room's sources are split evenly instead of all
 * harvesters crowding the one closest to the spawn. The assignment is stored
 * in the creep's Memory and survives global resets; when a harvester dies,
 * its slot frees up and the next spawn rebalances.
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

    let best = sources[0];
    for (const source of sources)
    {
        if (counts[source.id] < counts[best.id])
        {
            best = source;
        }
    }
    return best.id;
}

/**
 * Attempts to start one spawn of the given role on a known-free spawn.
 *
 * The body is the largest template the sizing budget allows (owner rule #5).
 * The spawn only starts when the room can actually pay for the body, except
 * on a cold boot - when no harvester is alive, the budget is the store
 * itself and the first harvester is sized down to it.
 * @param room The room to spawn in
 * @param spawn The free spawn to use
 * @param role The role to spawn
 * @param energyAvailable room.energyAvailable at the start of this tick
 * @returns True if a spawn intent was started (no other role may then attempt
 * a spawn this tick), false if this role could not start a spawn this tick
 */
function trySpawnRole(room: Room, spawn: Spawn, role: Role, energyAvailable: number): boolean
{
    const coldBoot = role === "harvester" && getCreepCount(role) === 0;
    const sizingBudget = coldBoot ? energyAvailable : room.energyCapacityAvailable;

    const picked = pickBody(role, sizingBudget);
    if (picked === null)
    {
        return false; // Nothing affordable - not even a minimal body
    }

    if (energyAvailable < picked.cost)
    {
        // Wait until the room can pay for the full-size body. A shrunken
        // creep is permanently smaller, so waiting is always worth it.
        return false;
    }

    ensureCreepCounter();
    const name = `${role}-${Memory.creepCounter}`;
    Memory.creepCounter += 1;

    // Upgraders start with working=true (straight to the controller once
    // they have energy); all other roles start collecting. Harvesters get a
    // fixed source assignment so the sources are split evenly (see above).
    const memory: CreepMemory = { role, working: role === "upgrader" };
    if (role === "harvester")
    {
        memory.sourceId = assignSource(room);
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

    for (const role of SPAWN_ORDER)
    {
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
            break; // One spawn intent per tick - the rest wait for the next tick
        }
    }
}

/** Mode Manager (M4)
 * Tracks the colony's threat state in Memory.mode so that every system can
 * react to one common signal:
 *
 *   - the towers (managers/towerManager.ts) keep their energy for attacks
 *     and healing while defending, and only repair in peace;
 *   - the builders (roles/builder.ts) put ramparts first while defending;
 *   - the spawn manager (managers/spawnManager.ts) holds the last-resort
 *     defender in reserve while any tower can still fire.
 *
 * The state is derived purely from what the room can see this tick, so it
 * survives a global reset: Memory holds only the 'lastHostileTick'
 * bookkeeping the 500-tick quiet period needs, and the rest re-derives
 * within one tick.
 */

import { DEFEND_REVERT_TICKS } from "config";

/**
 * Runs the colony's threat-state logic for one room.
 *
 * Hostiles in the room: the mode becomes 'defend' (an owner-set 'war' mode
 * is never overwritten). No hostiles seen anywhere for
 * DEFEND_REVERT_TICKS ticks: the mode reverts to 'peace'. Then runs the
 * safe-mode last resort and paints the current mode next to the
 * controller so a reviewer can see the state in-game.
 * @param room The room to check for hostiles
 */
export function manageMode(room: Room): void
{
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    // A fresh world (or a global reset) has no Memory.rooms at all - create
    // both levels before writing lastHostileTick.
    if (Memory.rooms === undefined)
    {
        Memory.rooms = {};
    }

    if (Memory.rooms[room.name] === undefined)
    {
        Memory.rooms[room.name] = { sourceIds: [], spawnIds: [] };
    }

    if (hostiles.length > 0)
    {
        Memory.rooms[room.name].lastHostileTick = Game.time;
    }

    const current = Memory.mode ?? "peace";

    if (hostiles.length > 0 && current === "peace")
    {
        setMode("peace", "defend", hostiles.length, room.name);
    }
    else if (hostiles.length === 0 && current === "defend" && noHostilesSeenRecently())
    {
        setMode("defend", "peace", 0, room.name);
    }

    checkSafeMode(room, hostiles);

    // Paint the mode next to the controller: one visual text per tick, and
    // the only way a human sees the state without opening Memory.
    const controller = room.controller;
    if (controller !== undefined && controller !== null)
    {
        room.visual.text(Memory.mode ?? "peace", controller.pos.x, controller.pos.y - 1, { color: "yellow" });
    }
}

/**
 * Records a mode change: exactly one console line per change (the M4 spec
 * requires one line - console.log costs CPU, so never per tick).
 * @param from The mode being left
 * @param to The mode being entered
 * @param hostileCount The hostiles seen this tick (for the log line)
 * @param roomName The room that triggered the change
 */
function setMode(from: GameMode, to: GameMode, hostileCount: number, roomName: string): void
{
    Memory.mode = to;
    console.log(`[mode] ${from} -> ${to}: ${hostileCount} hostile in ${roomName}`);
}

/**
 * True when no room has seen a hostile in the last DEFEND_REVERT_TICKS
 * ticks. The mode is colony-wide, so the latest sighting across ALL rooms
 * decides: one room's sighting holds the others back. If no sighting is
 * recorded at all - which cannot happen while the mode is 'defend', since
 * entering it records one - the answer is false: staying on guard is the
 * safe side.
 * @returns True when the quiet period has fully elapsed
 */
function noHostilesSeenRecently(): boolean
{
    let latest = 0;
    let found = false;
    for (const name in Memory.rooms)
    {
        const tick = Memory.rooms[name].lastHostileTick;
        if (tick !== undefined)
        {
            found = true;
            if (tick > latest)
            {
                latest = tick;
            }
        }
    }
    if (!found)
    {
        return false;
    }
    return Game.time - latest >= DEFEND_REVERT_TICKS;
}

/**
 * Safe mode is the last resort (M4): it activates only when ALL of these
 * hold -
 *   1. a hostile that can damage or drain energy (an ATTACK, RANGED_ATTACK
 *      or WORK part) is in the room;
 *   2. no tower holds the 10 energy a shot costs, so the towers cannot
 *      even fire once;
 *   3. the spawn or a tower has already lost hits, so something is being
 *      damaged right now.
 * A single small intruder that the towers can handle must never spend safe
 * mode - that is exactly what the M4 acceptance test asserts.
 * @param room The room whose controller may activate safe mode
 * @param hostiles The hostiles the caller already found this tick (reused
 *                 instead of a second room.find)
 */
function checkSafeMode(room: Room, hostiles: Creep[]): void
{
    const controller = room.controller;
    if (controller === undefined || controller === null || !controller.my)
    {
        return;
    }
    if (controller.safeMode !== undefined && controller.safeMode > 0)
    {
        return; // already active
    }

    const dangerous = hostiles.some((hostile) =>
        hostile.body.some((part) =>
            part.type === ATTACK || part.type === RANGED_ATTACK || part.type === WORK,
        ),
    );
    if (!dangerous)
    {
        return;
    }

    const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure): structure is StructureTower =>
            structure.structureType === STRUCTURE_TOWER,
    });
    const towerCanFire = towers.some(
        (tower) => tower.store.getUsedCapacity(RESOURCE_ENERGY) >= TOWER_ENERGY_COST,
    );
    if (towerCanFire)
    {
        return;
    }

    const structureDamaged = room.find(FIND_MY_SPAWNS).some(
        (spawn) => spawn.hits < spawn.hitsMax,
    ) || towers.some((tower) => tower.hits < tower.hitsMax);
    if (!structureDamaged)
    {
        return;
    }

    console.log(`[mode] activating safe mode in ${room.name}`);
    controller.activateSafeMode();
}
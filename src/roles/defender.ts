/** Defender role (M4): the last-resort fighter.
 *
 * A defender is only spawned while the colony defends or wages war and NO
 * tower holds energy (see spawnManager): a tower with energy beats a creep
 * in damage, range and cost, so the defender covers the gap - the towers
 * are dry (spending their last shots or drained) while hostiles are here.
 *
 * With hostiles in the room it attacks the closest one. Without hostiles
 * (it spawned a tick early, or the intruder left) it parks within range 2
 * of the spawn: close enough to react next tick, off the road tiles so it
 * does not slow the builders down.
 */

import { moveToToward } from "utils/movement";

/**
 * Runs the defender creep behavior for one tick.
 * @param creep The defender creep to run
 */
export function runDefender(creep: Creep): void
{
    const room = creep.room;
    const hostiles = room.find(FIND_HOSTILE_CREEPS);

    if (hostiles.length === 0)
    {
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        if (spawn !== undefined)
        {
            moveToToward(creep, spawn, 2);
        }
        return;
    }

    const target = creep.pos.findClosestByPath<Creep>(hostiles);
    if (target === null)
    {
        return;
    }

    const result = creep.attack(target);
    if (result === ERR_NOT_IN_RANGE)
    {
        moveToToward(creep, target, 1);
    }
}
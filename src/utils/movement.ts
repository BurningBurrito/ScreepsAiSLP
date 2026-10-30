/**
 * Shared movement helper used by every creep role.
 *
 * Why this exists: the engine caches each creep's last computed path in
 * memory._move and replays it on every subsequent moveTo() with the same
 * destination (for reusePath ticks), without re-checking that the path is
 * still walkable. When the path's final tile gets blocked - a creep that
 * parked there after pathfinding, or a creep the pathfinder was told to
 * ignore - the creep replays the cached path forever and never moves again.
 * That freeze killed the RCL1 economy: the harvester's cached path was the
 * single tile the builder was parked on, and ignoreCreeps: true made
 * re-pathfinding return the very same blocked tile.
 *
 * moveToToward() wraps creep.moveTo() with a stuck detector. It keeps a
 * sliding window of STUCK_CLEAR_BASE + 2 x (non-MOVE parts) ticks: if the
 * creep stands on the same tile at both ends of the window, it made no net
 * progress and loses its cached path, so the next moveTo() recomputes one.
 * This catches both failure modes the engine's fallback produces when
 * pathfinding fails: standing still (no step improves the cost) and
 * ping-ponging between two tiles (the measured upgrader oscillation at the
 * pocket entrance, 50+ ticks between the same two tiles). A walking creep
 * revisits any tile for at most its fatigue cycle (one step per
 * 2 x non-MOVE parts ticks with one MOVE part on plain), so normal walking
 * never trips the detector.
 */

import { MOVE_REUSE_PATH_TICKS, STUCK_CLEAR_BASE } from "config";

/**
 * Moves a creep toward a target, dropping its cached path (memory._move)
 * when it stops making progress, so the engine recomputes a path instead of
 * replaying a blocked one.
 * @param creep - The creep to move.
 * @param target - Position, creep, or any object with a pos (structures,
 *        construction sites, ...) to move toward.
 * @param range - How far from the target to stop (1 for harvest/transfer,
 *        3 for build/upgrade).
 * @returns The moveTo() result code (OK, ERR_NO_PATH, ERR_NOT_IN_RANGE, ...),
 *        so callers can still special-case ERR_NO_PATH (unreachable target).
 */
export function moveToToward(creep: Creep, target: RoomPosition | Creep | Structure | { pos: RoomPosition }, range: number): number
{
    const position = `${creep.pos.x},${creep.pos.y}`;
    const nonMoveParts = creep.body.filter((part) => part.type !== MOVE).length;
    const stuckThreshold = 2 * nonMoveParts + STUCK_CLEAR_BASE;

    if (Game.time - (creep.memory.stuckSince ?? 0) >= stuckThreshold)
    {
        if (creep.memory.stuckPos === position)
        {
            // No net progress across the whole window: the creep stood still
            // or ping-ponged between tiles while the engine replayed a path
            // whose end is blocked. Drop the cache so the moveTo below
            // recomputes (a fresh path may route around the blocker, and if
            // none exists the recompute is cheap and the window re-arms).
            // eslint-disable-next-line no-underscore-dangle -- the engine's own cache
            delete creep.memory._move;
        }
        // Slide the window: this tile becomes the new reference point.
        creep.memory.stuckPos = position;
        creep.memory.stuckSince = Game.time;
    }

    return creep.moveTo(target, {
        reusePath: MOVE_REUSE_PATH_TICKS,
        range
    });
}
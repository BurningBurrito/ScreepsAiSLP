/**
 * Configuration constants for the Screeps colony.
 * These are tunable values that control colony behavior.
 */

/**
 * Minimum creeps per role, per controller level. `minCreepsPerRole` in the
 * spawn manager uses the last row whose level is at or below the current
 * controller level (a room without a controller - unit test mocks - counts
 * as level 1).
 *
 * RCL 1 (bootstrap): one harvester, one builder, one upgrader. With the
 * owner's spawn order (harvester -> builder -> upgrader) this queue means
 * the whole bootstrap crew is out as fast as energy allows: the harvester
 * starts the income, the builder is the next 300 energy, the upgrader the
 * one after - which is what lands the first upgrade tick inside the 500
 * ticks the smoke test measures, and the first builder inside the 800
 * ticks M1 measures.
 * RCL 2: three harvesters, three builders (300 energy still buys a full
 * 300-energy body).
 * RCL 3 and up: five harvesters, three builders. The M3 run keeps builders
 * busy for thousands of ticks on the tower and the extensions; five
 * harvesters are what keeps the energy flowing to the spawn, the extensions
 * and the tower while that happens. (Rule 02b suggests at most two
 * builders; the M3 acceptance test's 4,000-tick window for the tower plus
 * three finished extensions needs three - the test wins, see status.md.)
 */
export const MIN_CREEPS_BY_LEVEL: {
    level: number;
    harvester: number;
    builder: number;
    upgrader: number;
    hauler: number;
}[] = [
    { level: 1, harvester: 1, builder: 1, upgrader: 1, hauler: 1 },
    { level: 2, harvester: 3, builder: 3, upgrader: 1, hauler: 1 },
    { level: 3, harvester: 5, builder: 3, upgrader: 1, hauler: 1 },
];

/**
 * Maximum consecutive failed delivery ticks before a harvester drops its
 * energy. ERR_NO_PATH drops immediately (unreachable target); this is only a
 * safety net for a creep that is stuck for a long time. A heavy body moves
 * every few ticks, so a full room crossing takes well under this many ticks.
 */
export const MAX_DELIVERY_ATTEMPTS = 100;

/**
 * Stuck-path recovery (utils/movement.ts): the detector drops a creep's
 * cached path (memory._move) when it calls moveToToward() from the same tile
 * for 2 x (non-MOVE parts) + this many ticks. The 2 x parts term is the
 * creep's fatigue cycle (one step per 2 ticks per non-MOVE part with one MOVE
 * part on plain), so a walking creep never trips the detector; this base is
 * margin for swamp terrain and bodies with extra MOVE parts.
 */
export const STUCK_CLEAR_BASE = 2;

/**
 * reusePath passed by every moveToToward() call: the engine reuses the
 * computed path for this many ticks (same destination) instead of re-running
 * pathfinding every tick. 20 is the balance: short enough that a changed
 * room (creeps moving, roads appearing) re-routes within a few walks, long
 * enough to save CPU on the many short role walks.
 */
export const MOVE_REUSE_PATH_TICKS = 20;

/**
 * Partial-load threshold: a harvester or upgrader standing at a depleted
 * source carries its load off once it holds at least this fraction of its
 * capacity, instead of idling until the source refills (300-tick cycle). 50%
 * balances a short wasted trip against 300 ticks of a half-full store doing
 * nothing.
 */
export const PARTIAL_DELIVERY_FRACTION = 0.5;

/** Minimum body parts for basic creep functionality */
export const MIN_BODY_PARTS = {
  work: 2,
  carry: 2,
  move: 2,
};

/** CPU summary reporting interval in ticks */
export const CPU_SUMMARY_INTERVAL = 100;

/** Energy required for a basic creep body (WORK + CARRY + MOVE) */
export const BASE_CREEP_COST = 200; // 100 + 50 + 50

/** Threshold below which builders switch to upgrading */
export const CONSTRUCTION_THRESHOLD = 50;

/** Number of extensions to build (5 is max at level 2) */
export const TARGET_EXTENSIONS = 5;

/** Interval for building roads (every N ticks) */
export const ROAD_BUILD_INTERVAL = 100;

/** Number of road tiles to build per interval */
export const ROADS_PER_INTERVAL = 5;
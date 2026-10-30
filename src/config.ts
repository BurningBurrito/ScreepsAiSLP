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
/**
 * Configuration constants for the Screeps colony.
 * These are tunable values that control colony behavior.
 */

/** Minimum number of creeps to maintain per role */
export const MIN_CREEPS_PER_ROLE = {
  harvester: 2,
  upgrader: 1,
  builder: 0,  // Builder count is computed from open sites and energy capacity (see BUILDER_COUNT_BY_CAPACITY)
  hauler: 1,   // Only spawned while a built container exists (see spawnManager.minCreepsPerRole)
};

/**
 * Builder count per energy capacity. The first entry whose capacity threshold
 * the room meets determines how many builders to keep alive (0 below all of
 * them, 0 whenever no construction site exists). The thresholds match the
 * builder body templates: a builder is only worth spawning when it can be
 * spawned full-size.
 */
export const BUILDER_COUNT_BY_CAPACITY: { capacity: number; builders: number }[] = [
  { capacity: 550, builders: 3 },
  { capacity: 450, builders: 2 },
  { capacity: 350, builders: 2 },
  { capacity: 300, builders: 1 },
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
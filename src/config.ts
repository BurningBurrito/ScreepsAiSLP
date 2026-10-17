/**
 * Configuration constants for the Screeps colony.
 * These are tunable values that control colony behavior.
 */

/** Minimum number of creeps to maintain per role */
export const MIN_CREEPS_PER_ROLE = {
  harvester: 2,
  upgrader: 2,
  builder: 1,
};

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
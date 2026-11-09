/**
 * Type definitions for Memory structures used in Screeps.
 * These extend the global Memory interface available in Screeps.
 */

declare global {
  /**
   * Role type definition for creep roles
   */
  type Role = "harvester" | "upgrader" | "builder" | "hauler" | "defender" | "miner";

  /**
   * The colony-wide threat state (M4). 'peace' is the default, 'defend' is
   * set by the bot while a hostile is (or was recently) in a room, and 'war'
   * is set by the owner manually - the bot never writes 'war' and it behaves
   * like 'defend' while it lasts.
   */
  type GameMode = "peace" | "defend" | "war";

  /**
   * Creep memory structure - stored in Memory.creeps[creepName]
   */
  interface CreepMemory {
    /** Role of the creep: harvester, upgrader, or builder */
    role: Role;
    /**
     * Hauler phase latch (M5 hauler rewrite, owner feedback 2026-11-04):
     * true while the hauler delivers (keep going to the next target with
     * free capacity until the store is empty), false while it collects
     * from source containers. Losing it in a global reset is fine: the
     * hauler re-derives it from the store's contents on the next tick.
     */
    delivering?: boolean;
    /** ID of the source this creep is assigned to: a persistent assignment
     *  for harvesters, a per-work-cycle latch for upgraders (see upgrader.ts) */
    sourceId?: string;
    /** ID of the construction site this creep is building (for builders) */
    targetId?: string;
    /** Whether the creep is currently working or moving */
    working: boolean;
    /** ID of a construction site to skip (for builders when ERR_INVALID_TARGET occurs) */
    skipSiteId?: string;
    /** Number of consecutive failed transfer attempts (for harvester retry logic) */
    failedTransferAttempts?: number;
    /** Number of consecutive delivery attempts (for frozen harvester prevention) */
    deliveryAttempts?: number;
    /**
     * Position ("x,y") and tick of the last moveToToward() call: the stuck
     * detector in utils/movement.ts compares both against the current tick to
     * drop a cached path that keeps replaying into a blocked tile.
     */
    stuckPos?: string;
    stuckSince?: number;
    /**
     * The engine's own path cache (written by creep.moveTo with reusePath,
     * read on the next moveTo with the same destination). Typed here because
     * utils/movement.ts deletes it when the cached path is stale; the d.ts
     * only mentions it in a comment.
     */
    _move?: { // eslint-disable-line no-underscore-dangle -- the engine's own property name
      dest: { x: number; y: number; room: string };
      time: number;
      path: string;
      room: string;
    };
  }

  /**
   * Room memory structure - stored in Memory.rooms[roomName]
   */
  interface RoomMemory {
    /** ID of the controller in this room */
    controllerId?: string;
    /** Array of source IDs in this room */
    sourceIds: string[];
    /** Array of spawn IDs in this room */
    spawnIds: string[];
    /**
     * Last tick a hostile creep was seen in this room (M4 mode tracking).
     * Undefined until the first sighting; 'defend' reverts to 'peace' when
     * this tick is at least config.DEFEND_REVERT_TICKS old.
     */
    lastHostileTick?: number;
    /**
     * The room's creep parking tile ("x,y"), computed by the construction
     * manager and cached here so it survives a global reset (M4, owner
     * feedback 2026-11-06). Parked creeps - idle haulers, miners that
     * lost their source, harvesters that cannot deliver their load - stand
     * on it, outside the extension layout, so they never block a builder's
     * tile. Undefined until the manager computes it.
     */
    parkingPos?: string;
  }

  /**
   * Global memory structure - stored in Memory
   */
  interface Memory {
    /** Memory for individual creeps */
    creeps: { [name: string]: CreepMemory };
    /** Memory for individual rooms */
    rooms: { [name: string]: RoomMemory };
    /**
     * Colony-wide threat state (M4), maintained by managers/modeManager.
     * Missing means 'peace' so a world that predates this field works
     * without migration.
     */
    mode?: GameMode;
    /** Total number of creeps spawned (for naming) */
    creepCounter: number;
    /** Last tick when CPU summary was logged */
    lastCpuSummary: number;
    /** Last recorded CPU usage */
    lastCpuUsage: number;
    /** Last recorded CPU bucket */
    lastCpuBucket: number;
  }
}

export {};

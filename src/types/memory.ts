/**
 * Type definitions for Memory structures used in Screeps.
 * These extend the global Memory interface available in Screeps.
 */

declare global {
  /**
   * Role type definition for creep roles
   */
  type Role = "harvester" | "upgrader" | "builder";

  /**
   * Creep memory structure - stored in Memory.creeps[creepName]
   */
  interface CreepMemory {
    /** Role of the creep: harvester, upgrader, or builder */
    role: Role;
    /** ID of the source this creep is assigned to (for harvesters) */
    sourceId?: string;
    /** ID of the construction site this creep is building (for builders) */
    targetId?: string;
    /** Whether the creep is currently working or moving */
    working: boolean;
    /** ID of a construction site to skip (for builders when ERR_INVALID_TARGET occurs) */
    skipSiteId?: string;
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
  }

  /**
   * Global memory structure - stored in Memory
   */
  interface Memory {
    /** Memory for individual creeps */
    creeps: { [name: string]: CreepMemory };
    /** Memory for individual rooms */
    rooms: { [name: string]: RoomMemory };
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

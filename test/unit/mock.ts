// Constants for mocking
const RESOURCE_ENERGY = "energy";
const OK = 0;
const ERR_NOT_IN_RANGE = -6;
const FIND_MY_SPAWNS = 1;
const FIND_STRUCTURES = 3;
const FIND_SOURCES_ACTIVE = 4;
const STRUCTURE_EXTENSION = "extension";

// Expose as globals for Screeps API compatibility
(global as any).RESOURCE_ENERGY = RESOURCE_ENERGY;
(global as any).OK = OK;
(global as any).ERR_NOT_IN_RANGE = ERR_NOT_IN_RANGE;
(global as any).FIND_MY_SPAWNS = FIND_MY_SPAWNS;
(global as any).FIND_STRUCTURES = FIND_STRUCTURES;
(global as any).FIND_SOURCES_ACTIVE = FIND_SOURCES_ACTIVE;
(global as any).STRUCTURE_EXTENSION = STRUCTURE_EXTENSION;

export { RESOURCE_ENERGY, OK, ERR_NOT_IN_RANGE, FIND_MY_SPAWNS, FIND_STRUCTURES, FIND_SOURCES_ACTIVE, STRUCTURE_EXTENSION };

export const Game: {
  creeps: { [name: string]: any };
  rooms: { [name: string]: any };
  spawns: any;
  time: number;
  cpu: any;
} = {
  creeps: {},
  rooms: {},
  spawns: {},
  time: 12345,
  cpu: {
    used: 0,
    bucket: 10000,
    limit: 30,
  },
};

export const Memory: {
  creeps: { [name: string]: any };
  creepCounter: number;
  rooms: { [name: string]: any };
  lastCpuUsage: number;
  lastCpuBucket: number;
  lastCpuSummary: number;
} = {
  creeps: {},
  creepCounter: 0,
  rooms: {},
  lastCpuUsage: 0,
  lastCpuBucket: 0,
  lastCpuSummary: 0,
};

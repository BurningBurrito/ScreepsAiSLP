// Constants for Screeps API compatibility (these are global in Screeps)
export const RESOURCE_ENERGY = "energy";
export const OK = 0;
export const ERR_NOT_IN_RANGE = -9;
export const FIND_MY_SPAWNS = 112;
export const STRUCTURE_EXTENSION = "extension";

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
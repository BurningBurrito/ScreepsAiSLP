// Constants for Screeps API compatibility (these are global in Screeps)
export const RESOURCE_ENERGY = "energy";
export const OK = 0;
export const ERR_NOT_IN_RANGE = -9;
export const ERR_NO_PATH = -4;
export const ERR_INVALID_TARGET = -8;
export const FIND_MY_SPAWNS = 112;
export const FIND_MY_STRUCTURES = 108;
export const FIND_CREEPS = 101;
export const FIND_SOURCES = 102;
export const FIND_SOURCES_ACTIVE = 104;
export const STRUCTURE_EXTENSION = "extension";
export const STRUCTURE_TOWER = "tower";
export const TERRAIN_MASK_WALL = 1;
export const TERRAIN_MASK_SWAMP = 2;

// Mock store class with getFreeCapacity
class MockStore {
    private _energy: number;

    constructor(energy: number = 0) {
        this._energy = energy;
    }

    get RESOURCE_ENERGY(): number {
        return this._energy;
    }

    getFreeCapacity(resourceType?: string): number {
        // In Screeps, getFreeCapacity returns the free capacity for energy (or specified resource)
        // For simplicity, we always return a fixed amount
        return 50;
    }

    getUsedCapacity(resourceType?: string): number {
        return this._energy;
    }

    set energy(value: number) {
        this._energy = value;
    }

    get energy(): number {
        return this._energy;
    }
}

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
// Constants from node_modules/@types/screeps/index.d.ts
// These are the actual numeric/string values used at runtime in Screeps

// FIND_* constants (numeric values)
export const FIND_EXIT_TOP = 1;
export const FIND_EXIT_RIGHT = 3;
export const FIND_EXIT_BOTTOM = 5;
export const FIND_EXIT_LEFT = 7;
export const FIND_EXIT = 10;
export const FIND_CREEPS = 101;
export const FIND_MY_CREEPS = 102;
export const FIND_HOSTILE_CREEPS = 103;
export const FIND_SOURCES_ACTIVE = 104;
export const FIND_SOURCES = 105;
export const FIND_DROPPED_RESOURCES = 106;
export const FIND_STRUCTURES = 107;
export const FIND_MY_STRUCTURES = 108;
export const FIND_HOSTILE_STRUCTURES = 109;
export const FIND_FLAGS = 110;
export const FIND_CONSTRUCTION_SITES = 111;
export const FIND_MY_SPAWNS = 112;
export const FIND_HOSTILE_SPAWNS = 113;
export const FIND_MY_CONSTRUCTION_SITES = 114;
export const FIND_HOSTILE_CONSTRUCTION_SITES = 115;
export const FIND_MINERALS = 116;
export const FIND_NUKES = 117;
export const FIND_TOMBSTONES = 118;
export const FIND_POWER_CREEPS = 119;
export const FIND_MY_POWER_CREEPS = 120;
export const FIND_HOSTILE_POWER_CREEPS = 121;
export const FIND_DEPOSITS = 122;
export const FIND_RUINS = 123;

// ERR_* constants (negative numeric values)
export const ERR_NOT_OWNER = -1;
export const ERR_NO_PATH = -2;
export const ERR_NAME_EXISTS = -3;
export const ERR_BUSY = -4;
export const ERR_NOT_FOUND = -5;
export const ERR_NOT_ENOUGH_RESOURCES = -6;
export const ERR_NOT_ENOUGH_ENERGY = -6;
export const ERR_INVALID_TARGET = -7;
export const ERR_FULL = -8;
export const ERR_NOT_IN_RANGE = -9;
export const ERR_INVALID_ARGS = -10;
export const ERR_TIRED = -11;
export const ERR_NO_BODYPART = -12;
export const ERR_NOT_ENOUGH_EXTENSIONS = -6;
export const ERR_RCL_NOT_ENOUGH = -14;
export const ERR_GCL_NOT_ENOUGH = -15;
export const ERR_ACCESS_DENIED = -16;

// STRUCTURE_* constants (string values)
export const STRUCTURE_EXTENSION = "extension";
export const STRUCTURE_RAMPART = "rampart";
export const STRUCTURE_ROAD = "road";
export const STRUCTURE_SPAWN = "spawn";
export const STRUCTURE_LINK = "link";
export const STRUCTURE_WALL = "constructedWall";
export const STRUCTURE_KEEPER_LAIR = "keeperLair";
export const STRUCTURE_CONTROLLER = "controller";
export const STRUCTURE_STORAGE = "storage";
export const STRUCTURE_TOWER = "tower";
export const STRUCTURE_OBSERVER = "observer";
export const STRUCTURE_POWER_BANK = "powerBank";
export const STRUCTURE_POWER_SPAWN = "powerSpawn";
export const STRUCTURE_EXTRACTOR = "extractor";
export const STRUCTURE_LAB = "lab";
export const STRUCTURE_TERMINAL = "terminal";
export const STRUCTURE_CONTAINER = "container";
export const STRUCTURE_NUKER = "nuker";
export const STRUCTURE_FACTORY = "factory";
export const STRUCTURE_INVADER_CORE = "invaderCore";

// RESOURCE_* constants
export const RESOURCE_ENERGY = "energy";

// Action return codes
export const OK = 0;

// Expose as globals for Screeps API compatibility
(global as any).RESOURCE_ENERGY = RESOURCE_ENERGY;
(global as any).OK = OK;
(global as any).ERR_NOT_IN_RANGE = ERR_NOT_IN_RANGE;
(global as any).FIND_MY_SPAWNS = FIND_MY_SPAWNS;
(global as any).FIND_STRUCTURES = FIND_STRUCTURES;
(global as any).FIND_SOURCES_ACTIVE = FIND_SOURCES_ACTIVE;
(global as any).FIND_CONSTRUCTION_SITES = FIND_CONSTRUCTION_SITES;
(global as any).STRUCTURE_EXTENSION = STRUCTURE_EXTENSION;
(global as any).STRUCTURE_RAMPART = STRUCTURE_RAMPART;
(global as any).STRUCTURE_WALL = STRUCTURE_WALL;
(global as any).STRUCTURE_SPAWN = STRUCTURE_SPAWN;
(global as any).STRUCTURE_LINK = STRUCTURE_LINK;
(global as any).STRUCTURE_CONTROLLER = STRUCTURE_CONTROLLER;
(global as any).STRUCTURE_STORAGE = STRUCTURE_STORAGE;
(global as any).STRUCTURE_TOWER = STRUCTURE_TOWER;
(global as any).STRUCTURE_ROAD = STRUCTURE_ROAD;
(global as any).STRUCTURE_CONTAINER = STRUCTURE_CONTAINER;

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

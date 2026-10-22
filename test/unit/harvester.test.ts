import {assert} from "chai";
import {runHarvester} from "../../src/roles/harvester";
import {Game, Memory, FIND_MY_SPAWNS, FIND_MY_STRUCTURES, STRUCTURE_EXTENSION, STRUCTURE_TOWER} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

// Define RESOURCE_ENERGY for tests
const RESOURCE_ENERGY = "energy";

describe("harvester", () => {
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
    // Define Screeps globals for harvester tests
    // @ts-ignore
    global.FIND_SOURCES_ACTIVE = 104;
    // @ts-ignore
    global.FIND_MY_SPAWNS = 112;
    // @ts-ignore
    global.FIND_STRUCTURES = 107;
    // @ts-ignore
    global.FIND_MY_STRUCTURES = 108;
    // @ts-ignore
    global.STRUCTURE_EXTENSION = "extension";
    // @ts-ignore
    global.STRUCTURE_TOWER = "tower";
    // @ts-ignore
    global.RESOURCE_ENERGY = "energy";
    // @ts-ignore
    global.ERR_NOT_IN_RANGE = -9;
    // @ts-ignore
    global.ERR_NO_PATH = -4;
    // @ts-ignore
    global.ERR_INVALID_TARGET = -8;
  });

  it("transfers to spawn when spawn has free capacity and creep has partial energy", () => {
    // Setup: harvester with partial energy (20 of 50) and spawn with free capacity
    let transferCallCount = 0;
    let upgradeControllerCallCount = 0;

    const creep: any = {
      memory: { working: true, role: "harvester" },
      store: {
        [RESOURCE_ENERGY]: 20,
        getFreeCapacity: (resourceType: ResourceConstant) => 30,
        getCapacity: (resourceType: ResourceConstant) => 50,
      },
      pos: { findClosestByPath: () => null },
      room: {
        find: (type: number, options?: any) => {
          if (type === FIND_MY_SPAWNS) return [{ store: { getFreeCapacity: () => 10 } }];
          return [];
        },
        controller: { pos: { findClosestByPath: () => null } },
      },
      moveTo: () => {},
      upgradeController: () => { upgradeControllerCallCount++; return OK; },
      transfer: (target: any, resourceType: ResourceConstant) => { transferCallCount++; return ERR_NOT_IN_RANGE; },
      harvest: () => ERR_NOT_IN_RANGE,
      drop: () => {},
    };

    runHarvester(creep);

    // With partial energy and spawn having free capacity, should call transfer
    assert.equal(transferCallCount, 1, "transfer should be called when spawn has free capacity");
    assert.equal(upgradeControllerCallCount, 0, "upgradeController should not be called");
  });

  it("upgrades controller when spawn is full and creep has partial energy", () => {
    // Setup: harvester with partial energy (20 of 50) but spawn is full
    let transferCallCount = 0;
    let upgradeControllerCallCount = 0;

    const creep: any = {
      memory: { working: true, role: "harvester" },
      store: {
        [RESOURCE_ENERGY]: 20,
        getFreeCapacity: (resourceType: ResourceConstant) => 30,
        getCapacity: (resourceType: ResourceConstant) => 50,
      },
      pos: { findClosestByPath: () => null },
      room: {
        find: (type: number, options?: any) => {
          if (type === FIND_MY_SPAWNS) return [{ store: { getFreeCapacity: () => 0 } }];
          if (type === FIND_MY_STRUCTURES) return []; // No towers
          return [];
        },
        controller: { pos: { findClosestByPath: () => null } },
      },
      moveTo: () => {},
      upgradeController: () => { upgradeControllerCallCount++; return OK; },
      transfer: (target: any, resourceType: ResourceConstant) => { transferCallCount++; return ERR_NOT_IN_RANGE; },
      harvest: () => ERR_NOT_IN_RANGE,
    };

    runHarvester(creep);

    // With partial energy but spawn full, should call upgradeController
    assert.equal(transferCallCount, 0, "transfer should not be called when spawn is full");
    assert.equal(upgradeControllerCallCount, 1, "upgradeController should be called when spawn is full");
  });

  it("harvests from source when store is empty", () => {
    const creep: any = {
      memory: { working: false, role: "harvester" },
      store: {
        [RESOURCE_ENERGY]: 0,
        getFreeCapacity: (resourceType: ResourceConstant) => 50,
        getCapacity: (resourceType: ResourceConstant) => 50,
      },
      pos: { findClosestByPath: () => null },
      room: { controller: null },
      moveTo: () => {},
      upgradeController: () => OK,
      transfer: () => ERR_NOT_IN_RANGE,
      harvest: () => OK,
    };

    runHarvester(creep);

    // When not working and store is empty, the creep should be harvesting
    assert.isFalse(creep.memory.working, "creep should be in gathering mode when store is empty");
  });
});
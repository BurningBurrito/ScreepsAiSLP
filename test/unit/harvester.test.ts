import {assert} from "chai";
import {runHarvester} from "../../src/roles/harvester";
import {Game, Memory} from "./mock";

// Import types to extend global scope
import "../../src/types/memory";

describe("harvester", () => {
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
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
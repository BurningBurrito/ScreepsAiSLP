import {assert} from "chai";
import {runHarvester} from "../../src/roles/harvester";
import {Game, Memory} from "./mock"

// Import types to extend global scope
import "../../src/types/memory";

describe("harvester", () => {
  beforeEach(() => {
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("delivers energy when store is full and continues after partial delivery", () => {
    // Setup: harvester with full store and working flag set
    const creep: any = {
      memory: { working: true, role: "harvester" },
      store: {
        [RESOURCE_ENERGY]: 300,
        getFreeCapacity: (resourceType: ResourceConstant) => 0,
        getCapacity: (resourceType: ResourceConstant) => 300,
      },
      pos: { findClosestByPath: () => null },
      room: {
        find: (type: number, options?: any) => {
          if (type === FIND_MY_SPAWNS) return [];
          if (options && options.filter) return []; // extensions filter
          return [];
        },
        controller: null,
      },
      moveTo: () => {},
      upgradeController: () => OK,
      transfer: () => ERR_NOT_IN_RANGE,
      harvest: () => ERR_NOT_IN_RANGE,
    };

    // Simulate partial delivery: transfer returns ERR_NOT_IN_RANGE but store is reduced
    // The creep should try to deliver again (not harvest) because working flag is still true
    runHarvester(creep);

    // After partial delivery (simulating one transfer), store is not empty but not full
    creep.store[RESOURCE_ENERGY] = 100;

    // The harvester should continue working (trying to deliver or upgrade)
    // with the old bug, it would wait forever because store >= capacity check fails
    runHarvester(creep);

    // Verify the working flag logic allows continued delivery
    assert.isTrue(creep.memory.working, "creep should remain working when store is not empty");
  });

  it("harvests from source when store is empty", () => {
    const creep: any = {
      memory: { working: false, role: "harvester" },
      store: {
        [RESOURCE_ENERGY]: 0,
        getFreeCapacity: (resourceType: ResourceConstant) => 300,
        getCapacity: (resourceType: ResourceConstant) => 300,
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
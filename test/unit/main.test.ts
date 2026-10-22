import {assert} from "chai";
import {loop} from "../../src/main";
import {Game, Memory} from "./mock"

// Constants for Screeps API compatibility
const RESOURCE_ENERGY = "energy";

// Mock store class
class MockStore {
    getFreeCapacity(resourceType?: string): number {
        return 50;
    }
    getUsedCapacity(resourceType?: string): number {
        return 0;
    }
}

describe("main", () => {
  before(() => {
    // runs before all test in this block
  });

  beforeEach(() => {
    // runs before each test in this block
    // @ts-ignore : allow adding Game to global
    global.Game = _.clone(Game);
    // @ts-ignore : allow adding Memory to global
    global.Memory = _.clone(Memory);
  });

  it("should export a loop function", () => {
    assert.isTrue(typeof loop === "function");
  });

  it("should return void when called with no context", () => {
    assert.isUndefined(loop());
  });

  it("should delete memory of missing creeps", () => {
    Memory.creeps.persistValue = { role: "harvester" };
    Memory.creeps.notPersistValue = { role: "upgrader" };

    Game.creeps.persistValue = {
      memory: { role: "harvester" },
      store: { [RESOURCE_ENERGY]: 0, getFreeCapacity: () => 50, getUsedCapacity: () => 0 },
      pos: { roomName: "W0N1", findClosestByPath: (type: number) => null },
      room: {
        find: (type: number) => [],
        controller: { pos: { findClosestByPath: () => null } },
      },
    };

    loop();

    assert.isDefined(Memory.creeps.persistValue);
    assert.isUndefined(Memory.creeps.notPersistValue);
  });
});

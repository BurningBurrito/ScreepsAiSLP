// Unit tests for the spawn manager: cold boot, priorities, and the
// one-spawn-per-tick rule. Runs against the shared mock (test/unit/mock.ts),
// with a room object built per test below.

import {assert} from "chai";
import {checkAndSpawn} from "../../src/managers/spawnManager";
import {Game, Memory} from "./mock";
import "../../src/types/memory";

const WORK = "work";
const CARRY = "carry";
const MOVE = "move";

// These numeric values match the real engine constants (see the type
// definitions); the mock does not declare them, so the tests install them.
const FIND_MY_SPAWNS = 112;
const FIND_CONSTRUCTION_SITES = 105;
const FIND_STRUCTURES = 107;
const FIND_SOURCES_ACTIVE = 104;
const BODYPART_COST = {work: 100, carry: 50, move: 50};

interface SpawnCall {
  body: string[];
  name: string;
  memory: {role: string; working: boolean; sourceId?: string};
}

interface RoomOptions {
  capacity?: number;
  available?: number;
  /** Number of open construction sites (drives the builder minimum). */
  sites?: number;
  /** Number of containers (drives the hauler minimum). */
  containers?: number;
  /** Non-null while a spawn animation runs. */
  spawning?: object | null;
  /** Return code of spawnCreep (OK by default). */
  spawnResult?: number;
  /** When true, room.find returns no spawn at all. */
  noSpawn?: boolean;
  sources?: {id: string}[];
}

describe("spawnManager", () => {
  beforeEach(() => {
    // Reset the shared mock singletons: other test files alias parts of
    // them with shallow clones, so a field written through an alias would
    // survive a deep clone of the import. Reassign before cloning.
    Game.creeps = {};
    Memory.creeps = {};
    Memory.creepCounter = 0;

    // @ts-ignore : the mock is injected as the game globals
    global.Game = _.cloneDeep(Game);
    // @ts-ignore : the mock is injected as the game globals
    global.Memory = _.cloneDeep(Memory);

    // @ts-ignore
    global.WORK = WORK; // @ts-ignore
    global.CARRY = CARRY; // @ts-ignore
    global.MOVE = MOVE; // @ts-ignore
    global.OK = 0; // @ts-ignore
    global.ERR_BUSY = -11; // @ts-ignore
    global.FIND_MY_SPAWNS = FIND_MY_SPAWNS; // @ts-ignore
    global.FIND_CONSTRUCTION_SITES = FIND_CONSTRUCTION_SITES; // @ts-ignore
    global.FIND_STRUCTURES = FIND_STRUCTURES; // @ts-ignore
    global.FIND_SOURCES_ACTIVE = FIND_SOURCES_ACTIVE; // @ts-ignore
    global.STRUCTURE_CONTAINER = "container"; // @ts-ignore
    global.BODYPART_COST = BODYPART_COST; // @ts-ignore
    global.MAX_CREEP_SIZE = 50;
  });

  /**
   * Builds a mock room with one spawn. The room exposes just enough of the
   * API for the spawn manager: find (spawns, sites, structures, sources),
   * energyAvailable and energyCapacityAvailable.
   */
  function makeRoom(options: RoomOptions): {room: any; calls: SpawnCall[]} {
    const calls: SpawnCall[] = [];
    const spawn = {
      spawning: options.spawning === undefined ? null : options.spawning,
      // The engine's third parameter is an options object; the memory the
      // creep receives lives at options.memory.
      spawnCreep: (body: string[], name: string, opts: {memory?: SpawnCall["memory"]}) => {
        calls.push({body, name, memory: opts.memory as SpawnCall["memory"]});
        return options.spawnResult === undefined ? 0 : options.spawnResult;
      },
    };
    const room = {
      name: "w10n10",
      energyCapacityAvailable: options.capacity === undefined ? 300 : options.capacity,
      energyAvailable: options.available === undefined ? 300 : options.available,
      find: (type: number) => {
        if (type === FIND_MY_SPAWNS) return options.noSpawn ? [] : [spawn];
        if (type === FIND_CONSTRUCTION_SITES) return new Array(options.sites === undefined ? 0 : options.sites).fill(0);
        if (type === FIND_STRUCTURES) {
          return new Array(options.containers === undefined ? 0 : options.containers).fill({structureType: "container"});
        }
        if (type === FIND_SOURCES_ACTIVE) {
          return options.sources === undefined ? [{id: "source-1"}, {id: "source-2"}] : options.sources;
        }
        return [];
      },
    };

    return {room, calls};
  }

  /**
   * Adds living creeps to the globals the code under test reads (the cloned
   * globals, not the mock import: the clone happened in beforeEach).
   */
  function addCreeps(creeps: Record<string, {role: string}>): void {
    for (const name in creeps) {
      // @ts-ignore : write into the game globals
      (global as any).Game.creeps[name] = {memory: {role: creeps[name].role}};
      // @ts-ignore : write into the game globals
      (global as any).Memory.creeps[name] = {role: creeps[name].role};
    }
  }

  it("cold boot: starts exactly one spawn per tick, and the highest-priority role wins", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Cold boot: nothing is alive, so the first worker goes out now. But the
    // engine drops all but one spawnCreep intent per tick, so at most one
    // may be started.
    assert.equal(calls.length, 1);
    // Priority 1 is the harvester, and 300 energy buys the full-size body.
    assert.equal(calls[0].name, "harvester-0");
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
    assert.equal(calls[0].memory.role, "harvester");
    // A fresh harvester starts collecting (working=false means "harvest
    // mode" for this role; it flips to true once the store is full).
    assert.equal(calls[0].memory.working, false);
    assert.isDefined(calls[0].memory.sourceId);
  });

  it("cold boot with a low store: the first harvester is sized down, nothing else spawns", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 200,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-0");
    // A cold boot sizes the body from the energy available right now (200),
    // not from the 300 the extensions will hold once filled: [W,W,C,M] would
    // cost 300 and never spawn. [W,C,M] fits and starts income immediately.
    assert.deepEqual(calls[0].body, [WORK, CARRY, MOVE]);
  });

  it("does not spawn when the spawn is busy", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: {},
      spawnResult: OK,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0);
  });


  it("does not spawn when the store cannot pay for even the smallest body", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 150,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0);
  });

  it("does not spawn when there is no spawn", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      noSpawn: true,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0);
  });

  it("does not spawn when every role is at its minimum", () => {
    addCreeps({
      "harvester-0": {role: "harvester"},
      "harvester-1": {role: "harvester"},
      "harvester-2": {role: "harvester"},
      "upgrader-3": {role: "upgrader"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0);
  });

  it("spawns a builder while construction sites exist and builders are below minimum", () => {
    addCreeps({
      "harvester-0": {role: "harvester"},
      "harvester-1": {role: "harvester"},
      "harvester-2": {role: "harvester"},
      "upgrader-3": {role: "upgrader"},
    });
    // Four creeps already exist, so the next name uses counter value 4.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 4;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 4,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-4");
    assert.equal(calls[0].memory.role, "builder");
    // Not a cold boot, so the body is sized from the room's capacity (300).
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
  });

  it("spawns a hauler once a container exists and haulers are below minimum", () => {
    addCreeps({
      "harvester-0": {role: "harvester"},
      "harvester-1": {role: "harvester"},
      "harvester-2": {role: "harvester"},
      "upgrader-3": {role: "upgrader"},
    });
    // Four creeps already exist, so the next name uses counter value 4.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 4;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 1,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "hauler-4");
    assert.equal(calls[0].memory.role, "hauler");
    assert.deepEqual(calls[0].body, [CARRY, CARRY, MOVE, MOVE]);
  });

  it("moves on to the next role when the engine rejects a spawn", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: -11,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);

    // A rejected call creates no engine intent, so the next role may still
    // start its own intent this tick - nothing can be overwritten.
    assert.equal(calls.length, 2);
    assert.equal(calls[0].name, "harvester-0");
    assert.equal(calls[1].name, "upgrader-1");
  });

  it("keeps the counter moving when the engine rejects a spawn", () => {
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: -11,
      sources: [{id: "source-1"}],
    });

    checkAndSpawn(room);
    checkAndSpawn(room);

    // Rejected names must not be handed out twice: each tick gets the next
    // counter values.
    assert.equal(calls.length, 4);
    assert.equal(calls[0].name, "harvester-0");
    assert.equal(calls[1].name, "upgrader-1");
    assert.equal(calls[2].name, "harvester-2");
    assert.equal(calls[3].name, "upgrader-3");
  });
});

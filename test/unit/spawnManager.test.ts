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
const ATTACK = "attack";

// These numeric values match the real engine constants (see the type
// definitions); the mock does not declare them, so the tests install them.
const FIND_MY_SPAWNS = 112;
const FIND_CONSTRUCTION_SITES = 111;
const FIND_STRUCTURES = 107;
const FIND_SOURCES = 105;
const FIND_SOURCES_ACTIVE = 104;
const BODYPART_COST = {work: 100, carry: 50, move: 50, attack: 80};

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
  /** Controller level for the minimums table; undefined = no controller. */
  controllerLevel?: number;
  sources?: {id: string; pos?: {x: number; y: number}}[];
  /** "x,y" tiles that are wall terrain (all others are plain). */
  wallTiles?: string[];
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
    global.ATTACK = ATTACK; // @ts-ignore
    global.OK = 0; // @ts-ignore
    global.ERR_BUSY = -11; // @ts-ignore
    global.FIND_MY_SPAWNS = FIND_MY_SPAWNS; // @ts-ignore
    global.FIND_CONSTRUCTION_SITES = FIND_CONSTRUCTION_SITES; // @ts-ignore
    global.FIND_STRUCTURES = FIND_STRUCTURES; // @ts-ignore
    global.FIND_SOURCES = FIND_SOURCES; // @ts-ignore
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
    // Default source positions (the test room's layout); tests may override
    // them via options.sources.
    const wallTiles = new Set(options.wallTiles === undefined ? [] : options.wallTiles);
    const sources = (options.sources === undefined
      ? [{id: "source-1"}, {id: "source-2"}]
      : options.sources).map((source, index) => ({
      id: source.id,
      pos: source.pos === undefined
        ? (index === 0 ? {x: 14, y: 18} : {x: 39, y: 14})
        : source.pos,
    }));
    const room = {
      name: "w10n10",
      energyCapacityAvailable: options.capacity === undefined ? 300 : options.capacity,
      energyAvailable: options.available === undefined ? 300 : options.available,
      controller: options.controllerLevel !== undefined ? {level: options.controllerLevel, pos: {x: 20, y: 20}} : undefined,
      // 0 = plain, TERRAIN_MASK_WALL (1) = wall; the source-assignment code
      // probes the tiles next to each source for standable room.
      getTerrain: () => ({
        get: (x: number, y: number) => (wallTiles.has(`${x},${y}`) ? 1 : 0),
      }),
      find: (type: number) => {
        if (type === FIND_MY_SPAWNS) return options.noSpawn ? [] : [spawn];
        if (type === FIND_CONSTRUCTION_SITES) return new Array(options.sites === undefined ? 0 : options.sites).fill(0);
        if (type === FIND_STRUCTURES) {
          const count = options.containers === undefined ? 0 : options.containers;
          // Each mock container sits on the tile next to the source at the
          // same index (Chebyshev distance 1), so the source-split logic in
          // minCreepsPerRole sees a container on that source and none on the
          // rest. getRangeTo mirrors the engine's Chebyshev metric.
          return Array.from({length: count}, (_, i) => {
            const src = sources[i] === undefined ? sources[0] : sources[i];
            const cx = src.pos.x + 1;
            const cy = src.pos.y;
            return {
              structureType: "container",
              pos: {
                x: cx,
                y: cy,
                // The engine's getRangeTo accepts a RoomPosition OR any
                // object that carries a pos (line 4788 of the types) - the
                // spawn manager passes a whole Source, so unwrap .pos when
                // present. Mirrors the engine's Chebyshev metric.
                getRangeTo: (other: {x?: number; y?: number; pos?: {x: number; y: number}}) => {
                  const tx = other.pos !== undefined ? other.pos.x : (other.x ?? 0);
                  const ty = other.pos !== undefined ? other.pos.y : (other.y ?? 0);
                  return Math.max(Math.abs(tx - cx), Math.abs(ty - cy));
                },
              },
            };
          });
        }
        if (type === FIND_SOURCES_ACTIVE || type === FIND_SOURCES) {
          return sources;
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
  function addCreeps(creeps: Record<string, {role: string; sourceId?: string}>): void {
    for (const name in creeps) {
      // @ts-ignore : write into the game globals
      (global as any).Game.creeps[name] = {memory: {role: creeps[name].role, sourceId: creeps[name].sourceId}};
      // @ts-ignore : write into the game globals
      (global as any).Memory.creeps[name] = {role: creeps[name].role, sourceId: creeps[name].sourceId};
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

  it("does not spawn when every role is at its minimum and the store is not full", () => {
    addCreeps({
      "harvester-0": {role: "harvester"},
      "harvester-1": {role: "harvester"},
      "harvester-2": {role: "harvester"},
      "upgrader-3": {role: "upgrader"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 200,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Minimums are met, and the surplus step (store full AND every minimum
    // met, owner feedback 2026-10-30) does not run because the store is
    // not full: nothing is actually sitting idle.
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
    // M5: the container'd source is now served by a stationary miner, so the
    // miner minimum is met here (miner-3) and the spawn falls through to the
    // hauler - the role that only exists once a container is built.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-2"},
      "miner-1": {role: "miner", sourceId: "source-1"},
      "upgrader-2": {role: "upgrader"},
    });
    // Three creeps already exist, so the next name uses counter value 3.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 3;
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
    assert.equal(calls[0].name, "hauler-3");
    assert.equal(calls[0].memory.role, "hauler");
    assert.deepEqual(calls[0].body, [CARRY, CARRY, MOVE, MOVE]);
  });

  it("spawns one harvester per container-less source (the M5 source-state split)", () => {
    // M5: the source-worker minimum is no longer the level table row - it is
    // one worker per source, and the worker's role depends on the source's
    // state. Both sources here are container-less, so both want a harvester;
    // only one is alive, and harvesters come before builders in the spawn
    // order.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
    });
    // Two creeps already exist, so the next name uses counter value 2.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 2;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 4,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 2,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-2");
    assert.equal(calls[0].memory.role, "harvester");
  });

  it("spawns one harvester per container-less source, even at RCL 3", () => {
    // M5: the source-worker minimum is one per source, not the level row.
    // Both sources are container-less, so both want a harvester; only one is
    // alive. Harvesters come before builders in the spawn order, so the
    // missing harvester spawns even though a builder slot is also open.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
      "builder-2": {role: "builder"},
    });
    // Three creeps already exist, so the next name uses counter value 3.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 3;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 60,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 3,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-3");
    assert.equal(calls[0].memory.role, "harvester");
  });

  it("keeps the bootstrap queue short at RCL 1: both sources covered, builder next", () => {
    // M5: one source worker per container-less source, so both sources need
    // a harvester at bootstrap. With both covered the builder is next, so the
    // upgrader follows right behind and can show controller progress within
    // the smoke test's 500 ticks.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
    });
    // Two creeps already exist, so the next name uses counter value 2.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 2;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 60,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 1,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Both sources are covered, so the builder is next.
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-2");
    assert.equal(calls[0].memory.role, "builder");
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
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

  /**
   * Wall tiles around the 3x3 block centred on (x, y) that leave exactly
   * two standable tiles, (x-1, y+1) and (x, y+1) - the shape of the test
   * room's pocket source.
   */
  function pocketWalls(x: number, y: number): string[] {
    const walls: string[] = [];
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        if (dx === 0 && dy === 0) continue;
        if (dx === -1 && dy === 1) continue;
        if (dx === 0 && dy === 1) continue;
        walls.push(`${x + dx},${y + dy}`);
      }
    }
    return walls;
  }

  it("keeps a new harvester off a pocket source whose standable tiles are full", () => {
    // source-1 is a pocket with exactly two standable tiles, and one
    // harvester is already assigned to it. source-2 is open ground. Both
    // sources are container-less, so the missing source-worker slot must go
    // to the open source-2, not the pocket.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
    });
    // One creep already exists, so the next name uses counter value 1.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 1;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 3,
      wallTiles: pocketWalls(14, 18),
    });

    checkAndSpawn(room);

    // The pocket's score is 2 standable - 1 assigned = 1, the open source's
    // 8 - 0 = 8: the new harvester must not be sent to a source it could
    // never stand next to (it would oscillate at the pocket entrance instead
    // of harvesting).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-1");
    assert.equal(calls[0].memory.role, "harvester");
    assert.equal(calls[0].memory.sourceId, "source-2");
  });

  it("still uses the pocket source while it has a free standable tile", () => {
    // Both sources are two-tile pockets; the second one is full, the first
    // has one free tile, so the pocket is still the right assignment.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-2"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
    });
    // Three creeps already exist, so the next name uses counter value 3.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 3;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 3,
      wallTiles: [...pocketWalls(14, 18), ...pocketWalls(39, 14)],
    });

    checkAndSpawn(room);

    // Scores: source-1 2 - 0 = 2, source-2 2 - 2 = 0 -> the pocket wins.
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-3");
    assert.equal(calls[0].memory.sourceId, "source-1");
  });

  // --- Surplus spawning (owner feedback 2026-10-30) -----------------------
  // The minimums keep the colony alive, not busy: while every minimum is
  // met AND the store is full, checkAndSpawn spends the idle energy on one
  // extra creep instead of idling (the smoke scorecard's "Spawn idle while
  // full" sat at 100 % for exactly this reason).

  it("spawns a surplus harvester bound to the uncovered source when the minimums are met and the store is full", () => {
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
    });
    // Two creeps already exist, so the next name uses counter value 2.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 2;
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

    // RCL 1 wants one harvester and one upgrader: both are alive, so the
    // surplus step runs. Source 2 has no harvester, and a surplus harvester
    // covers an uncovered source before any other surplus role (it is the
    // only surplus creep that adds income instead of only spending).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-2");
    assert.equal(calls[0].memory.role, "harvester");
    assert.equal(calls[0].memory.sourceId, "source-2");
  });

  it("spawns a surplus upgrader once every source is covered and the store is full", () => {
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
    });
    // Three creeps already exist, so the next name uses counter value 3.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 3;
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

    // Both sources are covered and the minimums are met: the surplus step
    // takes the second upgrader - the room's fixed energy sink that keeps
    // the store cycling instead of sitting full (capped at
    // SURPLUS_UPGRADER_MAX = 2 total).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-3");
    assert.equal(calls[0].memory.role, "upgrader");
    assert.equal(calls[0].memory.working, true);
    // No controller container yet, so the upgrader walks for its energy.
    // 300 capacity buys the 300-energy [W,W,C,M], the historical
    // pre-container body. It must cost the whole RCL 1 capacity, or the
    // upgrader spawns before the income crew is up and its building work
    // pins the store at the 50% withdrawal floor (the M4 regression of
    // 2026-11-03).
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
  });

  it("spawns a WORK-heavy upgrader once a controller container exists", () => {
    // The M5 switch (owner feedback 2026-11-02): when a finished container
    // sits within range 3 of the controller, the energy comes to the
    // upgrader and its body goes WORK-heavy again - one MOVE reaches the
    // container, so every spare part is WORK. Both sources sit next to the
    // mock controller (20,20), so both containers are within range 3.
    addCreeps({
      "miner-0": {role: "miner", sourceId: "source-1"},
      "miner-1": {role: "miner", sourceId: "source-2"},
      "hauler-2": {role: "hauler"},
    });
    // Three creeps already exist, so the next name uses counter value 3.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 3;
    const {room, calls} = makeRoom({
      capacity: 800,
      available: 800,
      sites: 0,
      containers: 2,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 3,
      sources: [
        {id: "source-1", pos: {x: 17, y: 18}},
        {id: "source-2", pos: {x: 19, y: 18}},
      ],
    });

    checkAndSpawn(room);

    // Both miners cover the container'd sources and the hauler is alive, so
    // the upgrader minimum (1) is the next role - sized from the 800
    // capacity, and the controller container makes it the WORK-heavy table.
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-3");
    assert.equal(calls[0].memory.role, "upgrader");
    assert.deepEqual(calls[0].body, [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE]);
  });

  it("spawns a surplus builder while sites exist, once the upgrader cap is reached", () => {
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
      "upgrader-3": {role: "upgrader"},
      "builder-4": {role: "builder"},
    });
    // Five creeps already exist, so the next name uses counter value 5.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 5;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Sources covered, both upgraders alive (the cap), one builder (the
    // minimum): the surplus step adds a second builder because construction
    // sites exist (capped at SURPLUS_BUILDER_MAX = 3 total).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-5");
    assert.equal(calls[0].memory.role, "builder");
  });

  it("does not spawn a surplus creep while the store is not full", () => {
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 200,
      sites: 0,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Minimums met, but the store is not full: the surplus step only applies
    // when energy is actually sitting unused in the store.
    assert.equal(calls.length, 0);
  });

  it("does not spawn a surplus creep while a minimum is still missing", () => {
    // M5: both sources are container-less, so both need a harvester. With
    // both covered the upgrader minimum (1) is the missing one: the main
    // loop fills it, and the surplus step never runs - no double-spending
    // while below minimums.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
    });
    // Two creeps already exist, so the next name uses counter value 2.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 2;
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

    // The upgrader minimum (1) is not met: the main loop fills it, and the
    // surplus step never runs - no double-spending while below minimums.
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-2");
    assert.equal(calls[0].memory.role, "upgrader");
  });

  it("stops spawning once every surplus cap is reached", () => {
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
      "upgrader-3": {role: "upgrader"},
      "builder-4": {role: "builder"},
      "builder-5": {role: "builder"},
      "builder-6": {role: "builder"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Sources covered, two upgraders (the cap), three builders (the cap):
    // the surplus step has nothing left to spend the idle energy on, so the
    // spawn idles - correct now, because every sink is busy.
    assert.equal(calls.length, 0);
  });

  describe("cold boot and income floor (owner feedback 2026-11-02)", () => {
    it("cold boot beats the dead-hauler path: with no income alive, the harvester spawns first", () => {
      // A container exists and no hauler is alive, so the hauler would also
      // be sized from the available energy - but the cold boot pre-pass
      // (no harvester AND no miner) runs first and starts the income itself.
      const {room, calls} = makeRoom({
        capacity: 300,
        available: 200,
        sites: 0,
        containers: 1,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "harvester-0");
      // Sized from the 200 available, not the 300 capacity: a wiped colony
      // must spawn the income it can pay for right now, or the store is
      // never refilled and it can never recover.
      assert.deepEqual(calls[0].body, [WORK, CARRY, MOVE]);
      assert.equal(calls[0].memory.role, "harvester");
    });

    it("income floor: one income creep alive, hauler below minimum - the hauler spawns before the upgrader", () => {
      // One source with a container: the miner minimum is met, and the
      // hauler minimum (1, a container exists) and the upgrader minimum (1)
      // are both unmet. SPAWN_ORDER puts the upgrader before the hauler, so
      // without the income floor the upgrader would win this tick. With one
      // income creep alive (below ENERGY_INCOME_FLOOR = 2) the floor hands
      // the spawn to the hauler instead.
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
      });
      // @ts-ignore : write into the game globals
      (global as any).Memory.creepCounter = 1;
      const {room, calls} = makeRoom({
        capacity: 300,
        available: 200,
        sites: 0,
        containers: 1,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "hauler-1");
      assert.equal(calls[0].memory.role, "hauler");
      // The hauler crew is dead (no hauler alive while a container exists),
      // so this one is sized from the 200 available, not the capacity:
      // the [C,C,C,C,C,C,C,C,M,M,M] body would cost 450 and never spawn.
      assert.deepEqual(calls[0].body, [CARRY, CARRY, MOVE, MOVE]);
    });

    it("income floor: at the floor, the main order applies (upgrader before hauler)", () => {
      // Two income creeps alive (at ENERGY_INCOME_FLOOR = 2): the floor is
      // not active, and the main loop follows SPAWN_ORDER - the unmet
      // upgrader is spawned before the unmet hauler.
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
        "harvester-1": {role: "harvester", sourceId: "source-2"},
      });
      // @ts-ignore : write into the game globals
      (global as any).Memory.creepCounter = 2;
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
      assert.equal(calls[0].name, "upgrader-2");
      assert.equal(calls[0].memory.role, "upgrader");
      // Income is alive, so the body is sized from the 300 capacity - and
      // with no controller container the balanced table picks the 300-energy
      // [W,W,C,M], the historical pre-container body that must cost the
      // whole RCL 1 capacity (see the body table in spawnManager).
      assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
    });

    it("income floor exception: a war-mode room with dry towers spawns the defender first", () => {
      // Same shape as the hauler test (one income creep, hauler below
      // minimum), but the room is in war mode and no tower can fire in the
      // unit environment: the defender minimum exists and takes priority
      // over the income floor (a colony that does not defend itself
      // defends no one).
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
      });
      // @ts-ignore : write into the game globals
      (global as any).Memory.creepCounter = 1;
      // @ts-ignore : write into the game globals
      (global as any).Memory.mode = "war";
      const {room, calls} = makeRoom({
        capacity: 300,
        available: 300,
        sites: 0,
        containers: 1,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "defender-1");
      assert.equal(calls[0].memory.role, "defender");
      // The defender carries nothing (it only attacks and moves): 300
      // capacity buys the 260-energy ATTACK+MOVE pair body.
      assert.deepEqual(calls[0].body, [ATTACK, ATTACK, MOVE, MOVE]);
    });

    it("cold boot: no creeps, 300 of 1300 available - a harvester spawns this tick", () => {
      // The owner's exact wipe scenario (a): nothing alive, the store holds
      // 300 while the room's capacity promises 1300 (the spawn plus a full
      // set of extensions). Sized against the capacity, the largest harvester
      // is the 500-energy [W,W,W,C,C,M,M] body and 300 < 500, so the spawn
      // would wait for energy that nothing can ever deliver. Sized from what
      // the store holds right now, the 300-energy [W,W,C,M] body starts
      // immediately and the colony can recover.
      const {room, calls} = makeRoom({
        capacity: 1300,
        available: 300,
        sites: 0,
        containers: 0,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}, {id: "source-2"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "harvester-0");
      assert.equal(calls[0].memory.role, "harvester");
      assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
    });

    it("income floor: one miner alive, hauler dead, 350 of 1300 - a hauler spawns from what is available", () => {
      // The owner's wipe scenario (b): a miner works its container, the
      // hauler is dead, the store holds 350 of 1300. One income creep is
      // below the floor of two, so this tick's spawn goes to the hauler -
      // and the hauler is sized from the 350 available, so the 200-energy
      // [C,C,M,M] body starts right away instead of waiting for a body
      // nobody can pay for yet.
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
      });
      // @ts-ignore : write into the game globals
      (global as any).Memory.creepCounter = 1;
      const {room, calls} = makeRoom({
        capacity: 1300,
        available: 350,
        sites: 0,
        containers: 1,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "hauler-1");
      assert.equal(calls[0].memory.role, "hauler");
      assert.deepEqual(calls[0].body, [CARRY, CARRY, MOVE, MOVE]);
    });

    it("income floor: same room at full energy - the hauler still goes first, with the largest body", () => {
      // The owner's wipe scenario (c): one miner, one dead hauler, and the
      // store is full (1300 of 1300). Even at full energy the hauler is
      // below its minimum while the income floor is active, so it spawns
      // before the upgrader - and with a full store the body is the largest
      // the capacity allows: 12 CARRY and 4 MOVE for 800 energy.
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
      });
      // @ts-ignore : write into the game globals
      (global as any).Memory.creepCounter = 1;
      const {room, calls} = makeRoom({
        capacity: 1300,
        available: 1300,
        sites: 0,
        containers: 1,
        spawning: null,
        spawnResult: OK,
        sources: [{id: "source-1"}],
      });

      checkAndSpawn(room);

      assert.equal(calls.length, 1);
      assert.equal(calls[0].name, "hauler-1");
      assert.equal(calls[0].memory.role, "hauler");
      assert.deepEqual(calls[0].body, [
        CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
        CARRY, CARRY, CARRY, CARRY, CARRY,
        MOVE, MOVE, MOVE, MOVE,
      ]);
    });
  });
});

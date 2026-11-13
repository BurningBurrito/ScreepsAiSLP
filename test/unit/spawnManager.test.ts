// Unit tests for the spawn manager: cold boot, priorities, and the
// one-spawn-per-tick rule. Runs against the shared mock (test/unit/mock.ts),
// with a room object built per test below.

import {assert} from "chai";
import {checkAndSpawn, incomeBelowMinimum} from "../../src/managers/spawnManager";
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

  it("builder below minimum with a partly full store waits for the capacity-sized body", () => {
    // Same shape as the builder test above, but the store holds 200 of 300.
    // The builder is an energy CONSUMER, not a producer: the living income
    // crew refills the store for it, so it keeps capacity sizing and waits
    // for the 300-energy 2-WORK body instead of shrinking (sizingBudgetFor).
    // A shrunken 1-WORK builder would self-harvest at the source and steal
    // the 20 energy per tick of source regeneration from the harvester crew
    // - the same mechanism that broke M3's extension build on 2026-11-11.
    addCreeps({
      "harvester-0": {role: "harvester"},
      "harvester-1": {role: "harvester"},
      "harvester-2": {role: "harvester"},
      "upgrader-3": {role: "upgrader"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 200,
      sites: 4,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // No minimum is short except the builder (and it is a consumer role),
    // and its capacity-sized body cannot be paid from 200: nothing spawns.
    assert.equal(calls.length, 0);
  });

  it("harvester below minimum with a partly full store waits for the capacity-sized body", () => {
    // Regression test for commit 1404382 (2026-11-11), which sized every
    // income role from the stored energy: on a store of 200 of 300 the
    // replacement was the 200-energy 1-WORK body, and each death left less
    // stored energy, so the crew ratcheted down body for body. M3's run
    // ended with 2 finished extensions (400 capacity) instead of 3 (450).
    // Capacity sizing makes the replacement wait the one tick for the
    // 300-energy 2-WORK body; the living harvester keeps refilling the
    // store in the meantime.
    // One of the two container-less sources is covered, so the harvester
    // minimum (one per source) is short and the income floor is active.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
    });
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 1;
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

    // The income floor hands the spawn to the harvester, but its
    // capacity-sized body costs 300 and the store holds 200: nothing
    // spawns this tick (under the 1404382 clamp a 1-WORK body would have
    // started here and ratcheted the crew down).
    assert.equal(calls.length, 0);
  });

  it("harvester below minimum with a full store starts the capacity-sized replacement", () => {
    // Same room as the test above with the store full: the wait ends
    // exactly when the store can pay for the 2-WORK body, and the
    // replacement is the full size, never the shrunken one.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
    });
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 1;
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

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-1");
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
    assert.equal(calls[0].memory.role, "harvester");
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

  it("fault 4: with two source containers the hauler minimum is two (one per container)", () => {
    // M5 fault 4: one hauler per source container - a single hauler cannot
    // keep 20 energy per tick flowing through 30 extensions, two towers and
    // the spawn at RCL 5. Both sources have built containers, so the
    // minimum is 3 (two per-container + the level-4+ spare of 2026-11-10);
    // one hauler is alive, so the second one spawns (one per spawn tick).
    addCreeps({
      "miner-0": {role: "miner", sourceId: "source-1"},
      "miner-1": {role: "miner", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
      "hauler-3": {role: "hauler"},
    });
    // Four creeps already exist, so the next name uses counter value 4.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 4;
    const {room, calls} = makeRoom({
      capacity: 1800,
      available: 1800,
      sites: 0,
      containers: 2,
      controllerLevel: 5,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "hauler-4");
    assert.equal(calls[0].memory.role, "hauler");
    // RCL 5 capacity (1800) fits the 1500 two-thousand-energy body: 20
    // CARRY and 10 MOVE (10 MOVE keeps 20 CARRY moving every tick on roads).
    const expectedBody = [
      ...new Array(20).fill(CARRY),
      ...new Array(10).fill(MOVE),
    ];
    assert.deepEqual(calls[0].body, expectedBody);
  });

  it("keeps two harvesters per uncovered source at level 5 (the M5 crew scaling)", () => {
    // M5 (2026-11-10, owner feedback v9.2 idea a): at level 4 and up an
    // uncovered source keeps TWO harvesters, not one - the 2-3 WORK miner
    // (4-6 per tick) can no longer drain a source's 10-per-tick refill on
    // its own. Source 1 has a built container (the miner works it); source
    // 2 is uncovered and holds only one harvester, so the second one
    // spawns.
    addCreeps({
      "miner-0": {role: "miner", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
      "hauler-2": {role: "hauler"},
      "hauler-3": {role: "hauler"},
      "harvester-4": {role: "harvester", sourceId: "source-2"},
    });
    // Five creeps already exist, so the next name uses counter value 5.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 5;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 1,
      controllerLevel: 5,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "harvester-5");
    assert.equal(calls[0].memory.role, "harvester");
  });

  it("keeps one harvester per uncovered source below level 4 (no crew scaling leak)", () => {
    // The two-per-uncovered-source minimum of 2026-11-10 is gated at level
    // 4: at level 1 (no visible controller) the source state split is back
    // to one worker per container-less source, the hauler has no spare, and
    // with every minimum met the store not full the spawn does nothing.
    addCreeps({
      "miner-0": {role: "miner", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
      "hauler-2": {role: "hauler"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
    });
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 200,
      sites: 0,
      containers: 1,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0, "no extra harvester and no spare hauler below level 4");
  });

  it("adds one spare hauler on top of the per-container minimum at level 5", () => {
    // M5 (2026-11-10, owner feedback v9.2 idea a): from level 4 up the
    // colony keeps CONTAINER_HAULER_SPARE (two, raised from one for the
    // 2026-11-12 build wave) extra haulers beyond the one-per-source-
    // container minimum. One container, one miner, the uncovered source
    // covered by its two harvesters, and one hauler alive - the spare
    // hauler minimum is short, so the first of them spawns (one intent
    // per tick, the rest wait).
    addCreeps({
      "miner-0": {role: "miner", sourceId: "source-1"},
      "upgrader-1": {role: "upgrader"},
      "hauler-2": {role: "hauler"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
      "harvester-4": {role: "harvester", sourceId: "source-2"},
    });
    // Five creeps already exist, so the next name uses counter value 5.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 5;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 0,
      containers: 1,
      controllerLevel: 5,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "hauler-5");
    assert.equal(calls[0].memory.role, "hauler");
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
    // SURPLUS_UPGRADER_MAX = 5 total, raised from 3 on 2026-11-12).
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
      "upgrader-4": {role: "upgrader"},
      "upgrader-5": {role: "upgrader"},
      "upgrader-6": {role: "upgrader"},
      "builder-7": {role: "builder"},
    });
    // Eight creeps already exist, so the next name uses counter value 8.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 8;
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

    // RCL 1 (no controller level): the low surplus caps apply - the
    // pre-2026-11-12 values SURPLUS_UPGRADER_MAX_LOW 2 / SURPLUS_BUILDER_MAX_LOW
    // 5 (see SURPLUS_VALVE_MIN_LEVEL in config.ts). Five upgraders are well
    // past the low upgrader cap, so the surplus step adds a second builder
    // because construction sites exist (one of the five the low builder cap
    // allows).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-8");
    assert.equal(calls[0].memory.role, "builder");
  });

  it("at RCL 5 spawns a surplus upgrader below the upgrader cap while sites exist", () => {
    // At SURPLUS_VALVE_MIN_LEVEL the surplus caps are the M5 values
    // (SURPLUS_UPGRADER_MAX = 5, 2026-11-12): with two upgraders alive the
    // surplus walk (harvester -> upgrader -> builder) spends the idle energy
    // on a third upgrader before a fourth builder, because the controller
    // progress is the room's standing energy sink. (At RCL 1 the low cap of
    // two would block this spawn and give the builder the energy instead -
    // see the next test.)
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "harvester-2": {role: "harvester", sourceId: "source-1"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
      "harvester-4": {role: "harvester", sourceId: "source-1"},
      "upgrader-5": {role: "upgrader"},
      "upgrader-6": {role: "upgrader"},
      "builder-7": {role: "builder"},
      "builder-8": {role: "builder"},
      "builder-9": {role: "builder"},
    });
    // Ten creeps already exist, so the next name uses counter value 10.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 10;
    const {room, calls} = makeRoom({
      capacity: 300,
      available: 300,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 5,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-10");
    assert.equal(calls[0].memory.role, "upgrader");
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, MOVE]);
  });

  it("below RCL 5 the surplus upgrader cap is two: the surplus goes to the builder instead", () => {
    // RCL 1 (no controller level), full store, two upgraders - exactly the
    // low upgrader cap (SURPLUS_UPGRADER_MAX_LOW, the pre-2026-11-12 value)
    // - and one builder with sites: the surplus walk cannot add a third
    // upgrader, so the idle energy goes to a second builder. This is the
    // M2 fix (2026-11-12 20:11 gate failure): with the M5 cap of five the
    // same room spawned up to four surplus upgraders at RCL 1 that drained
    // the 300-energy pool faster than the harvest refilled it and starved
    // the builder's road phase.
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

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-5");
    assert.equal(calls[0].memory.role, "builder");
  });

  it("below RCL 5 the surplus builder cap is five (the pre-2026-11-12 value)", () => {
    // RCL 1, full store, two upgraders (the low upgrader cap) and five
    // builders (the low builder cap, SURPLUS_BUILDER_MAX_LOW) with sites:
    // the surplus walk has nothing left to spend the energy on, so the
    // spawn stays idle - with the M5 cap of ten a sixth builder would
    // spawn here.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
      "upgrader-3": {role: "upgrader"},
      "builder-4": {role: "builder"},
      "builder-5": {role: "builder"},
      "builder-6": {role: "builder"},
      "builder-7": {role: "builder"},
      "builder-8": {role: "builder"},
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

    assert.equal(calls.length, 0);
  });

  it("spawns a surplus builder with the 4-WORK body once the capacity reaches 550", () => {
    // Same setup as the surplus-builder test above, but the room's capacity
    // is the RCL 5 value (550): the sizing budget (the room's capacity,
    // owner rule #5) now buys the full 4-WORK body - 200 build per tick for
    // the static-mining build wave (2026-11-12). The body must cost exactly
    // 550 or it would never spawn in the M5 window.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
      "upgrader-3": {role: "upgrader"},
      "upgrader-4": {role: "upgrader"},
      "upgrader-5": {role: "upgrader"},
      "upgrader-6": {role: "upgrader"},
      "builder-7": {role: "builder"},
    });
    // Eight creeps already exist, so the next name uses counter value 8.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 8;
    const {room, calls} = makeRoom({
      capacity: 550,
      available: 550,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "builder-8");
    assert.deepEqual(calls[0].body, [WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE]);
  });

  it("at RCL 5 spawns a surplus upgrader with the 2-MOVE body at the 400 capacity", () => {
    // At the RCL 4 capacity (400) the 400-energy row fills the gap between
    // the 350 and 500 walking bodies: the upgrader takes the whole capacity
    // (2026-11-12). The body must cost exactly 400 or the row would only
    // start being picked at 450 capacity. The room is at SURPLUS_VALVE_MIN_LEVEL:
    // with two upgraders alive only the M5 cap of five (not the low cap of
    // two) allows the surplus upgrader at all.
    // 2026-11-13: the row is now 2-WORK / 2-CARRY / 2-MOVE - the old
    // 3-WORK / 1-MOVE body crawled the pool round trip on plain (one tile
    // every 4 ticks) and the M5 gate measured 0.70 upgrade/tick with four
    // upgraders on it. Two MOVE parts plus the CARRY buffer at the same
    // 400-energy cost.
    // M4/M5 fix (2026-11-13): the full harvester crew now starts at the
    // 400 capacity (HARVESTER_CREW_FULL_CAPACITY), so each of the two
    // uncovered sources must keep five harvesters before the surplus walk
    // runs.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "harvester-2": {role: "harvester", sourceId: "source-1"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
      "harvester-4": {role: "harvester", sourceId: "source-1"},
      "harvester-5": {role: "harvester", sourceId: "source-2"},
      "harvester-6": {role: "harvester", sourceId: "source-1"},
      "harvester-7": {role: "harvester", sourceId: "source-2"},
      "harvester-8": {role: "harvester", sourceId: "source-1"},
      "harvester-9": {role: "harvester", sourceId: "source-2"},
      "upgrader-10": {role: "upgrader"},
      "upgrader-11": {role: "upgrader"},
      "builder-12": {role: "builder"},
      "builder-13": {role: "builder"},
      "builder-14": {role: "builder"},
    });
    // Fifteen creeps already exist, so the next name uses counter value 15.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 15;
    const {room, calls} = makeRoom({
      capacity: 400,
      available: 400,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 5,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-15");
    assert.deepEqual(calls[0].body, [WORK, WORK, CARRY, CARRY, MOVE, MOVE]);
  });

  it("below RCL 5 the store must be completely full: 93.75 % does not open the surplus", () => {
    // The M5 pressure valve (90 % of capacity, 2026-11-12) only applies from
    // SURPLUS_VALVE_MIN_LEVEL: below it the store must be completely full,
    // the pre-2026-11-12 gate. 750 of 800 is 93.75 % - far above the M5
    // valve's 90 %, not a completely full store: no surplus spawn. (M2 gate
    // failure of 2026-11-12 20:11: the valve at RCL 1 pulsed surplus
    // upgraders into the 300-energy pool that drained it faster than the
    // harvest refilled it, starving the builder's road phase.)
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "harvester-2": {role: "harvester", sourceId: "source-1"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
      "harvester-4": {role: "harvester", sourceId: "source-1"},
      "upgrader-5": {role: "upgrader"},
      "builder-6": {role: "builder"},
      "builder-7": {role: "builder"},
      "builder-8": {role: "builder"},
    });
    const {room, calls} = makeRoom({
      capacity: 800,
      available: 750,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    assert.equal(calls.length, 0);
  });

  it("at RCL 5 the 90 % valve opens the surplus below a full store", () => {
    // The same room at SURPLUS_VALVE_MIN_LEVEL: 750 of 800 is above 90 % of
    // capacity, so the M5 valve opens and the surplus step runs even though
    // the store is not completely full - the first surplus role it can pay
    // is the upgrader (its walking body costs 500 at this capacity).
    // 2026-11-13: at level 4+ with a capacity above
    // HARVESTER_CREW_FULL_CAPACITY (400) each uncovered source keeps the
    // full crew of five harvesters (UNCOVERED_SOURCE_HARVESTERS_FULL), so
    // this two-source room needs ten of them before any surplus opens.
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "harvester-2": {role: "harvester", sourceId: "source-1"},
      "harvester-3": {role: "harvester", sourceId: "source-2"},
      "harvester-4": {role: "harvester", sourceId: "source-1"},
      "harvester-5": {role: "harvester", sourceId: "source-2"},
      "harvester-6": {role: "harvester", sourceId: "source-1"},
      "harvester-7": {role: "harvester", sourceId: "source-2"},
      "harvester-8": {role: "harvester", sourceId: "source-1"},
      "harvester-9": {role: "harvester", sourceId: "source-2"},
      "upgrader-10": {role: "upgrader"},
      "builder-11": {role: "builder"},
      "builder-12": {role: "builder"},
      "builder-13": {role: "builder"},
    });
    // Fourteen creeps already exist, so the next name uses counter value 14.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 14;
    const {room, calls} = makeRoom({
      capacity: 800,
      available: 750,
      sites: 2,
      containers: 0,
      spawning: null,
      spawnResult: OK,
      controllerLevel: 5,
      sources: [{id: "source-1"}, {id: "source-2"}],
    });

    checkAndSpawn(room);

    // Level 5 wants five harvesters per uncovered source (ten), three
    // builders while sites exist - all alive, so the surplus walk runs and
    // takes the second upgrader (cap SURPLUS_UPGRADER_MAX = 5 at RCL 5).
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, "upgrader-14");
    assert.equal(calls[0].memory.role, "upgrader");
  });

  it("does not spawn a surplus creep while the store is not full", () => {
    // Both container-less sources are covered (the RCL 1 minimum is one
    // harvester per source), so no replacement is owed - this is a pure
    // surplus scenario. (The sources must be covered to isolate the surplus
    // step: with an uncovered source the income floor would owe a
    // replacement harvester, whose capacity-sized 2-WORK body cannot be paid
    // from the partly full store - it waits for the store to reach capacity.)
    addCreeps({
      "harvester-0": {role: "harvester", sourceId: "source-1"},
      "harvester-1": {role: "harvester", sourceId: "source-2"},
      "upgrader-2": {role: "upgrader"},
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
      "upgrader-4": {role: "upgrader"},
      "upgrader-5": {role: "upgrader"},
      "upgrader-6": {role: "upgrader"},
      "builder-7": {role: "builder"},
      "builder-8": {role: "builder"},
      "builder-9": {role: "builder"},
      "builder-10": {role: "builder"},
      "builder-11": {role: "builder"},
      "builder-12": {role: "builder"},
      "builder-13": {role: "builder"},
      "builder-14": {role: "builder"},
      "builder-15": {role: "builder"},
      "builder-16": {role: "builder"},
    });
    // Seventeen creeps already exist, so the next name uses counter value 17.
    // @ts-ignore : write into the game globals
    (global as any).Memory.creepCounter = 17;
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

    // Sources covered, five upgraders (the cap, raised from 3 to 5 for the
    // M5 upgrade rate, 2026-11-12), ten builders (the cap - raised from
    // five to ten for the M5 build wave, 2026-11-12): the surplus step has
    // nothing left to spend the idle energy on, so the spawn idles -
    // correct now, because every sink is busy.
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

  describe("incomeBelowMinimum (the builder's pool hold-back, M3 fix)", () => {
    // The mock room has two sources and no container, so at any controller
    // level the income minimum is two harvesters (the per-source split wins
    // over the level-1 row).
    it("is true while one of the two harvesters is dead", () => {
      addCreeps({"harvester-0": {role: "harvester"}});
      const {room} = makeRoom({controllerLevel: 1});

      assert.isTrue(incomeBelowMinimum(room));
    });

    it("is false once both harvesters are alive", () => {
      addCreeps({
        "harvester-0": {role: "harvester"},
        "harvester-1": {role: "harvester"},
      });
      const {room} = makeRoom({controllerLevel: 1});

      assert.isFalse(incomeBelowMinimum(room));
    });

    it("counts miners and haulers toward the minimum as well", () => {
      // One source with a built container: the minimum is one miner plus
      // one hauler (no harvester on the mined source).
      addCreeps({
        "miner-0": {role: "miner", sourceId: "source-1"},
        "hauler-0": {role: "hauler"},
      });
      const {room} = makeRoom({
        controllerLevel: 1,
        containers: 1,
        sources: [{id: "source-1"}],
      });

      assert.isFalse(incomeBelowMinimum(room));
    });
  });
});

# 02b – Screeps economy playbook (MANDATORY knowledge for every design decision)

The numbers below come from the game constants. Before you rely on one, confirm it in
`node_modules/@types/screeps/index.d.ts` (search for the constant name in brackets).

## Energy income
- A source in an owned room holds 3000 energy and refills every 300 ticks
  [SOURCE_ENERGY_CAPACITY, ENERGY_REGEN_TIME]: 10 energy per tick per source, 20 per tick
  for the two sources of the home room. Energy still in the source when it refills is lost.
- One WORK part harvests 2 energy per tick [HARVEST_POWER]. Five WORK parts empty a source
  exactly in time; a sixth is wasted.
- A creep lives 1500 ticks [CREEP_LIFE_TIME] and takes 3 ticks per body part to spawn
  [CREEP_SPAWN_TIME]. Spawn the replacement when `ticksToLive` is below spawn time plus
  travel time, so the source never idles.

## The three economy stages (always in this order)
1. Bootstrap (RCL 1, no containers): a few [WORK, CARRY, MOVE] workers that harvest, fill
   the spawn and upgrade. This stage ends when the first container exists.
2. Static mining (from RCL 2): one container on a tile next to each source. One miner per
   source walks to that tile, stands on it and only harvests; energy it cannot carry drops
   into the container. Haulers carry from the containers to spawn, extensions, towers and
   the controller area. Upgraders and builders take energy from containers or haulers and
   never walk to a source.
3. Storage logistics (from RCL 4): haulers fill the storage; every consumer withdraws from
   it. Links from RCL 5 replace hauler trips.

Never mix stages inside one role: a harvester that also upgrades is a bootstrap worker,
not a miner.

## Bodies
- Size bodies from `room.energyCapacityAvailable`. Use `room.energyAvailable` only in a
  cold boot (no miner and no bootstrap worker alive).
- Templates, cheapest first; pick the largest the capacity allows:
  - Bootstrap worker: [WORK, CARRY, MOVE] = 200; [WORK, WORK, CARRY, MOVE] = 300.
  - Miner: [WORK x2, MOVE] = 250; [WORK x3, MOVE] = 350; [WORK x5, MOVE] = 550 (fits RCL 2
    with five extensions); [WORK x5, CARRY, MOVE] = 600 (can also repair its container).
  - Hauler: pairs of [CARRY, MOVE] = 100 per pair, at least two pairs. On roads one MOVE
    per two CARRY is enough.
  - Upgrader: [WORK x n, CARRY, MOVE], n as large as the capacity allows; it stays within
    range 3 of the controller.
- Fatigue: every part except MOVE costs 2 fatigue per step on plain, 1 on road, 10 on
  swamp; each MOVE part removes 2 fatigue per tick. One MOVE per other part moves every
  tick on plain; one MOVE per two other parts moves every tick on roads.
- Never spawn a creep without MOVE. Never spawn a worker or hauler without CARRY.
  At most 50 parts [MAX_CREEP_SIZE].

## Spawning priorities (highest first)
1. Cold boot: no miner and no bootstrap worker alive → spawn the biggest worker
   `room.energyAvailable` allows, this tick.
2. A source without a living miner, or whose miner is about to expire.
3. Fewer haulers than containers that hold energy (at least one hauler as soon as the
   first container exists).
4. One upgrader. The controller must never downgrade: RCL 1 has 20,000 ticks of timer,
   RCL 2 only 10,000 [CONTROLLER_DOWNGRADE; the type file declares only its shape, the values
   are in node_modules/@screeps/common/lib/constants.js, read-only]; upgrading extends it.
5. Builders only while construction sites exist, at most two.
6. Extra upgraders when energy sits unused (containers or storage above a threshold).

## Building
- Extensions (RCL 2: 5, RCL 3: 10, RCL 4: 20, RCL 5: 30, RCL 6: 40, RCL 7: 50, RCL 8: 60;
  3000 energy each [CONSTRUCTION_COST]): 2 to 6 tiles from the spawn, in a checkerboard
  so every extension has walkable neighbours; never on a source's or the controller's
  neighbouring tiles; only on plain or swamp (`room.getTerrain()`). Compute the list of
  positions once, store it in Memory, and place sites from that list.
- Containers (5 per room, 5000 energy, 2000 capacity): one on the tile next to each source
  that lies on the path to the spawn; later one within range 3 of the controller.
- Roads: only along the paths from the spawn to each source and to the controller
  (`PathFinder.search` or `room.findPath` with swampCost 2); never on wall terrain
  (45,000 build progress instead of 300). Build them after containers and extensions.
  Roads decay and need repair.
- Tower (RCL 3, 5000 energy): the first thing to build at RCL 3, within 5 tiles of the
  spawn. It attacks hostiles first, heals creeps second, repairs roads and containers third.
- Storage (RCL 4, 30,000 energy): next to the spawn, placed once, never moved.
- Walls and ramparts: not before the tower works.

## Movement and CPU
- `creep.moveTo(target, { reusePath: 20, range: n })` is fine for roles. Recompute only
  when stuck (same position for 3 ticks while trying to move).
- Find each thing once per tick per room and reuse the result. A small per-tick cache
  object is allowed; losing it on a global reset is fine.
- An idle creep is a bug. Builders without sites upgrade; haulers without work park next
  to the spawn, off the roads.

## Things that look right but are wrong (never do these)
- Hardcoded room coordinates ("the spawn is at 13,20"). Every position comes from the
  room's objects and terrain at run time.
- Random moves to get unstuck. Compute a target instead.
- Placing construction sites by trying random tiles.
- More than about 10 open construction sites per builder.
- A harvester that walks to the spawn carrying 50 energy; a miner that leaves its source.
- Upgraders or builders harvesting from sources once containers exist.
- Spawning the smallest affordable creep when a full-size one would be affordable in
  20 ticks.
- `room.find` inside a per-creep loop without a cache.
- `console.log` every tick.

## Housekeeping: undoing your own mistakes
- A misplaced construction site: `site.remove()`. Find them with `room.find(FIND_MY_CONSTRUCTION_SITES)`.
  A player may have at most 100 sites [MAX_CONSTRUCTION_SITES]; useless sites block useful ones and
  waste build energy.
- A misplaced structure of your own: `structure.destroy()`, or `creep.dismantle(structure)`, which
  removes 50 hits per WORK part per tick and returns 0.005 energy per hit, half the repair cost
  [DISMANTLE_POWER, DISMANTLE_COST]: a way to remove, not a way to earn. Unrepaired roads and
  containers decay on their own [ROAD_DECAY_AMOUNT, CONTAINER_DECAY].
- A creep you no longer want: `spawn.recycleCreep(creep)` next to the spawn returns part of its body
  cost [CREEP_CORPSE_RATE, scaled by remaining life]; `creep.suicide()` returns nothing. A spawn in
  progress: `spawn.spawning.cancel()`.
- Dead creeps leave tombstones and dropped energy that decay [TOMBSTONE_DECAY_PER_PART, ENERGY_DECAY]:
  haulers `withdraw` from tombstones and `pickup` drops that lie on their way.
- Memory entries for sites, structures and plans that no longer exist are cleaned the same way as the
  memory of dead creeps.

## Defence: what you have and when to use it
- Invaders (NPC creeps) raid an owned room after about 100,000 energy harvested [INVADERS_ENERGY_GOAL]
  and keep coming; on the public server other players can attack at any time.
- Detect: `room.find(FIND_HOSTILE_CREEPS)` every tick is cheap; `room.getEventLog()` shows attacks on
  your objects (EVENT_ATTACK with damage) and losses (EVENT_OBJECT_DESTROYED).
- Tower (`tower.attack(creep)`, `tower.heal(creep)`, `tower.repair(structure)`): the first response,
  from RCL 3. Full effect within 5 tiles, falling to a quarter at 20 [TOWER_OPTIMAL_RANGE,
  TOWER_FALLOFF_RANGE, TOWER_FALLOFF]; 600 damage, 400 heal or 800 repair per action for 10 energy
  [TOWER_POWER_ATTACK, TOWER_POWER_HEAL, TOWER_POWER_REPAIR, TOWER_ENERGY_COST]. Keep it above
  500 energy at all times; repair only from the energy above that reserve.
- Safe mode: `room.controller.activateSafeMode()` blocks hostile actions for 20,000 ticks
  [SAFE_MODE_DURATION], then cools down for 50,000 [SAFE_MODE_COOLDOWN]; you start with one
  activation. Use it when hostiles are in the room, the spawn or the tower is taking damage, and no
  tower can stop them. Never spend it on a single invader a tower can kill.
- Before a tower exists: keep creeps away from the hostiles' path, keep the spawn full, and let the
  raid pass. Losing creeps is cheaper than losing the spawn.
- Hostile structures (an invader core in a neighbouring room, another player's leftovers):
  `creep.dismantle(structure)` or `creep.attack(structure)`; find them with `FIND_HOSTILE_STRUCTURES`.
  Not before the home room is safe and fed.
- Ramparts and walls: after the tower works, on the spawn, the tower and the storage first. They need
  repair energy forever, so only where they protect something.

## Being seen: how the owner and the tests watch you
- The owner watches the room in the game client. `creep.say('text')` and `new RoomVisual(room.name)`
  (circles, lines, text) make your plan visible: draw the planned positions of extensions, containers,
  the tower and roads every tick while they are unbuilt. It costs little CPU and shows the owner at a
  glance what you intend.
- `Game.notify(text, groupInterval)` emails the owner. Use it for events that need a human (hostile
  players, a lost structure, repeated exceptions), grouped with an interval of 60 minutes or more,
  never every tick. `structure.notifyWhenAttacked(false)` on roads and containers prevents email
  floods; keep it on for the spawn and the tower.
- The scorecard (reports/latest.md) counts hostile presence, attacks, damage taken and dealt, creeps
  lost before old age, structures destroyed, tower energy and safe mode ticks. Damage taken rising
  while damage dealt stays flat means the tower is empty or out of range.

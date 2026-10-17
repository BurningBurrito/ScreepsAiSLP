# 02 – Screeps essentials (MANDATORY knowledge)

## Game loop and ticks
- The game runs in ticks. Every tick the server calls the exported `loop()` from `main.ts` once. All decisions happen inside it.
- Actions (move, harvest, transfer …) are queued during the tick and resolved after all players' code ran.
  So the result of an action is visible only in the NEXT tick.
- Game code runs in a sandbox: no Node.js APIs, no `require` of npm packages at runtime, no `setTimeout`, no `async/await`, no file or network access.
  Only what Rollup bundles from `src/` exists. lodash is available in-game as the global `_` (version 3.10).

## Global reset
- The server can restart your code at any time ("global reset"): all module-level variables and caches are lost.
- Only `Memory` (and RawMemory segments) survive. Code must work correctly right after a reset.

## CPU
- Every tick has a CPU budget: `Game.cpu.limit` (this account: CPU unlocked = 30 + 10 per GCL level; private servers often 100).
- Unused CPU fills the bucket (`Game.cpu.bucket`, max 10,000). A tick may use up to 500 CPU only while the bucket has CPU.
- Rules:
  1. Design for an average under 50 % of `Game.cpu.limit`. Never depend on the bucket for normal operation.
  2. Expensive work (path finding, room planning) runs rarely (every N ticks) or only when `Game.cpu.bucket` is high.
  3. Avoid repeated `room.find()` for the same thing in one tick – find once, reuse the result within the tick.
  4. `console.log` costs CPU – log summaries every N ticks, not every creep every tick.
  5. Measure with `Game.cpu.getUsed()` when adding expensive code.

## Memory
- `Memory` is stored as JSON. It is parsed on first access every tick and saved at the end of every tick. Cost grows with its size.
- Rules:
  1. Keep Memory small. Store ids (`creep.id`, `source.id`), names and numbers – never whole game objects.
  2. Look objects up again each tick: `Game.getObjectById(id)`, `Game.creeps[name]`. They can be `null` (destroyed, out of vision).
  3. Delete memory of dead creeps (`Memory.creeps[name]` when `Game.creeps[name]` is missing).
  4. Declare every Memory field you use in a typed interface (`CreepMemory`, `RoomMemory`, `Memory`) – no untyped `any` data.

## API conventions
- Action methods return a code: `OK` (0) or a negative `ERR_*` constant. Always check it.
  Typical pattern: `if (creep.harvest(source) === ERR_NOT_IN_RANGE) { creep.moveTo(source); }`
- Use the `FIND_*`, `STRUCTURE_*`, `RESOURCE_*`, `LOOK_*` constants – never string literals for these.
- `spawn.spawnCreep(body, name, { memory })` – names must be unique (e.g. role + `Game.time`); check the return code
  (`ERR_NOT_ENOUGH_ENERGY`, `ERR_BUSY`, `ERR_NAME_EXISTS`).
- Body part costs: MOVE 50, WORK 100, CARRY 50, ATTACK 80, RANGED_ATTACK 150, HEAL 250, CLAIM 600, TOUGH 10.
  Build bodies from `room.energyAvailable` / `room.energyCapacityAvailable`.
- Things change between ticks: creeps die (about 1,500 ticks of life), structures get destroyed, objects leave vision. Handle `null`/`undefined`.

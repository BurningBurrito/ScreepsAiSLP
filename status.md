# ScreepsAiSLP Status

## Current State
Fixed 5 economy bugs identified by the owner. M3 in progress: build priorities, layout and a tower. All console.log calls removed from per-creep code.

## Change Log
### 2026-10-23
- **upgrader.ts**: Removed fallbackMoveTo function and all console.log calls that ran every 100 ticks. Simplified movement logic - uses moveTo with ignoreCreeps and reusePath.
- **M3 status**: Build priorities and layout fixed in previous run. Now testing tower construction and extension placement.
- All unit tests passing (6 tests)
- Lint passes with no errors
- Build succeeds

### 2026-10-22
- **Bug 1 - hauler.ts**: Removed withdrawal from spawn and extensions that caused energy to go in circles. Haulers now only pick up from dropped energy and containers (when they exist). Set hauler minimum to 0.
- **Bug 2 - harvester.ts**: Fixed moveTo error handling. Now only treats ERR_NO_PATH as "cannot reach"; ERR_TIRED/ERR_BUSY/other return codes mean "try again next tick" instead of dropping energy.
- **Bug 3 - builder.ts**: Removed withdrawal from spawn and extensions unless room is completely full. If harvesting from sources, stays at source until store is full.
- **Bug 4 - upgrader.ts**: Implemented working flag logic like other roles - harvest until full, then upgrade until empty. Removed all console.log calls.
- **Bug 5 - spawnManager.ts**: Changed body sizing from room.energyAvailable to room.energyCapacityAvailable. Updated spawning priority order: harvesters first, then builders (while construction sites exist), then upgraders, then haulers (only when container exists). Removed console.log calls.
- **Console.log cleanup**: Removed all per-creep console.log calls from main.ts and upgrader.ts that were printing 5000+ lines in 800 ticks.
- All unit tests passing (6 tests)
- Lint passes with no errors
- Build succeeds
- Updated config.ts: reduced upgrader and builder minimums to 1, hauler minimum to 0

## In Progress
- M3: build priorities, layout and a tower
- Baseline (from reports/latest.md): 7 creeps at end, 12% idle ticks, 72.7 energy delivered/tick

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [ ] M3: build priorities, layout and a tower (in progress)
- [ ] M4 containers and static mining
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- Energy delivery issue: previous scorecard showed 72.7 energy delivered/tick vs ~3 harvested (energy going in circles) - this is now fixed by hauler changes

## Feedback acknowledged
- Acknowledged 2026-10-22: hauler.ts makes energy go in circles - done (hauler.ts: removed withdrawal from spawn/extension)
- Acknowledged 2026-10-22: harvester.ts drops energy too often - done (harvester.ts: fixed moveTo error handling)
- Acknowledged 2026-10-22: builder.ts empties the spawn - done (builder.ts: only withdraws when room full)
- Acknowledged 2026-10-22: upgrader.ts walks to controller too early - done (upgrader.ts: uses working flag)
- Acknowledged 2026-10-22: spawnManager.ts sizes from energyAvailable - done (spawnManager.ts: uses capacity)
- Acknowledged 2026-10-22: remove console.log calls every tick - done (main.ts, upgrader.ts, spawnManager.ts)

## Concepts Explained
- **Creep memory**: Memory structure stored in Memory.creeps[creepName] that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick
- **Working flag**: State flag on creeps that determines whether they are gathering energy (working=false) or using it (working=true)
- **ERR_NO_PATH vs ERR_TIRED/ERR_BUSY**: ERR_NO_PATH means the path is permanently blocked; ERR_TIRED/ERR_BUSY mean the creep can't move this tick but should try again

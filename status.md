# ScreepsAiSLP Status

## Current State
M3 in progress: layout, road network and build priorities are done and measured (roads 59/0/0,
tower built and full in the last M3 run). The M3 economy (3 source-assigned harvesters + 3
builders, sized from capacity, tower+extensions as one priority class) was implemented in the
previous run. This run: fixed the gate-failing unit test, then re-running smoke and the M3
acceptance test to verify the economy finishes 3 extensions + the tower in 4000 ticks.

## Change Log
### 2026-10-24
- **Gate fix (test/unit/harvester.test.ts)**: the "harvests from source when store is empty" unit test failed the gate because its creep mock predated the source-assignment code (runHarvester now calls room.find(FIND_SOURCES_ACTIVE)). Updated the mock to provide one active source and asserted harvest is actually called. Unit tests: 6 passing.
- Running smoke (500 ticks) with the M3 economy from the previous run; then the M3 acceptance test (4000 ticks).

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
- **Baseline 2026-10-24** (smoke, 500 ticks, reports/latest.md): build energy to roads 0 %; roads 59 / 0 on wall / 0 disconnected; roads reach sources 2 of 2 and controller; extensions/towers farther than 8 tiles: 0; sites on wall terrain: 0; harvested 3.62/tick, delivered 1.92/tick, construction 1.74/tick; RCL 1/8.
- **Last M3 acceptance run (4000 ticks, 1-builder economy)**: tower built and full (maxTowerEnergy 1000), but extensionsBuilt 1 (need 3), energyCapacity 350 (need 450) - build throughput was the only failing part.
- M3 economy now in place (previous run): MIN_CREEPS_PER_ROLE.harvester = 3 with assignSource() in spawnManager.ts splitting harvesters over the room's sources; BUILDER_COUNT_BY_CAPACITY gives 3 builders at capacity >= 300; selectBuildSite() in builder.ts treats tower+extension sites as one priority class (closest wins), roads last; bodies sized from energyCapacityAvailable (owner rule #5).
- Next: smoke ramp check (3 harvesters + 3 builders alive by tick 500, delivered/tick up vs 1.92 baseline), then M3 acceptance (4000 ticks). If extensionsBuilt < 3 again, the documented fallback is the 100-energy buffer withdrawal rule for builders.

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [ ] M3: build priorities, layout and a tower (in progress)
- [ ] M4 containers and static mining
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- Energy delivery issue: previous scorecard showed 72.7 energy delivered/tick vs ~3 harvested (energy going in circles) - this is now fixed by hauler changes
- Owner rule #3 (builder may withdraw from spawn/extensions only when the room is completely full) is at risk for M3: the acceptance test needs ~9,500 build energy in ~3,700 ticks, which a self-harvesting-only builder population cannot reach (measured: 1 builder = ~1.75 progress/tick spawn-fed, ~0.65-1.1 self-harvesting; one builder spent ~3,450 ticks on the tower alone). Current attempt keeps the rule and scales the population instead (3 builders + 3 assigned harvesters). Fallback if that fails: builders withdraw once room energy is back above a 100-energy buffer (enough to keep one respawn queued), or 5-6 self-harvesting builders with a smaller margin.

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

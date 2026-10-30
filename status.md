# ScreepsAiSLP Status

## Current State
M1/M2/M3 in progress. The upgrader bootstrap failure (0 controller progress in the 500-tick
smoke) is fixed: the upgrader and builder now pick their self-harvest source by Chebyshev
distance to a fixed anchor (controller for the upgrader, spawn for the builder) instead of
findClosestByPath, which the swamp pocket around the spawn-side source distorted in favour
of the far source (src/utils/pickSource.ts, src/roles/upgrader.ts, src/roles/builder.ts).
Probe-verified: the upgrader now walks straight to the near source. Still in place from the
previous run: per-level spawn minimums (RCL 1: 1h/1b/1u, RCL 3: 5h/3b/1u) in
MIN_CREEPS_BY_LEVEL and builder priority roads-before-containers.

## Change Log
### 2026-10-24
- **Spawn minimums per controller level (src/config.ts, src/managers/spawnManager.ts)**: replaced MIN_CREEPS_PER_ROLE (fixed 3 harvesters) + BUILDER_COUNT_BY_CAPACITY with MIN_CREEPS_BY_LEVEL: RCL 1 = 1 harvester / 1 builder / 1 upgrader, RCL 2 = 3/3/1, RCL 3+ = 5/3/1 (hauler 1 in every row, only active once a built container exists; builder 0 while no construction site exists). Reason: the old fixed 3-harvester minimum queued the upgrader at position 6, so the first upgrade tick landed after the smoke test's 500-tick window (measured: upgrader born ~480, progress 0). With the owner's spawn order (harvester -> builder -> upgrader) the RCL 1 crew is now h0 -> b0 -> u0, one 300-energy body apart.
- **Builder priority: roads before containers (src/roles/builder.ts)**: selectBuildSite now orders tower+extensions (one class) -> roads -> containers. Roads sit above containers because bootstrap is the only window they get built: M2 needs a finished road within 3,000 ticks of an RCL 1 start, and once extension sites exist (RCL 2+) builders never reach the road list again. M3 is unaffected: tower+extension sites exist from tick 1, so builders never touch roads during the M3 window (road share stays 0 %).
- **Unit tests (test/unit/spawnManager.test.ts)**: 3 new tests (RCL 2 row, RCL 3 row, RCL 1 short queue) + a controllerLevel option on the mock room; the RCL 2 test caught a real bug (row lookup broke at the first matching row instead of the last) which is fixed. 19 unit tests passing.
- Running smoke (500 ticks) to verify the upgrader now shows controller progress by tick 500; then M1/M2/M3 acceptance.
- **Spawn manager unit tests (test/unit/spawnManager.test.ts, new)**: 10 tests for the one-spawn-per-tick rule, cold-boot sizing and engine rejections. All 16 unit tests pass (6 pre-existing + 10 new). Fixed trySpawnRole's parameter type from Spawn to StructureSpawn (src/managers/spawnManager.ts).
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
- M1/M2/M3 acceptance: upgrader bootstrap fix in place, smoke test running. Root cause of "0 progress in 500 ticks": upgrader.ts and builder.ts picked their source with pos.findClosestByPath, which prices swamp tiles 10x plain. Source A (spawn-side, (14,18)) sits in a swamp pocket, so path cost called the far source B (39,14) "closest" and the upgrader spent its life crossing the room. Fix: src/utils/pickSource.ts (pickSourceClosestTo, Chebyshev distance to a fixed anchor, O(sources), no path finding) - the upgrader anchors on the controller (its loop is fixed at source <-> controller), the builder anchors on the spawn (its loop is spawn <-> sites).
- Verified in the 170-tick probe: upgrader-2 at (15,20), one step from the pocket exit, walking to source A (old code: walking to source B). findClosestByPath from that same tile still returns B, confirming the trap.
- **Baseline 2026-10-24** (smoke, 500 ticks, reports/latest.md): build energy to roads 0 %; roads 59 / 0 on wall / 0 disconnected; roads reach sources 2 of 2 and controller; extensions/towers farther than 8 tiles: 0; sites on wall terrain: 0; harvested 3.62/tick, delivered 1.92/tick, construction 1.74/tick; RCL 1/8; upgrader born ~480, progress 0 (the failure this run fixes).
- **Last M3 acceptance run (4000 ticks, 1-builder economy)**: tower built and full (maxTowerEnergy 1000), but extensionsBuilt 1 (need 3), energyCapacity 350 (need 450) - build throughput was the only failing part.
- Next: read the smoke scorecard (progress > 0 by 500), then M1 (800), M2 (3000, roadsBuilt >= 1 + 1 extension), M3 (4000, tower + 3 extensions + 500 tower energy).

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [ ] M3: build priorities, layout and a tower (in progress)
- [ ] M4 containers and static mining
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- **Decision (2026-10-24): three builders, not the two rule 02b suggests.** The M3 acceptance test needs tower (5,000) + 3 extensions (9,000) finished inside 4,000 ticks of an RCL 3 start; measured ~1.75 progress/tick per builder, two builders cannot make that window. The M3 test (owner's acceptance criteria) wins over the 02b guideline; noted in the MIN_CREEPS_BY_LEVEL comment in src/config.ts.
- **Decision (2026-10-24): containers are the lowest build priority.** With roads above containers, a bootstrap colony finishes the first road before it touches the container site. That is what M2 (a finished road within 3,000 ticks of an RCL 1 start) requires. The trade-off is visible for M4, which needs containers adjacent to both sources by tick 3,000: when M4 work starts, selectBuildSite in builder.ts must gain a container-first path for the stage-2 economy (M4 spec redesigns the spawn manager into a priority list anyway).
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

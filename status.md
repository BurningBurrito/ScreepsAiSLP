# ScreepsAiSLP Status

## Current State
M1/M2/M3 in progress. The upgrader bootstrap failure (controller progress frozen at 0) is
fixed in three layers. First: the upgrader and builder pick their self-harvest source by
Chebyshev distance to a fixed anchor (controller for the upgrader, spawn for the builder)
instead of findClosestByPath, which the swamp pocket around the spawn-side source distorted in
favour of the far source (src/utils/pickSource.ts, src/roles/upgrader.ts, src/roles/builder.ts).
Second: occupancy-aware selection - pickSourceWithStandableTile skips a source whose standable
tiles are all occupied (the pocket source has only two), assignSource spreads harvesters by
remaining standable capacity, and the stuck detector in src/utils/movement.ts now clears a
creep's cached path when it makes no net progress across a 2 x (non-MOVE parts) + 2 tick
window, which catches the engine's two-tile ping-pong fallback at a blocked pocket entrance.
Third: the upgrader latches its source choice in memory for the whole work cycle
(src/roles/upgrader.ts) and the builder ranks the upgrader's source last when self-harvesting
(src/roles/builder.ts), so the builder no longer camps the pocket's second standable tile and
the upgrader no longer oscillates between the two sources. Verified with spawnprobe (700 ticks):
controller progress 0 -> 100 by t=700 (pre-fix regression: 0; baseline: 50), creep idle 18 % -> 6 %.

## Change Log
### 2026-10-30
- **M3 gate fix: tower-first build priority (src/roles/builder.ts)**: selectBuildSite splits the old "tower + extensions in one closest-wins class" into two: the tower site is now its own class above the extensions. Reason: in the last M3 run (4,000 ticks) the builders clustered on the closer extension sites and the tower starved at 4,959/5,000 progress - the acceptance test failed on "a tower is finished". With every builder on the single 5,000-energy tower site it completes first, then the builders spread over the 3,000-energy extensions. Road/container order below it is unchanged.
- **M3 gate fix: upgrader helps building while priority sites exist (src/roles/upgrader.ts)**: while an unfinished tower or extension site exists, runUpgrader delegates to runBuilder (the upgrader becomes a fourth builder; new exported helper hasPriorityBuildSites in builder.ts). The WORK energy an upgrader would burn on the controller goes into the construction instead. This is safe for M1/M2: the construction manager only places extension sites from controller level 2 and the tower site from level 3 (src/managers/constructionManager.ts), so the upgrader always makes its early RCL progress before the delegation can kick in; it resumes upgrading the moment the last priority site is finished.
- **Unit tests (test/unit/builder.test.ts, test/unit/upgrader.test.ts)**: +4 tests - builder prefers an unfinished tower site over a closer extension; builder prefers an extension over a closer road; upgrader builds the tower (not the closer extension) and skips the controller while a priority site exists; upgrader keeps upgrading when only road sites remain. 48 unit tests passing (44 before).

### 2026-10-30 (earlier run today)
- **Occupancy-aware source selection (src/utils/pickSource.ts, new helpers)**: added collectOccupiedTiles (creeps other than the asker + own structures, one room.find each), countStandableTiles (non-wall, in-bounds, unoccupied neighbours of a source) and pickSourceWithStandableTile (first source in priority order that still has a free standable tile; falls back to the first candidate when all are full so the creep waits instead of idling). Reason: the test room's pocket source at (14,18) has only two standable tiles; once two creeps stand there a third can never get in and the engine single-steps it at the pocket mouth (measured: upgrader oscillating between the two entrance tiles, 0 upgrades in 500 ticks; 330-tick no-upgrade window in reports/latest.md).
- **Upgrader and builder self-harvest (src/roles/upgrader.ts, src/roles/builder.ts)**: replaced pickSourceClosestTo with sortSourcesByDistance + pickSourceWithStandableTile (same anchors: controller, spawn), so a crowded pocket is skipped instead of becoming a parking trap.
- **Spawn manager assignment (src/managers/spawnManager.ts)**: assignSource now balances harvesters by remaining standable capacity (countStandableTiles minus already-assigned harvesters) instead of raw harvester count per source, so new harvesters spread across sources with free tiles.
- **Stuck detector (src/utils/movement.ts)**: the sliding window now triggers when the creep stands on the same tile at both ends of the window (no net progress), which catches the engine's ping-pong fallback (alternating two tiles) in addition to standing still; the window still slides on every trigger, so a walking creep (one step per 2 x non-MOVE parts ticks) never trips it.
- **Unit tests (test/unit/pickSource.test.ts new, test/unit/movement.test.ts, test/unit/mock.ts, test/unit/spawnManager.test.ts)**: 11 pickSource tests (ordering, standable counts, pocket skip, structure blocks, own-tile exclusion, full fallback), 2 movement tests (2-tile oscillation clears the cache; a straight walk keeps it), 2 spawnManager tests (pocket with full standable tiles gets no new harvester; pocket with a free tile still used). 39 unit tests passing.
- **Upgrader source latch (src/roles/upgrader.ts)**: the upgrader latches its chosen source in creep.memory.sourceId for the whole work cycle and re-picks only on the transition tick that empties the store after an upgrade, or when the latched source vanishes or runs dry while another source is live. Reason: re-picking the nearest-controller source every tick against the builder's transient pocket-tile occupancy made the upgrader oscillate between the two sources (measured: 0 controller progress in 700 ticks, creep idle 18 %); latching stabilises the target until the cycle completes.
- **Builder yields the upgrader's source (src/roles/builder.ts)**: when self-harvesting, the builder ranks the source nearest the controller (the upgrader's pick) last, so it takes the other source and falls back to the upgrader's only when the other has no free standable tile. This frees the pocket's second standable tile for the upgrader.
- **Unit tests (test/unit/upgrader.test.ts new, test/unit/builder.test.ts new)**: 3 upgrader latch tests (keeps the latched source mid-cycle instead of flipping to the closer one; re-picks on the store-emptying transition tick; drops a latched source that ran dry while another is live) and 2 builder yield tests (yields the upgrader's source and self-harvests at the other; falls back to the upgrader's source when the other is walled off). 44 unit tests passing.
- **Integration verification (spawnprobe, 700 ticks, via agent-test, 1 passing)**: controller progress 0 -> 100 by t=700 (pre-fix regression: 0; baseline 2026-10-30 commit 01c7958: 50), controller progress/tick 0 -> 0.18, creep idle 18 % -> 6 %. The upgrader probe trace shows a clean harvest(pocket A at 14,18) -> upgrade(controller at 8,43) cycle with no tick-to-tick oscillation; it switches to the open source B only for the few ticks the pocket genuinely runs dry, then returns when it refills.

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
- M3 gate failure (tower not finished by tick 4,000): fix implemented this run, two changes - (1) builder selectBuildSite puts the tower site in its own class above extensions (root cause: closest-site clustering starved the tower to 4,959/5,000 progress); (2) runUpgrader delegates to runBuilder while a tower or extension site exists (a fourth builder), so the WORK energy goes into the construction instead of the controller. Unit checks green (48 passing), smoke running.
- Plan for this run: [1] lint/build/unit (done, 48 passing) -> [2] smoke 500 ticks (upgrader must still show controller progress at t=500: at RCL 1 no tower/extension sites exist yet, so the delegation cannot trigger) -> [3] commit -> [4] M3 acceptance (4,000 ticks; expect tower finished early and >= 4 extensions by the end for the 450-capacity criterion) -> [5] full agent-test all (M1/M2 must stay green) -> [6] status/README/blog if green.
- **Last M3 acceptance run (before this fix)**: the failing criterion was the tower site unfinished at the end of the run - 4,959/5,000 build progress. Fix under test: tower-first builder priority + upgrader delegation to building.
- **Honest observation**: whole-run harvest is 2,488 this run vs 2,544 in the pre-fix run (-56, about 2 %, essentially flat - the builder now self-harvests the slightly farther open source after yielding the pocket to the upgrader) and construction is 3.3 vs 4.69/tick in the pre-fix run (the drop is expected: the upgrader now burns 0.18/tick on upgrades, so energy is split between construction and upgrading instead of all going to construction). The harvester itself is healthy (working on the pocket, not idle), so this is the intended trade, not a role regression.
- **Baseline 2026-10-24** (smoke, 500 ticks, reports/latest.md): build energy to roads 0 %; roads 59 / 0 on wall / 0 disconnected; roads reach sources 2 of 2 and controller; extensions/towers farther than 8 tiles: 0; sites on wall terrain: 0; harvested 3.62/tick, delivered 1.92/tick, construction 1.74/tick; RCL 1/8; upgrader born ~480, progress 0 (the failure this run fixes).
- **Last M3 acceptance run (4000 ticks, 1-builder economy)**: tower built and full (maxTowerEnergy 1000), but extensionsBuilt 1 (need 3), energyCapacity 350 (need 450) - build throughput was the only failing part.
- Next: run the full acceptance suite to confirm no regressions beyond the verified spawnprobe (smoke, M1 800, M2 3000 roadsBuilt >= 1 + 1 extension, M3 4000 tower + 3 extensions + 500 tower energy). M3 build throughput was already the failing part before this fix and is a separate follow-up; the controller-progress regression this run targets is resolved.

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

# ScreepsAiSLP Status

## Current State
M1/M2/M3 complete. The upgrader bootstrap failure (controller progress frozen at 0) is
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
M3 is complete: the acceptance test passed (1 passing, 17 min, 4,000 ticks). The build order is
fixed in two layers (src/roles/builder.ts, src/roles/upgrader.ts): the tower site is its own
priority class above the extensions, the upgrader delegates to runBuilder while a tower or
extension site exists, and while extension sites remain every builder works the ONE most
advanced extension (progress first, spawn-distance tie-break) so the room's energy capacity
grows as sites actually complete. Final M3 snapshot: tower built and full (maxTowerEnergy
1000), 4 extensions built + 6 sites placed (all 10 allowed), energyCapacity 500, road share
0 %, 59 road tiles, 0 on wall, 0 stray, sources 2 of 2 and controller connected, farthest
structure 6 tiles from spawn (limit 8), level 3.

## Change Log
### 2026-10-30 (M3 acceptance pass)
- **M3 COMPLETE**: acceptance-m3 passed (1 passing, 17 min) with the focused-extension fix from the previous entry. Snapshot after 4,000 ticks: towersBuilt 1, maxTowerEnergy 1000 (need >= 500), extensionsBuilt 4 + extensionSites 6 = all 10 allowed (need >= 3 built), energyCapacity 500 (need >= 450), roadShare 0 while priority sites existed (limit 10 %), 59 road tiles / 0 on wall / 0 stray, sources 2 of 2 + controller connected, farthestFromSpawn 6 (limit 8), level 3. Capacity climbed 300 -> 350 (~t2300) -> 400 (~t2800) -> 450 (~t3500) -> 500 (~t4000): one site finished at a time. Whole-run scorecard: harvested 38,120 energy, construction 4.28/tick, spawn idle 46 %, CPU avg 2.08 / max 26.07, 0 bot console errors.
- **Docs**: blog post blog/2026-10-30-build-priorities-and-a-tower.md (the two measured failure modes and the focus fix); README.md status and features updated; M3 ticked under Upcoming Features.
- Full-suite gate (agent-test all, 40 min): 50 passing (unit) + 7 passing (integration) - M1, M2, M3 acceptance, smoke and spawnprobe all green on commit cb8e347. The M3 run reproduced the passing snapshot exactly (roadShare 0, maxTowerEnergy 1000, extensions 4 built + 6 placed, capacity 500). M2 snapshot: 3 extensions built + 2 sites, 7 roads built + 52 sites, capacity 450, level 2.

### 2026-10-30 (M3 focus run)
- **M3 gate fix: focused extension building (src/roles/builder.ts)**: selectBuildSite no longer lets each builder pick its own nearest extension site. While any extension site exists, every builder (including the delegated upgrader) works the ONE most advanced site - highest build progress, ties broken by closeness to the spawn. All builders compute the same focus from shared room state (the progress numbers), so no Memory is needed and a global reset cannot desynchronise the crew. Reason: in the post-tower-first M3 run the tower finished and the first two extensions took ~450 ticks each with the full crew on them, but the crew then split one-per-site over the remaining eight sites (12,412 energy spread) and the third extension was still over 2,000 progress short at the end of the 4,000-tick window. Capacity only grows when a site is COMPLETE, so finishing one site at a time is what buys the energyCapacity criterion.
- **Unit tests (test/unit/builder.test.ts)**: +2 tests - a carrying builder converges on the most advanced extension (progress 2,900) even when a closer one (progress 100) sits at range 1; with equal progress the spawn-side site wins so every builder computes the same first target. 50 unit tests passing (48 before).
- **Deviation from M3 design note (documented per spec)**: the spec's "Choose by priority first, distance second" becomes "priority first, progress second, distance as the tie-breaker" for extension sites. Measured failure mode above is the justification; the tower class is unchanged.

### 2026-10-30 (M3 tower-first run)
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
- **M3 gate: PASSED this run** (acceptance-m3, 1 passing, 17 min, numbers above). Remaining steps this run: [1] full suite agent-test all (M1/M2/smoke must stay green) - IN PROGRESS -> [2] copy the "N passing, M failing" line into the Change Log -> [3] commit everything (code already committed as cb8e347; docs commit pending).
- **Next milestone (M4, containers and static mining)**: the hauler role already exists (withdraws from containers, delivers tower -> extensions -> spawn; spawnManager spawns haulers once a container exists) and constructionManager already computes container positions beside each source and places one site at a time (placeContainerSites). Still needed per milestones/M4.md: a stationary miner per source parked on its container tile, hauler delivery order per spec (spawn/extensions -> controller container -> upgraders in range 1), the spawn manager rewritten as a priority list, and a container-aware path in selectBuildSite while container sites exist. M4 acceptance: 3,000 ticks, 2 containers adjacent to 2 sources, >= 60 % of the harvest ceiling, wasted-at-regen <= 15 %, upgrade >= 20 % of ceiling, no >150-tick idle spawn at full energy, CPU <= 10/tick.

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [x] M3: build priorities, layout and a tower (completed 2026-10-30, acceptance 1 passing)
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
- **Construction site / build progress**: the ghost outline placed before a structure exists; it only becomes a real structure once energy spent on it (build progress) reaches the structure's cost - progress on an unfinished site is worthless at the deadline
- **Energy capacity**: the total energy a room can hold at once (spawn 100 + 50 per finished extension); bigger capacity means bigger creeps
- **Priority class (design concept)**: grouping structure types so builders always finish every site in a higher class before touching a lower one; M3 runs tower > extensions > roads > containers

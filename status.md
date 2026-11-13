# ScreepsAiSLP Status

## Current State
Current state (2026-11-13, run 97, 07:45 start): M5 improvement on the
reverted M4-passing tree. The M5 baseline numbers (2026-11-13 gate run,
referenced in the config comments; no report file survives): harvest
8.56/tick (needs >= 13) and upgrade 0.70/tick (needs >= 1) over the last
1,000 ticks, with the second source container site still unbuilt by the
window end. Root causes this run addresses: (1) the shared pool-rung gate
in getEnergy (src/utils/energy.ts) coupled builder AND upgrader pool
access to BOTH hold-backs - once the surplus valve spawned a second
upgrader (its cap is 5 from RCL 5), the upgraders' own rung closed and
their 1-MOVE body crawled the pool round trip (4 ticks per tile on
plain), capping upgrade at 0.70/tick, and the builder rung closed
whenever the income crew oscillated above minimum, starving the
second-container site (build 1.07/tick with ten builders would not
finish cB before the window); (2) the uncovered source B kept only TWO
harvesters (UNCOVERED_SOURCE_HARVESTERS_L4) at RCL 5, each a
3-WORK/1-MOVE body that spends most of its life walking to the spawn
with 100 energy - 2 walkers manage ~2.5-3/tick of the source's 10/tick
refill; (3) the first miner spawned as 1-WORK at 300 energy and its
replacement could not be 3-WORK before the 450 capacity arrived, and a
dying miner left its source uncovered for the replacement's whole ~100
tick walk (no early replacement). Fixes: the pool gate splits at
CONTAINER_BOOST_MIN_LEVEL (upgrader takes the pool from the 50% floor
with NO hold-backs - its own surplus must not cut off its fuel; the
builder takes it only from the 90% surplus line, never the reserve);
UNCOVERED_SOURCE_HARVESTERS_FULL = 5 at capacity >= 450
(HARVESTER_CREW_FULL_CAPACITY); MINER_REPLACEMENT_LEAD_TICKS = 200 (the
per-source miner minimum goes to 2 while a miner is inside its lead, and
assignMinerSource frees the slot so the replacement goes to the SAME
source); body rows: miner 300 [W,W,C,M], upgrader 400 [W,W,C,C,M,M]
(2 MOVE instead of 1, same 400 cost), hauler 400 [C x4, M x4] and 450
[C x6, M x3]. Unit suite updated for the two deliberate behavior changes
(upgrader 400 body; the RCL 5 surplus-valve test now carries ten
harvesters, the new per-source minimum). 192 unit passing, lint 0
errors, build clean. Smoke and acceptance-m5 runs in this run.
Previous state (2026-11-13, run 96, 06:20 start): the FAILED GATE of 06:05 is
FIXED - the 06:05 gate failed the unit suite (150 passing, 1 failing:
spawnManager "at RCL 5 spawns a surplus upgrader below the upgrader cap
while sites exist", expected upgrader-10 got builder-10) plus a lint warning
(LEVEL5_EXTENSION_FLOOR defined but never used in src/roles/builder.ts).
Cause: the previous run died mid-experiment on M5 and its leftovers (auto-
commit 6e5653c) were never tested: a new {level: 5, builder: 6} row in
MIN_CREEPS_BY_LEVEL (so at RCL 5 three builders are BELOW minimum and the
main spawn loop takes the slot before the surplus walk ever runs) and a new
LEVEL5_EXTENSION_FLOOR = 6 constant imported into builder.ts but never used
by the ladder. The verified M4-passing tree (9a39e9e, acceptance PASSED
06:28 on d32a596 = same code) has none of that, so both leftovers were
reverted with git checkout 9a39e9e -- src/config.ts src/roles/builder.ts.
192 unit passing, lint 0 errors 0 warnings, build clean. No M5 report of
the 8.56/0.7 run the config comment referenced survives in reports/
(history.csv has no acceptance-m5 row for 2026-11-13); the best surviving
M5 numbers are the 1a1507d probe (harvest 12.47, upgrade 0.6, idle-full
68 %, RCL 5/950) and the b9a4099 acceptance (harvest 10.52, upgrade 0.61,
idle-full 50.7 %, minedShare 0.98). This run: M5 acceptance baseline on the
reverted tree, then one focused M5 improvement. M5 criteria (milestones/
M5.md): harvested >= 13/tick and upgrade >= 1/tick over the last 1,000
ticks, spawn idle-while-full <= 30 %, minedShare >= 60 % from tick 3000,
ground energy <= 300 avg from tick 3000, >= 3 creeps at end, M1-M4 must
still pass. Previous state (2026-11-13, the M4-fix run labeled "run 96" in
the Change Log below): the M4 acceptance regression is FIXED and VERIFIED - the re-run after the fix (started 22:38, 6,000 ticks)
finished EXIT 0 (mocha success): extensionsBuilt 3, energyCapacity 450,
maxTowerEnergy 1000, towersBuilt 1 + 1 site, towersWithRampart 1,
spawnHasRampart, spawnHits 5000, firstHostile 5401 / firstDefend 5401,
intruder gone after 2 ticks, safeModeTicks 0, hostilesAtEnd 0, mode
peace, creeps 21, farthestFromSpawn 8 - every one of the test's 17
assertions met (reports/acceptance-m4.md, snapshot line in the Change
Log below). Scorecard vs the last passing M4 (f3a6863): RCL 5/1,650
(was 5/1,254), construction 3.8/tick (was 1.46), CPU 3.48 avg / 36.06
max. How it broke: the run 94 mini-floor
(CONTAINER_MINI_FLOOR_EXTENSIONS = 2) let the second source container
(5,000 energy) take the builder crew after TWO extensions and starve the
third (3,000 energy): the M4 acceptance failed this run (commit b9a4099)
with extensionsBuilt 2 and energyCapacity 400 of 450 at tick 6,000.
Fix: the mini-floor and the floor-completion rung are merged back into
one M4 three-extension floor (rung 3,
CONTAINER_BOOST_MIN_EXTENSIONS_L4) that runs BEFORE the remaining
source-container rung (rung 4) in selectContainerFirstSite
(src/roles/builder.ts); CONTAINER_MINI_FLOOR_EXTENSIONS is removed from
src/config.ts; the lower rungs are renumbered; test/unit/builder.test.ts
updated (the "two extensions -> second source container" test is flipped
to "crew stays on the third extension before the second source
container"). This restores the v9.4 order that the 2026-11-12 11:02 M4
run (f3a6863) proved fits the 6,000-tick window (all three extensions
finished well before tick 5,000), and it is exactly the order FEEDBACK
v9.4 prescribes ("build the FIRST source container right after the first
tower, and keep the 3-extension floor for everything after it"). M5 does
not need the second container BUILT: its "every source has a container"
criterion counts a placed site, and its minedShare criterion is
satisfied by the first source's stationary miner (rung 2). 192 unit
passing, lint 0 errors, build clean. Next: the full suite
(agent-test start all), then the M5 work (its three failing criteria are
pre-existing and out of scope for the M4 fix).
Previous state (2026-11-12, run 93): the failed gate - unit test failures in
test/unit/spawnManager.test.ts and test/unit/upgrader.test.ts, left stale by
this morning's config changes (commit 877cba7: SURPLUS_UPGRADER_MAX 2 -> 3,
new SURPLUS_SPAWN_ENERGY_RATIO 0.9 pressure valve, MIN_CONTAINER_WITHDRAW_
ENERGY 100 -> 50, new 450-energy 3-WORK/2-CARRY harvester body) - is
fixed: the surplus-builder test now runs against the 3-upgrader cap (expects
builder-6), a new surplus-upgrader test documents the cap (upgrader-4 with 2
upgraders and 3 builders), the all-caps test now uses 3 upgraders and
counter 10, and the upgrader trickle test uses 49 energy (below the new 50
threshold). 184 unit passing, lint 0 errors, build clean (commit b09a7e4).
Next: the M5 acceptance test on this tree (baseline reports/latest.md,
probe-m5-creeps: harvested 9.36/tick vs 13 needed, upgrade 0.43/tick vs 1,
spawn idle-while-full 59 % vs 30 % max, RCL 5/802 at 5,000 ticks), then the
M4 regression.
Previous state (2026-11-12, pool rung run): the M5 gate failures (harvest
11.68/tick vs 13 needed, upgrade 0.5/tick vs 1, spawn idle-while-full 76 %
vs 30 % max - probe-m5-timeline run of 2026-11-12, commit 004fc8e) were fixed
with an upgrader pool rung. getEnergy in src/utils/energy.ts gained rung 3:
upgrader only, from CONTAINER_BOOST_MIN_LEVEL (RCL 4) on, ABOVE the source
container rung, guarded by the same poolReady hold-backs as the builder rung
(!upgraderBelowMinimum && !incomeBelowMinimum && the 50 % floor) - so the
upgrader now spends the spawn/extensions pool (a few-tile round trip next to
the controller) instead of competing with the builders at the source
container 20+ tiles away, and the pool stops sitting full while the upgrader
starves. withdrawFromPool(creep, room) is shared by the upgrader and builder
rungs. Below RCL 4 the M1-M3 economy is byte-for-byte unchanged (upgrader
refuels from the controller container, then the source container, then
self-harvest). 183 unit passing (180 + 3 pool rung: the pool beats a full
source container at RCL 5; the container rung is untouched below the gate at
RCL 3; the pool is skipped below the 50 % floor even at RCL 5), lint + build
clean, dist rebuilt. M5 acceptance test running (started 06:28:58; live at
tick 3400: 9 creeps, harvested 5.28/tick, upgraded 0, energy 13/400, spawn
busy, RCL 5/100).
Current state (2026-11-11, run 8): the M3 death spiral is fixed with an
income hold-back instead of shrunken bodies. This run confirmed the
failure is two-layered: (1) b1b9be1 (full-capacity sizing + the v9.3
getEnergy pool rung) died to 2 creeps at t=4000 because the builder's
pool withdrawals kept the store below the cost of a full-size income
replacement; (2) the income-only min(capacity, available) clamp of
1404382 stopped the 1-WORK ratchet but M3 still ended with 2 extensions
at t=4000, the crew back in the 2-creep state. A sizing revert alone
cannot work: the drain engine is the pool rung, not the sizing. Final
fix: sizingBudgetFor in src/managers/spawnManager.ts is back to the
de5c985 behavior (every role sized from the room's CAPACITY, the only
exception a wiped income or hauler crew, whose store nothing else can
refill, sized from the stored energy - so a replacement is never smaller
than the crew it replaces), and the pool rung of getEnergy in
src/utils/energy.ts now requires the new incomeBelowMinimum(room)
(src/managers/spawnManager.ts) in addition to upgraderBelowMinimum:
while the income crew is below its per-source minimum the builder may
not withdraw from the spawn/extensions pool - it refuels by
self-harvesting or from the source-container rung (not gated) - so the
store climbs to capacity and the full-size income replacement starts.
174 unit passing (168 + 2 sizing regression + 3 incomeBelowMinimum + 1
builder hold-back; the 2 existing builder pool tests now carry an
at-minimum income crew), lint + build clean, smoke 1 passing (500
ticks, harvested 4.44/tick vs 3.86 in the previous smoke run 8553897,
6 creeps at end H2 B2 U2, 0 console errors).
M3 acceptance PASSED on the fix: 1 passing (18m), EXIT 0. Snapshot at
t=4000: extensionsBuilt 5 (de5c985 baseline 4; the failed 1404382 run
ended at 2), extension sites 5, energyCapacity 550 (500),
maxTowerEnergy 500 (500), creeps 7 (peak 10; baseline 3, peak 11),
roads 59 / 0 on wall / 0 disconnected, sources 2 of 2, controller
connected, farthest 6, 0 console errors. Scorecard (last 1000 ticks,
vs de5c985 baseline): harvested 7.78/tick (5.46), delivered to
spawn/extensions 6.35/tick (4.65), construction 4.52/tick (5.02),
controller 0.13/tick (0.15), CPU 1.94 avg / 21.44 max (1.83 / 21.53),
creep ticks idle 30% (19%), spawn busy 10% (3%). M2 regression PASSED on
the same tree (ec7a3f6): 1 passing (13m), EXIT 0, 3001 ticks - level 2,
extensionsBuilt 2 + 3 sites (>= 5), roadsBuilt 5 + 54 sites, capacity 400
(> 300), creeps 6 (>= 3); harvested 5.44/tick (previous M2 run 1404382:
3.46), construction 5.59/tick (2.99), delivered to spawn/extensions
4.96/tick (2.55), ticks to RCL 2: 812 (816), roads 59 / 0 on wall / 0
disconnected, sources 2 of 2 + controller reached, 0 console errors. The
full agent-test all suite started after the M2 pass (finish ritual).
Current state (2026-11-11, run 7): M3 has TWO competing failures and the
fix is now role-scoped. (1) b1b9be1 (the 08:05 gate) failed M3 on the death
spiral: creeps 2 at t=4000 (needs >= 3), while construction was fine
(extensionsBuilt 4 + 6 sites). (2) The full min(capacity, available) clamp
from this morning's run-6 working tree broke construction instead: the
builder/upgrader templates have no 250 body, so a store of 200-299 bought a
200-energy 1-WORK builder/upgrader about a hundred energy early; those early
consumers self-harvest at the source (20 energy/tick of source regen is the
binding constraint) and starved the five-harvester crew - harvest fell to
~2.4/tick in the last 1000 ticks (vs ~8-9 at the gate), the store plateaued
149-269 and never reached the 300 full-store threshold, so the surplus wave
(third builder, upgrader) arrived ~1000 ticks late, and extensionsBuilt was
1 at t=4000 (gate: 4 + 6 sites; creeps 4, H2 B1 U1, peak 6). Refined fix:
sizingBudgetFor (src/managers/spawnManager.ts) now clamps to
min(capacity, available) ONLY for income roles (harvester, miner, hauler) -
the crew that refills the store, whose replacement must not wait for a body
the bootstrap economy may never afford; builder/upgrader/defender keep
capacity sizing, restoring the gate's construction behavior exactly. 168
unit passing (167 + new test pinning the consumer wait), lint + build
clean. acceptance-m3 re-run RUNNING (started 11:50).

Current state (2026-11-11, run 6): M3 gate failure (creeps 2, needs >= 3)
fixed in the working tree. The 08:05 gate on b1b9be1 passed M1/M2 and
failed M3 on "the colony still has creeps": creeps 2 at t=4000 while
every other M3 criterion passed (level 3, 1 tower at maxTowerEnergy 500,
extensions 4 built + 6 sites, capacity 500, roadShare 0%, road tiles 59,
sources 2/2, controller connected, farthest 6). Root cause: sizingBudgetFor
in src/managers/spawnManager.ts sized replacement bodies from
energyCapacityAvailable and refused to start while the store was below it;
during the RCL 3 bootstrap the store oscillated 169-372 of 500 and never
reached it, so every creep death shrank the crew that refills the store -
a death spiral (the 07:48 de5c985 run already ended 3 of a peak 11, and
the v9.3 fixes in b36207d/b1b9be1 pushed it to 2). Fix: sizingBudgetFor
now returns min(capacity, energyAvailable), which subsumes the old
income-dead / hauler-dead exceptions (store empty -> equal; store full ->
capacity, so surplus spawns are unchanged). 167 unit passing, lint +
build clean. acceptance-m3 re-run RUNNING; M2 regression run follows.

Current state (2026-11-11, run 5): FEEDBACK v9.3 fixes in progress.
Fix 1 is committed (b36207d): src/utils/energy.ts adds getEnergy(creep,
role) - drops within BUILDER_DROP_PICKUP_RANGE, upgrader-only controller
container, fullest source container >= MIN_CONTAINER_WITHDRAW_ENERGY (new
config, 100), builder-only pool above BUILDER_WITHDRAW_FRACTION (with the
upgraderBelowMinimum hold-back), and a "wait" outcome when a container
holds energy but below the threshold (idling beats a partial-load source
trip). runBuilder and runUpgrader route their empty-store step through it;
the self-harvest paths stay as the last resort. Owner unit-test specs all
implemented: builder + 1000-energy source container withdraws from it,
builder + 50-energy container idles (no harvest, no move), upgrader +
source container withdraws, upgrader + 50-energy container idles. 167 unit
passing, lint + build clean. Fix 2 is applied (not yet committed):
hasPriorityBuildSites in src/roles/builder.ts no longer pauses the
upgrader for container sites (rungs 3-4 removed); tower (rung 1) and first
extension (rung 2) still pause it. 166 unit passing with both fixes.
acceptance-m4 (the gate blocker, extensionsBuilt 1 of 3 at de5c985) is
RUNNING on the tree with both fixes; acceptance-m5 follows if M4 passes.

Current state (2026-11-11): M3 gate failure fixed. The gate (2026-11-10
21:59) failed M3 on maxTowerEnergy 0 (needs 500): the tower was last in the
harvester delivery cascade and only saw pool OVERFLOW, but the builder
50%-capacity withdrawal floor (5be99ae) means the pool never fills to
overflow. The 500 reserve is a fixed buffer, so src/roles/harvester.ts now
fills the tower FIRST (bounded: only while below TOWER_ENERGY_RESERVE),
then spawns, then extensions, then drop. acceptance-m3 on the fix: 1
passing (18m), EXIT 0, maxTowerEnergy 500, extensionsBuilt 4, capacity 500,
roads 59, sources 2/2, creeps 3. Full suite (M1-M5 regressions) is the
remaining gate step.

Current state (2026-11-11): M5 static-mining milestone - builder build-pace fix.
Root cause of the slow M5 build: an empty builder used findClosestByRange on ALL
dropped energy with no range limit, so a single far pile (a harvester dumping a
full load at the far source, ~29 tiles out) was more attractive than the spawn
2-3 tiles away or a nearby pile; the builder did a cross-map round trip for
energy the walk cost more than, build pace sat at ~0.86/tick, and the first
source container was projected at ~5300 (past the 5000-tick test, so static
mining never started). Fix: BUILDER_DROP_PICKUP_RANGE (10 tiles) in
src/config.ts, applied in runBuilder's drop-pickup phase (src/roles/builder.ts)
- a builder only grabs a pile within 10 tiles, which covers the
spawn/tower/near-source cluster and excludes the far source. Probe (700 ticks,
M5 world): buildPerTick 0.86 -> 5.22, tower progress 258 -> 1479,
spawn idle-while-full 0.079 -> 0.011. M5 acceptance is RUNNING on the fixed
tree (163 unit passing, lint + build clean); the earlier gate failure
(constructionManager unit test) was already fixed in d1b130c.

Current state (2026-11-10, run 4 in progress): the M5 "early container"
build priority (owner idea a: 5d4b87e original, 7dc4775 scoped) is
REVERTED to the 88fb080 priority logic. containerFirstForRoom is back to
the three cases (a container is already built / RCL <= 2 after the M2
extension + road minimum / RCL 4+ after the M4 3-extension floor); the
CONTAINER_EARLY_MIN_LEVEL constant and the L5 container-first branch are
gone, and hasPriorityBuildSites pauses the upgrader only for tower
sites again. PRESERVED: the builder getUsedCapacity withdrawal fix
(verified active in-game by the run-2 pool sawtooth) and the L4+ crew
scaling (SURPLUS_BUILDER_MAX 5, UNCOVERED_SOURCE_HARVESTERS_L4,
CONTAINER_HAULER_SPARE). M4 regression CONFIRMED on the scoped idea-a
tree: acceptance-m4 (6000 ticks, EXIT 1) ended at extensionsBuilt 1 of
3, energyCapacity 350 of 450, 29 extension sites still open - the
first 5,000-energy container consumed the build bandwidth the 3-
extension floor (3 x 3,000 energy) needs in the same window; every
other M4 criterion passed (2 towers with ramparts, maxTowerEnergy 1000,
spawnHits 5000, spawnHasRampart, firstHostile 5401 / firstDefend 5401,
intruder gone in 1 tick). M4 acceptance re-verification is RUNNING on
the reverted tree; the commit is blocked until it passes. 139 unit
passing, lint + build clean; git diff against 88fb080 now touches only
the withdrawal fix, the crew-scaling constants and the builder tests.

Gate fix 2026-11-09: the full-suite gate on e996131 passed M1 and M2 and
failed M3 on "a connected road leads from the spawn to every source"
(sourcesConnected 1 of 2): replay step 2's container site sits on the pocket
tile (40,13), Source B's only walkable neighbour, and the M3 harness flood
fill counts roads only. Fixed by inverting the contested-tile ownership in
src/managers/constructionManager.ts: the road wins the tile, the container
site is withheld until the road is built, and the two then coexist on the
tile (the engine allows structures to share a tile, construction sites
cannot). 129 unit passing. M3 re-run PASSED (1 passing, 18m, EXIT 0,
sourcesConnected 2 of 2, roadTiles 59, strayRoads 0) and M3 passed again in
the 2026-11-09 full suite (4,001 ticks) - the fix holds. The full suite then
ran M4 (the step 6 check): FAILED - see the Change Log; step 6 was reverted
(92f465f) and the full suite is re-running on the reverted tree.

Gate state verified (2026-11-01, run 37 round 2): the 05:33 gate failed on M2
(0 finished extensions). The fix (c2b9f5c, 9f0abcf) was verified in this run by
a full-suite pass on the current src/ (agent-test start all, started 07:53,
4,325 s, EXIT 0: "8 passing (1h)" integration + 75 passing unit; M2 now
extensionsBuilt 1 / roadsBuilt 3, M3 capacity 450, M4 2 towers with ramparts,
0 console errors). HEAD (870f347) changed nothing in src/ since that run
(git diff 9f0abcf..HEAD touches only reports/ and status.md), and
lint/build/75 unit tests were re-verified clean in round 2, so the gate will
push the exact code that passed. M5 (static mining) remains the open milestone
but is blocked: the owner's M5 acceptance test is not in this repo copy.

M3 regression fixed (2026-11-01): the M5 merge's source-state spawn minimums
replaced the level-table harvester row with a per-source split, which left an
RCL 3 room without containers at two harvesters and starved the M3
tower-plus-extension window (failing run: 1 extension, capacity 350 at tick
4,000). minCreepsPerRole (src/managers/spawnManager.ts) now uses
max(per-source split, level-table row) while no container is built - the
pre-M5 bootstrap economy - and the M5 split once a container exists.
acceptance-m3 PASSES again (18m, 4,001 ticks, EXIT 0): 3 extensions + 7 sites,
capacity 450, tower built with maxTowerEnergy 500, roads to both sources and
the controller, 10 creeps, 0 console errors; harvested 10.46 -> 11.12/tick and
construction 4.06 -> 4.17/tick vs the pre-M5 baseline. Full suite re-verified
the same day (agent-test start all, 65m, EXIT 0): 75 passing (unit) + 8
passing (integration), 0 failing - M1-M4 acceptance, smoke and spawnprobe all
pass against the new minimums.
M2 regression fixed (2026-11-01): the M5 unconditional container-first build order
(d108b29) pinned the whole builder crew on the first 5,000-energy container site from
~tick 400 and failed the 05:33 gate's M2 with 0 finished extensions and 0 finished
roads at tick 3,000. containerFirstForRoom (src/roles/builder.ts) now gates the
container-first branch: containers lead only once a container is built, or at
controller level <= 2 after one extension AND one road are finished. acceptance-m2
PASSES again (EXIT 0, 3,001 ticks): level 2, extensionsBuilt 1, extensionSites 4,
roadsBuilt 3, energyCapacity 350, creeps 7; ticks to RCL 2 improved 945 -> 813.
M1, M2 and M3 are complete (bootstrap economy, focused build order, tower plus 10-extension
capacity - details in the Change Log). The 10:01 M1 gate failure was two code bugs, not the
environment: manageMode in src/managers/modeManager.ts read Memory.rooms on a fresh world
before Memory.rooms existed and threw every tick before any spawning, and
ErrorMapper.wrapLoop (src/utils/ErrorMapper.ts) rethrew the source-map
require("main.js.map") failure from inside its catch block, which masked the real error,
aborted every tick and silently killed the console channel the test probes use. Both are
fixed: Memory.rooms is created when missing, the source-map lookup falls back to the original
stack, and non-Error throws are logged instead of rethrown. acceptance-m1 now passes on a
fresh world (801 ticks, 0 console errors).
M4 (Hold the room, level 5) PASSED its acceptance test on 2026-10-31: 1 passing (26m),
6,001 ticks, EXIT 0. Snapshot: towersBuilt 2, towersWithRampart 2, extensionsBuilt 5 +
extensionSites 25 (30 total), energyCapacity 550, maxTowerEnergy 540, farthestFromSpawn 8,
spawnHasRampart, intruder (1000 hits at tick 5400) killed in 1 tick with Memory.mode
'defend' from the same tick, 0 safe-mode ticks, spawn at 5000 hits, 10 creeps at the end,
0 console errors. Before the fix the second tower site was never created because
computeExtensionPositions filled the checkerboard rings from range 2 outward and at level 5
all 30 extension slots fit inside ranges 2-4 - exactly the range computeTowerPositions
searches - so the extensions occupied every candidate tile (probe run, 2,600 ticks: 29
extension sites + 1 built, 59 roads, 1 container, NO tower sites, first tower already
finished). The fix (src/managers/constructionManager.ts): all missing tower positions are
computed up front and the road network plus every future tower tile is reserved (passed as
excludeTiles) to computeExtensionPositions and computeContainerPositions; placeTowerSites
still places one site at a time. Regression test test/unit/constructionManager.test.ts
(4 tests) fails without the fix and passes with it; 57 unit tests pass; smoke (500 ticks)
shows 0 console errors and no scorecard regressions. M1, M2 and M3 remain complete. Full suite verified the same day: agent-test start all (M1-M4 acceptance + smoke + spawnprobe) = 8 passing (1h), EXIT 0, re-confirming the M4 snapshot in-run (towersBuilt 2, towersWithRampart 2, extensionsBuilt 5 + extensionSites 25, energyCapacity 550, maxTowerEnergy 540, firstHostile/firstDefend 5401, intruderGoneAfterTicks 1, safeModeTicks 0, 10 creeps, 0 console errors).
M5 (static mining with containers and haulers) is implemented and its smoke failure is
fixed (2026-11-01): a stationary miner role per source (src/roles/miner.ts), M5
source-state spawn minimums in src/managers/spawnManager.ts (miners where a container is
built, bootstrap harvesters elsewhere, haulers once a container exists), and a
container-first branch in selectBuildSite (src/roles/builder.ts). The smoke test's
controller-progress criterion failed before the fix because the builder's 50 % withdrawal
floor pinned the store below the upgrader's 300-energy body cost (the whole RCL 1
capacity), so the upgrader never spawned in 500 ticks. The fix (upgrader hold-back in
src/roles/builder.ts, upgraderBelowMinimum in src/managers/spawnManager.ts): while fewer
upgraders are alive than the minimum, the builder does not withdraw at any store level and
self-harvests instead, so the store can reach the upgrader's cost; once the upgrader is
alive the floor applies again. Smoke now passes (1 passing, 2m, 0 console errors):
controller progress 0.1 -> 0.25/tick (50 total at tick 500), harvested 3.3 -> 3.86/tick,
construction 3.75 -> 2.01/tick (builders self-harvest during the hold-back window and the
window's build energy now goes to the container site - 401 - instead of roads, the M5
bottleneck), spawn idle while full 0 % -> 1 %, CPU 1.39 -> 1.52/tick, creep idle
8 % -> 22 % (under investigation, see Known Issues). 69 unit tests pass. The M5
acceptance test (owner's, 3,000 ticks) is not in this copy of the repo
(test/integration holds acceptance-m1..m4 only), so M5 is not ticked in Upcoming Features
yet.

## Change Log
### 2026-11-13 (run 97: M5 harvest/upgrade - full crews, decoupled pool gates, early miner replacement)
- Baseline (2026-11-13 gate run; report file did not survive): M5
  acceptance FAILED - harvest 8.56/tick (needs >= 13), upgrade 0.70/tick
  (needs >= 1), second source-container site unbuilt by the window end.
- Diagnosis (three independent bottlenecks, measured in the 06:28 M4
  scorecard timeline and the code): (1) the pool rung of getEnergy
  (src/utils/energy.ts) gated builder AND upgrader withdrawals on
  upgraderBelowMinimum (hold-back); the surplus valve spawns upgraders up
  to cap 5 at RCL 5, so once two upgraders exist the upgraders lose pool
  access and their 1-MOVE body walks the pool round trip (2 fatigue per
  part per step, 4 ticks per tile on plain) - 2x2 WORK from the pool is
  at most ~1 progress/tick; the builder rung closed whenever
  incomeBelowMinimum tripped (crew oscillates above the 2-per-source
  minimum at RCL 5), so the second-container site (rung 4 of the builder
  ladder) stalled at ~1.07 build/tick. (2) Source B (uncovered) ran TWO
  harvesters at RCL 5 (UNCOVERED_SOURCE_HARVESTERS_L4): a 3-WORK/1-MOVE
  walker harvests ~3/tick at the source then spends ~40 of its ~100-tick
  round trip walking back - the source refills 10/tick, the rest is lost
  at regeneration. (3) The first miner was 1-WORK (300 energy) and its
  replacement could not be 3-WORK before the 450 capacity, and no
  replacement spawned until the miner actually died (source uncovered
  for the whole ~100-tick walk of the replacement).
- Fix 1, pool gate split (src/utils/energy.ts): new upgraderPoolReady
  (CONTAINER_BOOST_MIN_LEVEL and above: pool above the 50%
  SURPLUS_POOL_FLOOR line, NO hold-backs - an upgrader's own surplus
  must not cut off its own fuel; below: the old floor +
  income/upgrader hold-backs) and builderPoolReady (same level: pool
  above the 90% SURPLUS_VALVE line, no hold-backs; below: unchanged).
  The upgrader rung uses upgraderPoolReady, the builder rung uses
  builderPoolReady.
- Fix 2, full harvester crew (src/config.ts, src/managers/spawnManager.ts):
  UNCOVERED_SOURCE_HARVESTERS_FULL = 5 and HARVESTER_CREW_FULL_CAPACITY
  = 450; countIncomeMinimum counts an uncovered source against the full
  crew from RCL 5 with capacity >= 450 (the source's 10/tick refill
  needs ~5 WORK to drain in time; below that the 2/2 split remains).
- Fix 3, early miner replacement (src/managers/spawnManager.ts,
  src/config.ts): MINER_REPLACEMENT_LEAD_TICKS = 200
  (replacement spawn time 9 ticks + walk 50 + margin); the per-source
  miner minimum is 2 while any living miner is inside its lead, so the
  replacement starts ~200 ticks before the incumbent dies and walks the
  path while the incumbent still harvests.
- Fix 4, bodies (src/config.ts): miner 300-energy row [W,W,C,M] (was
  [W,C,M] - covers the cold-boot wipe branch, which sizes a miner from
  STORED energy instead of room capacity; 2 WORK instead of 1 keeps the
  container cycling at 4/tick), upgrader 400 row
  [W,W,C,C,M,M] (was [W,W,C,C,M] - 2 MOVE halves the walk period, same
  400 cost); hauler 400 row [C x4, M x4] and 450 row [C x6, M x3]
  (6 CARRY with 3 MOVE is road-mover; 1 MOVE per 2 CARRY is the
  road-speed limit).
- Tests: test/unit/spawnManager.test.ts updated for the two deliberate
  behavior changes - the RCL 5 upgrader body test now expects
  [W,W,C,C,M,M] (400), and the "surplus upgrader below the cap while
  sites exist" test now carries ten harvesters (5 per source, the new
  RCL 5 minimum) so the upgrader is still below minimum and the surplus
  walk runs. 192 unit passing, lint 0 errors 0 warnings, build clean.
- Smoke (500 ticks) and acceptance-m5 + acceptance-m4 regression:
  in progress this run.
### 2026-11-13 (run 96, 06:20 start: gate fix - reverted the unfinished M5 experiment)
- The 06:05 gate failed: unit 150 passing / 1 failing (spawnManager "at RCL
  5 spawns a surplus upgrader below the upgrader cap while sites exist":
  expected upgrader-10, got builder-10) and a lint warning (LEVEL5_EXTENSION_
  FLOOR unused, src/roles/builder.ts:166). The cause was the previous run's
  uncommitted M5 leftovers, auto-committed as 6e5653c: a {level: 5,
  harvester: 5, builder: 6, upgrader: 1, hauler: 1} row in
  MIN_CREEPS_BY_LEVEL (at RCL 5 with 3 builders alive the builder is below
  minimum, so the main SPAWN_ORDER loop spawns the builder before the
  surplus walk can run) and LEVEL5_EXTENSION_FLOOR = 6 plus doc rewrites in
  builder.ts that the selectContainerFirstSite ladder never actually uses.
  The experiment was never tested and never recorded here. Reverted both
  files to 9a39e9e (the code of the verified M4-passing tree; d32a596,
  which the 06:28 M4 acceptance ran on, is 9a39e9e plus report files only).
  192 unit passing, lint 0 errors 0 warnings, build clean. The experiment's
  idea (six builders at RCL 5 + an 18,000-energy six-extension floor so the
  capacity reaches 600 and the store cycles instead of pinning full) is
  parked in Known Issues, to be re-derived from measurements if M5 needs it.
### 2026-11-13 (run 96: M4 fix - the second source container back behind the M4 floor)
- M4 acceptance (b9a4099, this run, 6,000 ticks) FAILED: extensionsBuilt
  2 (needs 3), energyCapacity 400 (needs 450); every other criterion met
  (level 5, tower 1 + site, 2 tower sites, 27 extension sites, ramparts,
  hostile/defend/kill all inside limits). Root cause: the run 94
  mini-floor (CONTAINER_MINI_FLOOR_EXTENSIONS = 2, rung 3) handed the
  builder crew to the second source container (rung 4, 5,000 energy)
  after TWO extensions, and the 3,000-energy third extension had not
  even started by the window's end. The 2026-11-12 M5 probe that
  motivated the mini-floor measured a stall with a different cause (the
  run 93/94 surplus caps leaving builders idle), and M5 never needs the
  second container BUILT (its "every source has a container" criterion
  counts a placed site; minedShare is satisfied by source A's stationary
  miner, rung 2). Fix: the mini-floor and the floor-completion rung are
  merged back into one M4 three-extension floor - rung 3 of
  selectContainerFirstSite (src/roles/builder.ts), gated on
  CONTAINER_BOOST_MIN_EXTENSIONS_L4 (3) - executing BEFORE the remaining
  source-container rung (rung 4). This restores the v9.4 order that the
  2026-11-12 11:02 M4 run (f3a6863) proved lands the M4 contract inside
  the window (all three extensions finished well before tick 5,000).
  Files: src/roles/builder.ts (rungs 3-5 merged/renumbered: 3 = M4 floor,
  4 = remaining source containers, 5 = controller container, 6 = ramparts,
  7 = second tower, 8 = remaining extensions, 9 = roads, 10 = leftover
  containers; header and hasPriorityBuildSites docs updated),
  src/config.ts (CONTAINER_MINI_FLOOR_EXTENSIONS removed; the
  CONTAINER_EARLY_MIN_LEVEL and CONTAINER_BOOST_MIN_EXTENSIONS_L4 docs
  describe the new order), test/unit/builder.test.ts (the "takes the
  second source container once two extensions are built" test is flipped
  to "keeps the crew on the third extension before the second source
  container at level 5"; rung numbers and wording updated in the floor
  tests). 192 unit passing (the flipped test plus the whole ladder
  suite), lint 0 errors, build clean. M4 acceptance re-run (this run,
  started 22:38, 6,000 ticks): PASSED - agent-test FINISHED with EXIT 0
  (mocha success; all 17 assertions of the suite met), snapshot:
  {"intruderGoneAfterTicks":2,"intruderLeftRoom":false,
  "maxTowerEnergy":1000,"hostileTicks":2,"defendTicks":6,
  "firstHostile":5401,"firstDefend":5401,"safeModeTicks":0,
  "snapshot":{"level":5,"towersBuilt":1,"towerSites":1,
  "towersWithRampart":1,"extensionsBuilt":3,"extensionSites":27,
  "energyCapacity":450,"creeps":21,"spawnHits":5000,
  "spawnHasRampart":true,"hostilesAtEnd":0,"mode":"peace",
  "farthestFromSpawn":8}}. The failing run's snapshot differed in
  exactly the two extension criteria (extensionsBuilt 2 -> 3,
  energyCapacity 400 -> 450); every other value is at or above the
  previous passing M4 (f3a6863). Scorecard (reports/acceptance-m4.md)
  vs f3a6863: RCL 5/1,650 (was 1,254), construction 3.8/tick (was
  1.46), controller progress 0.63/tick (was 0.45), spawn idle-while-
  full 71 % (was 92 %), creeps at end 21 (was 12), CPU 3.48 avg /
  36.06 max (was 2.43 / 29.38). Full-suite regression run pending.
### 2026-11-13 (run 95: M2 gate fix - level-gating the surplus policy)
- The 20:11 gate failed at M2: roadsBuilt 0 at tick 3000 (M1 passed). Root
  cause: the 2026-11-12 M5 surplus changes (90 % energy valve + raised
  surplus caps, upgrader 2 -> 5 / builder 5 -> 10) applied at every
  controller level. At RCL 1 the 300-energy pool was pulsed by surplus
  upgraders faster than two harvesters refill it, the builder's 50 %
  withdrawal floor (poolReady) was never reached, and the RCL 1 road phase
  produced ~19 road energy instead of ~1,126 - zero finished roads. Fix:
  the M5 policy is now gated by controller level (SURPLUS_VALVE_MIN_LEVEL
  = 5 in src/config.ts). Below RCL 5 the pre-2026-11-12 behavior is
  restored (completely-full-store gate, caps 2/5 via
  SURPLUS_UPGRADER_MAX_LOW / SURPLUS_BUILDER_MAX_LOW); at RCL 5 and above
  the 90 % valve and 5/10 caps are unchanged (checkAndSpawn's valveOpen
  uses the ratio only at level >= 5, spawnSurplus receives the level and
  picks the caps). 192 unit passing (188 + 4 new: RCL 1 low upgrader cap
  routes the surplus to the builder, RCL 1 low builder cap leaves the
  spawn idle, the valve closed at 93.75 % below RCL 5, the valve open at
  RCL 5), lint + build clean. M2 acceptance PASSED on the fix (this run,
  agent-test all): 3000-tick snapshot level 2, extensionsBuilt 2 + 3 sites,
  roadsBuilt 4 + 55 sites (the failed 20:11 gate: roadsBuilt 0),
  energyCapacity 400, creeps 6 - every criterion met. M3 acceptance
  PASSED on the fix (this run, agent-test all): 4000-tick snapshot level
  3, towersBuilt 1 + maxTowerEnergy 500, extensionsBuilt 4 + 6 sites,
  energyCapacity 500, creeps 10, roadShare 0, roadTiles 59 / 0 on wall /
  0 stray, sources 2 of 2 connected, controller connected, farthest 6.
  Full agent-test suite: <result line>.
### 2026-11-13 (run 94: M5 stagnation fix - mini-floor, caps, bodies)
- The M5 probe (probe-m5-creeps, reports/latest.md) showed the colony
  stuck at RCL 5/802 at 5,000 ticks: 82 % creep idle because the 3
  upgraders drained the store faster than the 90 % valve re-opened it
  and there was nothing left to build (source B's container had not
  started). Fix, one cause per file:
  - src/roles/builder.ts: new mini-floor rung in
    selectContainerFirstSite - after exactly
    CONTAINER_MINI_FLOOR_EXTENSIONS (2, src/config.ts) finished
    extensions the builder starts the second source's container, one
    rung earlier than the old 3-extension threshold. Level 5 gate
    unchanged, so M1-M4 (bootstrap order) are untouched.
  - src/config.ts: SURPLUS_UPGRADER_MAX 3 -> 5, SURPLUS_BUILDER_MAX
    5 -> 10, CONTAINER_HAULER_SPARE 1 -> 2, new
    CONTAINER_MINI_FLOOR_EXTENSIONS = 2.
  - src/managers/spawnManager.ts: 4-WORK builder row (200 build per
    tick) and a 3-WORK walking-upgrader row for the 400 capacity.
  - Cost-label audit (node check of every "body, // cost" label) found
    4 mismatches: the two new rows were mislabeled (a 700-energy body
    labeled 550 could never spawn in the M4/M5 window; a 450-energy
    body labeled 400 left the 400-449 capacity band on the old 2-WORK
    row) plus two pre-existing defender rows (520 labeled 620, 390
    labeled 420). Fixed: builder row [W,W,W,W,C,M,M] = 550, upgrader
    row [W,W,W,C,M] = 400 (one MOVE is enough from RCL 4 on - the pool
    rung of getEnergy hands it energy a few tiles from the controller),
    defender labels corrected to 520/390. All labels now match
    BODYPART_COST sums.
  - Tests: test/unit/builder.test.ts (mini-floor rung),
    test/unit/spawnManager.test.ts (caps + two new body-cost tests:
    the surplus builder takes [W,W,W,W,C,M,M] at 550 capacity, the
    surplus upgrader takes [W,W,W,C,M] at 400 capacity),
    test/unit/upgrader.test.ts (new caps). 188 unit passing, lint 0
    errors, build clean.
  - Smoke (500 ticks, twice: before and after the body fix): EXIT 0
    both times, scorecards bit-identical (harvested 4.34/tick,
    upgraded 0.5/tick, construction 0.05/tick, creep idle 16 %, CPU
    1.77/24.78, RCL 1/100, 0 console errors) - the new rows are
    provably a no-op in the 300-capacity smoke world.
  - M4 acceptance (6000 ticks, baseline f3a6863 in
    reports/acceptance-m4.md: harvested 14.02/tick, upgrade 0.45/tick,
    construction 1.46/tick, spawn idle-while-full 92 %, creep idle 45
    %, CPU 2.43/29.38, RCL 5/1254, 12 creeps) in progress; M5
    acceptance (5000 ticks) next.
### 2026-11-12 (run 93: the failed gate - stale unit tests)
- LAST_GATE.md: the unit step failed (178 passing, 6 failing) after this
  morning's config changes (877cba7): SURPLUS_UPGRADER_MAX 2 -> 3 made the
  surplus-builder and all-caps tests obsolete (a 2-upgrader room now spawns a
  surplus upgrader before another builder, so "builder-6" became
  "upgrader-4"), and MIN_CONTAINER_WITHDRAW_ENERGY 100 -> 50 put the
  upgrader trickle test's 50-energy container AT the threshold (the upgrader
  walked to it instead of waiting). Fixed the tests, not the code:
  test/unit/spawnManager.test.ts (surplus-builder test: 3 upgraders ->
  builder-6; new surplus-upgrader test: 2 upgraders + 3 builders ->
  upgrader-4; all-caps test: 3 upgraders, counter 10 -> 0 spawns) and
  test/unit/upgrader.test.ts (trickle test: 50 -> 49 energy, one under the
  new 50 threshold). 184 unit passing, lint 0 errors, build clean. M5
  acceptance next (baseline probe-m5-creeps in reports/latest.md: harvested
  9.36/tick vs 13, upgrade 0.43/tick vs 1, spawn idle-while-full 59 % vs 30 %).
### 2026-11-12 (M5 gate fix: the upgrader pool rung)
- Gate (probe-m5-timeline, 5001 ticks, commit 004fc8e): harvested
  11.68/tick (need 13), upgrade 0.5/tick (need 1), spawn idle-while-full
  76 % (need 30 %), wasted at source regen 8,076, creep idle 40.1 %, CPU
  2.56, RCL 5/600, 0 console errors. Root cause: the upgrader's only fuel
  stop short of self-harvest was the source container rung of getEnergy
  (src/utils/energy.ts), so it fought the builders for that container's
  trickle while the spawn/extensions pool sat full - the spawn idle-while-
  full criterion - and the second source container finished only around
  tick 5,400, keeping the second miner out of the window (harvest
  throughput), while the upgrader's long round trips held upgrade rate at
  0.5.
- Fix: rung 3 of getEnergy, upgrader only, from CONTAINER_BOOST_MIN_LEVEL
  (4) on, ABOVE the source container and sharing the builder rung's
  poolReady gate (upgrader and income crews at minimum, pool above
  BUILDER_WITHDRAW_FRACTION of capacity). New withdrawFromPool(creep, room)
  (spawn first, then extensions) is used by both the upgrader and the
  builder rung. The runUpgrader doc in src/roles/upgrader.ts drops the old
  "an upgrader never withdraws from the spawn or an extension" rule: the
  hold-backs are exactly what made that starvation impossible to begin
  with, and from RCL 4 on the pool is the upgrader's cheapest fuel. Below
  RCL 4 the upgrader keeps the old rung order, so the M1-M3 economy is
  unchanged.
- test/unit/upgrader.test.ts: 3 new tests in a "pool rung" describe - the
  pool beats a full source container at RCL 5 (fails against the old rung
  order: the container wins), the container rung is untouched at RCL 3
  (level gate), the pool is skipped below the 50 % floor even at RCL 5.
  183 unit passing (180 + 3), lint + build clean, dist/main.js rebuilt.
- PENDING: M5 acceptance (started 06:28:58, 5000 ticks) and the M4
  regression on this tree.
### 2026-11-11 (M5 minedShare fix: first source container right after the first tower)
- Owner feedback v9.4 "Then: minedShare": after URGENT 1 (upgradePerTick
  0.05 -> 0.55) and URGENT 2 (builders refuel from the source container
  before the spawn pool), the 21:43 M5 run (URGENT 1+2) still failed
  line 105: the first source container finished ~tick 3,880 of the
  5,000-tick window, minedShare below 0.6 (the harness writes no
  scorecard for failed runs). URGENT 2 changes where the builder
  refuels, not the build order - the container still finished after the
  window's bar.
- Fix (src/roles/builder.ts, selectContainerFirstSite): new Rung 2 - the
  FIRST source container runs right after the first tower (Rung 1) and
  AHEAD of the M4 extension floor; only the first one - the second
  source container, the second tower and the ramparts keep waiting for
  the floor, exactly the owner's scope. Rungs renumbered: floor 3,
  remaining source containers 4, controller container 5, ramparts 6,
  second tower 7, remaining extensions 8, roads 9, leftover 10. Rung 2
  counts built source containers via room.find(FIND_STRUCTURES,
  {filter}) with a StructureContainer type guard - FIND_MY_STRUCTURES
  excludes containers (the same pattern getEnergy in src/utils/energy.ts
  already uses).
- Completion log (the feedback asked for one console line per finished
  container): logNewContainers in src/managers/constructionManager.ts
  compares the built container ids against the reset-proof
  Memory.rooms[name].containersSeen counter (new field in
  src/types/memory.ts) and logs each new container with its id and the
  tick it finished.
- test/unit/builder.test.ts: 3 level-5 ladder tests rewritten for the new
  order, 3 new (first source container ahead of the floor; floor open
  with no extension site still takes the first container; second source
  container held behind the floor; second source container after the
  floor and before the controller container). 180 unit passing (177 + 3),
  lint + build clean, dist/main.js rebuilt.
- PENDING: M4 regression on the URGENT 1+2 tree (started 22:19:57; live
  at tick 4,700: harvested 16.02/tick, upgraded 1/tick, energy 450/450,
  RCL 5, 13 creeps); then M5 acceptance on this Rung 2 build; the two M5
  fixes commit with before/after numbers only if M4 still passes (v9.4
  rule: "If M4 fails, revert it and write the numbers in status.md").
### 2026-11-11 (M2 regression on the M3 death-spiral fix: PASSED)
- acceptance-m2 on the fix tree (ec7a3f6): 1 passing (13m), EXIT 0, 3001
  ticks. Snapshot: level 2, extensionsBuilt 2 + extensionSites 3 (needs
  built + sites >= 5 and built >= 1), roadsBuilt 5 + roadSites 54 (needs
  >= 5 and >= 1), energyCapacity 400 (needs > 300), creeps 6 (needs >= 3)
  - every criterion met. Scorecard (last 1000 ticks, vs the previous M2
  run 1404382): harvested 5.44/tick (3.46), delivered to spawn/extensions
  4.96/tick (2.55), construction 5.59/tick (2.99), controller progress
  0.15/tick (0.44), CPU 1.93 avg / 21.16 max (1.94 / 20.84), ticks to
  RCL 2: 812 (816), road tiles 59 / 0 on wall / 0 disconnected, sources 2
  of 2 + controller reached, creeps at end 6 (peak 9; previous 8, peak 9),
  0 console errors.
- Watch item: controller progress/tick fell vs the previous run (0.15 vs
  0.44; RCL 2/310 at end vs 2/554). The upgrader had multi-hundred-tick
  idle stretches while the crew was thin (a harvester died around t=2400
  and the store did not reach the 400 full-replacement cost before the run
  ended, so the replacement had not started). The M2 criteria do not
  assert controller progress and ticks-to-RCL-2 improved, but upgrade pace
  in thin-crew phases is a watch item for the full suite (M3/M4/M5 all
  depend on it).
- The full agent-test all suite (finish ritual) started after the M2
  pass; its result line is appended here when it finishes.
### 2026-11-11 (M3 death-spiral fix: income hold-back in the builder's pool rung)
- Root-caused the M3 failure to the v9.3 builder pool rung (b36207d), not to
  body sizing: while the income crew is below its minimum, the builder's pool
  withdrawals keep the store below the cost of a full-size income replacement,
  so every creep death delays its replacement and the crew ratchets down
  (b1b9be1: 2 creeps at t=4000 while construction was fine at 4 + 6 sites).
  The income-only sizing clamp of 1404382 removed the 1-WORK ratchet but not
  the drain: M3 still ended with 2 extensions built at t=4000.
- Fix, two parts: (1) sizingBudgetFor (src/managers/spawnManager.ts) restored
  to the de5c985 behavior - every role sized from the room's capacity, only a
  wiped income or hauler crew sized from the stored energy; (2) new
  incomeBelowMinimum(room) (src/managers/spawnManager.ts, mirrors
  upgraderBelowMinimum) and the pool rung of getEnergy (src/utils/energy.ts)
  now requires it - while the income crew is below its minimum the builder
  may not withdraw from the pool (it self-harvests or uses the
  source-container rung, both of which leave the pool alone), so the store
  climbs to capacity and the full-size income replacement starts.
- Tests: +2 sizing regression (harvester below minimum with a partly full
  store waits for the capacity-sized body; with a full store starts it), +3
  incomeBelowMinimum, +1 builder pool hold-back (income short -> no pool
  withdrawal, self-harvests instead); the 2 existing builder pool tests now
  carry an at-minimum income crew (upgrader + two harvesters). 174 unit
  passing, lint + build clean.
- Smoke 1 passing (500 ticks, commit 7c65fe0): harvested 4.44/tick (previous
  smoke run 8553897, 2026-11-10: 3.86), delivered to spawn 3.22/tick (2.90),
  construction 1.91/tick (2.01), RCL 1/59 (50), creeps at end 6 (H2 B2 U2),
  0 console errors.
- acceptance-m3 PASSED on the fix: 1 passing (18m), EXIT 0, 4001 ticks.
  Snapshot: extensionsBuilt 5 (baseline de5c985: 4; failed 1404382 run:
  2), extension sites 5, capacity 550 (500), maxTowerEnergy 500 (500),
  creeps 7 (peak 10; baseline 3, peak 11), roads 59/0/0, sources 2 of 2,
  controller connected, farthest 6, 0 console errors. Scorecard (last
  1000 ticks vs de5c985): harvested 7.78/tick (5.46), delivered
  6.35/tick (4.65), construction 4.52/tick (5.02), controller 0.13
  (0.15), CPU 1.94 avg (1.83), creep idle 30% (19%).
- acceptance-m2 (3000 ticks) regression run started 16:35. The full
  agent-test all suite is deferred to the next run: this run's 4-hour
  budget ends ~17:18 and all takes ~60 min.
### 2026-11-11 (M3 construction regression: clamp restricted to income roles)
- **The run-6 full clamp fixed the death spiral but starved construction.**
  With sizingBudgetFor returning min(capacity, available) for EVERY role,
  the builder below minimum at RCL 1 (store 200-299 of 300 capacity)
  spawned the 200-energy [W,C,M] body - the builder template has no 250
  row - roughly a hundred energy before the capacity-sized 300-energy
  [W,W,C,M] would have. The upgrader did the same (its pre-container table
  is 750/500/350/300/200). The early 1-WORK consumers self-harvest at the
  source when their store is empty (the 20 energy/tick of source
  regeneration is the binding constraint of a container-less room), so the
  five-harvester crew (10 WORK) no longer got a fair share: the acceptance
  scorecard fell to ~2.4 harvested/tick in the last 1000 ticks (the 08:05
  gate run harvested ~8-9/tick late in the window), the store plateaued
  149-269 and never reached the 300 full-store threshold, the surplus wave
  (third builder, upgrader) arrived ~1000 ticks late (U1 at t~1600 vs
  t~600), and construction ran at about half the gate's rate:
  extensionsBuilt 1 at t=4000 vs 4 + 6 sites at the gate. Creeps were 4 at
  t=4000 (H2 B1 U1, peak 6) - the death spiral was indeed fixed.
- **Root cause: the clamp was applied to consumer roles.** Builder and
  upgrader are energy consumers, not producers: the living income crew
  refills the store for them, so a capacity-sized body always comes. Only
  income roles (harvester, miner, hauler) are the crew that refills the
  store, and only they need the "start with the largest body the store can
  pay for" budget (playbook 02b: income clamped, consumers full-size).
- **Fix (src/managers/spawnManager.ts): sizingBudgetFor now clamps only
  income roles** - min(energyCapacityAvailable, energyAvailable) for
  harvester/miner/hauler, energyCapacityAvailable for builder/upgrader/
  defender. The role parameter is used again (no more underscore prefix).
  This restores the 08:05 gate's construction behavior exactly (consumer
  sizing is bit-identical to b1b9be1) while keeping the death-spiral fix
  for income. File header, sizingBudgetFor and trySpawnRole docstrings
  updated with both regressions and the numbers.
- **New unit test (test/unit/spawnManager.test.ts):** "builder below
  minimum with a partly full store waits for the capacity-sized body" -
  store 200 of 300, builder below minimum, income met: nothing spawns
  (the 300-energy body does not fit, and the consumer role does not
  shrink). Pins the M3 second regression against a future full clamp.
- **Tests:** 168 unit passing (167 + 1 new), lint + build clean.
  acceptance-m3 RUNNING (started 11:50); result line copied in when it
  finishes, then the acceptance-m2 regression run.

### 2026-11-11 (M3 death-spiral fix: replacements sized from min(capacity, available))
- **The 08:05 gate on b1b9be1 failed M3 on "the colony still has creeps"
  (creeps 2 at t=4000, needs >= 3); M1 and M2 passed.** M3 snapshot: level
  3, towersBuilt 1, maxTowerEnergy 500, extensionsBuilt 4 + 6 sites,
  energyCapacity 500, roadShare 0%, road tiles 59 (0 on wall, 0 stray),
  sources 2/2, controller connected, farthest 6 - every criterion except
  the creep count passed. The colony was on the death spiral all day: the
  07:48 de5c985 run already ended 3 of a peak 11, and the v9.3 changes in
  b36207d (getEnergy) and b1b9be1 (upgrader-pause rungs) pushed it to 2.
- **Root cause: the spawn budget waited for a full store.**
  sizingBudgetFor (src/managers/spawnManager.ts) returned
  energyCapacityAvailable for every role except the narrow income-dead /
  hauler-dead cases, and checkAndSpawn refused to start a replacement
  while energyAvailable was below that budget. During the RCL 3 bootstrap
  the harvester income balances the upgraders, builders and open
  construction sites, so the store oscillated 169-372 of the 500 capacity
  and never reached it: no replacement could ever start, each death shrank
  the crew that refills the store, income fell, the store ran shorter.
- **Fix (this commit): sizingBudgetFor returns
  min(energyCapacityAvailable, energyAvailable).** A needed replacement
  starts immediately with the largest body the store can pay for this
  tick, so the crew holds at its minimums and the store refills. When the
  store is full the budget equals the capacity, and surplus spawns - the
  only ones that require a full store - keep the full-size body, so the
  clamp is a no-op there. The old income-dead / hauler-dead exceptions
  (owner feedback 2026-11-02) are subsumed: with an empty store the two
  values are equal, and both were the same "the crew cannot refill the
  store without this creep" case. Docstring updated with the rationale;
  the role parameter is kept (underscore-prefixed) for signature
  stability.
- **Unit test correction (test/unit/spawnManager.test.ts).** "does not
  spawn a surplus creep while the store is not full" left source-2
  uncovered, so the RCL 1 minimum (one harvester per source) owed a
  replacement harvester and the test exercised the replacement path, not
  the surplus path; it now covers both sources so the surplus step is
  isolated. 167 unit passing, lint + build clean.
- **Tests:** acceptance-m3 RUNNING (started 11:04, 4000 ticks); result
  line copied in when it finishes, then the M2 regression run.

### 2026-11-11 (FEEDBACK v9.3: shared getEnergy + upgrader pause)
- **Fix 1 (commit b36207d): shared getEnergy.** New src/utils/energy.ts
  with getEnergy(creep, role): (1) drop within BUILDER_DROP_PICKUP_RANGE,
  (2) upgrader only: controller container, (3) fullest source container
  >= MIN_CONTAINER_WITHDRAW_ENERGY (new config constant, 100), (4) builder
  only: spawn/extensions above BUILDER_WITHDRAW_FRACTION of capacity, held
  back while upgraderBelowMinimum, (5) "harvest" only when no container
  has energy, else "wait" (idle this tick). runBuilder and runUpgrader
  call it for their empty-store step; the pre-existing self-harvest paths
  remain as the final fallback. Owner test specs covered in
  test/unit/builder.test.ts (withdraw from a 1000-energy source container;
  idle on a 50-energy one - no harvest, no move) and
  test/unit/upgrader.test.ts (same two for the upgrader). 167 unit
  passing with Fix 1 alone, lint + build clean.
- **Fix 2 (pending commit): hasPriorityBuildSites loses rungs 3-4.**
  Container sites (source or controller) no longer pause the upgrader;
  only the first tower site and the first extension site do. This is the
  M5 regression the owner diagnosed (cause 2): while any container site
  existed, the upgrader ran the builder role all run (upgradePerTick 0 on
  the 2026-11-09 M5 run). The builder's own ladder (selectBuildSite) still
  builds containers first - only the upgrader's pause changed. test/unit/
  builder.test.ts: the two "pauses for a container site" tests replaced by
  one "does not pause the upgrader for container sites at level 5" (tower
  + extension built, source + controller container sites -> false).
  166 unit passing with both fixes, lint + build clean.
- **Verification pending:** acceptance-m4 (gate blocker; de5c985 ended
  extensionsBuilt 1 of 3, energyCapacity 350 of 450) running on the tree
  with both fixes; acceptance-m5 (owner's M5 regression: tower 15,429 of
  20,000, extension 0 of 27,000) next. Numbers to be copied into this
  entry when the runs finish.

### 2026-11-11 (M3 gate fix: tower-first harvester delivery)
- **M3 maxTowerEnergy 0 -> 500, acceptance passing.** The 2026-11-10 21:59
  gate failed M3 on "the tower was filled with at least 500 energy at some
  point" (0 of 500); every other M3 criterion passed (towersBuilt 1,
  extensionsBuilt 4, energyCapacity 500, roadTiles 59, sourcesConnected 2 of
  2, creeps 3). Root cause: the harvester delivery cascade was spawn ->
  extensions -> tower, so the tower only saw energy that overflowed a FULL
  pool - but since 5be99ae the builders withdraw from the 50%-capacity floor
  (BUILDER_WITHDRAW_FRACTION in src/config.ts), the pool oscillates around
  half capacity and never overflows, so the tower sat at 0 for all 4000
  ticks. The 500 (TOWER_ENERGY_RESERVE) is a fixed defensive buffer, not an
  overflow sink, so it belongs FIRST in the cascade: the delivery phase in
  src/roles/harvester.ts now tries the tower first (only while below the
  reserve - a bounded fill that stops on its own, so the economy is not
  starved), then the spawns, then the extensions, then drop. acceptance-m3
  on the fix: 1 passing (18m), EXIT 0, maxTowerEnergy 500, towersBuilt 1,
  extensionsBuilt 4, energyCapacity 500, roadTiles 59, sourcesConnected 2 of
  2, controllerConnected true, strayRoads 0, roadShare 0, farthestFromSpawn
  6, creeps 3 (peak 11). Scorecard vs the last full M3 pass (754f7d4):
  harvested/tick 9.03 -> 5.46 (crew decay from the builder floor,
  pre-existing - the gate run ended with 3 creeps too), build/tick 2.15 ->
  5.02, spawn idle-while-full 25 % -> 0 %, CPU/tick 2.23 -> 1.88, RCL
  progress 388 -> 400. 163 unit passing, lint + build clean. Removed the
  probe-m3-tmp.test.ts diagnostic (investigation complete). NEXT: full
  suite (agent-test all) for M1/M2/M4/M5 regressions - M4 also asserts
  maxTowerEnergy >= 500, which the new first-priority fill satisfies.
### 2026-11-10 (run 4: M5 gate unit-test failure fixed - wrong test expectations)
- LAST_GATE 2026-11-10 (failed at 55bb96d): lint ok, unit step exit 1 -
  "test/unit/constructionManager.test.ts: still places the two source
  container sites alongside the C_ctrl" expected container sites at 10,10
  and 40,40 - the source tiles themselves. The engine refuses structures
  on a source tile (createConstructionSite -> ERR_INVALID_TARGET,
  @types/screeps), and placeContainerSites deliberately picks the
  source's neighbour closest to the spawn (11,11 for A, 39,39 for B),
  one source container per tick (the "return; // Only place one container
  at a time" guard). The test (added in 55bb96d) encoded unverified
  coordinates and a one-tick assumption - the manager was right, the test
  was wrong. Fixed to expect 11,11 / 39,39 after two manageConstruction
  calls and removed the leftover DEBUG console.log. 163 unit passing,
  lint + build clean. Note: the gate runs ALL tests before pushing, so
  acceptance-m5 (last EXIT 1 on the idea-a tree, minedShare 0.5853 < 0.6)
  must also pass for the push - the v9.2 iteration below is the way there.
### 2026-11-10 (M5 run 3: M4 regression on idea a - full revert of the container priority)
- M4 regression CONFIRMED on the scoped idea-a tree (7dc4775 plus the
  uncommitted builder fix): acceptance-m4 (6000 ticks, EXIT 1) ended at
  extensionsBuilt 1 of 3, energyCapacity 350 of 450, 29 extension sites
  still open. Mechanism: at L5 the container-first branch led the crew
  to the first 5,000-energy container before the extensions, and the
  scoped "first container built" condition still let the container queue
  re-arm after C1 while the floor was unmet - the 3 x 3,000-energy
  extension floor never finished in the window. Every other M4 criterion
  passed (level 5, 2 towers with ramparts, maxTowerEnergy 1000,
  spawnHits 5000, spawnHasRampart, firstHostile 5401 / firstDefend 5401,
  intruder gone in 1 tick, hostilesAtEnd 0, mode peace).
- Revert to the 88fb080 priority logic (UNCOMMITTED, this run):
  src/roles/builder.ts containerFirstForRoom back to the three cases
  (built container / RCL <= 2 after the M2 extension + road minimum /
  RCL 4+ after the M4 3-extension floor), the CONTAINER_EARLY_MIN_LEVEL
  import and L5 branch removed, hasPriorityBuildSites back to "tower
  sites only" (the upgrader-to-builder swap for the first container site
  goes with it). src/config.ts: CONTAINER_EARLY_MIN_LEVEL deleted.
  PRESERVED: the builder getUsedCapacity withdrawal fix (run-2 verified
  active in-game) and the L4+ crew scaling. test/unit/builder.test.ts:
  the three idea-a tests removed; regression guard "keeps the extension
  ahead of the first container at level 5 below the M4 extension floor"
  and "does not pause the upgrader for a container site at level 5"
  added. 139 unit passing, lint + build clean. git diff 88fb080..working
  tree now touches only the withdrawal fix, the crew-scaling constants
  and the builder tests.
- M4 acceptance re-verification on the reverted tree: RUNNING (started
  this session, previous run took ~44 min). Next run: re-plan the M5
  early container behind the M4 3-extension floor (first container
  leads only once 3 extensions are finished) or otherwise budget it so
  the floor still finishes by tick 6000 - a blanket L5 override cannot
  coexist with the M4 contract.
### 2026-11-10 (M5 run 2: builder inverted capacity check - root cause, fix, verification)
- Refined idea a (container boost) into the SCOPED version (7dc4775, morning
  session): at L5+ the first container leads the builder queue only while
  zero containers are built (containerFirstForRoom, case 4); from the second
  container on the M4 3-extension floor
  (CONTAINER_BOOST_MIN_EXTENSIONS_L4) re-gates the queue. Crew scaling in
  src/managers/spawnManager.ts: uncovered sources keep 2 harvesters at L4+
  (UNCOVERED_SOURCE_HARVESTERS_L4) because the miner body is 1 WORK at
  capacity 300, a spare hauler rides along at L4+ (CONTAINER_HAULER_SPARE),
  SURPLUS_BUILDER_MAX 3 -> 5. Pre-fix M5 baseline (5000 ticks, 22m, EXIT 1):
  5 of 10 criteria fail - minedShare 0.585 (< 0.6), harvested 10.13 (< 13),
  upgraded 0 (< 1), spawn-idle-full 0.942 (> 0.3), avgDropped 617 (> 300);
  pool pinned 300/300, build 2.64/tick, 1 container, 0 extensions.
- Root cause of the pinned pool: src/roles/builder.ts checked
  spawn/extension store.getFreeCapacity(energy) > 0 before withdrawing -
  the INVERTED check: a full spawn has zero free capacity, so the builders
  skipped exactly the structures that hold energy and fell through to
  self-harvesting from the far source (24+ tick walk), returning full to a
  spawn they could not transfer into. Fix (UNCOMMITTED, this run): both
  withdrawal loops now check getUsedCapacity; regression unit test
  "withdraws from a FULL spawn above the floor instead of self-harvesting"
  in test/unit/builder.test.ts. 142 unit passing, lint + build clean.
- Post-fix M5 verification (this session, 5000 ticks, 22m, EXIT 1, "0
  passing, 1 failing"): the fix is provably active - the pool now
  sawtooths (samples 169/300 at 2000, 108/300 at 3300-3400, 58/300 at 3800;
  pre-fix the pool could only dip when the spawn itself spent) - but every
  last-window (4000-5000) metric is IDENTICAL to the pre-fix baseline:
  harvested 10.13, upgraded 0, build 2.64, spawn-idle-full 0.942,
  minedShare 0.585 (first failing assertion), avgDropped 617,
  maxContainerEnergy 1354, 1 container built (~3900), 0 extensions, RCL
  5(0), 13 creeps (harvester 3, builder 5, upgrader 2, miner 1, hauler 2).
- Interpretation: the builder fix is correct but is not the M5 lever. The
  L5 build queue (30 extensions + second tower + ramparts + ~59 road sites
  ~ 45,000 energy) cannot be cleared in 5000 ticks at the walk-limited
  builder drain; last-window build mix was road 401 / rampart 203 /
  extension 96 / tower 50 (per 1000-tick window). Delivery (~8-9/tick)
  outpaces the drain, so the pool sits at its 300 cap in 94 % of the last
  window, exactly as pre-fix. Next levers, in order: extension-priority
  build queue (extensions are near the spawn and unlock the 3-extension
  floor -> second container, the 5-WORK miner body [needs capacity 600 = 6
  extensions] and the harvest >= 13 criterion), then upgrader container
  fuel (change 2/3) for upgraded >= 1, then hauler ground-pickup for
  avgDropped <= 300.
- M4 regression: started 05:08 (6000 ticks); commit after the result.
- Implemented the M5 construction priorities on the step 4 tree (3642fd2),
  i.e. the reverted step 6 change re-applied with the M4 safety gate:
  - src/config.ts: CONTAINER_BOOST_MIN_LEVEL (4) and
    CONTAINER_BOOST_MIN_EXTENSIONS_L4 (3 - exactly the M4 floor of "at least
    3 extensions finished", so the boost cannot starve the third extension;
    the unconditioned boost failed M4 on 2026-11-08 with extensionsBuilt 1,
    capacity 350).
  - src/roles/builder.ts containerFirstForRoom: at level 4+ the container
    leads the builder crew once 3+ extensions are BUILT; level 3 keeps the
    M3 contract (returns false, roads first).
  - src/managers/constructionManager.ts: at level 4+ placeContainerSites
    takes a road-network tile directly (removing an unbuilt road site - in
    the static-mining rooms shouldPlaceRoadSites gates the road network off
    while the extension queue stands, so the built road the below-L4 wait
    expects may never come); placeRoadSites skips its legacy container-swap
    on that tile at level 4+. Below level 4 the M3 road-first contract is
    unchanged.
  - Tests: test/unit/builder.test.ts (boost arms at 3 built extensions, off
    at 2) and test/unit/constructionManager.test.ts (L5 container-takes-tile
    plus road-site-removal cases). 127 -> 131 unit tests, all passing; lint
    and build clean.
- M4 acceptance regression run on the M5 tree: PASSED - 1 passing (28m),
  EXIT 0. All M4 criteria green: extensionsBuilt 3 (needs 3),
  energyCapacity 450 (needs 450), extension sites 27 (3 + 27 >= 15), towers
  2/2 with ramparts, maxTowerEnergy 592 (needs 500), intruder gone in 1
  tick, spawn ramparted, farthestFromSpawn 8 (max 8), 0 console errors.
  Scorecard before (d3ed9e6) -> after: harvested 13.05 -> 12.1/tick, wasted
  7,482 -> 7,710, construction 5.21 -> 5.42/tick, delivered 1.71 -> 2.26/
  tick, creep idle 34 % -> 31 %, spawn idle 70 % -> 59 %, CPU 2.31/28.41
  -> 2.46/28.65, RCL 5/550 identical, roads 59 -> 58 (the L4+ pocket tile
  is now the container; M4 has no road-reach criterion, M3 asserts it and
  runs at level 3 below the gate).
- Smoke test (500 ticks, RCL 1) before the acceptance run: passed, no
  regression (bootstrap path untouched - the gate is a no-op at RCL 1).
### 2026-11-09 (M4 replay: step 5 broke M4 and was reverted, step 6 re-applied)
- Step 4 M4 acceptance PASSED (6001 ticks, EXIT 0, code 7232135):
  harvested 9.84 -> 13.05/tick, construction 4.14 -> 5.21/tick,
  wasted-at-regen 8,332 -> 7,482, delivered-to-spawn 1.54 -> 1.71/tick,
  creep idle 39 % -> 34 %, capacity 500, RCL 5/500 -> 5/550, CPU
  2.17/30.47 -> 2.34/28.6, roads 58, 0 console errors. Snapshot: 4
  extensions + 26 sites, 2 towers with ramparts, 11 creeps at end
  (builder 3, defender 1, harvester 5, upgrader 2), 86 sites total. The
  builder deadlock fix (skip extension sites whose tile holds a waiting
  creep, keep the load and retry the next best site on ERR_INVALID_TARGET)
  is what moved every economy line at once - the step 3b run stalled at
  4.14 build/tick with 26 sites still open, the step 4 run keeps building
  through the whole window. Step complete.
- Step 5 (parking, b00c0e1): code applied in this run as a manual
  hunk-by-hunk cherry-pick. The four blob-identical files
  (src/roles/harvester.ts, src/roles/miner.ts, src/types/memory.ts,
  test/unit/harvester.test.ts) came over with git checkout b00c0e1 --
  <file>; the manual hunks went on src/config.ts (PARKING_RING_START /
  PARKING_RING_END appended at EOF), src/roles/hauler.ts (the
  getParkingPosition import; parkNearSpawn now parks on the cached
  parking tile and keeps the spawn-ring fallback only when there is no
  cache), src/managers/constructionManager.ts (parkingExcludedTiles,
  isParkingTileFree, getParkingPosition, ensureParkingPosition inserted
  before manageConstruction; the ensureParkingPosition call at the end
  of manageConstruction; the two new config import names) and
  test/unit/constructionManager.test.ts (the per-test Memory hook and
  the parking describe, 4 tests). Every residual diff against b00c0e1
  was checked: only the excluded M5-era changes remain (EXTENSION_PRIORITY_MIN,
  CONTAINER_FIRST_MIN_LEVEL, the road-first container strategy, the
  pathfinding callbacks, the four-builder row). The parking tile is
  cached in Memory.rooms.parkingPos (survives global resets) and the
  roles fall back to the old spawn-ring parking when there is no cache
  or no Memory (unit-test environment). The harvester's "nothing could
  take the load" branch now parks with the load instead of dropping it.
  Lint and build clean, 130 unit passing (126 + 4). M4 acceptance
  FAILED 2026-11-09 (6001 ticks, EXIT 1): extensionsBuilt 1 (needs 3),
  energyCapacity 350 (needs 450); every other criterion passed (level
  5, towersBuilt 2, maxTowerEnergy 546, towersWithRampart 2,
  spawnHasRampart, firstHostile 5401 / firstDefend 5401, intruder gone
  in 1 tick, intruderLeftRoom false, safeModeTicks 0, spawnHits 5000,
  11 creeps, farthestFromSpawn 8, mode peace). The harness writes no
  scorecard for a failed run; the live 100-tick samples show the cost:
  harvest oscillated 0-9.9/tick (the step 4 run held 11-12 steady), and
  the store cycled full -> drained while the builders consumed ~2.5-3.5
  build/tick (step 4: 4.1-5.2). Measured mechanism: with the store full
  the harvester now parks with the undeliverable load on the cached tile
  (ring 5-10, off the builder's route) instead of dropping the energy
  near the spawn, where the builder's runBuilder ground-pickup collects
  it on the way to the sites; the energy sits in the harvester carry and
  the builders self-harvest or wait. Per the owner's protocol (feedback
  v9.1: "If M4 fails: revert the step ... Do NOT try to repair a failing
  step. The owner decides.") the step was reverted: git revert 06733fc
  (commit 0ce4712, clean apply), tree back to the step 4 state, 126 unit
  passing.
- Step 6 (container boost, cad8c5b): the first application (on top of
  the step 5 tree, bf9b796) was reverted too (b4fa6fd) so the step is
  judged on the step 4 tree without the parking change, then re-applied.
  This time the reference diff from cad8c5b applied cleanly with
  git apply, no manual hunks: src/config.ts (+CONTAINER_FIRST_MIN_LEVEL
  = 4), src/roles/builder.ts (at controller level 4+ the container sites
  lead the queue right after the tower class, ahead of the ramparts and
  the extension queue; the level 1-3 containerFirstForRoom gate and the
  M2/M3 order below level 4 are unchanged), test/unit/builder.test.ts
  (+2 tests: at level 5 the container beats a closer, more advanced
  extension and beats a rampart site). Verified: the three files are
  byte-identical to the earlier bf9b796 application (the only tree
  difference after the revert is the parking constants git revert
  removed). Lint and build clean, 128 unit passing (126 + 2). M4
  acceptance pending (the last run of the replay).
- GATE FIX - M3 road reach (the 2026-11-09 full-suite gate on e996131 passed
  M1 and M2, failed M3 on "a connected road leads from the spawn to every
  source": sourcesConnected 1 of 2; snapshot roadTiles 58, strayRoads 0,
  roadsOnWalls 0, roadShare 0, maxTowerEnergy 500, capacity 450, level 3,
  towersBuilt 1, extensionsBuilt 3 + 7 sites, farthestFromSpawn 6, 10 creeps
  - every other M3 criterion passing). Root cause: replay step 2 (a87ecf7,
  the owner-specified fff12dc "container wins the tile") puts the container
  site on the contested pocket tile (40,13), Source B's only walkable
  neighbour; the M3 harness flood fill (acceptance-m3.test.ts SNAPSHOT)
  counts built roads and road sites only, so a container site on the
  endpoint tile disconnects Source B. The step 2 note called the scorecard's
  reach 2/2 -> 1/2 "a harness flood-fill artifact, M4 asserts no road
  reach" - true for M4, but M3 line 133 asserts it, so it was a latent M3
  break. Fix: invert the contested-tile ownership in
  src/managers/constructionManager.ts (placeContainerSites now takes the
  road-network tiles and withholds the site on a road tile until a built
  road is on it; placeRoadSites removes a legacy container site on a road
  tile and creates the road site; once the road is built the container site
  goes on the same tile - structures share a tile, construction sites do
  not). The M5 property step 2 preserved still holds: the container ends up
  on the pocket tile, after the road. test/unit/constructionManager.test.ts:
  the two "container wins the tile" tests (added by a87ecf7, asserting the
  now-removed behavior) are replaced by three pocket-tile tests (road site
  preserved and container withheld while the road is unbuilt; container
  placed once the road is built; legacy container site removed and replaced
  by the road site). The unit tests are agent-owned and asserted a behavior
  the protected M3 acceptance test forbids, so they change with the code.
  Lint and build clean, 129 unit passing (128 + 3 - 2). M3 re-run
  PASSED 2026-11-09 (1 passing, 18m, 4,001 ticks, EXIT 0): snapshot
  sourcesConnected 2 of 2, controllerConnected true, roadTiles 59,
  roadsOnWalls 0, strayRoads 0, towersBuilt 1 (maxTowerEnergy 500),
  extensionsBuilt 3 + 7 sites, capacity 450, level 3, 10 creeps, 0
  console errors. End state: 59 road sites (the pocket tile (40,13)
  among them - the builder was still extension-first in the M3 window)
  and 1 container site (the open-neighborhood source's; the pocket
  container follows once its road is built). Full suite (agent-test
  start all) running to cover the step 6 M4 run; M1 and M2 were green
  on this exact tree earlier today (gate run e996131).
- STEP 6 M4 ACCEPTANCE FAILED - full suite (agent-test start all, started
  05:32, on 7542b1f = step 4 tree + step 6 + the M3 road fix): M1 PASSED
  (800 ticks), M2 PASSED (3,000 ticks), M3 PASSED (4,001 ticks,
  sourcesConnected 2 of 2, roadTiles 59 - the M3 fix holds in the suite),
  M4 FAILED (6,000 ticks, EXIT 1): "at least 3 extensions are finished",
  actual 1. M4 snapshot: level 5, towersBuilt 2, towerSites 0,
  towersWithRampart 2, extensionsBuilt 1, extensionSites 29, energyCapacity
  350 (needs 3 / 450), maxTowerEnergy 1000, spawnHits 5000, spawnHasRampart
  true, firstHostile 5401 / firstDefend 5401, intruder gone in 1 tick,
  intruderLeftRoom false, safeModeTicks 0, hostilesAtEnd 0, mode peace, 9
  creeps, farthestFromSpawn 8 - every criterion except the extension count
  passes. Measured mechanism: the step 6 container-first order at level 4+
  queues both source containers (10,000 build energy, plus the 50-energy
  pocket road from the M3 fix) behind tower 1 and ahead of the extension
  queue, so the first extension finishes at about tick 5,550 instead of the
  step 4 run's ~3,350 (c924877: 4 extensions, capacity 500); the extra
  10,050 build energy is a ~2,200-tick delay at the measured ~4.5 build/tick,
  and only 1 of the 29 extension sites finishes inside the 6,000-tick window.
  This is the break the owner predicted for this step (feedback v9.1: "the
  most likely cause of the M4 break, which is why it comes last"). Per the
  protocol ("If M4 fails after it, revert it, write the numbers in status.md
  and stop there") the step was reverted: src/config.ts, src/roles/builder.ts
  and test/unit/builder.test.ts restored to their pre-step-6 state (92f465f),
  lint/build clean, 127 unit passing (129 - the 2 step 6 tests). The tree is
  now the step 4 tree + the M3 road fix; the step 6 change is preserved on
  backup/m4-attempts-2026-11-08 as cad8c5b - the owner decides about it. The
  replay ends at step 6; full-suite re-verification on the reverted tree is
  running (final gate before the push).
### 2026-11-08 (M4 replay started: owner reset to 040eef6, feedback v9.1 acknowledged)
- Owner reset main to 040eef6 (the last commit where M4 passes) and moved all M4
  attempts to backup/m4-attempts-2026-11-08 (feedback v9.1). Objective of this and
  the following runs: the replay - take back six named changes in order, M4 after
  every step. No other changes this run (no crew rows, floors, lanes, staggered
  replacement, recovery sizing, builder yield, pathfinding or probes).
- Step 0 (baseline): acceptance-m4 on the current tree (040eef6 + the two owner
  chore commits, which change no src/ files) - PASSED 2026-11-09 04:54 (6001
  ticks, EXIT 0): harvested 9.84/tick (last 1000), construction 4.14/tick,
  4 extensions + 26 sites, capacity 500, RCL 5/500, CPU 2.22 avg / 29.53 max,
  0 console errors; scorecard identical to the 2026-11-04 reference (every
  "Change" column 0). Full detail under "In Progress", step 1.
- Step 1 (blog, done 2026-11-09): took back the three rewritten posts and
  test/unit/blog.test.ts from the backup branch with git checkout; commit
  2968c46. No M4 run needed (no src/ change); lint and build clean, 109
  unit passing (100 + 9 guard tests).
- Step 2 (container wins the tile): cherry-picked fff12dc as a87ecf7 -
  clean apply on src/managers/constructionManager.ts and
  test/unit/constructionManager.test.ts only (the stale reports/ conflicts
  from the old commit were dropped). Lint and build clean, 111 unit
  passing (109 + 2 pocket-source tests). M4 acceptance PASSED 2026-11-09
  05:24 (1 passing, 6001 ticks, EXIT 0): harvested 9.84/tick, construction
  4.14/tick, capacity 500, RCL 5/500, CPU 2.17 avg / 28.45 max (baseline
  2.22 / 29.53), 0 console errors. Scorecard vs the baseline: roads 59 ->
  58 and reach 2 of 2 -> 1 of 2 - the new container site takes the tile a
  road would have, and the harness flood-fill does not count a container
  as reachable; M4 asserts no road reach, so non-blocking. All other lines
  identical.
- Step 3a (hauler state machine, done 2026-11-09): clean cherry-pick of
  a55af67 as 8364c5e - src/roles/hauler.ts collect/deliver state machine
  (memory.delivering latch), src/types/memory.ts +delivering, new
  test/unit/hauler.test.ts (4 tests); lint and build clean, 115 unit
  passing. M4 acceptance PASSED 2026-11-09 05:58 (1 passing, 6001 ticks,
  EXIT 0): harvested 9.84/tick, construction 4.14/tick, wasted-at-regen
  8,332, capacity 500, RCL 5/500 - all identical to the step-2 baseline;
  CPU 2.17/28.45 -> 2.2/28.79; roads 58, 0 console errors. Behavior-neutral
  at this stage (the hauler row and delivery-group changes are step 3b).
- Step 3b (hauler faults 2-4, done 2026-11-09): 2f6ed80 applied onto the
  post-3a tree as 9e33c99. git cherry-pick takes no pathspec, so the four
  blob-identical files (src/roles/hauler.ts, src/managers/spawnManager.ts,
  test/unit/hauler.test.ts, test/unit/spawnManager.test.ts) were checked out
  with git checkout 2f6ed80 -- <file> and src/config.ts got the
  TOWER_REFILL_PRIORITY_ENERGY block appended by hand (same content, same
  position: after TOWER_ENERGY_RESERVE at EOF, keeping the later b00c0e1
  config hunk clean); every resulting blob verified against the target
  except config.ts, which differs only by the cad8c5b block that step 6
  will still take back. Changes: hauler delivery reworked to ONE ordered
  group list with the free-capacity filter BEFORE the distance pick
  (fault 2) and the threat-dependent group order (fault 3, Memory.mode);
  TOWER_REFILL_PRIORITY_ENERGY in config; the hauler row becomes
  Math.max(row.hauler, minerCount) with the 1500-energy 20-CARRY body
  (fault 4). Lint and build clean, 121 unit passing (115 + 6). M4
  acceptance PASSED 2026-11-09 06:27 (6001 ticks, EXIT 0, 1584 s):
  harvested 9.84/tick, construction 4.14/tick, wasted-at-regen 8,332,
  capacity 500, RCL 5/500, CPU 2.2/28.79 -> 2.17/30.47 - every scorecard
  line identical to the step-3a run (all "Change" columns 0). Snapshot: 4
  extensions + 26 sites, 2 towers with ramparts, mode peace, intruder
  gone in 1 tick, 10 creeps (peak 11), 0 console errors. The hauler
  changes stay dormant during M4: no source container is ever built in
  the window, so minerCount is 0 and the hauler row stays 0 - baseline
  parity, as expected for a replay step.
- Steps 4-6: see "In Progress".

### 2026-11-03 (M4 regression fixed: 300-energy pre-container upgrader body restored)
- **Root cause of the M4 failures on e073eed (extensionsBuilt 1, expected 3).**
  e073eed's M5 prereq removed the 300-energy [W,W,C,M] row from the upgrader's
  pre-container body table (it became 750/500/350/200), so at the RCL 1-4
  capacity of 300 the upgrader body was the 200-energy [W,C,M]. The upgrader
  could now spawn after only one or two harvesters had saved up (~T90 in the
  M4 world), and its building work - limited by the builder role's 50%
  withdrawal floor - pinned the store at ~149-198, below the 300 the second
  harvester costs. The income crew never grew: the store stayed in the
  149-225 band for ~3,700 ticks and only one extension was finished by tick
  6,000 (reproduction run 11:32: extensionsBuilt 1, capacity 350, creeps
  "harvester 1-2, upgrader 1" from T100 to T3700).
- **Fix (src/managers/spawnManager.ts).** Restored `[WORK, WORK, CARRY,
  MOVE]` // 300 to the pre-container upgrader table (between the 350 and 200
  rows) with a comment explaining that the row must cost the whole RCL 1
  capacity: the first upgrader may only spawn once the income crew is up,
  which the builder hold-back (src/roles/builder.ts) makes possible by
  leaving the store alone until it reaches 300. Once the first extension
  raises the capacity to 350 the balanced 350 body [W,W,C,M,M] takes over,
  and the M5 WORK-heavy table (controller container) is untouched.
- **Comment fix (src/roles/builder.ts).** The hold-back header said the
  upgrader body "costs 200 of the 300 capacity"; after the fix it costs the
  whole RCL 1 capacity (300). The hold-back is still required (300 > the
  150 floor), so the mechanism is unchanged.
- **Unit tests (test/unit/spawnManager.test.ts).** Two tests asserted the
  200-energy [W,C,M] body at 300 capacity (introduced with the regression in
  e073eed); both now assert [W,W,C,M] (300) with the rationale in comments.
  The WORK-heavy table test (controller container, 7-WORK body at 800) is
  unchanged. 100 passing (28ms).
- **Verification.** smoke (500 ticks): EXIT 0, timeline and scorecard
  byte-identical to the 6b3393d passing baseline (harvest 3.86/tick,
  progress 50, upgrader alive by T300, creeps at end builder 2 / harvester 2
  / upgrader 2). acceptance-m4 re-run in progress (started 13:15); the result
  line is copied in when it finishes.

### 2026-11-03 (cold-boot recovery test: probe race root-caused and fixed)
- **The cold-boot integration test failed with "the wipe killed the whole crew
  (8 creeps actually remained)." Root cause: a race in the test's own probe
  helper, not the game logic.** `suicide()` runs in the tick's user phase and
  only writes the suicide intent; the room processor applies the intent (removes
  the creep) later in the same tick's room phase. The old `probeUntilResult`
  resolved as soon as the console result ("wiped N creeps") arrived, which fires
  during the user phase, before the processor removed the creeps. The next probe
  (the post-wipe count) then started a fresh `server.tick()` while the wipe tick
  was still in flight, and its `Game.creeps` read saw the pre-processor state:
  all 8 creeps still alive.
- **Proof the wipe works.** A scratch run with strictly serialized ticks: after
  the wipe tick completes, `rooms.intents` is empty (processor handled it) and
  `rooms.objects` holds 0 creep documents; the next tick's probe reads 1 creep
  (the fresh cold-boot spawn). Engine and processor are correct; the test read
  stale state.
- **Fix (test only).** `probeUntilResult` in
  test/integration/cold-boot-recovery.test.ts now records the console result but
  resolves only after the tick that produced it has fully completed (user + room
  phases), so every probe sees the post-processor state and the count probe can
  never overlap the wipe tick.
- **Also in this working tree (from the interrupted run, committed with it):**
  M5 body-template prereqs — the upgrader body now switches on
  `hasControllerContainer` (WORK-heavy once a container feeds the controller,
  MOVE-balanced before that: src/managers/spawnManager.ts, src/config.ts
  CONTROLLER_CONTAINER_RANGE) and the defender/attacker body is now pure
  ATTACK+MOVE pairs (the old CARRY part was dead weight). Lint clean, build OK,
  100 unit passing, tsc clean. Because the upgrader body changes the RCL pace of
  the M1-M4 acceptance worlds (no controller container there), the full suite is
  re-run before this is committed.
- **Tests:** <pending - agent-test: cold-boot first, then the full suite; result
  lines are copied in at the end of the run>

### 2026-11-03 (feedback v8.6: URGENT tower placement fix + controller sign)
- **URGENT 2 — the second tower was never placed in the owner's cramped room
  (feedback 2026-11-02).** The range 2-5 search found nothing because
  computeTowerPositions (src/managers/constructionManager.ts) still reused the
  extension checkerboard parity filter: rings 3 and 5 sit on the opposite parity
  from the spawn, so in a cramped room every even-parity ring tile was taken by
  roads or extension sites and the odd rings were skipped entirely. Fix (1076de5):
  the parity filter is gone (towers don't need walkable neighbours), the primary
  search walks rings 2-5 by proximity (TOWER_SITE_RANGES); if the engine refuses
  every candidate or the static search finds nothing, placeTowerSites does a deep
  re-scan of the rings 2-8 union (TOWER_SITE_DEEP_RANGES, capped at
  TOWER_SITE_DEEP_CANDIDATES = 96); the last resort removes the nearest UNBUILT
  extension construction site - never a finished structure - and builds the tower
  on its tile. The tower tile leaves the extension search through the tower
  reservation, so extensions re-reserve the next free tile on the next tick.
  Files: src/config.ts, src/managers/constructionManager.ts,
  test/unit/constructionManager.test.ts.
- **Tests for the tower fix:** 5 new cramped-room unit tests - rings 2/4 full puts
  the towers on rings 3/5, the owner's 30-extension box gets both towers on
  opposite sides, engine refusing every primary tile falls back to a placement
  inside ring 8, rings 2-8 full removes the closest unbuilt extension site, and a
  finished extension is never removed. Unit suite 95 -> 99 passing with the sign
  tests (was 90).
- **In-game verification (agent-test, this run):** smoke 500 ticks EXIT 0 -
  3.86/tick, CPU avg 2.11, 0 console errors (unchanged vs the 4a706dc baseline);
  acceptance-m4 6001 ticks EXIT 0, "1 passing (26 min)" - snapshot: L5/444,
  towersBuilt 2, towersWithRampart 2, extensionsBuilt 5, energyCapacity 550, 11
  creeps, mode peace, hostiles 0. Scorecard vs baseline 06677ce: harvested 12.66
  -> 12.66/tick, upgraded 0.2 -> 0.2, construction 5.26 -> 5.26, RCL 5/444 ->
  5/444, spawn idle 68 % -> 68 %, creep idle 38 % -> 38 %, CPU avg 2.2 -> 2.28
  (max 28.06 -> 28.63, noise), 0 errors. The M4 world is not the cramped case, so
  no number moved there; the cramped behaviour is covered by the 5 unit tests.
- **Controller sign (feedback 2026-11-02 small task).** CONTROLLER_SIGN_TEXT
  added to src/config.ts; the upgrader - the only role that parks at the
  controller - signs it while already on the upgrade round trip
  (signController in src/roles/upgrader.ts): signController needs range 1, so a
  pending sign walks two tiles closer first; one action per tick (sign or
  upgrade, never both); never re-signs when the text already matches; a harvester
  is never diverted. 4 new unit tests plus a new 800-tick integration test
  (test/integration/controller-sign.test.ts) that reads controller.sign from the
  sandbox with a scorecard-style probe. The first run timed out on the probe: I
  queued the probe with an un-awaited promise, so the game tick sometimes ran
  before the probe reached the queue - fixed by awaiting the queue insert before
  the tick. Result: 1 passing (4m), controller signed, upgrader alive, 0 console
  errors (d666902).
- **Full suite:** <pending - agent-test all, result line copied in at the end>
### 2026-11-01 (run 38: gate failure fixed by revert; owner's URGENT edge-crash fix completed)
- **Gate failure root cause and fix (commit 54fb465).** The 20:16 gate failed on a unit
  test (spawnManager "spawns a fifth worker from the surplus energy"). A previous run's
  leftover working tree (committed as 08424f2 "auto-commit leftover changes") had raised the
  bootstrap surplus cap 100 -> 300 and the RCL 1 builder minimum 1 -> 5 in src/config.ts,
  plus a matching minCreepsPerRole change in src/managers/spawnManager.ts. At RCL 1 the
  surplus formula is energyAvailable - used, so with 300 energy the cap was 0 (300 - 300)
  while the new builder minimum alone was 500; the test (energyAvailable 500, expects a
  worker) instead spawned the extra builder and failed. 9df73af (run 37 round 2, verified
  "8 + 75 passing, EXIT 0") did not have these changes, which is why the earlier full-suite
  pass and this gate run disagreed. Reverted both files to 9df73af; the spawnManager suite
  is back to 13 passing.
- **Owner URGENT crash items 1 + 2 (in 08424f2, kept) and TEMP-DEBUG removal (commit
  6a038a1).** constructionManager's computeTowerPositions and computeRoadEndpoints built
  new RoomPosition(x, y, roomName) from raw arithmetic with no range check; near the room
  edge the range-2 / range-8 search walked off the map and threw "Invalid arguments in
  RoomPosition constructor" (the real game rejects x/y outside 0..49), killing the loop and
  leaving the room with no sites. An isValidTile(x, y) helper (0 <= x <= 49 && 0 <= y <=
  49) now guards both loops, so off-map candidates are skipped, not thrown. src/main.ts
  wraps each room in try/catch and logs the error (previously a constructionManager throw
  took down the whole tick). The TEMP-DEBUG [cdbg] instrumentation left by the
  investigation was removed in the same file.
- **Owner URGENT crash item 3: edge-position unit tests (commit f695cfd).** The PositionMock
  now throws "Invalid arguments in RoomPosition constructor" for coordinates outside 0..49,
  exactly like the real game (it used to accept any number, which is why the crash was
  invisible in tests). A makeEdgeRoom helper moves only the spawn to the edge so the
  range-8 extension search walks off the map; three tests cover x=3, y=46 and the corner
  4,4, asserting manageConstruction does not throw and every placed site stays inside 1..48.
  Verified against the owner's bar: on the unguarded 9df73af constructionManager the edge
  test throws the live crash; on the fixed code the full unit suite is 78 passing (was 75).
- Unit suite: 78 passing (75 original + 3 new edge tests); lint clean, build clean.
- **Full suite verified (agent-test start all, commit 5d4eae6, ~73 min).** Integration
  "6 passing, 1 failing"; the 6 passing are acceptance-m1, m2, m3, m4, smoke and spawnprobe.
  The M1-M4 acceptance scorecards are byte-for-byte identical to the 21d2356 baseline
  (reports/history.csv), so the config revert and the isValidTile guard changed no acceptance
  behaviour. The single failure is m5-candidate.test.ts, the human's M5 static-mining draft
  candidate (fails on 1 of 2 containers, 1 miner, 9.82 vs 12 harvested/tick, 0.05 vs 4
  controller progress/tick): M5 is not implemented, it is not an acceptance gate, and it is
  unchanged by the run 38 fixes - expected, not a regression.

### 2026-11-01 (run 37 round 2: gate state verified, no code changes; M5 blocked)
- The 05:33 gate failure (M2: "at least one extension is finished", 0 built)
  was fixed in round 1 of this run (c2b9f5c container-first gate, 9f0abcf
  harvester minimums) and verified by the full suite against this exact src/:
  agent-test start all, started 07:53, 4,325 s, EXIT 0 - "8 passing (1h)"
  integration plus 75 passing unit. Snapshots: M2 level 2, extensionsBuilt 1,
  roadsBuilt 3 (gate run: 0 / 0), M3 3 extensions + 7 sites / capacity 450 /
  tower 500, M4 2 towers with ramparts / 5 extensions + 25 sites, smoke
  harvested 3.86/tick / 0 console errors, spawnprobe 700 ticks clean.
- Round 2 re-verified HEAD (870f347): lint 0 errors, build OK, 75 unit tests
  passing; src/ is byte-identical to the commit the suite passed on, so the
  gate will re-run and push that same code.
- Fresh smoke at HEAD (agent-test, 500 ticks, "1 passing (2m)", EXIT 0):
  harvested 3.86/tick, upgrade 0.25/tick (50 at tick 500), spawn idle while
  full 1 % (target below 20 %), CPU 1.49/tick, 0 console errors - identical to
  the 07:53 suite's smoke numbers, confirming code and test environment are
  stable at the handoff point.
- M5 stays unchecked: the owner's acceptance test is not in this repo copy
  (test/integration holds acceptance-m1..m4 only) and agent-test only accepts
  test/integration or test/unit paths, so the candidate in
  test/candidates/acceptance-m4.candidate.test.ts cannot be run. Copying it
  into test/integration/ would add it to the gate's npm test (mocha
  'test/integration/**/*.ts'), and its criterion 1 (two containers by tick
  3000) is not yet energy-budgeted inside M2's extension + road window - that
  would fail the gate. Decision: no code changes this round; the
  verified-green state is handed to the gate as-is.

### 2026-11-01 (M3 regression: no-container rooms keep the level-table harvester minimum)
- Full suite after the M2 gate fix (agent-test start all) bailed at M3:
  "at least 3 extensions are finished - actual 1, expected 3" (capacity 350 vs the
  required 450); M1 and M2 passed, M4/smoke/spawnprobe did not run (mocha --bail).
- Root cause: M3 had never been run against the M5 code. reports/history.csv shows
  its last run at 2026-11-01 05:30 on commit 32706ac, BEFORE the M5 merge d108b29,
  passing with builder 3 + harvester 5 + upgrader 2, 10.46 harvested per tick, 4.06
  construction per tick, 4 extensions and capacity 500 at the end. d108b29's
  source-state spawn minimums replaced the level-table harvester row (5 at RCL 3)
  with the per-source split: two container-less sources -> two harvesters. In the
  M3 world (RCL 3, containers last in the builder queue, so no container is ever
  built) the economy stayed at two harvesters for the whole 4,000-tick window:
  ~26,600 total build energy vs ~34,700 pre-M5, ending at 1 extension / capacity
  350. The containerFirstForRoom gate is inactive in M3 (level 3 >
  CONTAINER_BOOST_MAX_LEVEL = 2), so the M2 gate fix is not the cause.
- Fix (src/managers/spawnManager.ts, minCreepsPerRole): while no container is
  built, the harvester minimum is max(per-source split, level-table row) - the
  pre-M5 bootstrap economy (5 at RCL 3, 3 at RCL 2, 2 at RCL 1 where the split
  wins); once the first container is built the M5 per-source split applies again
  (miners take the covered sources; a surplus harvester would fight the
  stationary miner). M1/smoke/spawnprobe (RCL 1) are unchanged (2 = the split);
  M2 now runs three harvesters from the moment it reaches level 2 - the pre-M5
  M2 run had exactly three and passed.
- Lint clean, build clean, 75 unit tests passing.
- acceptance-m3 PASSED (18m, 4,001 ticks, EXIT 0): snapshot
  {"level":3, "towersBuilt":1, "towerSites":0, "extensionsBuilt":3,
  "extensionSites":7, "energyCapacity":450, "creeps":10, "roadTiles":59,
  "roadsOnWalls":0, "strayRoads":0, "sources":2, "sourcesConnected":2,
  "controllerConnected":true, "farthestFromSpawn":6}, maxTowerEnergy 500,
  roadShare 0 - all 13 criteria met. Crew was builder 3 + harvester 5 +
  upgrader 2 for the whole run (the pre-M5 passing composition). Scorecard vs
  the pre-M5 baseline (32706ac): harvested 10.46 -> 11.12/tick, construction
  4.06 -> 4.17/tick, wasted 9,704 -> 9,136, controller progress 0 -> 0.15/tick
  (RCL 3 / 251 at the end), CPU 2.11 -> 2.15/tick, creep idle 30 % -> 30 %,
  0 console errors. Capacity went 300 -> 350 between ticks 2,200-2,300,
  -> 400 between 2,700-2,800 and -> 450 between 3,600-3,700; the failing run
  ended its whole 4,000 ticks at 350 with one finished extension.
- Full suite (agent-test start all, 65m, EXIT 0) after the fix: 75 passing
  (unit, 22ms) + 8 passing (integration, 1h), 0 failing. M3 re-passed in the
  same run with the identical snapshot (3/251, capacity 450, 10 creeps, 0
  console errors).
  - M2 (3,001 ticks): level 2, extensionsBuilt 1 + 4 sites, roadsBuilt 3,
    energyCapacity 350, creeps 9 (builder 3, harvester 2, hauler 1, miner 1,
    upgrader 2 - the M5 miner/hauler handoff happened in-run, tick ~2,400,
    right after the first container finished). Scorecard vs the pre-M5 run:
    harvested 7.09 -> 9.83/tick, total 19,060 -> 25,016, wasted 11,632 ->
    9,112, delivered to spawn 0.56 -> 0.98/tick; ticks to RCL 2 unchanged at
    813, 0 console errors.
  - M4 (6,001 ticks): level 5 / 444, towersBuilt 2 with ramparts, capacity
    550, 11 creeps, 0 console errors. Scorecard vs the pre-M5 run (32706ac):
    harvested 11 -> 12.66/tick, wasted 8,268 -> 6,968, construction 5.11 ->
    5.26/tick. Defense: firstHostile 5401, Memory.mode 'defend' from the same
    tick, intruderGoneAfterTicks 1, safeModeTicks 0, spawnHits 5,000
    (spawn survived).
  - smoke (500 ticks): 0 console errors, 6 creeps, harvested 1,824,
    progress 50, CPU 1.48/tick.
  - spawnprobe (700 ticks): 0 console errors, RCL 1 / 150, 7 creeps,
    harvested 5.43/tick in the window.
### 2026-11-01 (M2 regression fixed: container-first build priority gated behind the bootstrap minimum)
- Fix (src/roles/builder.ts, commit c2b9f5c): containerFirstForRoom now gates the
  container-first branch of selectBuildSite. M5's unconditional container-first
  (d108b29) put a container site above the extension and road queues, and the
  construction manager places a container site from RCL 1, so from ~tick 400 the
  whole crew camped the first 5,000-energy container site: the 05:33 gate failed
  M2 with extensionsBuilt 0 and roadsBuilt 0 at tick 3,000 (snapshot level 2,
  energyCapacity 300, 5 extension sites, 59 road sites, 0 of each built).
  Containers now lead only when (a) a container is already built, or (b) the
  controller is at level <= CONTAINER_BOOST_MAX_LEVEL (2) with at least
  CONTAINER_BOOST_MIN_EXTENSIONS (1) extension and CONTAINER_BOOST_MIN_ROADS (1)
  road finished. Built structures are counted with FIND_STRUCTURES: in
  @types/screeps the FIND_MY_STRUCTURES union (AnyOwnedStructure) excludes
  containers and roads, so the MY_ constant does not type-check for them (and the
  rest of the codebase counts them the same way).
- 6 new gate tests in test/unit/builder.test.ts (75 unit tests passing); lint
  clean; build clean; smoke (500 ticks): 1 passing, 0 console errors, build
  energy on roads 0 % -> 100 %.
- acceptance-m2 PASSED (17m, 3,001 ticks, EXIT 0): snapshot {"level":2,
  "extensionsBuilt":1, "extensionSites":4, "roadsBuilt":3, "roadSites":56,
  "energyCapacity":350, "creeps":7} - all seven criteria met (level >= 2;
  extensionsBuilt >= 1; roadsBuilt >= 1; extensionBuilt+sites >= 5;
  roadBuilt+sites >= 5; energyCapacity >= 350; creeps >= 3). In-run behavior:
  roads lead from ~tick 400 (3 finished by tick 3,000), extension one finishes
  ~tick 2,150 (capacity 300 -> 350), then the gate opens and the crew moves to
  the container (2,835 build energy in the last 1,000 ticks). Scorecard vs the
  pre-M5 2026-11-01 05:12 run: harvested 6.64 -> 7.09/tick, controller progress
  0 -> 0.3/tick, ticks to RCL 2 945 -> 813, RCL 2 progress at end 0 -> 846,
  construction 4.35 -> 3.23/tick, CPU 1.84 -> 1.95/tick, creep idle 22 % ->
  26 %, spawn idle while full 31 % -> 86 %, wasted at regen 10,066 -> 11,632
  (none of these is an M2 criterion; the last three trade the store for the
  container build).
- Full suite (agent-test start all) running after this entry.
### 2026-11-01 (M5 static mining implemented; M5 smoke failure fixed with upgrader hold-back)
- **M5 implementation (from the previous run, verified green this run):**
  - New src/roles/miner.ts: a stationary miner per source. It walks to the container
    tile beside its source exactly once, then stands on it for its whole life (range 1
    harvest, range 0 transfer, no further movement); energy it cannot carry drops into
    the container. spawnManager only assigns miners to sources that already have a built
    container (assignMinerSource), so bootstrap sources stay with harvesters; if the
    container is lost later the miner falls back to drop-mining beside the source.
    Dispatched by role in src/main.ts.
  - src/managers/spawnManager.ts: M5 spawn minimums are source-state aware - a source with
    a finished container wants a miner, a source without one wants a bootstrap harvester,
    and a hauler is spawned once any container exists. MIN_UPGRADERS_BY_LEVEL is exposed to
    the builder through upgraderBelowMinimum (see below).
  - src/roles/builder.ts: selectBuildSite gained a container-first branch (M5 priority:
    containers are the stage-2 bottleneck, built before extensions and roads) and
    hasPriorityBuildSites for the upgrader's tower-site pause.
  - src/roles/hauler.ts delivery order per M5 spec (containers -> tower -> extensions ->
    spawn); src/roles/harvester.ts keeps feeding containers while they are being built.
  - src/config.ts: MIN_HAULERS (1), MIN_UPGRADERS_BY_LEVEL (RCL 1-2: 1), body templates.
- **M5 smoke failure, root cause:** the smoke test asserts controller progress > 0 within
  500 ticks. Before the fix the upgrader never spawned: at RCL 1 the room capacity is 300
  and the upgrader body ([WORK, WORK, CARRY, MOVE]) costs 300, but the builder's 50 %
  withdrawal floor (added 2026-10-31 for construction rate) drained the store to ~146-196,
  and spawn priorities (harvester -> builder -> upgrader) meant the 300-energy upgrader was
  never queued. Measured (failed smoke, 32706ac): controller progress 0.1/tick, RCL
  1/progress 50 at tick 500, creeps at end builder 1 + harvester 2.
- **Fix (upgrader hold-back, src/roles/builder.ts + src/managers/spawnManager.ts):**
  while upgraderBelowMinimum(room) (alive upgraders < MIN_UPGRADERS_BY_LEVEL[RCL]), the
  builder's withdraw gate is skipped at every store level, so the builder self-harvests and
  the store is allowed to fill to the upgrader's cost; once an upgrader is alive the 50 %
  floor applies again and construction resumes at the old rate.
- **Tests:** test/unit/builder.test.ts - the withdraw test now mocks an alive upgrader
  (Game.creeps replaced, not mutated, to avoid cross-test pollution through the shared
  reference) and a new test covers the hold-back (upgrader minimum unmet -> builder does
  not withdraw even at a full store). 69 unit tests pass; lint and build clean.
- **Smoke scorecard (500 ticks, this commit vs the failed run 32706ac):** 1 passing (2m),
  0 console errors. Controller progress 0.1 -> 0.25/tick (50 total at tick 500),
  harvested 3.3 -> 3.86/tick, delivered 3.1 -> 3.5/tick, wasted 1.2 -> 1.3/tick,
  construction 3.75 -> 2.01/tick, spawn idle while full 0 % -> 1 %, CPU 1.39 -> 1.52/tick
  (max 22.28 -> 20.35), creep idle 8 % -> 22 %, creeps at end 3 -> 6 (builder 2,
  harvester 2, upgrader 2), build energy in window: road 1194 -> container 401.
  Interpretation: the construction drop is the intended hold-back trade (builders
  self-harvest for ~150 ticks until the first upgrader, and only one builder is active in
  the last-200-tick window); the build energy now goes to the container site, which is the
  structure M5's acceptance test actually requires. The idle rise is under investigation
  (Known Issues).
### 2026-10-31 (construction-rate regression fixed: builder withdrawal floor)
- **Root cause of the construction-rate regression (3.11 -> 0.19/tick):** the
  builder's energy withdrawal was gated on the room being completely full
  (energyAvailable >= energyCapacityAvailable, owner rule #3). The surplus
  spawning from the previous run drains the store the moment it peaks, so the
  room is rarely completely full and the builders were forced onto the
  far-source self-harvest loop (~40 tiles to a distant source), which dropped
  construction to 0.19/tick and creep idle to 23 %.
- **Fix (src/roles/builder.ts, src/config.ts):** changed the builder's
  withdrawal gate from "room completely full" to "room at or above
  BUILDER_WITHDRAW_FRACTION (0.5) of capacity". The builders now drain the
  store down to 50 % and the harvesters refill it, so the builders build from
  the room instead of self-harvesting. The floor is still high enough that the
  spawn can queue a minimum-crew respawn between delivery ticks (a deliberate
  deviation from owner rule #3, noted in the config comment and the file header).
- **Unit test (test/unit/builder.test.ts):** added "withdraws from the room
  above the floor instead of self-harvesting" (builder with energyAvailable
  200/300, above the 150 floor, withdraws from the spawn and does not
  self-harvest). Updated the stale "completely full" comment in the mock room.
  68 unit tests passing.
- **Smoke (500 ticks) on the fixed code:** construction progress 3.75/tick (was
  0.19, baseline 3.11), spawn idle while full 0 % (was 2 %), creep ticks idle
  8 % (was 23 %), CPU 1.44/tick (was 1.61). Controller progress 0.1/tick (was
  0.35) and RCL progress at end 1/50 (was 1/100): the builders now compete for
  the room's energy, so the upgrader's sink is slower - a tradeoff accepted for
  the faster construction. 0 console errors.

### 2026-10-31 (M4 second-tower root cause fixed)
- **Root cause of the M4 acceptance failure (criterion 1: "both towers allowed at level 5 are built or placed"):** construction-slot saturation. A temporary probe test (test/integration/probe-tower.test.ts, 2,600 ticks, deleted after) dumped the tiles around the spawn every 100 ticks: the first tower was placed at tick ~100 and finished, all 30 extension slots were consumed (29 sites + 1 built), and NO second tower site was ever created - computeExtensionPositions fills the checkerboard rings from range 2 outward, and at level 5 all 30 slots fit inside ranges 2-4, the exact range computeTowerPositions searches for the second tower. Baseline (pre-fix) scorecard, fields the M4 spec lists to watch: construction progress 4.39/tick, extensions and towers farther than 8 tiles 0, spawn idle while full 68 %.
- **Fix (src/managers/constructionManager.ts):** manageConstruction now calls computeTowerPositions with the number of towers still missing (limit - built - sites), so ALL future tower tiles are known up front; the road network plus those tiles form towerReserveTiles, which is passed as excludeTiles to computeExtensionPositions and computeContainerPositions. placeTowerSites still places one site per tick (M4 spec: "One tower site at a time") and now finds its future tile free.
- **Regression test (test/unit/constructionManager.test.ts, 4 tests, new file):** mock room with spawn and controller at (25,25), sources in the far corners. The search walks Manhattan-diamond rings, and the four diagonal "range 2" tiles are at range 1 from the controller (on the spawn's tile) and excluded, so the tower candidates are the axial tiles - first tower (23,25), second (25,27). Tests: one tower site first on (23,25); while all 30 extensions fill up, (25,27) stays free (this test FAILS without the fix - the extensions take the tile); the second site (25,27) is placed once the first tower is finished, with ramparts on the spawn's and the finished tower's tiles; no site beyond the level-5 limit of two. 57 unit tests passing (53 + 4).
- Probe test deleted. **Verification (same day): acceptance-m4 PASSED - 1 passing (26m),
  6,001 ticks, EXIT 0.** Snapshot: towersBuilt 2, towerSites 0, towersWithRampart 2,
  extensionsBuilt 5 + extensionSites 25 (30 total), energyCapacity 550, maxTowerEnergy
  540, farthestFromSpawn 8, spawnHasRampart, firstHostile 5401 / firstDefend 5401,
  intruderGoneAfterTicks 1, safeModeTicks 0, spawnHits 5000, creeps 10, 0 console errors.
  Scorecard (fields the M4 spec lists to watch): construction progress 4.44/tick (baseline
  4.39), extensions and towers farther than 8 tiles 0 (baseline 0), spawn idle while full
  82 % (baseline 68 %). Smoke (500 ticks) on the fixed code: 0 console errors, 0 probe
  misses, all scorecard numbers unchanged from the previous run.
 - **Full test suite (agent-test start all, commit 2c081e3): 8 passing (1h), EXIT 0.**
   M1-M4 acceptance, smoke and spawnprobe all green. M4 snapshot re-confirmed in this run:
   towersBuilt 2, towerSites 0, towersWithRampart 2, extensionsBuilt 5 + extensionSites 25,
   energyCapacity 550, maxTowerEnergy 540, farthestFromSpawn 8, firstHostile 5401 /
   firstDefend 5401, intruderGoneAfterTicks 1, safeModeTicks 0, spawnHits 5000, mode
   'peace' at the end, 10 creeps. Smoke: 0 console errors, 0 probe misses, CPU 1.42/tick.
   Spawnprobe scorecard unchanged from the previous run (construction progress 3.3/tick,
   CPU 1.46 average, 0 console errors).

### 2026-10-31 (root cause of the M1 failure found and fixed)
- **Root cause (not environmental, code bug):** the clean-environment acceptance-m1 re-run (started 10:30) failed identically to the 10:01 gate (empty probe results, no console output, 0 transfers, no creeps). Isolated it with a throwaway mockup driver script (diag-console.js, deleted after the fix): the probe results ARE delivered when the module is trivial, but never with dist/main.js. The engine evaluates the user's console commands inside the same context and tick as loop(); a throw OUT of loop() aborts the tick and the commands are skipped.
- **Two bugs in sequence (src/utils/ErrorMapper.ts, src/managers/modeManager.ts):**
  1. `manageMode` read `Memory.rooms[room.name]` on a fresh world where `Memory.rooms` itself is undefined (Memory starts as `{}`), so the room loop threw `TypeError: Cannot read properties of undefined (reading 'W0N1')` every tick, before checkAndSpawn ever ran - the colony never spawned a single creep. Fixed by creating `Memory.rooms = {}` when missing.
  2. `ErrorMapper.wrapLoop`'s catch block called `sourceMappedStackTrace`, whose `require("main.js.map")` throws in the game runtime (the map file is not uploaded; the `"sim" in Game.rooms` guard does not cover the mockup's W0N1 room). That second throw happened inside the catch: it masked the real error, and the throw out of loop() aborted every tick - which is also why the console channel (probes and bot logs) stayed silent. Fixed: the source-map lookup is wrapped in its own try/catch that falls back to the original stack, and non-Error throws are logged instead of rethrown.
- **Verification:** unit test added (test/unit/errorMapper.test.ts, 3 tests: swallow + fallback + non-Error), 53 unit tests passing. Throwaway driver with dist/main.js: harvester-0 spawned at tick 1 (energy 300 -> 80), no error lines, probe results delivered. Smoke test (500 ticks) green: 3 creeps, 0 console errors.
- **M1 acceptance passes:** agent-test acceptance-m1 on a fresh world: 1 passing, 801 ticks, no console errors. The earlier "diagnosed as environmental" entry is superseded: the port collision was real but only delayed the first diagnosis; the clean re-run proved the failure is in the code, and the two fixes above are what cleared it.
- **ErrorMapper fallback test strengthened (test/unit/errorMapper.test.ts):** it now throws an error whose stack frame points at the bundled module (main:42:10) the way the game runtime does, so sourceMappedStackTrace actually reaches the consumer and the require("main.js.map") failure - previously the plain-Node stack never matched, and the test passed without exercising the fallback. It now asserts the "Source maps unavailable" message. 53 unit tests passing.
- **Full suite:** agent-test start all (M1-M4 acceptance + smoke + spawnprobe, ~1 h) running since 10:59 to verify M4 (Hold the room, level 5). diag-console.js deleted.

### 2026-10-31 (gate M1 failure diagnosed as environmental)
- No source change yet. The 10:01 gate failed on acceptance-m1 (energyDelivered 0/3000, empty snapshot, no bot console output, no scorecard probe results). Diagnosis: the sandbox never ran because the engine could not reach storage - server/logs/storage.log from my 10:19 repro run shows "Storage server error: Error: listen EADDRINUSE: address already in use 127.0.0.1:21025" and engine_runner.log shows repeated "Storage connection lost" / SIGTERM restart loops. A screeps server left over from a previous crashed test process held the storage port; by 10:31 no screeps node processes remained (ps) and the port was free (ss). dist/main.js loads cleanly in a plain Node VM with stubbed globals (throwaway probe, removed), so the M4 code from commit 4e26fb9 is not implicated by a load error.
- Note: the M4 in-progress work from the interrupted 2026-10-31 run (commit 4e26fb9: modeManager, towerManager rewrite, defender role, spawnManager priority list, constructionManager changes, 169 unit tests passing) has never run in the integration environment.
- Recovery per rule 07-C: agent-test stop (cleans leftover engine processes), re-running acceptance-m1 in a clean environment.

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
- **Run 97 (2026-11-13 07:45 start): M5 harvest/upgrade (takes over run 96's M5 steps).**
  1. [x] Fix set: split pool gate (upgraderPoolReady/builderPoolReady,
     src/utils/energy.ts), full harvester crew at RCL 5 (config +
     countIncomeMinimum), early miner replacement (MINER_REPLACEMENT_
     LEAD_TICKS, countMinerMinimum + assignMinerSource), body rows
     (miner 300, upgrader 400 2-MOVE, hauler 400/450). 192 unit passing,
     lint 0 errors, build clean. Committed.
  2. [x] Smoke 500 ticks (1 passing, 2m): harvest 4.34 -> 4.2, upgrade
     0.5 -> 0.5, construction 0.05 -> 1.31, CPU 1.77 -> 1.7, 0 console
     errors. Early game (RCL 1) unchanged as expected. Committed ae46644.
  3. [ ] acceptance-m5 (running, started 07:58, 5,000 ticks).
     MID-RUN FINDING (tick 1,800 of the 07:58 run): the 90% builder
     pool line (builderPoolReady) is a NET NEGATIVE in this room - the
     builders self-harvest at the source instead of drinking the pool
     (gate only opens above 270/300), the first extension is still
     unbuilt at tick 1,800 (M4 baseline tree: capacity 350 by ~2,800),
     and the harvester crew ratcheted 5 -> 3 -> 1 while the store sat at
     198, below the 300-energy replacement body (the classic M3 spiral,
     only slower). Planned focused iteration once the run's timeline is
     in: (a) builderPoolReady reverts to the old poolReady (50% floor +
     hold-backs - the verified M4 construction speed and crew
     protection); (b) the upgrader keeps the L5 decoupling
     (poolAboveFloor, no hold-backs) but gets the OLD gate back below L5
     (it is currently false - the verified tree gave the upgrader the
     pool at every level); (c) a 400-energy 2-CARRY harvester row
     [W,W,C,C,M,M] (or HARVESTER_CREW_FULL_CAPACITY lowered to 400): the
     M5 window is 4,000-5,000 and capacity 450 only arrives ~4,200 in
     this room (measured: M4 06:28 timeline), so a full 5-harvester
     crew on the 450 body starts too late to lift the window average to
     13 - at 400 capacity (~3,400) a 2-WORK/2-CARRY/2-MOVE body does
     ~100 energy per ~55-tick trip (~1.8/tick each, 5-9/tick from the
     uncovered source) and the crew is in place before the window.
     (d) possibly MIN_CREEPS_BY_LEVEL level-5 builder 3 -> 5 to pull the
     extension floor earlier.
  4. [ ] If m5 passes: acceptance-m4 regression (6,000 ticks), then
     Part D (agent-test start all).
  5. [ ] If m5 fails: analyze the new scorecard timeline (which source,
     which role is the new cap), one focused iteration.
- **Run 96 (2026-11-13 06:20 start): failed-gate fix, then M5 - steps 2-5
  taken over by run 97.**
  Baseline (rule 07 A5): reports/latest.md = acceptance-m4, 2026-11-13
  06:28, commit d32a596 (== 9a39e9e code): harvested 12.72/tick, upgrade
  0.63/tick, construction 3.8/tick, spawn idle-while-full 71 %, CPU
  3.35/29.26, RCL 5/1,650, creeps 21 (builder 10, harvester 2, hauler 3,
  miner 1, upgrader 5). M5 baseline: no acceptance-m5 report survives from
  2026-11-13 (history.csv rows end at acceptance-m4); best M5 numbers on
  file: 1a1507d probe 11-12 22:56 harvest 12.47 / upgrade 0.6 / idle-full
  68 % / RCL 5/950; b9a4099 acceptance 11-12 22:09 harvest 10.52 / upgrade
  0.61 / idle-full 50.7 % / minedShare 0.98.
  1. [x] Gate fix: revert 6e5653c's src leftovers to 9a39e9e (config
     level-5 min-creeps row, unused LEVEL5_EXTENSION_FLOOR, builder.ts
     docs/import). 192 unit passing, lint + build clean. Committed.
  2. [ ] M5 baseline: agent-test start
     test/integration/acceptance-m5.test.ts on the reverted tree.
  3. [ ] One focused M5 improvement from the baseline analysis (harvest
     >= 13, upgrade >= 1, idle-full <= 30 % are the failing criteria;
     minedShare/ground/sources-with-container pass on recent trees).
  4. [ ] Verify the change: unit suite, then acceptance-m5, then
     acceptance-m4 regression (owner protocol: revert what breaks M4).
  5. [ ] Part D: agent-test start all, result line into the Change Log,
     status/README update.
- **Run 96 (2026-11-13): M4 acceptance failure - second source container
  before the third extension.** M4 acceptance (b9a4099, this run, 6,000
  ticks) failed: extensionsBuilt 2 (needs 3), energyCapacity 400 (needs
  450). Root cause: the run 94 mini-floor (rung 3 = two extensions)
  hands the crew to the second source container (rung 4, 5,000 energy)
  while the third extension (3,000 energy) is still open.
  - Fix (restore the v9.4 full-floor order that f3a6863 proved fits the
    6,000-tick window - 11:02 M4 run of 2026-11-12: all three
    extensions finished well before tick 5,000):
    1. [x] builder.ts: merge the mini-floor and floor-completion rungs
       into one three-extension floor (rung 3,
       CONTAINER_BOOST_MIN_EXTENSIONS_L4) BEFORE the remaining
       source-container rung (rung 4); renumber rungs 5-10.
    2. [x] config.ts: remove CONTAINER_MINI_FLOOR_EXTENSIONS; document
       the order.
    3. [x] Unit tests: flip the "two extensions -> second container"
       test to "crew stays on the third extension before the second
       source container"; renumber the floor tests. 192 passing, lint +
       build clean.
    4. [x] M4 acceptance (agent-test, started 22:38): PASSED (EXIT 0)
       - extensionsBuilt 3, energyCapacity 450, all 17 assertions met
       (snapshot line in the Change Log above).
    5. [ ] Full suite (agent-test start all), then commit.
- Previous - **Run 95 (2026-11-12): M2 gate failure (roadsBuilt 0 at tick 3000).**
  The 20:11 gate failed at the M2 acceptance test: roadsBuilt 0 (M1 passed).
  Baseline 2026-11-12: M2 gate run vs last passing M2 (f3a6863 15:04 run):
  road energy in the 481-801 window 19 vs 1126 (4.7/tick), RCL 2 at 614 vs
  720, end of run 4 extensions + partial 5th vs 2 extensions + 1 container
  + 4 roads.
  - Root cause (code diff f3a6863..69474de + both scorecards): builder and
    site-placement code is unchanged. The regression is the run 93/94
    surplus changes applied at every controller level: SURPLUS_SPAWN_ENERGY_RATIO
    0.9 valve + SURPLUS_UPGRADER_MAX 5 + SURPLUS_BUILDER_MAX 10. At RCL 1 the
    room holds only 300 energy and ~2 harvesters bring in 3-4/tick, so the
    valve pulsed 4-5 two-WORK surplus upgraders into the pool (M1 timeline:
    upgrader 4 at tick 500, 5 at 600) that drained it at ~5-6/tick - faster
    than the harvest refilled it. The builder's 50 % withdrawal floor
    (poolReady) was never reached, it fell back to self-harvesting, and the
    RCL 1 road phase (ticks ~200-614) built ~19 road energy instead of ~1126:
    zero finished roads. RCL 2 at 614 then placed all 5 extension sites (the
    builder's rung 5 beats rung 6 roads) and the 4-WORK builders finished 4
    extensions with none left for roads.
  - Fix (the valve and raised caps were designed and measured only for the
    RCL 5 M5 window - probe-m5-creeps - so gate them by controller level):
    1. [x] config.ts: SURPLUS_VALVE_MIN_LEVEL = 5; SURPLUS_UPGRADER_MAX_LOW
       = 2 and SURPLUS_BUILDER_MAX_LOW = 5 (the pre-2026-11-12 values M1-M4
       passed on).
    2. [x] spawnManager.ts: below the level the store must be completely
       full (100 % gate, pre-2026-11-12 behavior) and the low caps apply;
       at/above the level the 0.9 valve and 5/10 caps stay.
    3. [x] Unit tests: the two cap-5/cap-10 tests move to controllerLevel 5;
       new tests for the RCL 1 low caps and the 100 % gate. 192 unit passing
       (188 + 4: low upgrader cap -> builder gets the surplus, low builder
       cap -> idle, valve closed at 93.75 %, valve open at RCL 5), lint +
       build clean.
    4. [x] M2 + M3 acceptance on the fix: M2 PASSED (roadsBuilt 4, was 0
       in the failed gate), M3 PASSED (tower built + filled, roadShare 0).
    5. [ ] M4 + M5 + full suite (agent-test all): M4/M5 run at RCL 5 where
       the 90 % valve and 5/10 caps stay active (untouched by the fix);
       the suite result line goes into the Change Log.
    4. [ ] lint + build + test-unit.
    5. [ ] agent-test start all; expect M1-M4 green, M5 failing as before
       (its own milestone, next run). Commit with scorecard numbers.
- **Run 94 (2026-11-12): M5 stagnation fix (mini-floor, caps, bodies).**
  The M5 probe showed the colony stuck at RCL 5/802: 82 % creep idle
  because 3 upgraders drained the store faster than the 90 % valve
  re-opened it and there was nothing left to build (source B's
  container had not started).
  1. [x] Builder mini-floor in src/roles/builder.ts: after exactly 2
     extensions (CONTAINER_MINI_FLOOR_EXTENSIONS in src/config.ts) the
     builder starts the second source's container - one rung earlier
     than the old 3-extension threshold that left M5 without work.
  2. [x] Caps in src/config.ts: SURPLUS_UPGRADER_MAX 3 -> 5,
     SURPLUS_BUILDER_MAX 5 -> 10, CONTAINER_HAULER_SPARE 1 -> 2.
  3. [x] Bodies in src/managers/spawnManager.ts: 4-WORK builder row
     and 3-WORK 400-energy walking-upgrader row.
  4. [x] Unit tests: builder.test.ts, spawnManager.test.ts (incl. two
     new body-cost tests), upgrader.test.ts. 188 passing, lint 0
     errors, build clean.
  5. [x] Cost-label audit: a node check of every "body, // cost" label
     found 4 mismatches - the two new rows (700 labeled 550, 450
     labeled 400) plus two pre-existing defender rows (520 labeled
     620, 390 labeled 420). Fixed: builder row is now [W,W,W,W,C,M,M]
     = 550 (the RCL 5 capacity buys it; the old 10-part body could
     never spawn in the M4/M5 window), upgrader row is [W,W,W,C,M] =
     400 (one MOVE is enough from RCL 4 on - the pool rung hands it
     energy a few tiles from the controller), defender labels
     corrected to 520/390. All labels now match BODYPART_COST sums.
  6. [x] Smoke re-run after the body fix: EXIT 0, scorecard
     bit-identical to the pre-fix smoke (a no-op at 300 capacity).
  7. [ ] M4 acceptance (in progress - canary for the RCL 4 economy the
     body rows and caps change), then M5 acceptance.
  8. [ ] Commit with the scorecard before -> after; then status.md/
     README/blog per the run procedure.
- **Run 93 (2026-11-12): failed gate, then the M5 decision.** The gate's
  unit step failed (178 passing, 6 failing) - the 877cba7 changes
  (SURPLUS_UPGRADER_MAX 2 -> 3, new SURPLUS_SPAWN_ENERGY_RATIO 0.9 valve,
  MIN_CONTAINER_WITHDRAW_ENERGY 100 -> 50, new 450-energy harvester body)
  left 3 unit tests stale.
  1. [x] Gate fix: update the stale unit tests (commit b09a7e4). 184 unit
     passing, lint 0 errors, build clean.
  2. [ ] M5 acceptance on the current tree. Baseline 2026-11-12
     (probe-m5-creeps, reports/latest.md, tree 54985c0 - everything below
     the 877cba7 valve changes): harvested 9.36/tick (need 13), upgrade
     0.43/tick (need 1), spawn idle-while-full 59 % (need 30 %), creep idle
     41 %, CPU 2.57 avg, RCL 5/802 at 5,000 ticks, 0 console errors.
  3. [ ] If M5 fails: fix one cause at a time (measure before touching the
     same code twice; a worse number is a problem, not something to try
     around). If M5 passes: the M4 regression (the upgrader pool rung and
     the valve changes alter the RCL 4+ economy; M4 ends at RCL 5/550 and
     is the M1-M5 canary), then Part D (agent-test all, docs).
  4. [ ] status.md "Feedback acknowledged": the v9.4 items (URGENT 1,
     URGENT 2, minedShare, cleanup) - the M5/M4 numbers in those lines
     land with the acceptance results.
- **M5 upgrader pool rung (2026-11-12, superseded by run 93).** Fix the M5 gate
  (harvest 11.68 vs 13, upgrade 0.5 vs 1, spawn idle-while-full 76 % vs
  30 %): the upgrader spends the spawn/extensions pool from RCL 4 on.
  1. [x] Rung 3 in getEnergy (src/utils/energy.ts) + shared
     withdrawFromPool; doc update in src/roles/upgrader.ts.
  2. [x] 3 unit tests (pool beats container at RCL 5; level gate at RCL 3;
     50 % floor hold at RCL 5). 183 passing, lint + build clean, dist
     rebuilt.
  3. [ ] M5 acceptance (started 06:28:58) - check as it progresses; if it
     passes, the M4 regression on this tree (the pool rung changes where
     the upgrader refuels from RCL 4 on; M4 ends at RCL 5/550, so M4 is the
     canary for the M1-M5 economy).
  4. [ ] M1-M3 smoke: the rung is level-gated, M1-M3 run below RCL 4 -
     the M3 acceptance only if 3 passes (the level gate should make it a
     no-op there).
  5. [ ] Commit with the scorecard before -> after, then status.md/
     README/blog per the run procedure.
  Baseline 2026-11-12 (probe-m5-timeline, commit 004fc8e): harvested
  11.68/tick (need 13), upgrade 0.5/tick (need 1), spawn idle-while-full
  76 % (need 30 %), wasted at regen 8,076, creep idle 40.1 %, CPU 2.56,
  RCL 5/600, creeps 12, 0 console errors.
- **M5 v9.4 fixes (2026-11-11, this run).** Owner feedback v9.4: two
  independent bugs, each one commit (lint + build + unit, then M5, then M4;
  commit only if M4 still passes).
  1. [x] Cleanup: probe-m5-builder.test.ts moved to probe-tmp/ (commit
     d0ec3a0).
  2. [x] URGENT 1: upgrader latch (src/roles/upgrader.ts) - close the work
     cycle only on an EMPTY store (working false at 0, true at capacity),
     getEnergy only in the fetch phase. 2 new unit tests (half-full store
     keeps upgrading; empty store closes the latch and tops up). M5
     before: upgradePerTick 0.05 (gate run); after (URGENT 1 only run):
     0.55 - much better, still below the 1.0 criterion. minedShare stayed
     0.585 (the latch does not touch the build order). Committed 73d682c.
  3. [ ] URGENT 2: getEnergy rung order (src/utils/energy.ts) - source
     container (>= 100) BEFORE the builder pool rung; spawn/extensions only
     when no container holds 100+. 1 new unit test (full room + container
     with 1000 -> withdraw from container; fails against the old order,
     passes against the new). 177 unit passing, lint + build clean, dist
     rebuilt. M5 acceptance with URGENT 1+2 running (started 21:43); M4
     regression after it.
  4. [ ] minedShare 0.585 -> >= 0.6 only if 2 and 3 did not close it:
     first source container right after the first tower (3-extension floor
     kept for the second container, second tower, ramparts); console line
     from the construction manager when a container completes.
  Baseline 2026-11-11 (M5 gate run, pre-fix): harvested 4.56/tick,
  upgradePerTick 0.05 (need 1), builtByTick3000 0, containerByTick3000
  0, minedShare 0.585 (need 0.6), 0 console errors.
  After URGENT 1 only (M5 run 2026-11-11 21:09): upgradePerTick 0.55,
  minedShare 0.585 - failed at acceptance-m5 line 105 (minedShare < 0.6);
  first source container finished ~tick 3800.
- **M3 death-spiral fix (2026-11-11, this run).** The M3 failure is
  two-layered: the b1b9be1 death spiral (2 creeps at t=4000) is driven by
  the v9.3 builder pool rung draining the store below full-size income
  replacement cost, and the 1404382 income-only clamp (2 extensions at
  t=4000, crew back at 2 creeps) fixed the body ratchet but not the drain.
  Plan:
  1. [x] sizingBudgetFor restored to the de5c985 behavior: every role
     sized from the room's capacity, only a wiped income/hauler crew sized
     from the stored energy (src/managers/spawnManager.ts).
  2. [x] incomeBelowMinimum(room) (src/managers/spawnManager.ts) + the
     pool rung of getEnergy (src/utils/energy.ts) requires it, so the
     builder cannot drain the pool while the income crew is below its
     minimum.
  3. [x] Unit tests: 174 passing (168 + 2 sizing regression + 3
     incomeBelowMinimum + 1 builder hold-back; 2 existing builder pool
     tests updated to an at-minimum income crew). Lint + build clean.
  4. [x] Smoke: 1 passing (500 ticks; harvested 4.44/tick vs 3.86 in the
     previous smoke run 8553897; 6 creeps at end H2 B2 U2; 0 console
     errors).
  5. [x] acceptance-m3 (4000 ticks) - PASSED: 1 passing (18m), EXIT 0;
     extensionsBuilt 5 (baseline 4), capacity 550, maxTowerEnergy 500,
     creeps 7 (peak 10), harvested 7.78/tick (baseline 5.46), 0 console
     errors.
  6. [x] acceptance-m2 (3000 ticks) regression run (same tree) - PASSED:
     1 passing (13m), EXIT 0; level 2, extensionsBuilt 2 + 3 sites,
     roadsBuilt 5 + 54 sites, capacity 400, creeps 6 (peak 9); harvested
     5.44/tick (previous M2 run 1404382: 3.46), construction 5.59/tick
     (2.99), ticks to RCL 2: 812 (816), 0 console errors.
  7. [x] Commit with scorecard numbers before -> after (code: ec7a3f6).
  8. [ ] agent-test all (finish ritual) - started after the M2 pass; the
     result line goes into today's Change Log entry, then final commit.
  Baseline 2026-11-11 (07:48, de5c985, M3 PASS): creeps 3 (peak 11),
  maxTowerEnergy 500, extensionsBuilt 4 + 6 sites, capacity 500,
  roadShare 0%, road tiles 59 / 0 on wall / 0 disconnected, sources 2 of
  2, controller connected, farthest 6.
  Baseline 2026-11-11 (b1b9be1, M3 FAIL): creeps 2 at t=4000 (death
  spiral); construction otherwise fine (extensionsBuilt 4 + 6 sites).
  Baseline 2026-11-11 (1404382 income-only clamp, M3 FAIL): 2 extensions
  built at t=4000, crew back in the 2-creep state.

- **FEEDBACK v9.3 fixes (2026-11-11).** Two surgical fixes, each in its own
  commit (owner: no M4/M5 redesign, no M3/M4/M5 rewrite).
  1. `getEnergy(creep, role)` in src/utils/energy.ts: (1) drop within
     BUILDER_DROP_PICKUP_RANGE, (2) upgrader only: controller container,
     (3) fullest source container >= MIN_CONTAINER_WITHDRAW_ENERGY (new
     config, 100), (4) builder only: spawn/extensions above
     BUILDER_WITHDRAW_FRACTION (upgraderBelowMinimum hold-back), (5) harvest
     only if no container has energy, else idle ("wait"). runBuilder and
     runUpgrader call it; their self-harvest logic stays. Owner unit-test
     specs (a) 50-energy container -> no harvest, (b) 150 -> withdraw,
     (c) upgrader partial store + 10-energy controller container ->
     withdraw. NOTE: owner's step 1 says "range 3 (as it currently is)" but
     the builder's current range is BUILDER_DROP_PICKUP_RANGE = 10 (set in
     688bf10, which the owner praised); keeping 10 for both roles.
     Then lint/build/unit, agent-test acceptance-m5 THEN acceptance-m4,
     commit with scorecard numbers before -> after.
  2. hasPriorityBuildSites: remove rungs 3-4 (container at RCL <= 2, road
     at RCL <= 2); keep rungs 1-2 (tower site; extensions under minimum).
     Owner unit-test spec: M5 world, tower built, RCL 5, one container +
     one road site -> false (no builder, no upgrader pauses). Then same
     verification, own commit.
  3. Housekeeping commit: git rm test/integration/probe-m5-builder.test.ts
     (one-off probe back in the gate folder); correct the wrong M5 numbers
     in status.md's Change Log (the 4,463/4,086/0.31/59.23% block was
     measured 2026-11-09 pre-fix, not the 2026-11-10 fix run - owner
     caught it; fix-run numbers: build 3,678, ctrl 4,618, build 5.77,
     idle 47.32%); the stale "M5 fix" roadmap item was already removed in
     8f6c631; add the "Feedback acknowledged" v9.3 entry.
- **M3 tower-energy fix (2026-11-11, DONE - pending full suite).** The M3
  acceptance failed on maxTowerEnergy 0 (needs >= 500). Root cause: the
  harvester delivery cascade was spawn -> extensions -> tower, so the tower
  only saw energy when the whole pool sat full - and the builder floor
  (BUILDER_WITHDRAW_FRACTION 0.5, since 5be99ae) pins the pool at ~half
  capacity, so the tower never filled. TOWER_ENERGY_RESERVE (500) is a fixed
  buffer per config.ts, not an overflow target. Fix: the delivery phase in
  src/roles/harvester.ts now tries the tower FIRST (only while below the
  reserve - a bounded fill that stops on its own), then the spawns, then
  the extensions, then drop. acceptance-m3 on the fix: 1 passing (18m),
  EXIT 0, maxTowerEnergy 0 -> 500; all other criteria unchanged (4
  extensions, capacity 500, 59 roads, 2/2 sources, 3 creeps). Probe
  probe-m3-tmp.test.ts removed. NEXT: agent-test start all (M1-M5
  regressions; M4 also asserts maxTowerEnergy >= 500); then update the
  M5 acceptance re-verification that was queued behind this.
- **M5 builder build-pace fix (2026-11-11).** The M5 gate unit-test failure
  (constructionManager C_ctrl source-container test) was ALREADY fixed in
  d1b130c (163 unit passing) - confirmed this run, so that gate is clear.
  The open M5 work is the builder build pace: an empty builder chased a
  single far energy drop (findClosestByRange, no range limit) across the map
  instead of the spawn 2-3 tiles away, so the first source container never
  finished in the 5000-tick test. Fix: BUILDER_DROP_PICKUP_RANGE (10 tiles)
  in src/config.ts, applied in runBuilder's drop-pickup phase (src/roles/
  builder.ts). Probe (700 ticks, M5 world): buildPerTick 0.86 -> 5.22, tower
  258 -> 1479, spawn idle-while-full 0.079 -> 0.011. Committed 688bf10.
  NEXT: M5 acceptance RUNNING on the fixed tree (acceptance-m5.test.ts,
  5000 ticks); if it passes, run the full suite for M1-M4 regressions, then
  update README + blog. If it still fails on minedShare/containers, the next
  lever is the L5 build order (source container behind the 3-extension
  floor).
- **M5 iteration per owner feedback v9.2 (2026-11-09, one change at a time).**
  The protected acceptance-m5.test.ts was missing from the working tree (parked
  2026-11-08, "the test comes back"); it was restored verbatim from the git
  history (0bffe66, 112 lines, 5000 ticks, 5 criteria - identical to the M5.md
  spec), so the baseline can run; the launcher re-restores the official copy at
  the gate. Protocol: step-0 baseline on the untouched tree, then one change
  per cycle, each verified against M5 AND M4 before the next change; every
  change gets a "Feedback acknowledged" line with commit + M5/M4 numbers.
  1. [x] Step 0 baseline: acceptance-m5 on 88fb080 as-is, 5000 ticks, FINISHED
     2026-11-09, 4 failing / 2 passing, verdict "static mining is not running":
     - failing: miner+container on a source for 100% of ticks 3000-5000 (0% -
       no container was ever built: the L4 extension-floor gate opened only at
       ~4700 when 3 extensions finished, container A projected ~5300);
       final-window harvested/tick >= 18 (measured ~6.7-11.1); final-window
       upgraded/tick >= 1 (measured ~0.22: controller 150->350 from tick 4000
       to 4900, ~0 for most of the run); spawn idle while store full <= 30%.
     - passing: avg dropped <= 300 (0.00 - no containers, so nothing drops);
       "all sources have containers (built or placed)" via SITES placed at t0.
     - Mechanisms: (1) L5 build order puts ramparts + the 3-extension floor
       ahead of the first source container; (2) the upgrader latches to the
       pocket source (2 standable tiles) that 5 bootstrap harvesters occupy
       forever, so it starves and has no container fuel path (spec: upgraders
       take energy from containers); (3) miner replacement lead and (4)
       hauler pick policy not observable (no container ever appeared).
  2. [ ] Change 1 (owner's idea a): first source container right after the
     towers at L5+, gated so M4 (also L5, intruder at 5400) stays green.
     Original implementation 5d4b87e (CONTAINER_EARLY_MIN_LEVEL, container-first
     branch in builder.ts) passed M1-M3 (history.csv 11-10) but was never
     M5/M4-verified. Refined 2026-11-10 (run 1, committed 7dc4775) into the
     SCOPED version: at L5+ the first container leads the build queue only
     while zero containers are built (containerFirstForRoom, case 4); once it
     is up, the M4 3-extension floor (CONTAINER_BOOST_MIN_EXTENSIONS_L4)
     re-gates the queue so the extensions cannot starve.
     hasPriorityBuildSites swaps upgraders to builder work for the first
     container site at L5+ (whole crew on the 5,000-energy site). Crew
     scaling in spawnManager.ts: uncovered sources keep 2 harvesters at L4+
     (UNCOVERED_SOURCE_HARVESTERS_L4) because the miner body tops out at
     2-3 WORK there, a spare hauler rides along at L4+
     (CONTAINER_HAULER_SPARE); SURPLUS_BUILDER_MAX raised 3 -> 5.
     M5 baseline (pre-fix, 5000 ticks, 22m, EXIT 1, recorded last run):
     5 of 10 criteria fail - minedShare 0.585 (< 0.6), harvested 10.13
     (< 13), upgraded 0 (< 1), spawn-idle-full 0.942 (> 0.3), avgDropped
     617 (> 300); 1 container built, 0 extensions, pool pinned 300/300,
     build 2.64/tick, RCL 5(0), 13 creeps (harvester 3, builder 5,
     upgrader 2, miner 1, hauler 2), maxContainerEnergy 1354. Post-fix M5
     re-run (this run, 22m, EXIT 1, "0 passing, 1 failing"): identical
     last-window numbers - first failing assertion minedShare 0.5853 <
     0.6 (full breakdown in item 5). M4 regression RUNNING (started
     05:06); the builder fix (the only uncommitted code change) gets
     committed after it.
  3. [ ] Change 2 (owner's idea b): spend surplus energy on upgraders -
     the upgrader withdraws from containers (not the spawn/extensions) and
     the spawn manager adds a surplus upgrader while the pool is full and a
     container holds more than half its capacity. Target: upgraded/tick
     0.22 -> >= 1 and a lower spawn-idle-full.
  4. [ ] Change 3 (owner's idea d): controller-area container - the
     construction manager places and the builders finish a third container
     within range 3 of the controller; the hauler delivers there when the
     pool is above its floor and the upgrader withdraws from it, so the
     upgrader stops walking 24 tiles per load (the step-0 run's upgrader
     starved because its fuel source was across the room).
  5. [ ] Change 4 (pool drain - not an owner idea, forced by step-0's
     spawn-idle-full failure). ROOT CAUSE FOUND (2026-11-10 run 2): not a
     crew-size problem but a logic bug in src/roles/builder.ts - the
     withdrawal phase checked spawn/extension store.getFreeCapacity(energy)
     > 0 before withdrawing, which is the inverted check: a full spawn has
     zero free capacity, so the builders skipped the very structures that
     hold energy and fell through to self-harvesting (far source, 24+ tick
     walk), returning full to a full spawn they could not transfer into.
     FIX APPLIED this run: the check now uses getUsedCapacity (spawn and
     extension loops); regression unit test "withdraws from a FULL spawn
     above the floor instead of self-harvesting" added
     (test/unit/builder.test.ts), 142 unit passing, lint + build clean.
     M5 re-run on the fix FINISHED (5000 ticks, 22m, EXIT 1, "0 passing,
     1 failing"): the fix is provably active in-game - the pool is no
     longer pinned, it sawtooths (samples 169/300 at 2000, 108/300 at
     3300-3400, 58/300 at 3800; pre-fix the pool could not fall below the
     spawn-spending dips at all) - but EVERY last-window (4000-5000) M5
     metric is unchanged from the pre-fix baseline: harvested 10.13 (< 13),
     upgraded 0 (< 1), build 2.64, spawn-idle-full 0.942 (> 0.3),
     minedShare 0.585 (< 0.6), avgDropped 617 (> 300), maxContainerEnergy
     1354, 1 container built (~3900), 0 extensions (capacity 300 at end),
     RCL 5(0), 13 creeps (harvester 3, builder 5, upgrader 2, miner 1,
     hauler 2). First failing assertion: minedShare 0.5853 < 0.6.
     WHY UNCHANGED: the steady state re-converges. Hauler + harvester
     delivery (~8-9/tick) outpaces the walk-limited builder drain (build
     2.64/tick), so the pool ends at its 300 cap in 94 % of the last
     window (samples 4100-5000 all 300/300, spawn idle) exactly as pre-fix.
     The real M5 bottlenecks, in order: (1) 0 extensions ever built at
     L5, so capacity stays 300 and the M4 3-extension floor that gates the
     second container never opens - whether the extension SITES were even
     placed is unverified (this M5 run wrote no report file: the harness
     could not parse the mocha result of the long run, so the per-type
     site count is unknown; needs a probe); (2) upgrader latch starvation
     (upgrade 0); (3) miner is 1 WORK at capacity 300 (2/tick) so harvest
     tops out ~10; (4) hauler ground-pickup missing (dropped 617).
     M4 regression RUNNING (started 05:06); commit after it.
  6. [ ] Change 5 (owner's idea c): hauler ground pickup - pick up energy
     dropped on/near source tiles before collecting from the container
     (safety net for the avg-dropped criterion; passes at 0 in step 0).
  - Each change: unit test, lint + build + unit, M5 acceptance, M4 acceptance
    (regression), then commit with before/after scorecard numbers.
  - Baseline M4 guard: last pass 88fb080 (2026-11-09 18:43) - must re-pass
    after every change.
  - Order deviation from the feedback list (a, b, c, d) is justified by the
    step-0 numbers: drops pass at 0, so c is last; b and d are the two
    criteria that need energy-flow changes (upgraded 0.22 -> 1,
    idle-full -> <= 30 %). Harvest margin depends on the miner body ladder
     (5W = 10/tick per source is the spec body; verify the ladder while
     change 1 verifies).
- **M5 construction priorities (previous run, complete in 88fb080).**
  The M4 replay ended at the reverted step 6 (unconditioned L4+ container boost
  failed M4: extensionsBuilt 1, capacity 350). That run re-applied the boost
  with the M4 safety gate and the L4+ pocket-tile ownership:
  1. [x] Gate constants in src/config.ts: CONTAINER_BOOST_MIN_LEVEL (4) and
     CONTAINER_BOOST_MIN_EXTENSIONS_L4 (3 - exactly the M4 floor of "at least
     3 extensions finished", so the boost cannot starve the third extension).
  2. [x] containerFirstForRoom in src/roles/builder.ts: case 3 - at level 4+
     the container leads the crew once 3+ extensions are BUILT; level 3 keeps
     the M3 contract (returns false). Unit tests: the boost arms at 3 built
     extensions and stays off at 2.
  3. [x] L4+ pocket-tile ownership in src/managers/constructionManager.ts:
     placeContainerSites takes a road-network tile directly at level 4+
     (removing an unbuilt road site - in the static-mining rooms
     shouldPlaceRoadSites gates the network off while the extension queue
     stands, so the built road the below-L4 wait expects may never come);
     placeRoadSites skips its legacy container-swap on that tile at level 4+,
     so the network keeps its gap (the in-game flood fill counts container
     sites as road tiles, connectivity reads as connected either way). Below
     level 4 the M3 road-first contract is unchanged. Unit tests: the
     below-L3/L4 withhold-takeback pair plus the two L5 container-takes-tile
     cases.
  4. [x] M4 acceptance run (regression check) - PASSED 2026-11-09, 1 passing (28m),
     EXIT 0 on the M5 tree. Snapshot: extensionsBuilt 3, extensionSites 27,
     energyCapacity 450, towers 2/2 ramparted, maxTowerEnergy 592, intruder gone
     in 1 tick (firstHostile 5401), farthestFromSpawn 8, 0 console errors.
     Scorecard vs the d3ed9e6 baseline: harvested 13.05 -> 12.1/tick, wasted
     7,482 -> 7,710, construction 5.21 -> 5.42/tick, delivered 1.71 -> 2.26/tick,
     creep idle 34 % -> 31 %, spawn idle 70 % -> 59 %, CPU 2.31/28.41 ->
     2.46/28.65, RCL 5/550 identical. Expected deltas: the boost arms at tick
     ~5300 (third extension) and the window's build energy goes to the
     container (4,986) instead of a fourth extension (375); the container is
     built by ~5900 and miner + hauler creeps appear at the end - exactly the
     M5 static-mining behavior, and M4 has no container or road-reach criteria
     (its "roads reach" line 2 of 2 -> 1 of 2 is informational: the pocket
     source now has the container instead of the road tile).
  5. [ ] Full suite (agent-test start all) and commit.
- **M4 replay (completed 2026-11-09; M5 now unblocked).**
  One M4 acceptance run (agent-test, ~30 min) after every step; each passing step is
  committed with before/after numbers, each failing step is reverted and its numbers
  noted here and in the Change Log. Cherry-picked commits: only the files the step
  names are kept, the stale reports/ files from those commits are dropped.
  1. [x] Step 0 baseline: acceptance-m4 on 040eef6 as-is - PASSED 2026-11-09
     04:54 (6001 ticks, EXIT 0): harvested 9.84/tick (last 1000), construction
     4.14/tick, wasted-at-regen 8,332, 4 extensions + 26 sites, capacity 500,
     RCL 5/500, CPU 2.22 avg / 29.53 max, 0 console errors. Snapshot: 2
     towers with ramparts, mode peace, safe mode 0 ticks, intruder gone in
     1 tick, maxTowerEnergy 543. Scorecard identical to the 2026-11-04
     reference (all "Change" columns 0) - the reset restored the last
     known-good state exactly.
  2. [x] Step 1 blog: git checkout backup/m4-attempts-2026-11-08 -- blog/
     test/unit/blog.test.ts (unit tests only, no M4 run), commit - done
     2026-11-09, commit 2968c46 (three rewritten posts + the
     corruption-guard test; 109 unit passing).
  3. [x] Step 2 container wins the tile: cherry-pick fff12dc - committed
     as a87ecf7 (src/managers/constructionManager.ts + its unit tests
     only, reports/ dropped); 111 unit passing, lint and build clean. M4
     acceptance PASSED 2026-11-09 05:24 (1 passing, 6001 ticks, EXIT 0):
     harvested 9.84/tick, construction 4.14/tick, CPU 2.22/29.53 ->
     2.17/28.45; roads 59 -> 58, reach 2 of 2 -> 1 of 2 (the container
     site takes a road tile; harness flood-fill artifact, M4 asserts no
     road reach) - step complete.
  4. [x] Step 3 hauler: a55af67 (state machine) + 2f6ed80 (faults 2-4) - only
     src/roles/hauler.ts, its unit tests, and the hauler count (one per source
     container).
     3a DONE 2026-11-09: clean cherry-pick of a55af67 as 8364c5e (its
     parent cad8c5b touched none of the three files, so it applied onto the
     a87ecf7 tree with zero conflicts): src/roles/hauler.ts rewritten to the
     collect/deliver state machine (memory.delivering latch, collection from
     source containers only), src/types/memory.ts +delivering, new
     test/unit/hauler.test.ts (4 tests); lint and build clean, 115 unit
     passing. M4 acceptance PASSED 2026-11-09 05:58 (1 passing, 6001 ticks,
     EXIT 0): harvested 9.84/tick, construction 4.14/tick, wasted-at-regen
     8,332 - all identical to the step-2 baseline; CPU 2.17/28.45 ->
     2.2/28.79; extensions 4, capacity 500, RCL 5/500, roads 58, 0 console
     errors. Snapshot: 2 towers with ramparts, mode peace, intruder gone in
     1 tick, maxTowerEnergy 543, 10 creeps (peak 11). The state machine is
     behavior-neutral at this stage (no hauler row or delivery-group change
     yet - that is 3b).
     3b DONE 2026-11-09: 2f6ed80 applied as 9e33c99 - the four
     blob-identical files (hauler.ts, spawnManager.ts, hauler.test.ts,
     spawnManager.test.ts) via git checkout 2f6ed80 -- <file>, and
     TOWER_REFILL_PRIORITY_ENERGY appended to config.ts by hand (git
     cherry-pick takes no pathspec; every blob verified against the
     target, config.ts differs only by the cad8c5b block step 6 takes
     back). Lint and build clean, 121 unit passing (115 + 6). M4
     acceptance PASSED 2026-11-09 06:27 (6001 ticks, EXIT 0, 1584 s):
     harvested 9.84/tick, construction 4.14/tick, wasted-at-regen 8,332,
     capacity 500, RCL 5/500 - every scorecard line identical to the
     step-3a run; CPU 2.2/28.79 -> 2.17/30.47; 4 extensions + 26 sites,
     2 towers with ramparts, mode peace, intruder gone in 1 tick, 10
     creeps (peak 11), 0 console errors. The hauler changes are dormant
     during M4 (no source container built in the window -> minerCount 0
     -> no haulers), so parity is expected.
  5. [x] Step 4 builder: 3c9a132 - skip obstacle sites with a creep on them, keep
     the energy on ERR_INVALID_TARGET.
     4 DONE 2026-11-09 (code, pre-M4): applied manually as 7232135 (git
     cherry-pick takes no pathspec, so hunk by hunk, as in steps 3a/3b):
     src/managers/constructionManager.ts gets the SPAWN_KEEP_CLEAR_RANGE
     import plus the parking-ring skip in computeExtensionPositions and
     computeTowerPositions; src/roles/builder.ts gets isBlockedByWaitingCreeps,
     the excludeIds parameter on selectBuildSite, the blocked-tile filter on
     the inline extension block (the focusExtension closure does not exist
     pre-M5 - the equivalent filter went on sitesOf(STRUCTURE_EXTENSION)
     directly), and the ERR_INVALID_TARGET retry that keeps the load and
     builds the next best site (the waitRoads hunk was skipped:
     containerWaitRoadSites is M5 rework not in the six commits);
     src/config.ts gets SPAWN_KEEP_CLEAR_RANGE = 1; test/unit/builder.test.ts
     gets ERR_INVALID_TARGET/LOOK_CREEPS, the lookFor default on pos(), the
     two globals, and the three deadlock tests (adapted to the pre-M5
     makeCarryingBuilder mock - its find already applies opts.filter, so the
     excludeIds path is exercised); test/unit/constructionManager.test.ts
     gets the spawn-parking-ring describe block at EOF (verbatim - all its
     helpers already existed). Verified every residual diff against
     3c9a132 is only previously-excluded M5 rework. Lint and build clean,
     126 unit passing (121 + 5). M4 acceptance PASSED 2026-11-09 (6001
     ticks, EXIT 0): harvested 9.84 -> 13.05/tick, construction 4.14 ->
     5.21/tick, wasted-at-regen 8,332 -> 7,482, delivered-to-spawn 1.54
     -> 1.71/tick, creep idle 39 % -> 34 %, capacity 500, RCL 5/500 ->
     5/550, CPU 2.17/30.47 -> 2.34/28.6, roads 58, 0 console errors;
     4 extensions + 26 sites, 2 towers with ramparts, 11 creeps (peak
     11). The builder deadlock fix moved every economy line at once -
     step complete.
     PRE-ANALYSIS (verified against the tree): the 3c9a132 base carries
     EXCLUDED intermediate-commit code (extensionFloorState,
     containerWaitRoadSites, dynamicCostCallback), so three spots need
     manual resolution; the rest applies.
     - constructionManager.ts import line: keep our set, DROP
       EXTENSION_PRIORITY_MIN (not in our config), ADD SPAWN_KEEP_CLEAR_RANGE
       -> `import { RAMPART_MIN_LEVEL, SPAWN_KEEP_CLEAR_RANGE,
       TOWER_SITE_DEEP_CANDIDATES, TOWER_SITE_DEEP_RANGES, TOWER_SITE_RANGES }
       from "config";`. Both body hunks (skip the spawn ring in
       computeExtensionPositions and computeTowerPositions) anchor on text
       present in our file.
     - builder.ts: (a) insert isBlockedByWaitingCreeps after the
       upgraderBelowMinimum import (our file has no dynamicCostCallback
       import - drop that context line); (b) selectBuildSite gains the
       excludeIds parameter, the sitesOf filter and the @param doc line
       (anchors present); (c) SKIP the waitRoads filter hunk - our tree has
       no containerWaitRoadSites class (excluded intermediate change);
       (d) SKIP the focusExtension hunk as-is and apply the equivalent to
       our INLINE extension block: `const extensionSites =
       sitesOf(STRUCTURE_EXTENSION).filter((site) =>
       !isBlockedByWaitingCreeps(site, creep));` (our 040eef6 layout has no
       focusExtension closure); (e) the ERR_INVALID_TARGET retry block in
       runBuilder (anchors present).
     - config.ts: SPAWN_KEEP_CLEAR_RANGE after the TOWER_SITE_DEEP_CANDIDATES
       line - clean (context matches).
     - builder.test.ts: ADD `const ERR_INVALID_TARGET = -8;` (after
       FIND_SOURCES) and `const LOOK_CREEPS = 2;` (after TERRAIN_MASK_WALL) -
       our file lacks the LOOK_* constants the base has; ADD
       `lookFor: (): any[] => []` to pos(); ADD global.LOOK_CREEPS and
       global.ERR_INVALID_TARGET to beforeEach (after global.OK); the three
       new deadlock tests insert between "equal progress goes to the
       spawn-side site" (line 415) and "keeps the extension ahead of a
       container site in a fresh bootstrap room" (line 418) - clean.
     - constructionManager.test.ts: appends the "manageConstruction spawn
       parking ring" describe (2 tests) at EOF - clean (our file ends with
       the contested-pocket describe, all helpers present).
  6. [x] Step 5 parking: b00c0e1 - parking area outside the extension field.
     M4 FAILED (extensionsBuilt 1 vs 3, capacity 350 vs 450); reverted per
     owner protocol (0ce4712). Numbers and mechanism in the Change Log and
     Known Issues.
     5 CODE APPLIED 2026-11-09 (this run, pre-M4): the four blob-identical
     files (src/roles/harvester.ts, src/roles/miner.ts, src/types/memory.ts,
     test/unit/harvester.test.ts) via git checkout b00c0e1 -- <file>;
     manual hunks on src/config.ts (PARKING_RING_START/PARKING_RING_END at
     EOF), src/roles/hauler.ts (getParkingPosition import + parkNearSpawn
     parks on the cached tile, spawn-ring fallback only without a cache),
     src/managers/constructionManager.ts (four parking functions before
     manageConstruction, ensureParkingPosition call at the end of
     manageConstruction, the two config import names) and
     test/unit/constructionManager.test.ts (per-test Memory hook + parking
     describe, 4 tests). Verified every residual diff against b00c0e1:
     only excluded M5-era changes remain (EXTENSION_PRIORITY_MIN,
     CONTAINER_FIRST_MIN_LEVEL, road-first container strategy, pathfinding
     callbacks, four-builder row). Parking tile cached in
     Memory.rooms.parkingPos; roles fall back to the spawn ring when there
     is no cache or no Memory. Harvester "nothing could take the load"
     now parks with the load instead of dropping it. Lint and build clean,
     130 unit passing (126 + 4). M4 acceptance FAILED (extensionsBuilt 1
     vs 3, capacity 350 vs 450, every other criterion passing); reverted
     with git revert 06733fc -> 0ce4712 per the owner's protocol - see
     the Change Log and Known Issues for the numbers and the measured
     mechanism (the lost ground-pickup energy path).
     PRE-ANALYSIS (verified against the post-3b/4 tree): harvester.ts,
     miner.ts, types/memory.ts and test/unit/harvester.test.ts are
     blob-identical to the cherry-pick base - clean. config.ts appends
     PARKING_RING_START/PARKING_RING_END after TOWER_REFILL_PRIORITY_ENERGY
     (the EOF after steps 3b+4) - clean. hauler.ts has exactly two
     conflicts (its base carries the excluded 7abe755 dynamicCostCallback
     change): the import block (ADD `import { getParkingPosition } from
     "managers/constructionManager";`, do NOT add the pathfinding import)
     and parkNearSpawn (ADD the parking block before the spawn fallback,
     keep the fallback WITHOUT the costCallback option).
     constructionManager.ts: one conflict - the import line (ADD
     PARKING_RING_END, PARKING_RING_START to the step-4 result, still
     without EXTENSION_PRIORITY_MIN); the four new functions
     (parkingExcludedTiles, isParkingTileFree, getParkingPosition,
     ensureParkingPosition) insert at the base's exact anchor (right before
     the manageConstruction doc comment - the same adjacency in our file),
     and the ensureParkingPosition call appends to manageConstruction (the
     roadNetworkTiles/extensionPositions/towerPositions/containerPositions
     variables all exist at lines 1222/1272/1247/1282).
     test/unit/constructionManager.test.ts: +109 lines of parking tests
     (clean once step 4's describe is in place). Also: the harvester's
     "nothing could take the load" branch changes from drop() to
     parkWithLoad() (energy stays in the carry, creep parks at the parking
     area) - in harvester.ts, clean per above.
  7. [x] Step 6 LAST source container: cad8c5b - the source container right after
     the first tower at level 4+. Code re-applied on the step 4 tree as e996131
     (byte-identical to the earlier bf9b796 application; 128 unit passing). M4
     acceptance FAILED 2026-11-09 in the full suite (the step 6 check): extensionsBuilt
     1 vs 3, energyCapacity 350 vs 450, every other criterion passing (level 5,
     towersBuilt 2, towersWithRampart 2, maxTowerEnergy 1000, intruder killed in 1
     tick, mode peace, 9 creeps). Mechanism: the level-4+ container-first order puts
     both source containers (10,050 build energy with the M3 pocket road) ahead of
     the extension queue - first extension at ~tick 5,550 vs ~3,350 on the step 4
     tree, so only 1 of 29 extension sites finishes in the window. Reverted per the
     owner's protocol in 92f465f (the three step 6 files back to the pre-step-6
     state; 127 unit passing) - NOT repaired, the owner decides. Per feedback v9.1
     ("If M4 fails after it, revert it, write the numbers in status.md and stop
     there") the replay ENDS here: steps 1-4 in and M4-verified, steps 5 and 6
     reverted, M5 unblocked. Final full-suite re-verification on the reverted tree
     running (gate before the push).
     GATE FIX 2026-11-09 (before the step 6 M4 run): the full-suite gate on
     e996131 failed M3 (sourcesConnected 1 of 2 - the step 2 container site
     owns the pocket tile (40,13), Source B's only walkable neighbour, and
     the M3 flood fill counts roads only). Fixed by inverting the
     contested-tile ownership in constructionManager.ts (road wins the
     tile, container waits for the built road, then the two coexist);
     129 unit passing. M3 re-run PASSED 2026-11-09 (1 passing, 18m,
     EXIT 0, sourcesConnected 2 of 2, roadTiles 59, strayRoads 0);
     full suite running (covers the step 6 M4 run).
     PRE-ANALYSIS (verified): the cherry-pick base for src/roles/builder.ts
     IS our current blob (af1a44d), so after step 4's manual edits the only
     overlap is the selectBuildSite doc comment - step 4 adds the @param
     excludeIds line BELOW cad8c5b's hunk context, so both land. Hunks:
     header doc renumber (1-7) clean; CONTAINER_FIRST_MIN_LEVEL added to the
     config import (our import already has all three CONTAINER_BOOST_*
     names, lines 114-116) clean; the new level-4+ container branch inserts
     after the towerSites return clean; the old `const containerSites =
     sitesOf(STRUCTURE_CONTAINER);` line moves up (context present) clean.
     config.ts: CONTAINER_FIRST_MIN_LEVEL block inserts between
     CONTAINER_BOOST_MAX_LEVEL (line 226) and the container-priority-gate
     comment - a different anchor than step 4's, no overlap - clean.
     builder.test.ts: two new tests insert between "no container boost at
     level 3 without a built container" (line 472) and "hands the crew to
     the container once the bootstrap minimum is met" (line 475) - clean.
- **Run (2026-11-03): M4 energy-deadlock regression fixed - awaiting the M4
  acceptance result.** The e073eed M5 prereq made the pre-container upgrader
  body 200 energy ([W,C,M]) at 300 capacity, so the upgrader spawned after
  one or two harvesters and its building work (capped by the builder role's
  50% withdrawal floor) pinned the store at ~149-198 for ~3,700 ticks -
  below the 300 the second harvester costs - and M4 failed with
  extensionsBuilt 1, expected 3 (reproduction run 11:32; the earlier
  "harvester-freeze flake" reading of the 07:24/07:57 failures was
  superseded by this measurement: the store timeline shows the pin, not a
  movement stall). Fix: the 300-energy [W,W,C,M] row is back in the
  pre-container upgrader table (src/managers/spawnManager.ts), the hold-back
  comment in src/roles/builder.ts is corrected, and the two unit tests that
  asserted the 200-energy body now assert [W,W,C,M]. Smoke verified
  byte-identical to the 6b3393d passing baseline; acceptance-m4 started
  13:15, commit after a green M4 + full suite.
- **Run (2026-11-02/03): feedback v8.6 URGENT items + controller sign — done.**
  URGENT 1 (colony died out): cold boot + income floor (edb614e) plus unit tests of
  the exact wipe scenarios from the feedback (4a706dc). URGENT 2 (no second tower in
  the owner's cramped room): the parity filter that silently skipped tower rings 3
  and 5 is removed, the search walks rings 2-5, the deep fallback rescans rings 2-8,
  and the last resort removes the nearest UNBUILT extension site (never a finished
  structure) — 1076de5 with 5 cramped-room unit tests; M4 acceptance re-verified
  this run (1 passing, 26 min): 12.66/tick, L5/444, 2 towers with ramparts, 0
  errors — unchanged vs baseline 06677ce (CPU avg 2.2 -> 2.28). Controller sign
  (small task): the upgrader signs CONTROLLER_SIGN_TEXT at range 1 while already on
  the upgrade round trip, never re-signs matching text — 4 unit tests plus a new
  800-tick integration test (test/integration/controller-sign.test.ts). Remaining
  v8.6 items for the next run, in order: M5 (run the owner's acceptance-m5 test if
  it exists, else the energy-budget work in the M5 note below) and the
  upgrader/defender body changes (M5 part).
- **Run 38 (2026-11-01): owner's URGENT edge-crash fix COMPLETE, gate fixed.**
  Items 1 + 2 (isValidTile bounds guard in constructionManager + main.ts
  per-room try/catch) were already in tree as 08424f2; kept. Item 3
  (edge-position unit tests) added in f695cfd: the PositionMock now throws for
  out-of-bounds like the real game, and three tests (x=3, y=46, corner 4,4)
  fail on the unguarded code and pass on the fixed code (78 unit passing, was
  75). The 20:16 gate failure (unvalidated RCL 1 builder minimum 5 + surplus cap
  300) was reverted to the verified-green 9df73af in 54fb465. Full suite verified this run:
  acceptance-m1..m4, smoke and spawnprobe all pass and the M1-M4 scorecards are byte-for-byte
  identical to the 21d2356 baseline, so the run 38 fixes changed no acceptance behaviour; the
  only failure is the M5 draft candidate (m5-candidate.test.ts), expected because M5 is
  unimplemented and it is not an acceptance gate. Remaining: M5 +
  surplus-energy spend (see the M5 item below) - no M5 acceptance test in this
  repo, so validate via the candidate/smoke/spawnprobe scorecards.
- **M5 (static mining) - BLOCKED on the owner's acceptance test (run 37 round
  2, 2026-11-01).** The test is not in this copy and agent-test refuses
  test/candidates/ paths, so M5 cannot be measured or ticked from this repo
  state. Next run, in order: (1) if the owner's acceptance-m5 test appears in
  test/integration/, run it with agent-test and fix the first failing
  criterion; (2) otherwise work criterion 1's energy budget - two containers
  adjacent to both sources within 3,000 ticks of an RCL 1 start while M2's
  extension + road minimum still finishes (10,000 energy of containers plus
  the extension, the road and all spawn costs out of ~12,000-18,000 harvest) -
  likely by splitting the builder crew across both container sites earlier
  instead of serializing them after every road; verify with the M2 and M3
  acceptance tests after any such change.
- **M3 regression (spawn minimums after the M5 merge) - DONE 2026-11-01.**
  Full suite after the M2 gate fix: M1 passing, M2 passing, M3 failing with
  "at least 3 extensions are finished - actual 1, expected 3" (and capacity 350 vs
  the required 450); the suite bailed at M3 (M4/smoke/spawnprobe did not run).
  Root cause (found via reports/history.csv and the pre-M5 scorecards, not the
  gate): M3 had never been run against the M5 code - its last run was
  2026-11-01 05:30 on commit 32706ac, BEFORE the M5 merge d108b29, and it passed
  with 5 harvesters / 10.46 harvested per tick / 4.06 construction per tick /
  4 extensions / capacity 500 at the end. d108b29 replaced the level-table
  harvester row (5 at RCL 3) with the per-source split: two container-less
  sources -> two harvesters. In the M3 world (RCL 3, containers last in the
  builder queue, so no container is ever built) the economy stayed at two
  harvesters for the whole 4,000-tick window: ~26,600 total build energy vs
  ~34,700 pre-M5, ending at 1 extension / capacity 350. The
  containerFirstForRoom gate is inactive in M3 (level 3 > CONTAINER_BOOST_MAX_LEVEL),
  so the M2 gate fix is not the cause.
  Fix: in minCreepsPerRole (src/managers/spawnManager.ts), while no container is
  built the harvester minimum is max(per-source split, level-table row) - the
  pre-M5 bootstrap economy (5 at RCL 3, 3 at RCL 2, 2 at RCL 1 = the split);
  once a container is built the M5 split applies (miners take the covered
  sources, no stacking a harvester on a mined source).
  Plan (each one commit):
  1. [x] Root cause via history.csv + pre-M5 scorecards + builder/spawn diffs.
  2. [x] Fix in minCreepsPerRole + config comment; lint clean, build clean, 75
     unit tests pass (the L2/L3 unit tests assert single-spawn decisions that
     hold for the higher minimum too).
  3. [x] acceptance-m3: PASSED (18m, 4,001 ticks, EXIT 0) - snapshot in the
     Change Log above; all 13 criteria met.
  4. [x] Full suite PASSED (75 + 8 passing, EXIT 0, 65m) - M1-M4 acceptance,
     smoke and spawnprobe all pass against the new minimums; scorecard numbers
     in the Change Log.
- M5 acceptance (owner's, 3,000 ticks): 2 containers adjacent to 2 sources, >= 60 % of the
  harvest ceiling, wasted-at-regen <= 15 %, upgrade >= 20 % of ceiling, no >150-tick idle
  spawn at full energy, CPU <= 10/tick. Its acceptance test is not in this copy of the
  repo (test/integration holds acceptance-m1..m4 only), so M5 stays unchecked in Upcoming
  Features until the owner's test can be run. Expected effect of the gate on the owner's
  M5 world (fresh RCL 1 stub): the first container now finishes only after the first
  extension + road (~tick 2,600-2,900 instead of ~tick 1,500) - the M5 criterion
  "two containers by tick 3000" is energy-budgeted beyond reach in that window while
  M2's extension + road minimum must also finish; the miner/hauler machinery goes live
  as soon as container one is done.

## Upcoming Features
- [x] M4 replay (completed 2026-11-09: steps 1-4 taken back and M4-verified; steps 5 and 6 each broke M4 and were reverted per the owner's protocol, unrepaired; the M3 gate break from step 2's contested tile fixed in 62963bc)
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [x] M3: build priorities, layout and a tower (completed 2026-10-30, acceptance 1 passing)
- [x] M4: Hold the room (level 5) - towers, ramparts, defend mode (completed 2026-10-31, acceptance 1 passing)
- [ ] M5: static mining with containers and haulers (UNBLOCKED - the M4 replay finished 2026-11-09; the parked acceptance test comes back per the owner before M5 starts. Construction-priorities step done 2026-11-09 in 88fb080: the container boost after the towers is gated on RCL 4+ and 3+ BUILT extensions so it cannot starve the M4 extension floor, and at RCL 4+ a container takes its road-network pocket tile directly - M4 acceptance re-verified 1 passing, 131 unit passing)
- [ ] CPU profiling and path caching (former M5, before the M4 renumber)
- [ ] Expansion to a second room (former M6, before the M4 renumber)

## Known Issues / Notes
- **Parked (2026-11-13, run 96): the previous run's unfinished M5
  experiment, reverted for the gate.** 6e5653c added a level-5
  MIN_CREEPS_BY_LEVEL row (builder 6) and LEVEL5_EXTENSION_FLOOR = 6 with
  the idea "six 4-WORK builders drain the store as fast as harvest refills
  it, so the store cycles instead of pinning full; an 18,000-energy
  six-extension floor buys the 600 capacity the static-mining bodies
  need". It was incomplete (the builder.ts ladder never used the new
  constant), untested, and it broke the unit gate (the surplus-upgrader
  test: with builder minimum 6 at RCL 5, three builders are below
  minimum, so the main loop takes the spawn slot). Reverted to 9a39e9e.
  If the M5 baseline of this run still shows a pinned-full store plus an
  idle crew, this idea may deserve a proper redo (ladder rung + min-creeps
  row + updated unit tests + M4/M5 verification); until then it is a note,
  not a plan.
- **M5 acceptance is failing (pre-existing since run 94, 2026-11-12) -
  out of scope for the M4 fix of run 96.** Latest full M5 run
  (b9a4099, started 2026-11-12 22:09, EXIT 1, snapshot at 5,000 ticks):
  harvestedPerTick 10.52 (needs 13), upgradePerTick 0.61 (needs 1),
  spawnIdleFullShare 50.7 % (max 30 %); minedShare 0.98 (passes 0.6),
  sourcesWithContainer 2/2, sourcesWithBuiltContainer 1/2, energy
  400/400 (the mini-floor's third-extension starvation, fixed in run 96
  and verified: M4 acceptance PASSED this run, capacity 450 at 6,000
  ticks), 21 creeps with 5 upgraders + 10 builders (the run 93/94
  surplus caps - the upgraders burn the pool faster than the harvest
  refills it, the same stall pattern as probe-m5-creeps: RCL 5/802,
  82 % creep idle). The failure is in the RCL 5 economy (harvest
  throughput, upgrade rate, idle-full share), not in the build order:
  the run 96 floor change restores the best-known M5 trajectory
  (1a1507d probe: 3 extensions/450 at 5,000, harvest 12.47, upgrade
  0.6, idle-full 68 %) without changing any of the economy code, so M5
  is expected to fail the same criteria with no regression. Fixing M5
  itself (harvest/upgrade/idle-full) is the next milestone's work.
- **Step 6 container boost (cad8c5b) broke M4 - reverted per owner protocol, NOT repaired
  (2026-11-09).** Re-applied on the step 4 tree as e996131 (128 unit passing); its M4
  acceptance ran in the 2026-11-09 full suite (7542b1f): FAILED, extensionsBuilt 1
  (needs 3), energyCapacity 350 (needs 450); every other M4 criterion passed (level 5,
  towersBuilt 2, towersWithRampart 2, maxTowerEnergy 1000, spawnHits 5000, spawnHasRampart,
  firstHostile 5401 / firstDefend 5401, intruder gone in 1 tick, intruderLeftRoom false,
  safeModeTicks 0, hostilesAtEnd 0, mode peace, 9 creeps, farthestFromSpawn 8). Mechanism
  (measured from the run's 100-tick samples): at RCL 5 the level-4+ container-first order
  queues both source containers (10,000 build energy, plus the 50-energy pocket road from
  the M3 fix) behind tower 1 and ahead of the extension queue, so the first extension
  finishes at about tick 5,550 instead of the step 4 run's ~3,350 (c924877: 4 extensions,
  capacity 500) - the extra 10,050 build energy is a ~2,200-tick delay at the measured
  ~4.5 build/tick, and only 1 of 29 extension sites finishes in the 6,000-tick window.
  This is the break the owner predicted for this step ("the most likely cause of the M4
  break, which is why it comes last"). Not repaired: feedback v9.1 says a failing step is
  reverted and the owner decides; the change is preserved on
  backup/m4-attempts-2026-11-08 as cad8c5b. Reverted in 92f465f (config.ts, builder.ts,
  builder.test.ts back to the pre-step-6 state; 127 unit passing). Per the protocol the
  replay ends here.
- **M3 road reach failed in the 2026-11-09 full-suite gate on e996131 -
  fixed and verified (2026-11-09).** The gate ran M1 and M2 (both
  passing) and failed M3 on "a connected road leads from the spawn to every
  source": sourcesConnected 1 of 2 (full snapshot in the Change Log; every
  other M3 criterion passing with margin). Root cause: replay step 2
  (a87ecf7, owner-specified fff12dc "container wins the tile") puts the
  container site on the contested pocket tile (40,13), Source B's only
  walkable neighbour, and the M3 harness flood fill counts built roads and
  road sites only - a container site on the endpoint tile disconnects
  Source B from the road network. The step 2 verification note called the
  scorecard's reach 2/2 -> 1/2 "a harness flood-fill artifact, M4 asserts
  no road reach" - true for M4, but M3 line 133 asserts exactly that, so it
  was a latent M3 break, not an artifact. Fix (this run): invert the
  contested-tile ownership - placeContainerSites takes the road-network
  tiles and withholds the site on a road tile until a built road is on it;
  placeRoadSites removes a legacy container site on a road tile and creates
  the road site; once the road is built the container site goes on the same
  tile (the engine allows a built road and a container to share a tile,
  construction sites cannot). The M5 property step 2 preserved still holds:
  the container ends up on the pocket tile, after the road is built. Safety
  checked and confirmed in the 2026-11-09 full suite: M2 passed (roadsBuilt
  11, 59 road tiles at end: 11 built + 48 sites), M3 passed with
  sourcesConnected 2 of 2 and
  roadTiles 59, and the M4 failure that run traces to the step 6 container
  order, not the M3 fix - the only failing M4 criterion was the extension
  count, and the measured delay (10,050 build energy of queued containers)
  dwarfs the 50-energy pocket road the fix adds.
- **Step 5 parking (b00c0e1) broke M4 - reverted per owner protocol, NOT repaired
  (2026-11-09).** Re-applied on the step 4 tree as 06733fc (130 unit passing), M4
  acceptance FAILED: extensionsBuilt 1 (needs 3), energyCapacity 350 (needs 450);
  every other criterion passed (level 5, towersBuilt 2, maxTowerEnergy 546,
  towersWithRampart 2, spawnHasRampart, firstHostile 5401, safeModeTicks 0,
  spawnHits 5000, 11 creeps, farthestFromSpawn 8). Live 100-tick samples: harvest
  oscillated 0-9.9/tick (the step 4 run held 11-12), the store cycled full ->
  drained, builders consumed ~2.5-3.5 build/tick (step 4: 4.1-5.2). Mechanism
  (measured, consistent with the code): with the store full the harvester now
  parks with the undeliverable load on the cached tile - rings 5-10 around the
  spawn, outside the extension field and off the builder's route - instead of
  dropping the energy near the spawn, where runBuilder's ground-pickup (builder.ts,
  "dropped energy on the ground, only when we have space") collects it on the way
  to the sites. The energy sits in the harvester carry and the builders
  self-harvest or wait, so the extension queue finishes slower over the 6,000-tick
  window. The original b00c0e1 commit message notes the same direction in the
  500-tick smoke (harvest 4.1 -> 3.66/tick); M4 just multiplies the cost. Not
  repaired: feedback v9.1 says a failing step is reverted and the owner decides;
  the change is preserved on backup/m4-attempts-2026-11-08 as b00c0e1.
- **m5-candidate.test.ts fails in the full suite - expected, not a regression (2026-11-01,
  run 38).** It is the human reviewer's DRAFT candidate for the M5 static-mining milestone
  (header: "not a replacement for it", "The agent must not edit this file"). It is not named
  acceptance-* and status.md records it as measured by scorecards, "not an acceptance gate".
  It fails because M5 (static mining on both sources) is not implemented: the 3,000-tick run
  ends at 1 of 2 containers, 1 miner, 9.82 harvested/tick (needs 12) and 0.05 controller
  progress/tick (needs 4). The M1-M4 acceptance scorecards are byte-for-byte identical to the
  21d2356 baseline, so the run 38 fixes (config revert + isValidTile guard) did not cause it.
  It will turn green when M5 is implemented; do not satisfy it by editing the test or by
  building M5 as part of the crash/gate-fix task.
- **Creep idle rose 8 % -> 22 % in the 500-tick smoke window (2026-11-01, post
  upgrader-hold-back).** The scorecard counts a creep tick as idle after 5+ consecutive
  ticks with no action event and no position change. The window is the last 200 ticks,
  and in this run the second builder and second upgrader spawn near its end (timeline:
  builder 2 and upgrader 2 first appear at tick 500, store pinned at 2/300 while the
  spawns process), while pre-fix only 3 creeps existed the whole window. My read: the
  late-window new creeps plus the store cycling 300 -> 2 on spawn costs (versus the
  pre-fix steady 146-196) create more stand-still stretches, e.g. a harvester arriving
  at a full spawn while the builder is away self-harvesting (store below the 150
  withdraw floor). Not yet decomposed per creep - the full suite's 700-tick spawnprobe
  (pre-fix baseline: idle 6 %) is the next measurement. If it stays in the single digits
  the 22 % is a short-window artifact of the late spawns; if it jumps, dig in with the
  per-tick creep status the scorecard already records (this.creepStatus in
  test/integration/scorecard.ts).
- **Construction 3.75 -> 2.01/tick in the same window (2026-11-01):** intended hold-back
  trade, not a regression to fix - builders self-harvest while the upgrader minimum is
  unmet (~tick 150-300) and only one builder is active in the last-200-tick window. The
  window's build energy now goes to the container site (401, 100 % of build energy)
  instead of roads (pre-fix: 1194 on roads, 0 on the container), which is the structure
  M5's acceptance test requires. RCL 2 (energy capacity 800) re-opens the builder's
  withdraw path with a 400-energy floor, so the rate should recover in longer runs.
- **Decision (2026-10-24): three builders, not the two rule 02b suggests.** The M3 acceptance test needs tower (5,000) + 3 extensions (9,000) finished inside 4,000 ticks of an RCL 3 start; measured ~1.75 progress/tick per builder, two builders cannot make that window. The M3 test (owner's acceptance criteria) wins over the 02b guideline; noted in the MIN_CREEPS_BY_LEVEL comment in src/config.ts.
- **Decision (2026-10-24): containers are the lowest build priority.** With roads above containers, a bootstrap colony finishes the first road before it touches the container site. That is what M2 (a finished road within 3,000 ticks of an RCL 1 start) requires. The trade-off is visible for M4, which needs containers adjacent to both sources by tick 3,000: when M4 work starts, selectBuildSite in builder.ts must gain a container-first path for the stage-2 economy (M4 spec redesigns the spawn manager into a priority list anyway).
- Energy delivery issue: previous scorecard showed 72.7 energy delivered/tick vs ~3 harvested (energy going in circles) - this is now fixed by hauler changes

## Feedback acknowledged
- Acknowledged 2026-11-12 (v9.4) - URGENT 1 (upgrader latch): done in
  73d682c - the work latch now gates the fetch phase (working with energy > 0
  -> upgrade at the controller without asking getEnergy; energy 0 -> working
  = false), so a half-full store no longer leaves the controller for a
  one-energy top-up. Unit tests (a)/(b) in the "work latch (owner feedback
  v9.4, URGENT 1)" describe of test/unit/upgrader.test.ts ("burns a half-full
  store instead of walking back for a top-up" and "closes the work cycle on
  an empty store and tops up from the container"). M5 numbers: upgrade
  0.05 -> 0.55/tick (URGENT 1 run), 0.43/tick (probe-m5-creeps,
  reports/latest.md - still below the 1.0 criterion, not reverted); harvest
  9.36/tick, spawn idle-while-full 59 %. M5 on the current tree (b9a4099
  run of 2026-11-12 22:09): upgrade 0.61/tick (need 1, still failing),
  harvest 10.52/tick, spawn idle-while-full 50.7 % (max 30 %, still
  failing); the floor-fixed tree's numbers come from this run's full suite.
- Acknowledged 2026-11-12 (v9.4) - URGENT 2 (builder order): done in the
  getEnergy rework (src/utils/energy.ts): the source-container rung (>=
  MIN_CONTAINER_WITHDRAW_ENERGY) now sits ABOVE the builder pool rung for
  builders (rung 4 before rung 5), so a builder that can refill at the
  container no longer competes with the income crew for the pool. Unit test
  in test/unit/builder.test.ts ("the source container beats the full pool":
  empty builder, full room, container with 1000 -> withdraws from the
  container, not the spawn). M5 before (18:31 gate per the v9.4 note):
  harvested 9.05/tick (need 13), upgrade 0.43/tick (need 1), spawn idle
  59 %, RCL 5/550. M5 after (b9a4099 run of 2026-11-12 22:09, the tree
  right before the run 96 floor fix): harvested 10.52/tick (need 13),
  upgrade 0.61/tick (need 1), spawn idle-while-full 50.7 % (max 30 %),
  minedShare 0.98, energy 400/400 at 5,000 ticks - improved on every
  failing criterion, M5 still EXIT 1. M4 result: the run 94 mini-floor had
  broken M4 (extensionsBuilt 2, capacity 400); the run 96 floor fix
  restores it - M4 acceptance PASSED this run (EXIT 0, extensionsBuilt 3,
  capacity 450), so the floor fix is kept, not reverted. The M5 "after"
  numbers on the floor-fixed tree come from the full-suite run.
- Acknowledged 2026-11-12 (v9.4) - minedShare > 0.6 (only if still failing
  after URGENT 1 and 2): not needed - the b9a4099 M5 run of 2026-11-12
  22:09 already gives minedShare 0.98 (passes the 0.6 criterion; source A's
  stationary miner, rung 2). No extra change made; the M4 floor fix of run
  96 does not touch the first source container (still rung 2).
- Acknowledged 2026-11-12 (v9.4) - cleanup probe-m5-builder: done in d0ec3a0
  (removed from test/integration/, the folder the gate scans).
- Acknowledged 2026-11-11 (v9.3): FEEDBACK v9.3 - the M5 regression has
  two causes: (1) builders/upgraders self-harvest when the pool is thin
  and a source container holds energy -> getEnergy(creep, role) shared
  utility, withdraw from source containers with >= 100 energy, idle
  instead of a partial-load source trip below 100; (2) hasPriorityBuild
  Sites pauses the upgrader for container sites -> remove rungs 3-4 (keep
  tower + first extension). Fix 1 done in b36207d (167 unit passing);
  Fix 2 applied in this run (166 unit passing, pending commit); M4 and M5
  acceptance verification in progress this run (the M4 gate failure at
  de5c985 - extensionsBuilt 1 of 3 - is checked against the fixed tree
  before anything is pushed).
- Acknowledged 2026-11-08 (v9.1): RESET - owner moved the M4 attempts to
  backup/m4-attempts-2026-11-08, reset main to 040eef6, parked M5 - doing the
  replay step by step; one line per replay step is added below as each step
  completes (done in which commit with numbers, or reverted with numbers).
- Replay step 1 (harvest-while-building, 862d07e): done in b5a1c63, M4 passing
  (harvested 11.83/tick, construction 13.69/tick, wasted 8,733, capacity 500).
- Replay step 2 (upgrader cap, e9c99e6): done in 2367768, M4 passing (harvested
  12.28/tick, construction 5.08/tick, wasted 8,215, capacity 500).
- Replay step 3a (tower energy floor, 4b8a604): done in e0f7858, M4 passing
  (harvested 12.23/tick, construction 6.06/tick, wasted 7,731, capacity 500).
- Replay step 3b (tower refill priority, 0e9962e): done in 1d299a8, M4 passing
  (harvested 12.27/tick, construction 1.38/tick, wasted 1,172, capacity 500,
  maxTowerEnergy 546).
- Replay step 4 (extension build priority, 278c0d1 + f192091): done in 7232135,
  M4 passing (harvested 13.05/tick, construction 5.21/tick, wasted 7,482,
  capacity 500).
- Replay step 5 (parking, b00c0e1): applied as 06733fc, M4 FAILED (extensionsBuilt
  1 vs 3, capacity 350 vs 450, all other criteria passing), reverted in 0ce4712 -
  NOT repaired, the owner decides.
- Replay step 6 (container boost, cad8c5b): re-applied on the step 4 tree as
  e996131, M4 FAILED in the 2026-11-09 full suite (extensionsBuilt 1 vs 3,
  capacity 350 vs 450, every other criterion passing), reverted in 92f465f -
  NOT repaired, the owner decides. Last step of the replay: the replay is
  complete and M5 is unblocked.
- Acknowledged 2026-11-03 (v8.6): URGENT — colony died out (no creep able to
  recover) - done: cold boot + income floor in minCreepsPerRole and the spawn
  decision in src/managers/spawnManager.ts (edb614e), plus unit tests of the
  exact wipe scenarios from the feedback (4a706dc, spawnManager suite 21
  passing). Optional item 5 (an integration test that wipes all creeps at tick
  1500) not done this run: the tower fix took priority, and per the new rules
  only passing tests go in test/integration - first step of the next run.
- Acknowledged 2026-11-03 (v8.6): URGENT — second tower never placed in the
  owner's cramped room - done in 1076de5: computeTowerPositions
  (src/managers/constructionManager.ts) drops the checkerboard parity filter
  (it skipped tower rings 3 and 5, the free ones in a cramped room) and walks
  rings 2-5 (TOWER_SITE_RANGES); placeTowerSites falls back to a deep re-scan
  of rings 2-8 (TOWER_SITE_DEEP_RANGES) when the engine refuses every primary
  candidate, and as a last resort removes the nearest UNBUILT extension
  construction site - never a finished structure - and builds the tower on its
  tile. 5 new cramped-room unit tests (unit suite 95 -> 99 passing with the
  sign tests); smoke unchanged (3.86/tick) and M4 acceptance re-verified
  (1 passing, 26 min: 12.66/tick, L5/444, 2 towers with ramparts, 0 errors).
- Acknowledged 2026-11-03 (v8.6): small task — controller sign - done:
  CONTROLLER_SIGN_TEXT in src/config.ts; the upgrader (the only role that
  parks at the controller) signs it while on the upgrade round trip -
  signController needs range 1 so a pending sign walks two tiles closer first,
  one action per tick, never re-signs when the text already matches, and a
  harvester is never diverted (runUpgrader + signController,
  src/roles/upgrader.ts). 4 new unit tests plus a new 800-tick integration
  test (test/integration/controller-sign.test.ts) that reads
  controller.sign from the sandbox.
- Acknowledged 2026-11-01 (v8): URGENT live crash - constructionManager built new
  RoomPosition from unchecked arithmetic near the room edge (items 1 + 2) - done:
  isValidTile guard in computeTowerPositions and computeRoadEndpoints (08424f2),
  main.ts per-room try/catch (08424f2), TEMP-DEBUG removed (6a038a1).
- Acknowledged 2026-11-01 (v8): URGENT crash item 3 - edge-position unit tests
  (x=3, y=46, corner 4,4) that fail on the old code and pass on the new - done
  (f695cfd): the PositionMock now throws for out-of-bounds like the real game;
  the tests throw "Invalid arguments in RoomPosition constructor" on the
  unguarded 9df73af code and pass on the fixed code (78 unit passing, was 75).
- Acknowledged 2026-11-01 (v8): M5 + energy (spend spare energy on more/bigger
  upgraders and builders, pick up dropped energy before harvesting) - not done
  this run: no M5 acceptance test in this repo copy (only
  test/integration/m5-candidate.test.ts exists), so there is no acceptance bar
  to validate against, and the previous attempt (RCL 1 builder minimum 1 -> 5)
  failed the unit gate. Next run: unit-test a surplus-energy spend (extra
  upgraders when containers/storage hold energy above a threshold, per rule
  02b) against the spawn manager before any integration change.
- Acknowledged 2026-11-01 (v8): rules - read FEEDBACK.md every run, one commit
  per fix, the full suite must pass, never break protected tests or config, no
  junk files, no TEMP-DEBUG in commits - process rules, followed in this run
  (crash fix + gate fix are separate commits 54fb465 / 6a038a1 / f695cfd;
  TEMP-DEBUG removed before committing).
- Acknowledged 2026-10-31: M4 "Hold the room (level 5)" is a new milestone - done: M4
  green on 2026-10-31 (acceptance 1 passing, full suite 8 passing; commits 2c081e3,
  f606551).
- Acknowledged 2026-10-31: junk files and probe-tmp hygiene - done: probe-tmp
  diagnostics removed and the folder gitignored (commit 2747be0); the probe-tower test
  was deleted in the same M4 fix run.
- Acknowledged 2026-10-31: M4 spec details (structure caps, tower priority, mode
  switching, safe mode) - done in the M4 work (commits 2e17160, 2c081e3, f606551).
- Acknowledged 2026-10-31: "worth fixing once M4 is green" - the spawn idles at full
  energy in the early game - done (commits d108b29, c2b9f5c, 9f0abcf): the M5
  minimums plus the container-first gate hold the smoke scorecard's "Spawn idle
  while energy is full" at 1 % (target below 20 %; 07:53 full-suite run, 500
  ticks, 0 console errors). The 700-tick spawnprobe window still shows 23 % - a
  longer window dominated by the late builder/upgrader spawns, tracked in Known
  Issues.
- Acknowledged 2026-10-31: rules - never edit protected tests, one commit per fix with
  scorecard numbers in the message - process rules, followed in this run.

## Concepts Explained
- **Creep memory**: Memory structure stored in Memory.creeps[creepName] that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick
- **Working flag**: State flag on creeps that determines whether they are gathering energy (working=false) or using it (working=true)
- **ERR_NO_PATH vs ERR_TIRED/ERR_BUSY**: ERR_NO_PATH means the path is permanently blocked; ERR_TIRED/ERR_BUSY mean the creep can't move this tick but should try again
- **Construction site / build progress**: the ghost outline placed before a structure exists; it only becomes a real structure once energy spent on it (build progress) reaches the structure's cost - progress on an unfinished site is worthless at the deadline
- **Energy capacity**: the total energy a room can hold at once (spawn 100 + 50 per finished extension); bigger capacity means bigger creeps
- **Priority class (design concept)**: grouping structure types so builders always finish every site in a higher class before touching a lower one; M3 runs tower > extensions > roads > containers
- **Manhattan diamond ring (M4 post, 2026-10-31)**: the set of tiles at a fixed Manhattan distance (|dx| + |dy|) from a point, shaped like a diamond on the square grid - how computeTowerPositions walks candidate tiles at range 2, then 3, then 4; the diagonal tiles of a "range 2" ring are only range 1 (Chebyshev) from a controller on the spawn's tile, so the search skips them

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
- **Root cause found (road disconnection)**: `placeRoadSites` skipped every tile in the computed *extension position list*, not just tiles that actually hold an extension. On W0N1 the 5th computed extension position is (14,21) - the shared trunk tile of the road network - so its road site was never created at any RCL (58 sites, 57 disconnected). A direct probe `createConstructionSite(14,21)` at tick 2 returned OK and the network became 59/0/0 (both sources + controller connected), confirming the tile itself is placeable.
- **Fix applied** (constructionManager.ts): the road network is now computed once per tick and passed as an exclusion set to `computeExtensionPositions`, `computeTowerPositions` and `computeContainerPositions`, so no structure is ever placed on a road tile. `placeRoadSites` no longer takes the extension list; it only skips tiles that actually hold a site or non-road structure, and re-attempts missing tiles every tick while the network is incomplete. `placeExtensionSites` now caps total extensions (built + sites) at 10. All temporary debug logging removed.
- Next: smoke test to confirm 59/0/0 connectivity, then the M3 acceptance test (4000 ticks) to check tower energy and build throughput.
- **M3 baseline (this run, 4000 ticks)**: towersBuilt 1, maxTowerEnergy 1000, roadShare 0, roads 59/0/0, sources 2/2, controller connected, farthest 6 - all layout/road/tower criteria pass. FAILS: extensionsBuilt 1 (need 3), energyCapacity 350 (need 450). Cause: with one builder (~1.75 progress/tick, spawn-fed) the tower (5000) consumed ~3450 ticks before extensions could start.
- **Economy plan for M3** (implement next): 3 builders and 3 harvesters from capacity 300 (config), harvesters get a fixed source assignment (fewest-assigned source at spawn, stored in creep memory) so source B is harvested too, and tower+extension sites become one priority class (closest wins, per the M3 spec wording). Owner rule #3 (builder withdraws only when room is completely full) stays as-is for this attempt: the sawtooth analysis says 3 builders + 3 harvesters pass even with it (builder duty ~25 % spawn-fed + 75 % self-harvest ~ 2.8-3.6 progress/tick). The 100-energy buffer relaxation stays as a documented fallback only if the measured run shows spawn starvation or a failing criterion.

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

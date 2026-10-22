# ScreepsAiSLP Status

## Current State
M3 in progress: build priorities, layout and a tower. M2 acceptance test was failing (no extensions built), M1 had issues with harvester freezing and energy going in circles. Fixes implemented:
- Harvester now drops energy and switches to harvesting when it can't reach spawn with ERR_NO_PATH or ERR_INVALID_TARGET
- Upgrader no longer takes energy from spawns (prevents energy going in circles), only harvests directly from sources
- All unit tests passing

## Change Log
### 2026-10-22
- Fixed harvester: drops energy when it can't reach spawn (ERR_NO_PATH/ERR_INVALID_TARGET) instead of freezing
- Fixed upgrader: no longer withdraws energy from spawns, only harvests directly from sources
- Updated unit test mock to include drop() method

### 2026-10-21
- Fixed M1 acceptance test: harvester now drops energy when it cannot deliver to any target, preventing it from freezing (standing still with unchanged energy for 30+ ticks)
- Changed harvester priority: spawn first, then extensions, then towers (was: extensions first)
- Added proper `range: 1` to moveTo calls for better creep movement
- When harvester is full but cannot upgrade controller, it drops energy and switches to harvesting mode
- Fixed M1 acceptance test: added ERR_NO_PATH and ERR_INVALID_TARGET constants to mock.ts
- Fixed unit test main.test.ts: creep mock now has required properties (store, pos, room) to prevent errors in harvester code
- All tests passing: 6 unit tests, smoke test, acceptance-m1 test

### 2026-10-20
- M2 acceptance test passes: 1 extension finished, 4 extension sites placed, 2 roads finished, 48 road sites placed, energy capacity 350
- All tests passing (6 unit tests + 4 integration tests)
- Blog posts verified - no backticks found in current versions

### 2026-10-21
- M1 acceptance test passes: 8 creeps (2 harvester, 2 hauler, 2 upgrader, 2 builder), RCL 2 reached at tick 640, 2986 energy harvested
- All tests passing (6 unit tests + smoke test + acceptance-m1 test)

### 2026-10-19
- Fixed M2 milestone: builders now continue building when sources are temporarily depleted
- Changed builder spawn energy requirement from 200 to 250 for better CARRY capacity
- Reordered builder body part creation to prioritize CARRY over WORK
- Added fix: when no active sources found, builder switches to building if it has energy
- Added proper error handling for ERR_NOT_ENOUGH_RESOURCES in build/repair actions

### 2026-10-18
- Added M2 extensions and roads management
- Created constructionManager.ts with functions to place extension and road construction sites
- Updated config.ts with TARGET_EXTENSIONS, ROAD_BUILD_INTERVAL, and ROADS_PER_INTERVAL constants
- Updated main.ts to import and call manageConstruction()

### 2026-10-17
- Fixed M1 issues per human review: status.md and blog post updated to correct MongoDB claim about integration tests
- Added Correction section to blog post documenting initial implementation bugs and fixes
- Fixed builder.ts to harvest from sources and use creep.store instead of spawn.energy/creep.carry
- Fixed harvester.ts to use upgradeController() instead of invalid transfer() on controller
- Removed eslint-disable comments and "as any" casts by using typed store API with proper type assertions
- Implemented working flag logic in harvester.ts, builder.ts, and upgrader.ts to decide between gathering and working based on store capacity
- Updated docstrings to reflect working flag behavior
- Fixed bugs in M1: harvesters now deliver energy to spawns/extensions first (not controller), upgraders now harvest themselves instead of withdrawing from spawns, spawning uses room.energyAvailable instead of spawn.energy, Memory.creepCounter is initialized, every creep body includes WORK/CARRY/MOVE

## In Progress
- M3: build priorities, layout and a tower

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [x] M1: basic economy and creep management (completed)
- [ ] M3: build priorities, layout and a tower (in progress)
- [ ] M4 containers and static mining
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- No path caching yet - will be added in M5
- Memory cleanup runs every tick - could be optimized in M5
- M3 acceptance test expected at least 1 builder but got 0 - need to fix builder spawning and construction priorities

## Concepts Explained
- **Creep memory**: Memory structure stored in Memory.creeps[creepName] that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick

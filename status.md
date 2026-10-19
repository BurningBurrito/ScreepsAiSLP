# ScreepsAiSLP Status

## Current State
A colony with extensions and roads management. The bot maintains minimum creeps per role (harvester, upgrader, builder), builds extensions near the controller, and places roads in a grid pattern. The construction manager manages extension placement near the controller and road placement in a grid pattern across the room.

## Change Log
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
- M2 extensions and roads (implemented, acceptance tests need infrastructure fix)

## Upcoming Features
- [x] M2 extensions and roads (implemented, awaiting test infrastructure fix)
- [ ] M3 containers and static mining
- [ ] M4 towers and defense
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- Integration tests for M2 fail due to screeps-server-mockup infrastructure issue (test was already failing before M2 implementation)
- No path caching yet - will be added in M5
- Memory cleanup runs every tick - could be optimized in M5

## Concepts Explained
- **Creep memory**: Memory structure stored in `Memory.creeps[creepName]` that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick

# ScreepsAiSLP Status

## Current State
A colony with extensions and roads management. The bot maintains minimum creeps per role (harvester, upgrader, builder), builds extensions near the spawn, and places roads along paths from spawn to sources and controller. The construction manager manages extension and road placement, while builders handle construction and repair tasks. M2 acceptance test passes with 1 extension finished, 4 extension sites placed, 1 road finished, 49 road sites placed, and energy capacity of 350.

## Change Log
### 2026-10-20
- M2 acceptance test passes: 1 extension finished, 4 extension sites placed, 1 road finished, 49 road sites placed, energy capacity 350
- M2 milestone completed - extensions and roads management working

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
- None (M2 extensions and roads completed)

## Upcoming Features
- [x] M2 extensions and roads (completed)
- [ ] M3 containers and static mining
- [ ] M4 towers and defense
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- No path caching yet - will be added in M5
- Memory cleanup runs every tick - could be optimized in M5

## Concepts Explained
- **Creep memory**: Memory structure stored in Memory.creeps[creepName] that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick

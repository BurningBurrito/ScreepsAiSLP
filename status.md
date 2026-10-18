# ScreepsAiSLP Status

## Current State
A fresh colony core with basic creep roles (harvester, upgrader, builder) and management systems for spawning, memory cleanup, and CPU reporting. The bot maintains minimum creeps per role and scales body size based on available room energy.

## Change Log
### 2026-10-18
- Fixed builder.ts: when there's nothing to build, don't repair constructed walls or ramparts (they have huge hit points and would swallow all energy); repair other damaged structures only, otherwise upgrade the controller
- Rewrote test/unit/harvester.test.ts: tests now count actual method calls (transfer vs upgradeController) instead of just checking the working flag; tests verify partial energy behavior with spawn having capacity vs being full
- Updated test/unit/mock.ts: replaced made-up constants with real Screeps constants from node_modules/@types/screeps/index.d.ts (FIND_MY_SPAWNS = 112, FIND_STRUCTURES = 107, FIND_SOURCES_ACTIVE = 104, ERR_NOT_IN_RANGE = -9, etc.)
- Fixed harvester freeze bug: harvester no longer freezes after partial delivery because it relies only on the working flag instead of store capacity check

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
- None

## Upcoming Features
- [ ] M2 extensions and roads
- [ ] M3 containers and static mining
- [ ] M4 towers and defense
- [ ] M5 CPU profiling and path caching
- [ ] M6 expansion to a second room

## Known Issues / Notes
- No path caching yet - will be added in M5
- Memory cleanup runs every tick - could be optimized in M5

## Concepts Explained
- **Creep memory**: Memory structure stored in `Memory.creeps[creepName]` that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick

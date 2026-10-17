# ScreepsAiSLP Status

## Current State
A fresh colony core with basic creep roles (harvester, upgrader, builder) and management systems for spawning, memory cleanup, and CPU reporting. The bot maintains minimum creeps per role and scales body size based on available room energy.

## Change Log
### 2026-10-17
- Created M1 core economy: status.md, src/types/memory.ts, src/config.ts, src/managers/memoryManager.ts, src/managers/spawnManager.ts, src/roles/harvester.ts, src/roles/upgrader.ts, src/roles/builder.ts, src/managers/cpuReporter.ts
- Updated src/main.ts to use new module structure with ErrorMapper.wrapLoop
- Updated test/unit/main.test.ts and test/unit/mock.ts to match new code structure
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
- Integration tests require MongoDB which is not available in this environment; unit tests pass successfully
- No path caching yet - will be added in M5
- Memory cleanup runs every tick - could be optimized in M5

## Concepts Explained
- **Creep memory**: Memory structure stored in `Memory.creeps[creepName]` that persists creep state across ticks
- **Global reset**: Screeps server restarts all code at any time, losing module-level variables; only Memory survives
- **CPU bucket**: Unused CPU accumulates in a bucket (max 10,000) allowing bursts of up to 500 CPU per tick

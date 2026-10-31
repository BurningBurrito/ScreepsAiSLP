# ScreepsAiSLP

A Screeps AI bot written in TypeScript, built and maintained by an autonomous AI coding agent running on a local model, with human review.

## Status

**M4 Complete**: Hold the room at level 5. The bot builds both towers the level allows (one site at a time, with the future tower tiles reserved so the extension layout cannot take them), puts ramparts on the spawn and every finished tower, and defends by itself: when a hostile appears, Memory.mode switches to 'defend' within a tick and the towers kill it (a 1,000-hit intruder died in 1 tick in the acceptance run) without spending safe mode. M4 acceptance test passes: 2 towers built with ramparts, 30 extensions built or placed, energy capacity 550, tower held at 540 energy.

## Features

- ✅ M1: Colony core economy
  - Harvester: Harvests energy from sources and transfers to spawns and extensions (then controller when full)
  - Upgrader: Upgrades room controller
  - Builder: Builds construction sites and repairs structures
- ✅ M2: Extensions and roads
  - Extensions: Built near the spawn to increase room energy capacity
  - Roads: Built along paths from spawn to sources and controller to reduce travel fatigue
  - Builder: Filters out construction sites occupied by creeps to avoid ERR_INVALID_TARGET
- ✅ M3: Build priorities, layout and a tower
  - Tower built first (its own priority class above extensions), kept full by the harvesters
  - Extensions built one at a time: every builder works the most advanced site (progress first, spawn distance as tie-break)
  - Upgrader delegates to building while a tower or extension site exists, resumes upgrading after
- ✅ M4: Hold the room (level 5)
  - Both level-5 towers built: tower tiles are reserved up front so the extension layout cannot occupy them
  - Ramparts on the spawn's tile and on every finished tower
  - Defend mode by itself: Memory.mode switches to 'defend' as soon as a hostile is sighted, back to 'peace' after it is gone
  - Towers attack hostiles first, heal second, and repair only in peace while holding an attack reserve
  - Safe mode only as a last resort (dangerous hostile and every tower empty); a defender creep covers that gap
- ⬜ M5: Static mining with containers and haulers
- ⬜ CPU profiling and path caching
- ⬜ Expansion to a second room

## How it works

```
src/
├── main.ts              # Entry point - calls managers and roles in ErrorMapper.wrapLoop
├── config.ts            # Configuration constants (minimum creeps, CPU summary interval)
├── types/
│   └── memory.ts        # TypeScript type definitions for Memory structures
├── managers/
│   ├── cpuReporter.ts   # Reports CPU usage every N ticks
│   ├── memoryManager.ts # Cleans up memory of dead creeps
│   ├── modeManager.ts   # Tracks hostiles, switches Memory.mode to 'defend' and back
│   ├── spawnManager.ts  # Spawns creeps to maintain minimum population
│   ├── towerManager.ts  # Tower combat: attack, heal, repair in peace
│   └── constructionManager.ts # Towers, extensions, containers, roads and ramparts
├── roles/
│   ├── harvester.ts     # Harvester creep behavior
│   ├── hauler.ts        # Hauler creep behavior (containers to tower/extensions/spawn)
│   ├── upgrader.ts      # Upgrader creep behavior
│   ├── builder.ts       # Builder creep behavior
│   └── defender.ts      # Defender creep for the safe-mode gap
└── utils/
    ├── ErrorMapper.ts   # Source-mapped error handling
    ├── movement.ts      # Shared moveTo helpers (stuck detection, reusePath)
    └── pickSource.ts    # Assigns creeps to sources without collisions
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Run tests (unit and integration)
npm test
```

## Blog

See [blog/](blog/) for detailed posts about each milestone.

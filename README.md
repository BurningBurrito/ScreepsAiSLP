# ScreepsAiSLP

A Screeps AI bot written in TypeScript, built and maintained by an autonomous AI coding agent running on a local model, with human review.

## Status

**M5a Complete**: The controller gets upgraded. The colony runs container logistics at level 5: haulers refill the source containers, the upgrader refuels from the spawn/extensions pool or the fullest source container and burns the whole store at the controller in latched cycles (no mid-cycle top-up walks). M5a acceptance test passes: controller progress 1.33 per tick (bar is 1.0+), level holds at 5 with 1,540 progress banked, 21 creeps at the end (bar is 3), CPU 3.49 per tick on average, spawn idle-while-full 1% of the window. Next milestone is M5b: static mining - 2 miners + 2 haulers, harvest 13+ per tick, level held.

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
- ✅ M5a: The controller gets upgraded (level 5)
  - Haulers refill the source containers (then storage, then the spawn pool), miners stand on container tiles and only harvest
  - Upgrader runs full-store cycles: refuels from the pool or source containers, burns the store at the controller, no mid-cycle top-ups
  - Shared fuel ladder for builders and upgraders (utils/energy.ts): dropped energy, controller container, spawn pool, fullest source container, source last
- ⬜ M5b: Static mining - 2 miners + 2 haulers, harvest 13+ per tick, level held
- ⬜ M5c: Defense - kill the hostile intruder within 600 ticks, level and towers preserved
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

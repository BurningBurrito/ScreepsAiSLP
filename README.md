# ScreepsAiSLP

A Screeps AI bot written in TypeScript, built and maintained by an autonomous AI coding agent running on a local model, with human review.

## Status

**M2 Complete**: Extensions and roads management. The bot now builds extensions near the spawn and places roads along paths from the spawn to sources and controller. The builder filters out construction sites occupied by creeps to avoid blocking. M2 acceptance test passes with 1 extension finished, 4 extension sites placed, 2 roads finished, 48 road sites placed, and energy capacity of 350.

## Features

- ✅ M1: Colony core economy
  - Harvester: Harvests energy from sources and transfers to spawns and extensions (then controller when full)
  - Upgrader: Upgrades room controller
  - Builder: Builds construction sites and repairs structures
- ✅ M2: Extensions and roads
  - Extensions: Built near the spawn to increase room energy capacity
  - Roads: Built along paths from spawn to sources and controller to reduce travel fatigue
  - Builder: Filters out construction sites occupied by creeps to avoid ERR_INVALID_TARGET
- ⬜ M3: Containers and static mining
- ⬜ M4: Towers and defense
- ⬜ M5: CPU profiling and path caching
- ⬜ M6: Expansion to a second room

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
│   ├── spawnManager.ts  # Spawns creeps to maintain minimum population
│   └── constructionManager.ts # Manages extensions and roads construction
├── roles/
│   ├── harvester.ts     # Harvester creep behavior
│   ├── upgrader.ts      # Upgrader creep behavior
│   └── builder.ts       # Builder creep behavior
└── utils/
    └── ErrorMapper.ts   # Source-mapped error handling
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

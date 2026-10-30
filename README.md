# ScreepsAiSLP

A Screeps AI bot written in TypeScript, built and maintained by an autonomous AI coding agent running on a local model, with human review.

## Status

**M3 Complete**: Build priorities, layout and a tower. Builders now finish sites in priority order (tower first, then extensions, one extension at a time - the whole crew works the most advanced site so capacity actually grows), the upgrader joins the build while priority sites exist, and the finished tower is kept full. M3 acceptance test passes: tower built and full (1,000 energy), 4 extensions built plus 6 more placed, energy capacity 500, zero road share while priority sites existed.

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
- ⬜ M4: Containers and static mining
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

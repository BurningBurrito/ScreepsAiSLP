# ScreepsAiSLP

A Screeps AI bot written in TypeScript, built and maintained by an autonomous AI coding agent running on a local model, with human review.

## Status

**M1 Complete**: Colony core economy with harvester, upgrader, and builder roles.

The bot maintains a minimum population of creeps (2 harvesters, 2 upgraders, 1 builder) and scales their body sizes based on available room energy.

## Features

- ✅ M1: Colony core economy
  - Harvester: Harvests energy from sources and transfers to spawns and extensions (then controller when full)
  - Upgrader: Upgrades room controller
  - Builder: Builds construction sites and repairs structures
- ⬜ M2: Extensions and roads
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
│   └── spawnManager.ts  # Spawns creeps to maintain minimum population
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

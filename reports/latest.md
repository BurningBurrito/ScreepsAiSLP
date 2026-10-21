# Scorecard: smoke · 2026-10-21 04:45 · 500 ticks · commit 6aaaaab

| Metric (last 200 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 0.91 | - |  |
| Energy wasted at source regeneration (sum) | 1,056 | - |  |
| Controller progress / tick | 0.7 | - |  |
| Construction progress / tick | 0 | - |  |
| Energy delivered to spawn and extensions / tick | 0 | - |  |
| Spawn idle while energy is full | 100 % | - |  |
| Spawn busy | 0 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 15 % | - |  |
| CPU / tick (average, max) | 1.09, 3.64 | - |  |
| RCL / progress at end (whole run) | 1 / 183 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - |  |
| Energy harvested (whole run) | 1,124 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 4 / 1 / 4 | - |  |
| Roads reach (end): sources, controller | 0 of 2, no | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 1 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 4 (4) | - |  |

Creeps at end by role: harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 4 (road 4). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 9 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1
      200 | harvester 2, upgrader 2                  |   4.3 |     0 |   300/300 | idle | 1.3
      300 | harvester 2, upgrader 2                  |   1.1 |   0.4 |   300/300 | idle | 1.1
      400 | harvester 2, upgrader 2                  |   0.6 |   0.8 |   300/300 | idle | 1
      500 | harvester 2, upgrader 2                  |   1.2 |   0.6 |   300/300 | idle | 1.1

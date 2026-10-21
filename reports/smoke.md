# Scorecard: smoke · 2026-10-21 05:00 · 500 ticks · commit 0f7a56f

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-21 04:45, 6aaaaab) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 0.91 | 0.91 | 0 |
| Energy wasted at source regeneration (sum) | 1,056 | 1,056 | 0 |
| Controller progress / tick | 0.7 | 0.7 | 0 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 0 | 0 | 0 |
| Spawn idle while energy is full | 100 % | 100 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 15 % | 15 % | 0 pts |
| CPU / tick (average, max) | 1.47, 20.36 | 1.09, 3.64 | +0.38 |
| RCL / progress at end (whole run) | 1 / 183 | 1 / 183 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,124 | 1,124 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 4 / 1 / 4 | -4 |
| Roads reach (end): sources, controller | 2 of 2, yes | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 1 | -1 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 4 (4) | 4 (4) | 0 |

Creeps at end by role: harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 59 (road 59). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 9 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.5
      200 | harvester 2, upgrader 2                  |   4.3 |     0 |   300/300 | idle | 1.7
      300 | harvester 2, upgrader 2                  |   1.1 |   0.4 |   300/300 | idle | 1.5
      400 | harvester 2, upgrader 2                  |   0.6 |   0.8 |   300/300 | idle | 1.4
      500 | harvester 2, upgrader 2                  |   1.2 |   0.6 |   300/300 | idle | 1.6

# Scorecard: smoke · 2026-11-13 00:28 · 500 ticks · commit fdd6e36

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-11-13 00:09, fdd6e36) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.34 | 4.34 | 0 |
| Energy wasted at source regeneration (sum) | 948 | 948 | 0 |
| Controller progress / tick | 0.5 | 0.5 | 0 |
| Construction progress / tick | 0.05 | 0.05 | 0 |
| Energy delivered to spawn and extensions / tick | 2.75 | 2.75 | 0 |
| Spawn idle while energy is full | 2 % | 2 % | 0 pts |
| Spawn busy | 17 % | 17 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 16 % | 16 % | 0 pts |
| CPU / tick (average, max) | 1.77, 24.78 | 1.7, 21.24 | +0.07 |
| RCL / progress at end (whole run) | 1 / 100 | 1 / 100 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,920 | 1,920 | 0 |
| Build energy spent on roads (share of all build energy) | 100 % | 100 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 1, harvester 2, upgrader 4.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: road 9.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 12 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.5
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.7
      500 | builder 1, harvester 2, upgrader 4       |     5 |   0.5 |    71/300 | idle | 1.8

# Scorecard: acceptance-m1 · 2026-11-03 07:36 · 801 ticks · commit d666902

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-03 02:40, 06677ce) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.04 | 6.28 | -0.24 |
| Energy wasted at source regeneration (sum) | 4,204 | 4,204 | 0 |
| Controller progress / tick | 0.31 | 0.39 | -0.08 |
| Construction progress / tick | 3.35 | 3.24 | +0.11 |
| Energy delivered to spawn and extensions / tick | 1.69 | 1.69 | 0 |
| Spawn idle while energy is full | 51 % | 51 % | 0 pts |
| Spawn busy | 7 % | 7 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 23 % | 20 % | +3 pts |
| CPU / tick (average, max) | 1.89, 23.76 | 1.83, 20.37 | +0.06 |
| RCL / progress at end (whole run) | 1 / 150 | 1 / 174 | -24 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 3,664 | 3,760 | -96 |
| Build energy spent on roads (share of all build energy) | 99 % | 98 % | +1 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: road 2, spawn 1. Construction sites: 58 (container 1, road 57). Build energy in the window by target: completed 9, road 1064.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 15 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.5
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.5
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.6
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.6
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.6 |   131/300 | idle | 1.7
      700 | builder 3, harvester 2, upgrader 2       |     6 |   0.4 |   300/300 | idle | 1.9
      800 | builder 3, harvester 2, upgrader 2       |   8.1 |     0 |   300/300 | idle | 2.1
      801 | builder 3, harvester 2, upgrader 2       |    12 |     0 |   300/300 | idle | 1.9

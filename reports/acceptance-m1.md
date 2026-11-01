# Scorecard: acceptance-m1 · 2026-11-01 10:20 · 801 ticks · commit eff4edb

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-01 09:59, d108b29) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.09 | 6.09 | 0 |
| Energy wasted at source regeneration (sum) | 4,204 | 4,204 | 0 |
| Controller progress / tick | 0.39 | 0.39 | 0 |
| Construction progress / tick | 1.63 | 1.63 | 0 |
| Energy delivered to spawn and extensions / tick | 1.69 | 1.69 | 0 |
| Spawn idle while energy is full | 51 % | 51 % | 0 pts |
| Spawn busy | 7 % | 7 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 22 % | 22 % | 0 pts |
| CPU / tick (average, max) | 1.72, 20.32 | 1.91, 20.33 | -0.19 |
| RCL / progress at end (whole run) | 1 / 174 | 1 / 174 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 3,700 | 3,700 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: container 520.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 15 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.4
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.9 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.1 |   300/300 | idle | 1.8
      800 | builder 3, harvester 2, upgrader 2       |   7.9 |   0.2 |   300/300 | idle | 1.9
      801 | builder 3, harvester 2, upgrader 2       |     8 |     2 |   300/300 | idle | 1.7

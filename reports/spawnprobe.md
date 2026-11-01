# Scorecard: spawnprobe · 2026-11-01 13:58 · 700 ticks · commit 9f0abcf

| Metric (last 280 ticks unless noted) | This run | Previous run (2026-11-01 06:01, 32706ac) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.43 | 3.9 | +1.53 |
| Energy wasted at source regeneration (sum) | 1,796 | 1,784 | +12 |
| Controller progress / tick | 0.36 | 0.18 | +0.18 |
| Construction progress / tick | 0.56 | 4.43 | -3.87 |
| Energy delivered to spawn and extensions / tick | 2.64 | 3.57 | -0.93 |
| Spawn idle while energy is full | 23 % | 0 % | +23 pts |
| Spawn busy | 12 % | 0 % | +12 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 21 % | 6 % | +15 pts |
| CPU / tick (average, max) | 1.66, 20.22 | 1.44, 20.49 | +0.22 |
| RCL / progress at end (whole run) | 1 / 150 | 1 / 100 | +50 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,900 | 2,452 | +448 |
| Build energy spent on roads (share of all build energy) | 100 % | 96 % | +4 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 3 (3) | +4 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: road 156.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 746 lines, 0 with errors (reports/spawnprobe-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.4
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.9 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.1 |   300/300 | idle | 1.8

# Scorecard: acceptance-m1 · 2026-11-11 21:54 · 801 ticks · commit ec7a3f6

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-11 17:24, 1404382) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.47 | 4.4 | +0.07 |
| Energy wasted at source regeneration (sum) | 4,584 | 4,644 | -60 |
| Controller progress / tick | 0.38 | 0.47 | -0.09 |
| Construction progress / tick | 5 | 4.58 | +0.42 |
| Energy delivered to spawn and extensions / tick | 3.59 | 3.44 | +0.15 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 21 % | 15 % | +6 pts |
| CPU / tick (average, max) | 1.8, 26.58 | 1.77, 21.01 | +0.03 |
| RCL / progress at end (whole run) | 1 / 177 | 1 / 168 | +9 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 3,304 | 3,324 | -20 |
| Build energy spent on roads (share of all build energy) | 97 % | 98 % | -1 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 6 (6) | 0 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: road 5, spawn 1. Construction sites: 55 (container 1, road 54). Build energy in the window by target: completed 45, road 1554.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 14 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   275/300 | idle | 1.4
      400 | builder 2, harvester 2, upgrader 2       |   4.1 |   0.1 |    67/300 | idle | 1.6
      500 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   117/300 | idle | 1.8
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.4 |   117/300 | idle | 1.7
      700 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.6 |   117/300 | idle | 1.8
      800 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.2 |   117/300 | idle | 1.8
      801 | builder 2, harvester 2, upgrader 2       |     8 |     2 |   118/300 | idle | 2.1

# Scorecard: acceptance-m1 · 2026-11-11 02:28 · 801 ticks · commit bc47292

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-10 16:36, 754f7d4) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.46 | 4.4 | +0.06 |
| Energy wasted at source regeneration (sum) | 4,584 | 4,588 | -4 |
| Controller progress / tick | 0.43 | 0.31 | +0.12 |
| Construction progress / tick | 4.76 | 1.48 | +3.28 |
| Energy delivered to spawn and extensions / tick | 3.59 | 3.39 | +0.2 |
| Spawn idle while energy is full | 0 % | 1 % | -1 pts |
| Spawn busy | 0 % | 12 % | -12 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 21 % | 25 % | -4 pts |
| CPU / tick (average, max) | 1.74, 21.01 | 1.69, 20.91 | +0.05 |
| RCL / progress at end (whole run) | 2 / 0 | 1 / 150 | -150 |
| Ticks to RCL 2 / RCL 3 (whole run) | 712 / - | - / - |  |
| Energy harvested (whole run) | 3,212 | 3,140 | +72 |
| Build energy spent on roads (share of all build energy) | 74 % | 97 % | -23 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 9 (9) | -3 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: road 3, spawn 1. Construction sites: 62 (container 1, extension 5, road 56). Build energy in the window by target: completed 6, extension 390, road 1126.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 17 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.5 |   0.5 |   257/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   186/300 | idle | 1.7
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   136/300 | idle | 1.7
      700 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.6 |   186/300 | idle | 1.7
      800 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.3 |   136/300 | idle | 1.7
      801 | builder 2, harvester 2, upgrader 2       |     8 |     0 |   137/300 | idle | 1.9

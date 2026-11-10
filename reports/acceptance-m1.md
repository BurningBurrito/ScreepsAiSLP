# Scorecard: acceptance-m1 · 2026-11-10 16:36 · 801 ticks · commit 754f7d4

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-10 10:59, cf6c66a) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.4 | 4.4 | 0 |
| Energy wasted at source regeneration (sum) | 4,588 | 4,588 | 0 |
| Controller progress / tick | 0.31 | 0.31 | 0 |
| Construction progress / tick | 1.48 | 1.48 | 0 |
| Energy delivered to spawn and extensions / tick | 3.39 | 3.39 | 0 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 12 % | 12 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 25 % | 25 % | 0 pts |
| CPU / tick (average, max) | 1.69, 20.91 | 1.69, 20.79 | 0 |
| RCL / progress at end (whole run) | 1 / 150 | 1 / 150 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 3,140 | 3,140 | 0 |
| Build energy spent on roads (share of all build energy) | 97 % | 97 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 9 (9) | 0 |

Creeps at end by role: builder 5, harvester 2, upgrader 2.
Structures at end: road 2, spawn 1. Construction sites: 58 (container 1, road 57). Build energy in the window by target: completed 16, road 457.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 17 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.6 |   131/300 | idle | 1.6
      700 | builder 4, harvester 2, upgrader 2       |   5.1 |   0.4 |   260/300 | idle | 1.7
      800 | builder 5, harvester 2, upgrader 2       |   3.8 |     0 |     5/300 | busy | 1.8
      801 | builder 5, harvester 2, upgrader 2       |     4 |     0 |     6/300 | busy | 1.7

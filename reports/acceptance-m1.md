# Scorecard: acceptance-m1 · 2026-10-31 18:18 · 801 ticks · commit f606551

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-31 17:07, 2c081e3) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.88 | 3.88 | 0 |
| Energy wasted at source regeneration (sum) | 1,784 | 1,784 | 0 |
| Controller progress / tick | 0.31 | 0.31 | 0 |
| Construction progress / tick | 3.38 | 3.38 | 0 |
| Energy delivered to spawn and extensions / tick | 0 | 0 | 0 |
| Spawn idle while energy is full | 100 % | 100 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 5 % | 5 % | 0 pts |
| CPU / tick (average, max) | 1.4, 20.2 | 1.55, 20.22 | -0.15 |
| RCL / progress at end (whole run) | 1 / 150 | 1 / 150 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,860 | 2,860 | 0 |
| Build energy spent on roads (share of all build energy) | 99 % | 99 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 3 (3) | 3 (3) | 0 |

Creeps at end by role: builder 1, harvester 1, upgrader 1.
Structures at end: road 5, spawn 1. Construction sites: 55 (container 1, road 54). Build energy in the window by target: completed 14, road 1066.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 11 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | builder 1, harvester 1                   |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.2
      300 | builder 1, harvester 1, upgrader 1       |   2.6 |   0.3 |   300/300 | idle | 1.2
      400 | builder 1, harvester 1, upgrader 1       |   3.2 |   0.2 |   300/300 | idle | 1.4
      500 | builder 1, harvester 1, upgrader 1       |   3.7 |     0 |   300/300 | idle | 1.4
      600 | builder 1, harvester 1, upgrader 1       |     4 |   0.5 |   300/300 | idle | 1.4
      700 | builder 1, harvester 1, upgrader 1       |     4 |     0 |   300/300 | idle | 1.4
      800 | builder 1, harvester 1, upgrader 1       |   3.7 |   0.5 |   300/300 | idle | 1.4
      801 | builder 1, harvester 1, upgrader 1       |     0 |     0 |   300/300 | idle | 1.4

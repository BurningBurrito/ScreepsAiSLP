# Scorecard: acceptance-m1 · 2026-11-03 13:25 · 801 ticks · commit e073eed

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-03 11:05, f03bd18) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.31 | 4.31 | 0 |
| Energy wasted at source regeneration (sum) | 4,730 | 4,730 | 0 |
| Controller progress / tick | 0.46 | 0.46 | 0 |
| Construction progress / tick | 2.67 | 2.67 | 0 |
| Energy delivered to spawn and extensions / tick | 3.59 | 3.59 | 0 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 7 % | 7 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 23 % | 23 % | 0 pts |
| CPU / tick (average, max) | 1.74, 20.44 | 1.86, 20.6 | -0.12 |
| RCL / progress at end (whole run) | 1 / 196 | 1 / 196 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 3,032 | 3,032 | 0 |
| Build energy spent on roads (share of all build energy) | 97 % | 97 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: road 4, spawn 1. Construction sites: 56 (container 1, road 55). Build energy in the window by target: completed 30, road 824.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 15 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, upgrader 1                  |   3.7 |     0 |   199/300 | idle | 1.5
      200 | builder 1, harvester 2, upgrader 1       |   3.6 |   0.3 |     4/300 | busy | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   2.6 |   0.2 |   154/300 | idle | 1.6
      400 | builder 1, harvester 2, upgrader 1       |     3 |     0 |   154/300 | idle | 1.5
      500 | builder 1, harvester 2, upgrader 2       |   4.5 |     0 |   237/300 | idle | 1.5
      600 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.3 |   137/300 | idle | 1.7
      700 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.2 |   137/300 | idle | 1.7
      800 | builder 3, harvester 2, upgrader 2       |   4.2 |     1 |   187/300 | idle | 1.9
      801 | builder 3, harvester 2, upgrader 2       |     4 |     1 |   188/300 | idle | 1.9

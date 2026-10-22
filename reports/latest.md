# Scorecard: acceptance-m1 · 2026-10-22 17:23 · 801 ticks · commit 5b7a999

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-22 17:06, 5b7a999) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.43 | 3.43 | 0 |
| Energy wasted at source regeneration (sum) | 4,950 | 4,950 | 0 |
| Controller progress / tick | 0.31 | 0.31 | 0 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 73.13 | 73.13 | 0 |
| Spawn idle while energy is full | 32 % | 32 % | 0 pts |
| Spawn busy | 8 % | 8 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 34 % | 34 % | 0 pts |
| CPU / tick (average, max) | 1.84, 6.46 | 1.84, 5.98 | 0 |
| RCL / progress at end (whole run) | 1 / 100 | 1 / 100 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,006 | 2,006 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 0 (none). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 784 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, upgrader 1                  |   1.7 |     0 |    49/300 | idle | 1.1
      200 | harvester 1, hauler 1, upgrader 2        |     2 |     0 |    49/300 | idle | 1.1
      300 | harvester 1, hauler 2, upgrader 2        |     2 |     0 |   199/300 | idle | 1.4
      400 | harvester 1, hauler 2, upgrader 2        |   1.9 |     0 |   160/300 | idle | 1.6
      500 | builder 1, harvester 2, hauler 2, upgrader 2 |     2 |     0 |   300/300 | idle | 1.6
      600 | builder 1, harvester 2, hauler 2, upgrader 2 |   3.9 |     0 |   201/300 | idle | 1.7
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   2.8 |   0.1 |   300/300 | idle | 1.9
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.8 |   0.9 |    70/300 | idle | 2
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     4 |     0 |   271/300 | idle | 2.1

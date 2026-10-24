# Scorecard: acceptance-m1 · 2026-10-24 00:05 · 801 ticks · commit 36027d6

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-23 20:15, 382edab) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.24 | 4.04 | -0.8 |
| Energy wasted at source regeneration (sum) | 5,014 | 5,040 | -26 |
| Controller progress / tick | 0.16 | 0.16 | 0 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 2.19 | 0 | +2.19 |
| Spawn idle while energy is full | 0 % | 100 % | -100 pts |
| Spawn busy | 13 % | 0 % | +13 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 46 % | 47 % | 0 pts |
| CPU / tick (average, max) | 2.37, 20.13 | 1.52, 7.13 | +0.85 |
| RCL / progress at end (whole run) | 1 / 50 | 1 / 50 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,240 | 2,348 | -108 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 57 | 0 / 0 / 0 | +57 |
| Roads reach (end): sources, controller | 1 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 12 (12) | 5 (5) | +7 |

Creeps at end by role: builder 1, harvester 2, hauler 1, upgrader 8.
Structures at end: spawn 1. Construction sites: 59 (container 1, road 58). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 7218 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 1                    |   1.7 |     0 |    49/300 | idle | 1.5
      200 | harvester 1, hauler 1, upgrader 1        |     2 |     0 |   149/300 | idle | 1.3
      300 | harvester 2, hauler 1, upgrader 1        |   2.5 |     0 |   199/300 | idle | 1.5
      400 | builder 1, harvester 2, hauler 1, upgrader 1 |   3.5 |     0 |   178/300 | idle | 1.7
      500 | builder 1, harvester 2, hauler 1, upgrader 3 |     3 |     0 |    78/300 | idle | 1.8
      600 | builder 1, harvester 2, hauler 1, upgrader 4 |   3.1 |   0.5 |   178/300 | idle | 2.3
      700 | builder 1, harvester 2, hauler 1, upgrader 6 |   3.4 |     0 |    78/300 | idle | 2.4
      800 | builder 1, harvester 2, hauler 1, upgrader 8 |   3.4 |     0 |    78/300 | idle | 2.5
      801 | builder 1, harvester 2, hauler 1, upgrader 8 |     4 |     0 |    79/300 | idle | 3

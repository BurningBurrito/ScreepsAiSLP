# Scorecard: smoke · 2026-10-22 23:17 · 700 ticks · commit a912beb

| Metric (last 280 ticks unless noted) | This run | Previous run (2026-10-22 23:14, 69190d6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 2.99 | 2.99 | 0 |
| Energy wasted at source regeneration (sum) | 5,116 | 5,116 | 0 |
| Controller progress / tick | 0.18 | 0.18 | 0 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 15.2 | 15.2 | 0 |
| Spawn idle while energy is full | 18 % | 18 % | 0 pts |
| Spawn busy | 13 % | 13 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 22 % | 22 % | 0 pts |
| CPU / tick (average, max) | 1.98, 6 | 1.97, 5.94 | +0.01 |
| RCL / progress at end (whole run) | 1 / 51 | 1 / 51 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,640 | 1,640 | 0 |
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
Bot console: 5248 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 1                    |   1.7 |     0 |    49/300 | idle | 1.2
      200 | harvester 1, hauler 2                    |     2 |     0 |   199/300 | idle | 1.2
      300 | harvester 2, hauler 2, upgrader 1        |   1.9 |     0 |   272/300 | idle | 1.7
      400 | harvester 1, hauler 2, upgrader 2        |   2.1 |     0 |   154/300 | idle | 1.8
      500 | builder 1, harvester 2, hauler 2, upgrader 2 |   2.1 |     0 |   300/300 | idle | 1.7
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |     0 |    19/300 | idle | 2.1
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |     3 |   0.5 |   300/300 | idle | 2.1

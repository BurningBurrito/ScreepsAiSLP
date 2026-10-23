# Scorecard: smoke · 2026-10-23 03:54 · 500 ticks · commit 0adcf85

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-23 03:19, 0adcf85) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 2.7 | 2.49 | +0.21 |
| Energy wasted at source regeneration (sum) | 1,392 | 1,396 | -4 |
| Controller progress / tick | 0.04 | 0 | +0.04 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 1.99 | 1.62 | +0.37 |
| Spawn idle while energy is full | 1 % | 11 % | -10 pts |
| Spawn busy | 7 % | 7 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 33 % | 36 % | -3 pts |
| CPU / tick (average, max) | 1.41, 6.54 | 1.43, 5.92 | -0.02 |
| RCL / progress at end (whole run) | 1 / 58 | 1 / 50 | +8 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,146 | 1,100 | +46 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 5 (5) | 5 (5) | 0 |

Creeps at end by role: builder 1, harvester 2, hauler 1, upgrader 1.
Structures at end: spawn 1. Construction sites: 0 (none). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 5 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1                              |   1.7 |     0 |   199/300 | idle | 1.1
      200 | harvester 1, hauler 1, upgrader 1        |   2.5 |     0 |    99/300 | idle | 1.2
      300 | harvester 2, hauler 1, upgrader 1        |   1.9 |   0.5 |    79/300 | idle | 1.5
      400 | builder 1, harvester 2, hauler 1, upgrader 1 |   2.4 |     0 |    76/300 | idle | 1.4
      500 | builder 1, harvester 2, hauler 1, upgrader 1 |     3 |   0.1 |   276/300 | idle | 1.4

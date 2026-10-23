# Scorecard: smoke · 2026-10-23 17:44 · 500 ticks · commit bd63b5b

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-23 17:41, bd63b5b) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.13 | 4.13 | 0 |
| Energy wasted at source regeneration (sum) | 1,158 | 1,158 | 0 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 0.21 | 0.21 | 0 |
| Spawn idle while energy is full | 95 % | 95 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 28 % | 28 % | 0 pts |
| CPU / tick (average, max) | 1.59, 7.02 | 1.59, 7.11 | 0 |
| RCL / progress at end (whole run) | 1 / 50 | 1 / 50 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,664 | 1,664 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 4 (4) | 4 (4) | 0 |

Creeps at end by role: builder 1, harvester 2, upgrader 1.
Structures at end: spawn 1. Construction sites: 2 (container 2). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 4007 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1                              |   1.7 |     0 |   199/300 | idle | 1.2
      200 | harvester 2, upgrader 1                  |   2.8 |     0 |    49/300 | idle | 1.2
      300 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.5 |   249/300 | idle | 1.7
      400 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   300/300 | idle | 1.6
      500 | builder 1, harvester 2, upgrader 1       |   4.4 |     0 |   300/300 | idle | 1.6

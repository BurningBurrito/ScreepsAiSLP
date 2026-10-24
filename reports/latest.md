# Scorecard: smoke · 2026-10-24 09:19 · 500 ticks · commit ccd88cb

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-24 09:03, ccd88cb) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.62 | 3.62 | 0 |
| Energy wasted at source regeneration (sum) | 1,816 | 1,816 | 0 |
| Controller progress / tick | 0.02 | 0.02 | 0 |
| Construction progress / tick | 1.74 | 1.74 | 0 |
| Energy delivered to spawn and extensions / tick | 1.92 | 1.92 | 0 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 11 % | 11 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 13 % | 13 % | 0 pts |
| CPU / tick (average, max) | 1.74, 20.06 | 1.72, 20.85 | +0.02 |
| RCL / progress at end (whole run) | 1 / 8 | 1 / 8 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 906 | 906 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 4 (4) | 4 (4) | 0 |

Creeps at end by role: builder 1, harvester 2, upgrader 1.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: container 347.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 5 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | upgrader 1                               |     0 |     0 |    99/300 | idle | 1.4
      200 | upgrader 1                               |     0 |     0 |   199/300 | idle | 1.2
      300 | harvester 1, upgrader 1                  |   1.7 |     0 |   249/300 | idle | 1.2
      400 | builder 1, harvester 1, upgrader 1       |   3.4 |     0 |   236/300 | idle | 1.7
      500 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   231/300 | idle | 1.8

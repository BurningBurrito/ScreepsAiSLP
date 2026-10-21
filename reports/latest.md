# Scorecard: smoke · 2026-10-21 05:34 · 500 ticks · commit b596c33

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-21 05:27, 1099cb6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.41 | 0.91 | +2.5 |
| Energy wasted at source regeneration (sum) | 890 | 1,056 | -166 |
| Controller progress / tick | 0.09 | 0.7 | -0.61 |
| Construction progress / tick | 2.35 | 0 | +2.35 |
| Energy delivered to spawn and extensions / tick | 0.35 | 0 | +0.35 |
| Spawn idle while energy is full | 59 % | 100 % | -41 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 22 % | 15 % | +7 pts |
| CPU / tick (average, max) | 1.73, 19.06 | 1.48, 19.13 | +0.25 |
| RCL / progress at end (whole run) | 1 / 18 | 1 / 183 | -165 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,790 | 1,124 | +666 |
| Build energy spent on roads (share of all build energy) | 100 % | 0 % | +100 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 4 (4) | +2 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 59 (road 59). Build energy in the window by target: road 470.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 11 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.5
      200 | builder 1, harvester 2, upgrader 2       |   5.7 |     0 |   249/300 | idle | 1.8
      300 | builder 2, harvester 2, upgrader 2       |   1.5 |     0 |   149/300 | idle | 2.2
      400 | builder 2, harvester 2, upgrader 2       |   3.7 |     0 |   300/300 | idle | 1.7
      500 | builder 2, harvester 2, upgrader 2       |   3.2 |   0.2 |   300/300 | idle | 1.7

# Scorecard: acceptance-m1 · 2026-10-23 06:48 · 801 ticks · commit f4cf191

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-23 02:30, d4ce72f) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.04 | 3.18 | +0.86 |
| Energy wasted at source regeneration (sum) | 4,740 | 5,160 | -420 |
| Controller progress / tick | 0.37 | 0.49 | -0.12 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 0 | 11.85 | -11.85 |
| Spawn idle while energy is full | 100 % | 25 % | +75 pts |
| Spawn busy | 0 % | 7 % | -7 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 4 % | 19 % | -15 pts |
| CPU / tick (average, max) | 1.61, 6.01 | 1.99, 5.91 | -0.38 |
| RCL / progress at end (whole run) | 1 / 173 | 1 / 156 | +17 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,934 | 1,946 | +988 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 4 (4) | 8 (8) | -4 |

Creeps at end by role: builder 1, harvester 2, upgrader 1.
Structures at end: spawn 1. Construction sites: 0 (none). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 8 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1                              |   1.7 |     0 |   199/300 | idle | 1.1
      200 | harvester 2, upgrader 1                  |   2.8 |     0 |    49/300 | idle | 1.2
      300 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.5 |   299/300 | idle | 1.6
      400 | builder 1, harvester 2, upgrader 1       |   4.7 |     0 |   300/300 | idle | 1.7
      500 | builder 1, harvester 2, upgrader 1       |   4.1 |   0.2 |   300/300 | idle | 1.4
      600 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.3 |   300/300 | idle | 1.6
      700 | builder 1, harvester 2, upgrader 1       |   4.4 |   0.5 |   300/300 | idle | 1.7
      800 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.2 |   300/300 | idle | 1.5
      801 | builder 1, harvester 2, upgrader 1       |     4 |     1 |   300/300 | idle | 1.7

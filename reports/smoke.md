# Scorecard: smoke · 2026-10-21 20:06 · 500 ticks · commit 1577bca

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-21 20:00, 1577bca) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 2.5 | 2.71 | -0.21 |
| Energy wasted at source regeneration (sum) | 900 | 900 | 0 |
| Controller progress / tick | 0.03 | 0.4 | -0.37 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 15.61 | 4.1 | +11.51 |
| Spawn idle while energy is full | 6 % | 22 % | -15 pts |
| Spawn busy | 11 % | 11 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 48 % | 30 % | +17 pts |
| CPU / tick (average, max) | 1.76, 5.7 | 1.72, 5.85 | +0.04 |
| RCL / progress at end (whole run) | 1 / 5 | 1 / 80 | -75 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,600 | 1,642 | -42 |
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
Bot console: 77 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.2
      200 | builder 1, harvester 2, hauler 2, upgrader 2 |   5.7 |     0 |   299/300 | idle | 1.7
      300 | builder 1, harvester 2, hauler 2, upgrader 2 |   1.4 |     0 |   300/300 | idle | 2.2
      400 | builder 1, harvester 2, hauler 2, upgrader 2 |   1.3 |     0 |   249/300 | idle | 1.6
      500 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |   0.1 |   237/300 | idle | 2

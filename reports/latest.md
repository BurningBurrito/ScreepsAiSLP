# Scorecard: acceptance-m1 · 2026-10-22 04:23 · 801 ticks · commit f82722d

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-22 01:38, 67b0cb5) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.91 | 3.66 | +0.25 |
| Energy wasted at source regeneration (sum) | 4,500 | 4,834 | -334 |
| Controller progress / tick | 0.58 | 0.33 | +0.25 |
| Construction progress / tick | 0 | 1.88 | -1.88 |
| Energy delivered to spawn and extensions / tick | 29.84 | 11.85 | +17.99 |
| Spawn idle while energy is full | 60 % | 45 % | +15 pts |
| Spawn busy | 6 % | 0 % | +6 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 51 % | 59 % | -8 pts |
| CPU / tick (average, max) | 2.09, 5.83 | 2.62, 17.65 | -0.53 |
| RCL / progress at end (whole run) | 1 / 185 | 2 / 0 | +185 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | 640 / - |  |
| Energy harvested (whole run) | 3,298 | 2,986 | +312 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 0 (none). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 236 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 2                    |   3.2 |     0 |    99/300 | idle | 1.2
      200 | harvester 2, hauler 2, upgrader 1        |   3.7 |     0 |   300/300 | idle | 1.6
      300 | builder 1, harvester 2, hauler 2, upgrader 2 |   3.7 |     0 |   300/300 | idle | 1.9
      400 | builder 1, harvester 2, hauler 2, upgrader 2 |   5.5 |     0 |   300/300 | idle | 2.1
      500 | builder 1, harvester 2, hauler 2, upgrader 2 |   5.3 |     0 |    13/300 | idle | 2.1
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   4.2 |   0.4 |    98/300 | idle | 2.2
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.6 |   0.5 |   300/300 | idle | 2.1
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |     1 |   201/300 | idle | 2
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     4 |     1 |   300/300 | idle | 2.1

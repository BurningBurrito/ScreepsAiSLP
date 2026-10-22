# Scorecard: acceptance-m1 · 2026-10-22 23:10 · 801 ticks · commit 69190d6

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-22 21:58, 69190d6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 2.98 | 2.54 | +0.44 |
| Energy wasted at source regeneration (sum) | 5,116 | 5,312 | -196 |
| Controller progress / tick | 0.18 | 0.13 | +0.05 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 10.51 | 72.7 | -62.19 |
| Spawn idle while energy is full | 44 % | 10 % | +34 pts |
| Spawn busy | 8 % | 9 % | -2 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 20 % | 12 % | +7 pts |
| CPU / tick (average, max) | 2.06, 6.06 | 1.81, 9.17 | +0.25 |
| RCL / progress at end (whole run) | 1 / 56 | 1 / 40 | +16 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,882 | 1,774 | +108 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 0 / 0 / 0 | 0 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, no | 0 of 2, no |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 7 (7) | +1 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 0 (none). Build energy in the window by target: none.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 6418 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 1                    |   1.7 |     0 |    49/300 | idle | 1.2
      200 | harvester 1, hauler 2                    |     2 |     0 |   199/300 | idle | 1.2
      300 | harvester 2, hauler 2, upgrader 1        |   1.9 |     0 |   272/300 | idle | 1.7
      400 | harvester 1, hauler 2, upgrader 2        |   2.1 |     0 |   154/300 | idle | 1.8
      500 | builder 1, harvester 2, hauler 2, upgrader 2 |   2.1 |     0 |   300/300 | idle | 1.7
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |     0 |    19/300 | idle | 2
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |     3 |   0.5 |   300/300 | idle | 2.1
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   2.4 |   0.1 |   300/300 | idle | 2.1
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     2 |     0 |   300/300 | idle | 2.1

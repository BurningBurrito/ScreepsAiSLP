# Scorecard: acceptance-m1 · 2026-10-23 02:30 · 801 ticks · commit d4ce72f

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-22 23:10, 69190d6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.18 | 2.98 | +0.2 |
| Energy wasted at source regeneration (sum) | 5,160 | 5,116 | +44 |
| Controller progress / tick | 0.49 | 0.18 | +0.31 |
| Construction progress / tick | 0 | 0 | 0 |
| Energy delivered to spawn and extensions / tick | 11.85 | 10.51 | +1.34 |
| Spawn idle while energy is full | 25 % | 44 % | -19 pts |
| Spawn busy | 7 % | 8 % | -1 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 19 % | 20 % | 0 pts |
| CPU / tick (average, max) | 1.99, 5.91 | 2.06, 6.06 | -0.07 |
| RCL / progress at end (whole run) | 1 / 156 | 1 / 56 | +100 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,946 | 1,882 | +64 |
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
Bot console: 6459 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 1                    |   1.7 |     0 |    49/300 | idle | 1.1
      200 | harvester 1, hauler 2                    |     2 |     0 |   199/300 | idle | 1.2
      300 | harvester 2, hauler 2, upgrader 1        |   1.9 |     0 |   272/300 | idle | 1.6
      400 | harvester 1, hauler 2, upgrader 2        |   2.1 |     0 |   154/300 | idle | 1.7
      500 | builder 1, harvester 2, hauler 2, upgrader 2 |   2.1 |     0 |   300/300 | idle | 1.6
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.3 |   0.2 |     1/300 | idle | 1.9
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.2 |   0.4 |   219/300 | idle | 2
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.2 |     1 |   254/300 | idle | 2.1
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     2 |     0 |   300/300 | idle | 2.3

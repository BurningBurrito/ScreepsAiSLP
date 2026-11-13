# Scorecard: acceptance-m1 · 2026-11-13 00:58 · 801 ticks · commit 69474de

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-12 15:04, f3a6863) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.75 | 4.63 | +2.12 |
| Energy wasted at source regeneration (sum) | 4,412 | 4,584 | -172 |
| Controller progress / tick | 0.71 | 0.39 | +0.32 |
| Construction progress / tick | 2.88 | 3.71 | -0.83 |
| Energy delivered to spawn and extensions / tick | 5.19 | 3.91 | +1.28 |
| Spawn idle while energy is full | 1 % | 0 % | +1 pts |
| Spawn busy | 13 % | 3 % | +10 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 23 % | 17 % | +5 pts |
| CPU / tick (average, max) | 2.07, 21.09 | 1.81, 21.07 | +0.26 |
| RCL / progress at end (whole run) | 2 / 100 | 2 / 0 | +100 |
| Ticks to RCL 2 / RCL 3 (whole run) | 614 / - | 720 / - | -106 |
| Energy harvested (whole run) | 4,000 | 3,276 | +724 |
| Build energy spent on roads (share of all build energy) | 2 % | 95 % | -93 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 7 (7) | +3 |

Creeps at end by role: builder 2, harvester 3, upgrader 5.
Structures at end: spawn 1. Construction sites: 65 (container 1, extension 5, road 59). Build energy in the window by target: extension 901, road 19.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 18 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.5
      500 | builder 1, harvester 2, upgrader 4       |     5 |   0.5 |    71/300 | idle | 1.7
      600 | builder 1, harvester 2, upgrader 5       |   5.7 |   0.7 |   200/300 | idle | 1.9
      700 | builder 2, harvester 3, upgrader 5       |   7.1 |   0.7 |   179/300 | idle | 2
      800 | builder 2, harvester 3, upgrader 5       |   7.9 |   0.6 |   129/300 | idle | 2.4
      801 | builder 2, harvester 3, upgrader 5       |     8 |     0 |   180/300 | idle | 2.1

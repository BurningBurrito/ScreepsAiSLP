# Scorecard: acceptance-m1 · 2026-11-13 02:08 · 801 ticks · commit b9a4099

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-13 00:58, 69474de) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.63 | 6.75 | -2.12 |
| Energy wasted at source regeneration (sum) | 4,584 | 4,412 | +172 |
| Controller progress / tick | 0.39 | 0.71 | -0.32 |
| Construction progress / tick | 3.71 | 2.88 | +0.83 |
| Energy delivered to spawn and extensions / tick | 3.91 | 5.19 | -1.28 |
| Spawn idle while energy is full | 0 % | 1 % | -1 pts |
| Spawn busy | 3 % | 13 % | -10 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 17 % | 23 % | -5 pts |
| CPU / tick (average, max) | 1.88, 21.04 | 2.07, 21.09 | -0.19 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 100 | -100 |
| Ticks to RCL 2 / RCL 3 (whole run) | 720 / - | 614 / - | +106 |
| Energy harvested (whole run) | 3,276 | 4,000 | -724 |
| Build energy spent on roads (share of all build energy) | 95 % | 2 % | +93 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 10 (10) | -3 |

Creeps at end by role: builder 2, harvester 3, upgrader 2.
Structures at end: road 4, spawn 1. Construction sites: 61 (container 1, extension 5, road 55). Build energy in the window by target: completed 30, extension 30, road 1126.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 19 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.5
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.6
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   142/300 | idle | 1.9
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   142/300 | idle | 1.9
      700 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.5 |   142/300 | idle | 1.9
      800 | builder 2, harvester 3, upgrader 2       |   4.9 |   0.4 |   241/300 | idle | 1.8
      801 | builder 2, harvester 3, upgrader 2       |     4 |     0 |   292/300 | idle | 2.5

# Scorecard: controller-sign · 2026-11-14 01:48 · 801 ticks · commit ede6b33

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-11-14 00:16, dc63e00) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.63 | 4.63 | 0 |
| Energy wasted at source regeneration (sum) | 4,584 | 4,584 | 0 |
| Controller progress / tick | 0.39 | 0.39 | 0 |
| Construction progress / tick | 3.71 | 3.71 | 0 |
| Energy delivered to spawn and extensions / tick | 3.91 | 3.91 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 3 % | 3 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 17 % | 17 % | 0 pts |
| CPU / tick (average, max) | 1.82, 21.27 | 1.87, 21.02 | -0.05 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 720 / - | 720 / - | 0 |
| Energy harvested (whole run) | 3,276 | 3,276 | 0 |
| Build energy spent on roads (share of all build energy) | 95 % | 95 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 2, harvester 3, upgrader 2.
Structures at end: road 4, spawn 1. Construction sites: 61 (container 1, extension 5, road 55). Build energy in the window by target: completed 30, extension 30, road 1126.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 19 lines, 0 with errors (reports/controller-sign-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   142/300 | idle | 1.8
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   142/300 | idle | 1.8
      700 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.5 |   142/300 | idle | 1.9
      800 | builder 2, harvester 3, upgrader 2       |   4.9 |   0.4 |   241/300 | idle | 1.7
      801 | builder 2, harvester 3, upgrader 2       |     4 |     0 |   292/300 | idle | 2.3

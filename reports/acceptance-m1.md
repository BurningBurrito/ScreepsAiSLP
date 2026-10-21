# Scorecard: acceptance-m1 · 2026-10-21 05:42 · 801 ticks · commit 1ebd257

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-21 05:38, 064195c) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.25 | 3.25 | 0 |
| Energy wasted at source regeneration (sum) | 4,924 | 4,924 | 0 |
| Controller progress / tick | 1.04 | 1.04 | 0 |
| Construction progress / tick | 2.2 | 2.2 | 0 |
| Energy delivered to spawn and extensions / tick | 0 | 0 | 0 |
| Spawn idle while energy is full | 100 % | 100 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 12 % | 12 % | 0 pts |
| CPU / tick (average, max) | 2, 19.14 | 2.03, 19.15 | -0.03 |
| RCL / progress at end (whole run) | 2 / 134 | 2 / 134 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 684 / - | 684 / - | 0 |
| Energy harvested (whole run) | 2,782 | 2,782 | 0 |
| Build energy spent on roads (share of all build energy) | 84 % | 84 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 6 (6) | 0 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: road 2, spawn 1. Construction sites: 62 (extension 5, road 57). Build energy in the window by target: completed 10, extension 105, road 590.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 14 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.5
      200 | builder 1, harvester 2, upgrader 2       |   5.7 |     0 |   249/300 | idle | 1.8
      300 | builder 2, harvester 2, upgrader 2       |   1.5 |     0 |   149/300 | idle | 2.1
      400 | builder 2, harvester 2, upgrader 2       |   3.7 |     0 |   300/300 | idle | 1.7
      500 | builder 2, harvester 2, upgrader 2       |   3.2 |   0.2 |   300/300 | idle | 1.7
      600 | builder 2, harvester 2, upgrader 2       |   3.4 |   1.6 |   300/300 | idle | 2.1
      700 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.3 |   300/300 | idle | 2.1
      800 | builder 2, harvester 2, upgrader 2       |   2.3 |   1.2 |   300/300 | idle | 1.9
      801 | builder 2, harvester 2, upgrader 2       |     0 |     1 |   300/300 | idle | 1.8

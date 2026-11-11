# Scorecard: acceptance-m3 · 2026-11-11 07:10 · 4001 ticks · commit 9e66bf5

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-10 17:06, 754f7d4) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.46 | 9.03 | -3.57 |
| Energy wasted at source regeneration (sum) | 11,318 | 10,894 | +424 |
| Controller progress / tick | 0.15 | 0.3 | -0.15 |
| Construction progress / tick | 5.02 | 2.15 | +2.87 |
| Energy delivered to spawn and extensions / tick | 4.65 | 4.28 | +0.37 |
| Spawn idle while energy is full | 0 % | 25 % | -25 pts |
| Spawn busy | 3 % | 17 % | -14 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 19 % | 29 % | -10 pts |
| CPU / tick (average, max) | 1.88, 23.95 | 2.23, 21.38 | -0.35 |
| RCL / progress at end (whole run) | 3 / 400 | 3 / 388 | +12 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 23,218 | 36,392 | -13,174 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 3 (11) | 12 (12) | -9 |

Creeps at end by role: harvester 2, upgrader 1.
Structures at end: extension 4, spawn 1, tower 1. Construction sites: 68 (container 1, extension 6, rampart 2, road 59). Build energy in the window by target: completed 17, extension 5002.
Room energy capacity 500; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 61 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.1
     1200 | builder 3, harvester 5, upgrader 1       |   6.3 |     0 |   187/300 | idle | 2
     1300 | builder 3, harvester 5, upgrader 2       |     7 |     0 |   237/300 | idle | 2
     1400 | builder 4, harvester 5, upgrader 2       |   8.2 |     0 |   134/300 | idle | 2.1
     1500 | builder 4, harvester 5, upgrader 2       |     9 |     0 |   134/300 | idle | 2.5
     1600 | builder 4, harvester 3, upgrader 2       |   6.9 |     0 |   134/300 | idle | 2.1
     1700 | builder 4, harvester 2, upgrader 2       |   6.6 |     0 |   134/350 | idle | 2
     1800 | builder 4, harvester 1, upgrader 2       |   3.7 |   0.5 |   184/350 | idle | 1.9
     1900 | builder 3, upgrader 2                    |   1.1 |   0.5 |   184/350 | idle | 1.6
     2000 | builder 1, harvester 1, upgrader 2       |     2 |   0.5 |   184/350 | idle | 1.6
     2100 | builder 1, harvester 2, upgrader 1       |   1.9 |   0.5 |   183/350 | idle | 1.5
     2200 | builder 1, harvester 4, upgrader 1       |   3.8 |     0 |    31/350 | busy | 1.5
     2300 | builder 1, harvester 5, upgrader 1       |   6.1 |     0 |   280/350 | idle | 1.8
     2400 | builder 3, harvester 5, upgrader 1       |   5.8 |     0 |   155/350 | idle | 1.9
     2500 | builder 3, harvester 5, upgrader 1       |   6.4 |     0 |   205/350 | idle | 2.2
     2600 | builder 3, harvester 5, upgrader 1       |   6.2 |     0 |   155/350 | idle | 2.2
     2700 | builder 3, harvester 5, upgrader 1       |   6.2 |     0 |   205/350 | idle | 2.2
     2800 | builder 3, harvester 5                   |   5.9 |     0 |   348/400 | idle | 2.1
     2900 | builder 2, harvester 5, upgrader 1       |   5.6 |     0 |   256/400 | idle | 2.2
     3000 | builder 2, harvester 5, upgrader 1       |   6.2 |   0.5 |   206/400 | idle | 2.3
     3100 | builder 2, harvester 5, upgrader 1       |   6.2 |     0 |   254/400 | idle | 2.1
     3200 | builder 2, harvester 5, upgrader 1       |   7.1 |     0 |   254/400 | idle | 2.1
     3300 | builder 2, harvester 5, upgrader 1       |   5.7 |     0 |   248/450 | idle | 2
     3400 | builder 2, harvester 5, upgrader 1       |   6.7 |   0.5 |   196/450 | idle | 2.2
     3500 | builder 2, harvester 4, upgrader 1       |   7.1 |     0 |   243/450 | idle | 2
     3600 | builder 2, harvester 3, upgrader 1       |     8 |     0 |   237/450 | idle | 2
     3700 | builder 2, harvester 2, upgrader 1       |   5.5 |     0 |   285/500 | idle | 1.9
     3800 | builder 2, harvester 1, upgrader 1       |   3.3 |   0.5 |   135/500 | idle | 1.7
     3900 | harvester 1, upgrader 1                  |   1.8 |   0.5 |   350/500 | idle | 1.4
     4000 | harvester 2, upgrader 1                  |   3.1 |     0 |    86/500 | idle | 1.4
     4001 | harvester 2, upgrader 1                  |     8 |     0 |    87/500 | idle | 1.6

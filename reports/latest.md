# Scorecard: acceptance-m3 · 2026-11-03 11:36 · 4001 ticks · commit f03bd18

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-03 08:32, 6b3393d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.87 | 10.44 | -0.57 |
| Energy wasted at source regeneration (sum) | 10,114 | 10,154 | -40 |
| Controller progress / tick | 0.05 | 0.1 | -0.05 |
| Construction progress / tick | 4.54 | 3.47 | +1.07 |
| Energy delivered to spawn and extensions / tick | 1.5 | 3.48 | -1.98 |
| Spawn idle while energy is full | 72 % | 43 % | +29 pts |
| Spawn busy | 6 % | 13 % | -7 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 35 % | 31 % | +4 pts |
| CPU / tick (average, max) | 2.31, 21.11 | 2.15, 20.95 | +0.16 |
| RCL / progress at end (whole run) | 3 / 358 | 3 / 201 | +157 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 28,482 | 37,796 | -9,314 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 10 (10) | 0 |

Creeps at end by role: builder 3, harvester 5, upgrader 2.
Structures at end: extension 3, rampart 2, spawn 1, tower 1. Construction sites: 67 (container 1, extension 7, road 59). Build energy in the window by target: completed 8, extension 4533.
Room energy capacity 450; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 62 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, upgrader 1                  |   3.5 |     0 |   149/300 | idle | 1.8
      200 | harvester 1, upgrader 1                  |   3.7 |     0 |   149/300 | idle | 1.6
      300 | harvester 1, upgrader 1                  |   2.8 |     0 |   149/300 | idle | 1.6
      400 | harvester 1, upgrader 1                  |   2.7 |     0 |   149/300 | idle | 1.6
      500 | harvester 1, upgrader 1                  |   3.7 |     0 |   149/300 | idle | 1.6
      600 | harvester 1, upgrader 1                  |   3.7 |     0 |   149/300 | idle | 1.8
      700 | harvester 1, upgrader 1                  |   3.7 |     0 |   149/300 | idle | 1.6
      800 | harvester 1, upgrader 1                  |   3.7 |     0 |   249/300 | idle | 1.6
      900 | harvester 1, upgrader 1                  |   3.7 |     0 |   199/300 | idle | 1.5
     1000 | harvester 1, upgrader 1                  |   3.7 |     0 |   249/300 | idle | 1.5
     1100 | harvester 1, upgrader 1                  |   3.7 |     0 |   249/300 | idle | 1.5
     1200 | harvester 1, upgrader 1                  |   3.7 |     0 |   249/300 | idle | 1.6
     1300 | harvester 2, upgrader 1                  |   3.7 |     0 |   199/300 | idle | 1.5
     1400 | harvester 4, upgrader 1                  |   6.1 |   0.1 |   297/300 | idle | 1.7
     1500 | builder 1, harvester 5, upgrader 1       |   8.3 |     0 |   196/300 | idle | 2
     1600 | builder 1, harvester 4, upgrader 1       |   7.1 |     0 |   296/300 | idle | 1.9
     1700 | builder 2, harvester 5, upgrader 1       |   8.3 |     0 |   295/300 | idle | 1.9
     1800 | builder 3, harvester 5, upgrader 2       |   6.1 |     0 |   300/300 | idle | 2
     1900 | builder 3, harvester 5, upgrader 2       |     5 |   0.2 |   300/300 | idle | 2
     2000 | builder 3, harvester 5, upgrader 2       |   7.6 |   0.8 |   300/300 | idle | 2.3
     2100 | builder 3, harvester 5, upgrader 2       |   7.2 |     0 |   300/300 | idle | 2.4
     2200 | builder 3, harvester 5, upgrader 2       |   9.3 |   0.1 |   300/300 | idle | 2.4
     2300 | builder 3, harvester 5, upgrader 2       |  11.2 |   0.4 |   300/300 | idle | 2.6
     2400 | builder 3, harvester 5, upgrader 2       |    11 |   0.5 |   350/350 | idle | 2.5
     2500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.6
     2600 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.7
     2700 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   350/350 | idle | 2.3
     2800 | builder 3, harvester 5, upgrader 2       |   6.8 |   0.3 |   350/350 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 2       |     8 |   0.7 |   267/350 | idle | 2.3
     3000 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   350/350 | idle | 2
     3100 | builder 3, harvester 5, upgrader 2       |  10.7 |     0 |   178/350 | idle | 2.1
     3200 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   291/350 | idle | 2.1
     3300 | builder 3, harvester 5, upgrader 2       |     8 |     0 |   350/350 | idle | 2
     3400 | builder 3, harvester 5, upgrader 2       |   7.5 |   0.5 |   350/350 | idle | 2.2
     3500 | builder 3, harvester 5, upgrader 2       |  10.9 |     0 |   400/400 | idle | 2.4
     3600 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.5
     3700 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.6
     3800 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.4
     3900 | builder 3, harvester 5, upgrader 2       |  10.3 |     0 |   400/450 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 2       |   9.9 |     0 |   450/450 | idle | 2.3
     4001 | builder 3, harvester 5, upgrader 2       |    12 |     0 |   450/450 | idle | 2.9

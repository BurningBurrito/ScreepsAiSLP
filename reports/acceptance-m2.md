# Scorecard: acceptance-m2 · 2026-10-30 07:57 · 3001 ticks · commit 7bf7d15

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-23 07:01, f4cf191) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.8 | 3.21 | +6.59 |
| Energy wasted at source regeneration (sum) | 9,172 | 14,016 | -4,844 |
| Controller progress / tick | 0.1 | 0.13 | -0.03 |
| Construction progress / tick | 4.81 | 4.01 | +0.8 |
| Energy delivered to spawn and extensions / tick | 1.53 | 2.74 | -1.21 |
| Spawn idle while energy is full | 66 % | 11 % | +56 pts |
| Spawn busy | 6 % | 0 % | +6 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 24 % | 15 % | +9 pts |
| CPU / tick (average, max) | 1.95, 20.02 | 1.74, 16.31 | +0.21 |
| RCL / progress at end (whole run) | 2 / 150 | 2 / 250 | -100 |
| Ticks to RCL 2 / RCL 3 (whole run) | 946 / - | 827 / - | +119 |
| Energy harvested (whole run) | 23,258 | 11,056 | +12,202 |
| Build energy spent on roads (share of all build energy) | 0 % | 85 % | -84 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 60 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 4 (4) | +3 |

Creeps at end by role: builder 3, harvester 3, upgrader 1.
Structures at end: extension 3, road 7, spawn 1. Construction sites: 55 (container 1, extension 2, road 52). Build energy in the window by target: completed 6, extension 4805.
Room energy capacity 450; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 44 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | builder 1, harvester 1                   |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 1, upgrader 1       |   2.6 |   0.3 |   300/300 | idle | 1.3
      400 | builder 1, harvester 1, upgrader 1       |   3.2 |   0.2 |   300/300 | idle | 1.4
      500 | builder 1, harvester 1, upgrader 1       |   3.7 |     0 |   300/300 | idle | 1.4
      600 | builder 1, harvester 1, upgrader 1       |     4 |   0.5 |   300/300 | idle | 1.5
      700 | builder 1, harvester 1, upgrader 1       |     4 |     0 |   300/300 | idle | 1.4
      800 | builder 1, harvester 1, upgrader 1       |   3.7 |   0.5 |   300/300 | idle | 1.4
      900 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   300/300 | idle | 1.4
     1000 | builder 1, harvester 2, upgrader 1       |   3.7 |   0.5 |   253/300 | idle | 1.5
     1100 | builder 2, harvester 3, upgrader 1       |   6.4 |     0 |   232/300 | idle | 1.6
     1200 | builder 3, harvester 3, upgrader 1       |   9.4 |   0.5 |   300/300 | idle | 1.9
     1300 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     1400 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.2
     1500 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     1600 | builder 3, harvester 3, upgrader 1       |   8.6 |     0 |     6/300 | busy | 2
     1700 | builder 3, harvester 3, upgrader 1       |   8.2 |     0 |   235/300 | idle | 1.9
     1800 | builder 3, harvester 3, upgrader 1       |   9.6 |     0 |   350/350 | idle | 2.1
     1900 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.1
     2000 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.1
     2100 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   350/350 | idle | 2.2
     2200 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2
     2300 | builder 3, harvester 3, upgrader 1       |  10.4 |     0 |   400/400 | idle | 2
     2400 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   400/400 | idle | 2.2
     2500 | builder 3, harvester 3, upgrader 1       |   9.5 |     0 |   300/400 | idle | 2.1
     2600 | builder 2, harvester 3, upgrader 1       |   5.5 |     0 |   345/400 | idle | 1.6
     2700 | builder 3, harvester 3, upgrader 1       |   5.3 |   0.5 |   116/400 | idle | 1.6
     2800 | builder 3, harvester 3, upgrader 1       |   7.9 |     0 |   400/400 | idle | 1.8
     2900 | builder 3, harvester 3, upgrader 1       |  14.5 |   0.5 |   400/400 | idle | 2
     3000 | builder 3, harvester 3, upgrader 1       |  11.5 |     0 |   450/450 | idle | 2
     3001 | builder 3, harvester 3, upgrader 1       |    12 |     0 |   450/450 | idle | 2.1

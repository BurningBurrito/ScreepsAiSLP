# Scorecard: acceptance-m2 · 2026-10-31 01:32 · 3001 ticks · commit e265aca

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-30 20:37, 2a12b91) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 10.57 | 10.57 | 0 |
| Energy wasted at source regeneration (sum) | 8,944 | 8,944 | 0 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 5.42 | 5.42 | 0 |
| Energy delivered to spawn and extensions / tick | 1.53 | 1.53 | 0 |
| Spawn idle while energy is full | 73 % | 73 % | 0 pts |
| Spawn busy | 6 % | 6 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 14 % | 14 % | 0 pts |
| CPU / tick (average, max) | 2, 20.05 | 2.03, 20.05 | -0.03 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 946 / - | 946 / - | 0 |
| Energy harvested (whole run) | 24,048 | 24,048 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 3, upgrader 1.
Structures at end: extension 3, road 7, spawn 1. Construction sites: 55 (container 1, extension 2, road 52). Build energy in the window by target: completed 10, extension 5411.
Room energy capacity 450; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 44 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | builder 1, harvester 1                   |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.2
      300 | builder 1, harvester 1, upgrader 1       |   2.6 |   0.3 |   300/300 | idle | 1.3
      400 | builder 1, harvester 1, upgrader 1       |   3.2 |   0.2 |   300/300 | idle | 1.4
      500 | builder 1, harvester 1, upgrader 1       |   3.7 |     0 |   300/300 | idle | 1.4
      600 | builder 1, harvester 1, upgrader 1       |     4 |   0.5 |   300/300 | idle | 1.4
      700 | builder 1, harvester 1, upgrader 1       |     4 |     0 |   300/300 | idle | 1.4
      800 | builder 1, harvester 1, upgrader 1       |   3.7 |   0.5 |   300/300 | idle | 1.4
      900 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   300/300 | idle | 1.4
     1000 | builder 1, harvester 2, upgrader 1       |   3.7 |   0.5 |   253/300 | idle | 1.5
     1100 | builder 3, harvester 3, upgrader 1       |   6.5 |     0 |     4/300 | busy | 1.6
     1200 | builder 3, harvester 3, upgrader 1       |   9.4 |     0 |   300/300 | idle | 1.9
     1300 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.1
     1400 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   300/300 | idle | 1.9
     1500 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   300/300 | idle | 1.9
     1600 | builder 3, harvester 3, upgrader 1       |   8.7 |     0 |    56/300 | busy | 1.8
     1700 | builder 3, harvester 3, upgrader 1       |   8.2 |     0 |   285/350 | idle | 1.8
     1800 | builder 3, harvester 3, upgrader 1       |   9.7 |     0 |   350/350 | idle | 2
     1900 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   350/350 | idle | 2.2
     2000 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.2
     2100 | builder 3, harvester 3, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.2
     2200 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.2
     2300 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.2
     2400 | builder 3, harvester 3, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.2
     2500 | builder 3, harvester 3, upgrader 1       |   9.5 |     0 |   300/400 | idle | 2.1
     2600 | builder 2, harvester 3, upgrader 1       |     6 |     0 |   394/400 | idle | 1.4
     2700 | builder 3, harvester 3, upgrader 1       |     7 |     0 |   237/400 | idle | 1.6
     2800 | builder 3, harvester 3, upgrader 1       |   9.7 |     0 |   400/400 | idle | 1.8
     2900 | builder 3, harvester 3, upgrader 1       |  14.4 |     0 |   450/450 | idle | 2
     3000 | builder 3, harvester 3, upgrader 1       |  14.5 |     0 |   450/450 | idle | 2.3
     3001 | builder 3, harvester 3, upgrader 1       |    16 |     0 |   450/450 | idle | 3.1

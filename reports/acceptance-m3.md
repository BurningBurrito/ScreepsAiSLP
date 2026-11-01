# Scorecard: acceptance-m3 · 2026-11-01 00:09 · 4001 ticks · commit be35fc7

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-31 18:48, f606551) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 10.46 | 10.91 | -0.45 |
| Energy wasted at source regeneration (sum) | 9,704 | 8,748 | +956 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 4.06 | 4.31 | -0.25 |
| Energy delivered to spawn and extensions / tick | 3.57 | 3.28 | +0.29 |
| Spawn idle while energy is full | 43 % | 50 % | -7 pts |
| Spawn busy | 13 % | 12 % | +1 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 30 % | 27 % | +3 pts |
| CPU / tick (average, max) | 2.09, 23.01 | 2.04, 23.06 | +0.05 |
| RCL / progress at end (whole run) | 3 / 0 | 3 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 38,022 | 38,640 | -618 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 9 (9) | +1 |

Creeps at end by role: builder 3, harvester 5, upgrader 2.
Structures at end: extension 4, rampart 2, spawn 1, tower 1. Construction sites: 66 (container 1, extension 6, road 59). Build energy in the window by target: completed 36, extension 4028.
Room energy capacity 500; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 70 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.4
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 1.9
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.2
     1300 | builder 3, harvester 5, upgrader 2       |  10.6 |     0 |   300/300 | idle | 2.4
     1400 | builder 3, harvester 5, upgrader 2       |     5 |     0 |   300/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 2       |   7.9 |     0 |   300/300 | idle | 2
     1600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |    56/300 | busy | 2.2
     1700 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   285/300 | idle | 2.1
     1800 | builder 3, harvester 5, upgrader 2       |   7.6 |     0 |   300/300 | idle | 2
     1900 | builder 3, harvester 5, upgrader 2       |   7.9 |     0 |     5/300 | busy | 2.1
     2000 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |   119/300 | idle | 2.2
     2100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   233/300 | idle | 2
     2200 | builder 3, harvester 5, upgrader 2       |    11 |     0 |   300/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 2       |    11 |     0 |   350/350 | idle | 2.2
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.2
     2500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.3
     2600 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.2
     2700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.4
     2800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.2
     3000 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.3
     3100 | builder 3, harvester 5, upgrader 2       |     8 |     0 |   400/400 | idle | 1.9
     3200 | builder 3, harvester 5, upgrader 2       |   8.6 |     0 |   174/400 | idle | 2
     3300 | builder 3, harvester 5, upgrader 2       |   6.4 |     0 |   440/450 | idle | 1.9
     3400 | builder 3, harvester 5, upgrader 2       |   6.5 |     0 |   450/450 | idle | 1.9
     3500 | builder 2, harvester 5, upgrader 2       |   8.5 |     0 |   346/450 | idle | 1.9
     3600 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   336/450 | idle | 1.9
     3700 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   450/450 | idle | 1.9
     3800 | builder 3, harvester 5, upgrader 2       |  16.2 |     0 |   450/450 | idle | 2.5
     3900 | builder 3, harvester 5, upgrader 2       |  16.2 |     0 |   450/450 | idle | 2.6
     4000 | builder 3, harvester 5, upgrader 2       |  15.8 |     0 |   500/500 | idle | 2.6
     4001 | builder 3, harvester 5, upgrader 2       |    12 |     0 |   500/500 | idle | 1.9

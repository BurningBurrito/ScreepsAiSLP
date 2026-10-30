# Scorecard: acceptance-m3 · 2026-10-30 10:24 · 4001 ticks · commit cb8e347

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-30 09:49, cb8e347) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 10.94 | 10.94 | 0 |
| Energy wasted at source regeneration (sum) | 8,800 | 8,800 | 0 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 4.28 | 4.28 | 0 |
| Energy delivered to spawn and extensions / tick | 3.27 | 3.27 | 0 |
| Spawn idle while energy is full | 46 % | 46 % | 0 pts |
| Spawn busy | 12 % | 12 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 29 % | 29 % | 0 pts |
| CPU / tick (average, max) | 2.1, 22.62 | 2.08, 26.07 | +0.02 |
| RCL / progress at end (whole run) | 3 / 0 | 3 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 38,120 | 38,120 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 9 (9) | 0 |

Creeps at end by role: builder 3, harvester 5, upgrader 1.
Structures at end: extension 4, spawn 1, tower 1. Construction sites: 66 (container 1, extension 6, road 59). Build energy in the window by target: completed 6, extension 4276.
Room energy capacity 500; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 67 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     1300 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   300/300 | idle | 2.1
     1400 | builder 3, harvester 5, upgrader 1       |   4.4 |     0 |   300/300 | idle | 1.7
     1500 | builder 3, harvester 5, upgrader 1       |   6.3 |     0 |   300/300 | idle | 1.7
     1600 | builder 3, harvester 5, upgrader 1       |   8.2 |     0 |    56/300 | busy | 2
     1700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   185/300 | idle | 2.1
     1800 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   300/300 | idle | 1.9
     1900 | builder 3, harvester 5, upgrader 1       |   8.3 |     0 |    55/300 | busy | 1.9
     2000 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   119/300 | idle | 2.1
     2100 | builder 3, harvester 5, upgrader 1       |   9.4 |     0 |   300/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |  10.9 |     0 |   350/350 | idle | 2.1
     2400 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.1
     2500 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.3
     2600 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   350/350 | idle | 2.2
     2700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.3
     2800 | builder 3, harvester 5, upgrader 1       |    11 |     0 |   400/400 | idle | 2.1
     2900 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   400/400 | idle | 2.1
     3000 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.3
     3100 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   348/400 | idle | 1.9
     3200 | builder 3, harvester 5, upgrader 1       |   6.3 |     0 |    70/400 | idle | 1.9
     3300 | builder 3, harvester 5, upgrader 1       |   7.1 |     0 |   350/400 | idle | 1.7
     3400 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   400/400 | idle | 2
     3500 | builder 2, harvester 5, upgrader 1       |   9.8 |     0 |   350/450 | idle | 2
     3600 | builder 3, harvester 5, upgrader 1       |   9.3 |     0 |   411/450 | idle | 2
     3700 | builder 3, harvester 5, upgrader 1       |  13.4 |     0 |   450/450 | idle | 2.5
     3800 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   450/450 | idle | 2.4
     3900 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   450/450 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 1       |  13.8 |     0 |   500/500 | idle | 2.1
     4001 | builder 3, harvester 5, upgrader 1       |    18 |     0 |   500/500 | idle | 3.2

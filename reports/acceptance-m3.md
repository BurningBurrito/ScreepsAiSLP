# Scorecard: acceptance-m3 · 2026-11-09 12:19 · 4001 ticks · commit 92f465f

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-09 11:06, 7542b1f) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 10.62 | 10.62 | 0 |
| Energy wasted at source regeneration (sum) | 9,948 | 9,948 | 0 |
| Controller progress / tick | 0.1 | 0.1 | 0 |
| Construction progress / tick | 3.91 | 3.91 | 0 |
| Energy delivered to spawn and extensions / tick | 3.61 | 3.61 | 0 |
| Spawn idle while energy is full | 40 % | 40 % | 0 pts |
| Spawn busy | 14 % | 14 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 29 % | 29 % | 0 pts |
| CPU / tick (average, max) | 2.15, 21.43 | 2.14, 21 | +0.01 |
| RCL / progress at end (whole run) | 3 / 200 | 3 / 200 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 38,192 | 38,192 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 10 (10) | 0 |

Creeps at end by role: builder 3, harvester 5, upgrader 2.
Structures at end: extension 3, rampart 2, spawn 1, tower 1. Construction sites: 67 (container 1, extension 7, road 59). Build energy in the window by target: completed 29, extension 3881.
Room energy capacity 450; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 70 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.3
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1300 | builder 3, harvester 5, upgrader 2       |  10.4 |     0 |   300/300 | idle | 2.4
     1400 | builder 3, harvester 5, upgrader 2       |   5.3 |     0 |   300/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 2       |     9 |     1 |   300/300 | idle | 2.2
     1600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |    56/300 | busy | 2.4
     1700 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   235/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     1900 | builder 3, harvester 5, upgrader 2       |   7.6 |     0 |     5/300 | busy | 2.1
     2000 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |   119/300 | idle | 2.4
     2100 | builder 3, harvester 5, upgrader 2       |   8.8 |     0 |   233/300 | idle | 2.3
     2200 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   300/300 | idle | 2.4
     2300 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   350/350 | idle | 2.5
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.6
     2500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     2600 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.5
     2700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.5
     2800 | builder 3, harvester 5, upgrader 2       |    11 |     0 |   400/400 | idle | 2.4
     2900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.4
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.4
     3100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   400/400 | idle | 2.3
     3200 | builder 3, harvester 5, upgrader 2       |   8.8 |   0.5 |   124/400 | idle | 2.1
     3300 | builder 3, harvester 5, upgrader 2       |   7.2 |     0 |   400/400 | idle | 2
     3400 | builder 3, harvester 5, upgrader 2       |   7.9 |     0 |   400/400 | idle | 2
     3500 | builder 2, harvester 5, upgrader 2       |  10.8 |   0.5 |   331/400 | idle | 2.1
     3600 | builder 3, harvester 5, upgrader 1       |    10 |     0 |   204/400 | idle | 2
     3700 | builder 3, harvester 5, upgrader 2       |   8.2 |     0 |   381/400 | idle | 2
     3800 | builder 3, harvester 5, upgrader 1       |    12 |     0 |   450/450 | idle | 2.3
     3900 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   450/450 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   450/450 | idle | 2.3
     4001 | builder 3, harvester 5, upgrader 2       |    18 |     0 |   450/450 | idle | 2.3

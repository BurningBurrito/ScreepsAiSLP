# Scorecard: acceptance-m4 · 2026-11-03 08:57 · 6001 ticks · commit 6b3393d

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-03 07:16, 4a706dc) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 11.11 | 12.66 | -1.55 |
| Energy wasted at source regeneration (sum) | 7,596 | 6,968 | +628 |
| Controller progress / tick | 0.1 | 0.2 | -0.1 |
| Construction progress / tick | 3.37 | 5.26 | -1.89 |
| Energy delivered to spawn and extensions / tick | 1.27 | 1.31 | -0.04 |
| Spawn idle while energy is full | 76 % | 68 % | +9 pts |
| Spawn busy | 5 % | 5 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | 38 % | +2 pts |
| CPU / tick (average, max) | 2.16, 30.4 | 2.28, 28.63 | -0.12 |
| RCL / progress at end (whole run) | 5 / 300 | 5 / 444 | -144 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 56,324 | 58,342 | -2,018 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 11 (11) | 11 (11) | 0 |

Creeps at end by role: builder 3, defender 1, harvester 5, upgrader 2.
Structures at end: extension 4, rampart 2, spawn 1, tower 2. Construction sites: 87 (container 1, extension 26, rampart 1, road 59). Build energy in the window by target: completed 41, extension 3328.
Room energy capacity 500; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 103 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.7
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.7
     1300 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     1400 | builder 3, harvester 5, upgrader 2       |     5 |     0 |   300/300 | idle | 2
     1500 | builder 3, harvester 5, upgrader 2       |     6 |     0 |   300/300 | idle | 2
     1600 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |    56/300 | busy | 2.3
     1700 | builder 3, harvester 5, upgrader 2       |   8.1 |     0 |   235/300 | idle | 2.3
     1800 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.3
     1900 | builder 3, harvester 5, upgrader 2       |   8.6 |     0 |    55/300 | busy | 2.3
     2000 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   119/300 | idle | 2.3
     2100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   233/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   300/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
     2600 | builder 3, harvester 5, upgrader 2       |   9.2 |     0 |   300/300 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 2       |   5.8 |     0 |   300/300 | idle | 2.2
     2800 | builder 3, harvester 5, upgrader 2       |   8.4 |   0.2 |   300/300 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 2       |  11.1 |   0.3 |   300/300 | idle | 2.4
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     3100 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   300/300 | idle | 2.3
     3200 | builder 3, harvester 5, upgrader 2       |   8.2 |   0.5 |   174/300 | idle | 2.3
     3300 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     3400 | builder 3, harvester 5, upgrader 2       |   8.5 |     0 |   350/350 | idle | 2.2
     3500 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |    58/350 | busy | 2.3
     3600 | builder 3, harvester 5, upgrader 2       |   8.4 |     0 |   172/350 | idle | 2.2
     3700 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   350/350 | idle | 2.2
     3800 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.3
     3900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.4
     4100 | builder 3, harvester 5, upgrader 2       |   9.2 |     0 |   350/400 | idle | 2.4
     4200 | builder 3, harvester 5, upgrader 2       |   7.7 |     0 |   400/400 | idle | 2.3
     4300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.4
     4400 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.3
     4500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.3
     4600 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   400/400 | idle | 2.3
     4700 | builder 3, harvester 5, upgrader 2       |   7.9 |     0 |    63/400 | busy | 2.2
     4800 | builder 3, harvester 5, upgrader 2       |   7.7 |     0 |   231/450 | idle | 2.2
     4900 | builder 3, harvester 5, upgrader 2       |     7 |     1 |   450/450 | idle | 2.3
     5000 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   400/450 | idle | 2.3
     5100 | builder 3, harvester 5, upgrader 2       |  10.5 |     0 |   206/450 | busy | 2.2
     5200 | builder 3, harvester 5, upgrader 2       |  15.5 |     0 |   450/450 | idle | 2.5
     5300 | builder 3, harvester 5, upgrader 2       |  16.2 |     0 |   450/450 | idle | 2.5
     5400 | builder 3, harvester 5, upgrader 2       |  15.6 |     0 |   450/500 | idle | 2.5
     5500 | builder 3, defender 1, harvester 5, upgrader 2 |   4.9 |     0 |   450/500 | idle | 2
     5600 | builder 3, defender 1, harvester 5, upgrader 2 |   5.2 |     0 |   500/500 | idle | 1.8
     5700 | builder 3, defender 1, harvester 5, upgrader 2 |  10.8 |     0 |   500/500 | idle | 1.9
     5800 | builder 3, defender 1, harvester 5, upgrader 2 |  10.8 |   0.2 |   500/500 | idle | 2
     5900 | builder 3, defender 1, harvester 5, upgrader 2 |  10.8 |   0.8 |   500/500 | idle | 2.1
     6000 | builder 3, defender 1, harvester 5, upgrader 2 |  10.8 |     0 |   500/500 | idle | 2.1
     6001 | builder 3, defender 1, harvester 5, upgrader 2 |    12 |     0 |   500/500 | idle | 1.6

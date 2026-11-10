# Scorecard: acceptance-m3 · 2026-11-10 17:06 · 4001 ticks · commit 754f7d4

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-10 11:30, cf6c66a) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.03 | 9.03 | 0 |
| Energy wasted at source regeneration (sum) | 10,894 | 10,894 | 0 |
| Controller progress / tick | 0.3 | 0.3 | 0 |
| Construction progress / tick | 2.15 | 2.15 | 0 |
| Energy delivered to spawn and extensions / tick | 4.28 | 4.28 | 0 |
| Spawn idle while energy is full | 25 % | 25 % | 0 pts |
| Spawn busy | 17 % | 17 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 29 % | 29 % | 0 pts |
| CPU / tick (average, max) | 2.23, 21.38 | 2.24, 21.28 | -0.01 |
| RCL / progress at end (whole run) | 3 / 388 | 3 / 388 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 36,392 | 36,392 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 12 (12) | 12 (12) | 0 |

Creeps at end by role: builder 5, harvester 5, upgrader 2.
Structures at end: extension 3, rampart 2, spawn 1, tower 1. Construction sites: 67 (container 1, extension 7, road 59). Build energy in the window by target: completed 17, extension 2130.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 76 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.4
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 4, harvester 5, upgrader 2       |   9.5 |     0 |     1/300 | busy | 2
      700 | builder 5, harvester 5, upgrader 2       |   9.4 |     0 |   300/300 | idle | 2.1
      800 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
      900 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     1000 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1100 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.7
     1300 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     1400 | builder 5, harvester 5, upgrader 2       |   7.3 |     0 |   300/300 | idle | 2.2
     1500 | builder 5, harvester 5, upgrader 2       |   5.7 |   0.9 |   300/300 | idle | 2.1
     1600 | builder 5, harvester 5, upgrader 2       |     9 |     0 |     6/300 | busy | 2.2
     1700 | builder 5, harvester 5, upgrader 2       |   7.9 |     0 |   235/300 | idle | 2.2
     1800 | builder 5, harvester 5, upgrader 2       |   7.9 |     0 |   300/300 | idle | 2.3
     1900 | builder 5, harvester 5, upgrader 2       |   8.8 |     0 |     5/300 | busy | 2.2
     2000 | builder 5, harvester 5, upgrader 2       |   9.3 |     0 |   119/300 | idle | 2.2
     2100 | builder 5, harvester 5, upgrader 2       |   9.4 |     0 |   233/300 | idle | 2.3
     2200 | builder 5, harvester 5, upgrader 2       |   9.1 |     0 |   300/300 | idle | 2.3
     2300 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     2400 | builder 5, harvester 5, upgrader 2       |  10.6 |     0 |   350/350 | idle | 2.7
     2500 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.6
     2600 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.7
     2700 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.7
     2800 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.7
     2900 | builder 5, harvester 5, upgrader 2       |    11 |     0 |   400/400 | idle | 2.8
     3000 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.6
     3100 | builder 5, harvester 5, upgrader 2       |   6.8 |     0 |   359/400 | idle | 2.2
     3200 | builder 5, harvester 5, upgrader 2       |   7.3 |   0.5 |   122/400 | idle | 1.9
     3300 | builder 5, harvester 5, upgrader 2       |   6.3 |     0 |   300/400 | idle | 1.9
     3400 | builder 5, harvester 5, upgrader 2       |     7 |     1 |   400/400 | idle | 2
     3500 | builder 4, harvester 5, upgrader 2       |   9.7 |     0 |   336/400 | idle | 2.1
     3600 | builder 5, harvester 5, upgrader 1       |  10.1 |     0 |   326/400 | idle | 2.4
     3700 | builder 4, harvester 5, upgrader 2       |   8.7 |     0 |   223/400 | idle | 2.2
     3800 | builder 5, harvester 5, upgrader 2       |   9.2 |   0.5 |   400/400 | idle | 2.5
     3900 | builder 5, harvester 5, upgrader 2       |  10.6 |     0 |   400/400 | idle | 2.3
     4000 | builder 5, harvester 5, upgrader 2       |  14.6 |     1 |   450/450 | idle | 2.7
     4001 | builder 5, harvester 5, upgrader 2       |     6 |     0 |   450/450 | idle | 2.6

# Scorecard: acceptance-m3 · 2026-10-31 18:48 · 4001 ticks · commit f606551

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-31 17:38, 2c081e3) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 10.91 | 10.91 | 0 |
| Energy wasted at source regeneration (sum) | 8,748 | 8,748 | 0 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 4.31 | 4.31 | 0 |
| Energy delivered to spawn and extensions / tick | 3.28 | 3.28 | 0 |
| Spawn idle while energy is full | 50 % | 50 % | 0 pts |
| Spawn busy | 12 % | 12 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 27 % | 27 % | 0 pts |
| CPU / tick (average, max) | 2.04, 23.06 | 2.08, 23.12 | -0.04 |
| RCL / progress at end (whole run) | 3 / 0 | 3 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 38,640 | 38,640 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 9 (9) | 0 |

Creeps at end by role: builder 3, harvester 5, upgrader 1.
Structures at end: extension 4, rampart 2, spawn 1, tower 1. Construction sites: 66 (container 1, extension 6, road 59). Build energy in the window by target: completed 27, extension 4286.
Room energy capacity 500; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 67 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.4
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 1.9
      600 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   300/300 | idle | 2
      700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
      900 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.3
     1200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.1
     1300 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   300/300 | idle | 2
     1400 | builder 3, harvester 5, upgrader 1       |   4.7 |     0 |   300/300 | idle | 1.6
     1500 | builder 3, harvester 5, upgrader 1       |  10.5 |     0 |   300/300 | idle | 1.8
     1600 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |     6/300 | busy | 2
     1700 | builder 3, harvester 5, upgrader 1       |   8.6 |     0 |   185/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 1       |   7.8 |     0 |   300/300 | idle | 1.9
     1900 | builder 3, harvester 5, upgrader 1       |   7.6 |     0 |   105/300 | busy | 2
     2000 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   169/300 | idle | 2
     2100 | builder 3, harvester 5, upgrader 1       |    10 |     0 |   300/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.5
     2300 | builder 3, harvester 5, upgrader 1       |    11 |     0 |   350/350 | idle | 2.4
     2400 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.5
     2500 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.4
     2600 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   350/400 | idle | 2.4
     2800 | builder 3, harvester 5, upgrader 1       |    11 |     0 |   400/400 | idle | 2.4
     2900 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.4
     3000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   400/400 | idle | 2.3
     3100 | builder 3, harvester 5, upgrader 1       |   7.8 |     0 |   400/400 | idle | 2
     3200 | builder 3, harvester 5, upgrader 1       |   8.1 |     0 |   224/400 | idle | 1.8
     3300 | builder 3, harvester 5, upgrader 1       |     7 |     0 |   400/400 | idle | 1.8
     3400 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   400/400 | idle | 1.7
     3500 | builder 3, harvester 5, upgrader 1       |  10.6 |     0 |     1/450 | busy | 1.9
     3600 | builder 3, harvester 5, upgrader 1       |   9.2 |     0 |   400/450 | idle | 2
     3700 | builder 3, harvester 5, upgrader 1       |  14.5 |     0 |   450/450 | idle | 2.3
     3800 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   450/450 | idle | 2.5
     3900 | builder 3, harvester 5, upgrader 1       |  15.2 |     0 |   500/500 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 1       |  11.5 |     0 |   500/500 | idle | 1.9
     4001 | builder 3, harvester 5, upgrader 1       |    12 |     0 |   500/500 | idle | 1.9

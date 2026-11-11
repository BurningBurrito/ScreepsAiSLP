# Scorecard: acceptance-m3 · 2026-11-11 22:44 · 4001 ticks · commit 5440f7a

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-11 21:31, 7c65fe0) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 7.78 | 7.78 | 0 |
| Energy wasted at source regeneration (sum) | 8,818 | 8,818 | 0 |
| Controller progress / tick | 0.13 | 0.13 | 0 |
| Construction progress / tick | 4.52 | 4.52 | 0 |
| Energy delivered to spawn and extensions / tick | 6.35 | 6.35 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 10 % | 10 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 30 % | 30 % | 0 pts |
| CPU / tick (average, max) | 1.88, 21.66 | 1.94, 21.44 | -0.06 |
| RCL / progress at end (whole run) | 3 / 278 | 3 / 278 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 29,614 | 29,614 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (10) | 7 (10) | 0 |

Creeps at end by role: builder 1, harvester 5, upgrader 1.
Structures at end: extension 5, rampart 2, spawn 1, tower 1. Construction sites: 65 (container 1, extension 5, road 59). Build energy in the window by target: completed 22, extension 4496.
Room energy capacity 550; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 66 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.4
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 1.9
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.1
     1200 | builder 3, harvester 5, upgrader 1       |   6.3 |     0 |   187/300 | idle | 2
     1300 | builder 3, harvester 5, upgrader 1       |   5.9 |     0 |   187/300 | idle | 1.9
     1400 | builder 3, harvester 5, upgrader 1       |   7.7 |     0 |   237/300 | idle | 2
     1500 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   137/300 | idle | 2.3
     1600 | builder 3, harvester 4, upgrader 1       |   8.5 |     0 |   225/300 | idle | 2.1
     1700 | builder 3, harvester 4, upgrader 1       |   7.1 |   0.5 |   290/300 | idle | 2
     1800 | builder 3, harvester 5, upgrader 2       |   6.8 |     0 |     7/350 | busy | 1.9
     1900 | builder 2, harvester 5, upgrader 2       |   7.8 |     0 |   207/350 | idle | 2
     2000 | builder 1, harvester 5, upgrader 2       |   7.7 |   0.5 |    55/350 | busy | 2.1
     2100 | builder 1, harvester 5, upgrader 1       |   7.9 |     0 |   255/350 | idle | 1.9
     2200 | builder 2, harvester 5, upgrader 1       |   7.8 |   0.1 |   204/350 | idle | 2
     2300 | builder 2, harvester 5, upgrader 1       |     8 |   0.4 |   154/350 | idle | 2.2
     2400 | builder 2, harvester 5, upgrader 1       |     8 |     0 |   254/400 | idle | 2.1
     2500 | builder 2, harvester 5, upgrader 1       |   7.8 |     0 |   152/400 | idle | 2.2
     2600 | builder 2, harvester 5, upgrader 1       |     8 |     0 |   152/400 | idle | 2.2
     2700 | builder 2, harvester 5, upgrader 1       |     8 |     0 |   202/450 | idle | 2.1
     2800 | builder 2, harvester 5, upgrader 1       |   7.9 |     0 |   202/450 | idle | 2.1
     2900 | builder 2, harvester 5, upgrader 1       |     8 |     0 |   202/450 | idle | 2.1
     3000 | builder 2, harvester 5, upgrader 1       |   7.9 |     0 |   252/450 | idle | 2.2
     3100 | builder 2, harvester 5, upgrader 1       |   6.1 |     0 |    70/450 | idle | 2
     3200 | builder 2, harvester 5, upgrader 1       |     7 |   0.5 |   300/450 | idle | 1.8
     3300 | builder 2, harvester 5, upgrader 1       |   5.3 |   0.1 |   400/450 | idle | 1.6
     3400 | builder 2, harvester 4, upgrader 1       |   6.9 |   0.1 |   265/450 | idle | 1.6
     3500 | builder 2, harvester 5, upgrader 1       |   6.3 |   0.5 |   267/500 | idle | 1.9
     3600 | builder 2, harvester 5, upgrader 1       |   6.5 |     0 |   120/500 | busy | 1.8
     3700 | builder 1, harvester 5, upgrader 1       |  11.6 |     0 |   236/500 | idle | 2.2
     3800 | builder 1, harvester 5, upgrader 1       |  10.4 |     0 |   300/500 | idle | 2
     3900 | builder 1, harvester 5, upgrader 1       |  10.3 |     0 |   300/550 | idle | 2
     4000 | builder 1, harvester 5, upgrader 1       |   7.6 |     0 |   267/550 | idle | 1.8
     4001 | builder 1, harvester 5, upgrader 1       |    12 |     0 |   268/550 | idle | 2.7

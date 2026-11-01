# Scorecard: acceptance-m2 · 2026-10-31 23:52 · 3001 ticks · commit be35fc7

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-10-31 18:31, f606551) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.64 | 10.57 | -3.93 |
| Energy wasted at source regeneration (sum) | 10,066 | 8,944 | +1,122 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 4.35 | 5.42 | -1.07 |
| Energy delivered to spawn and extensions / tick | 3.67 | 1.53 | +2.14 |
| Spawn idle while energy is full | 31 % | 73 % | -41 pts |
| Spawn busy | 4 % | 6 % | -1 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 22 % | 14 % | +8 pts |
| CPU / tick (average, max) | 1.84, 20.42 | 1.98, 20.29 | -0.14 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 945 / - | 946 / - | -1 |
| Energy harvested (whole run) | 13,910 | 24,048 | -10,138 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 7 (7) | +1 |

Creeps at end by role: builder 3, harvester 3, upgrader 2.
Structures at end: extension 2, road 10, spawn 1. Construction sites: 53 (container 1, extension 3, road 49). Build energy in the window by target: completed 2, extension 4346.
Room energy capacity 400; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 41 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | builder 1, harvester 1                   |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 1, upgrader 1       |   2.6 |   0.3 |   146/300 | idle | 1.4
      400 | builder 1, harvester 1, upgrader 1       |   2.9 |   0.2 |   146/300 | idle | 1.4
      500 | builder 1, harvester 1, upgrader 1       |   3.7 |     0 |   146/300 | idle | 1.4
      600 | builder 1, harvester 1, upgrader 1       |   3.8 |   0.5 |   196/300 | idle | 1.5
      700 | builder 1, harvester 1, upgrader 1       |   4.1 |     0 |   146/300 | idle | 1.5
      800 | builder 1, harvester 1, upgrader 1       |   3.7 |   0.5 |   196/300 | idle | 1.5
      900 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.5
     1000 | builder 1, harvester 1, upgrader 1       |     4 |   0.5 |   146/300 | idle | 1.5
     1100 | builder 1, harvester 1, upgrader 1       |   4.8 |     0 |   146/300 | idle | 1.4
     1200 | builder 1, harvester 1, upgrader 1       |   4.6 |     0 |   146/300 | idle | 1.4
     1300 | builder 1, harvester 1, upgrader 1       |   4.6 |     0 |   196/300 | idle | 1.4
     1400 | builder 1, harvester 1, upgrader 1       |   4.6 |     0 |   146/300 | idle | 1.4
     1500 | builder 1, harvester 1, upgrader 1       |   4.6 |     0 |   146/350 | idle | 1.4
     1600 | upgrader 1                               |   1.8 |     0 |   146/350 | idle | 1.2
     1700 | harvester 1                              |   0.7 |     0 |    96/350 | idle | 1
     1800 | harvester 2                              |   1.9 |     0 |    95/350 | idle | 1.1
     1900 | harvester 3                              |   2.4 |     0 |    94/350 | idle | 1.2
     2000 | builder 1, harvester 3                   |   6.1 |     0 |   193/350 | idle | 1.5
     2100 | builder 2, harvester 3                   |   5.5 |     0 |    42/350 | busy | 1.6
     2200 | builder 2, harvester 3                   |   6.2 |     0 |   192/350 | idle | 1.7
     2300 | builder 3, harvester 3                   |   5.5 |     0 |   141/350 | idle | 1.7
     2400 | builder 3, harvester 3, upgrader 1       |     6 |     0 |   190/350 | idle | 1.8
     2500 | builder 3, harvester 3, upgrader 1       |   5.3 |     0 |   325/350 | idle | 1.7
     2600 | builder 3, harvester 3, upgrader 2       |   6.1 |     0 |   195/400 | idle | 1.9
     2700 | builder 3, harvester 3, upgrader 2       |   5.1 |     0 |   400/400 | idle | 1.8
     2800 | builder 3, harvester 3, upgrader 2       |   8.1 |     0 |   400/400 | idle | 2
     2900 | builder 3, harvester 3, upgrader 2       |   9.4 |     0 |   400/400 | idle | 2.2
     3000 | builder 3, harvester 3, upgrader 2       |   9.3 |     0 |   400/400 | idle | 2
     3001 | builder 3, harvester 3, upgrader 2       |     6 |     0 |   400/400 | idle | 2.4

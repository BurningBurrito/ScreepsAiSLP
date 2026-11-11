# Scorecard: acceptance-m2 · 2026-11-11 07:31 · 3001 ticks · commit de5c985

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-11 02:41, bc47292) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.79 | 5.79 | 0 |
| Energy wasted at source regeneration (sum) | 10,316 | 10,316 | 0 |
| Controller progress / tick | 0.2 | 0.2 | 0 |
| Construction progress / tick | 4.2 | 4.2 | 0 |
| Energy delivered to spawn and extensions / tick | 5.04 | 5.04 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 7 % | 7 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 24 % | 24 % | 0 pts |
| CPU / tick (average, max) | 2.01, 22.66 | 2.02, 20.95 | -0.01 |
| RCL / progress at end (whole run) | 2 / 700 | 2 / 700 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 712 / - | 712 / - | 0 |
| Energy harvested (whole run) | 12,996 | 12,996 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 10 (10) | 0 |

Creeps at end by role: builder 4, harvester 3, hauler 1, upgrader 2.
Structures at end: container 1, extension 1, road 3, spawn 1. Construction sites: 60 (extension 4, road 56). Build energy in the window by target: completed 13, container 4112, extension 77.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 50 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.5 |   0.5 |   257/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   186/300 | idle | 1.7
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   136/300 | idle | 1.7
      700 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.6 |   186/300 | idle | 1.7
      800 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.3 |   136/300 | idle | 1.7
      900 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.5 |   136/300 | idle | 1.7
     1000 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.5 |   136/300 | idle | 1.8
     1100 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   136/300 | idle | 1.8
     1200 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.5 |   136/300 | idle | 1.7
     1300 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   186/300 | idle | 1.7
     1400 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.5 |   136/350 | idle | 1.8
     1500 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   186/350 | idle | 1.8
     1600 | builder 2, upgrader 2                    |     1 |   0.5 |   186/350 | idle | 1.4
     1700 | builder 1, upgrader 2                    |   0.5 |   0.5 |   186/350 | idle | 1.4
     1800 | builder 1, harvester 1, upgrader 1       |   1.5 |   0.5 |   186/350 | idle | 1.3
     1900 | builder 1, harvester 2                   |   1.9 |     0 |   185/350 | idle | 1.3
     2000 | builder 1, harvester 3                   |   3.8 |     0 |    33/350 | busy | 1.3
     2100 | builder 3, harvester 3                   |   5.8 |     0 |    81/350 | busy | 1.5
     2200 | builder 3, harvester 3, upgrader 1       |   5.1 |     0 |   248/350 | idle | 1.6
     2300 | builder 3, harvester 3, upgrader 2       |   4.3 |     0 |   286/350 | idle | 1.7
     2400 | builder 4, harvester 3, upgrader 2       |   5.8 |     1 |   236/350 | idle | 2.2
     2500 | builder 4, harvester 3, upgrader 2       |   6.3 |     0 |   136/350 | idle | 2.2
     2600 | builder 4, harvester 3, upgrader 2       |   6.5 |     0 |   186/350 | idle | 2.2
     2700 | builder 4, harvester 3, upgrader 2       |   5.6 |     0 |   136/350 | idle | 2.1
     2800 | builder 4, harvester 3, upgrader 2       |   6.2 |     1 |   186/350 | idle | 2.3
     2900 | builder 4, harvester 3, upgrader 2       |   6.2 |     0 |   136/350 | idle | 2.2
     3000 | builder 4, harvester 3, hauler 1, upgrader 2 |   6.2 |     0 |   188/350 | idle | 2.1
     3001 | builder 4, harvester 3, hauler 1, upgrader 2 |     6 |     0 |   189/350 | idle | 2.3

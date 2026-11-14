# Scorecard: acceptance-m2 · 2026-11-14 09:34 · 3001 ticks · commit e53adee

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-14 07:45, dd0837d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.07 | 5.07 | 0 |
| Energy wasted at source regeneration (sum) | 12,688 | 12,688 | 0 |
| Controller progress / tick | 0.15 | 0.15 | 0 |
| Construction progress / tick | 5.58 | 5.58 | 0 |
| Energy delivered to spawn and extensions / tick | 4.6 | 4.6 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 1 % | 1 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 30 % | 30 % | 0 pts |
| CPU / tick (average, max) | 1.81, 21.21 | 1.86, 21.78 | -0.05 |
| RCL / progress at end (whole run) | 2 / 360 | 2 / 360 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 720 / - | 720 / - | 0 |
| Energy harvested (whole run) | 17,280 | 17,280 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (8) | 6 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 1, upgrader 1.
Structures at end: container 1, extension 2, road 4, spawn 1. Construction sites: 58 (extension 3, road 55). Build energy in the window by target: completed 30, container 483, extension 5070.
Room energy capacity 400; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 60 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   142/300 | idle | 1.8
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   142/300 | idle | 1.8
      700 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.5 |   142/300 | idle | 1.8
      800 | builder 2, harvester 3, upgrader 2       |   4.9 |   0.4 |   241/300 | idle | 1.7
      900 | builder 3, harvester 3, upgrader 2       |   7.9 |   0.5 |   191/300 | idle | 2.1
     1000 | builder 3, harvester 3, upgrader 2       |   7.4 |     0 |   191/300 | idle | 2.2
     1100 | builder 3, harvester 3, upgrader 2       |     8 |     0 |   141/300 | idle | 2.4
     1200 | builder 3, harvester 3, upgrader 2       |   7.4 |     0 |   141/350 | idle | 2.2
     1300 | builder 3, harvester 3, upgrader 2       |     8 |     0 |   141/350 | idle | 2.4
     1400 | builder 3, harvester 3, upgrader 2       |   7.4 |   0.5 |   141/350 | idle | 2.5
     1500 | builder 3, harvester 3, upgrader 2       |   7.9 |   0.1 |   191/350 | idle | 2.4
     1600 | builder 3, harvester 2, upgrader 2       |   5.8 |     0 |   240/350 | idle | 1.9
     1700 | builder 2, harvester 3, upgrader 2       |   6.2 |     1 |   118/350 | idle | 2
     1800 | builder 2, harvester 3, upgrader 1       |   7.4 |     0 |   168/350 | idle | 2.1
     1900 | builder 3, harvester 3                   |   7.9 |     0 |   316/350 | idle | 1.9
     2000 | builder 3, harvester 3, upgrader 1       |   7.8 |     0 |   244/350 | idle | 1.8
     2100 | builder 3, harvester 3, upgrader 1       |   7.4 |     0 |   144/350 | idle | 1.9
     2200 | builder 3, harvester 3, upgrader 1       |     8 |     0 |   144/350 | idle | 1.8
     2300 | builder 3, harvester 2, hauler 1, upgrader 1 |   6.3 |     0 |    95/350 | idle | 1.9
     2400 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.2 |     0 |   155/350 | idle | 1.8
     2500 | builder 2, harvester 2, hauler 1, upgrader 1 |   3.7 |   0.5 |   173/350 | idle | 1.8
     2600 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.8 |     0 |   187/400 | idle | 1.9
     2700 | builder 2, harvester 2, hauler 1, upgrader 1 |   3.7 |   0.5 |   201/400 | idle | 1.8
     2800 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.8 |     0 |   166/400 | idle | 1.8
     2900 | builder 2, harvester 2, hauler 1, upgrader 1 |   3.7 |     0 |   228/400 | idle | 1.6
     3000 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.2 |   0.5 |   190/400 | idle | 1.7
     3001 | builder 2, harvester 2, hauler 1, upgrader 1 |     4 |     0 |   191/400 | idle | 1.5

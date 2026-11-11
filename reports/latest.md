# Scorecard: acceptance-m2 · 2026-11-11 22:07 · 3001 ticks · commit ec7a3f6

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-11 21:47, ec7a3f6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.44 | 5.44 | 0 |
| Energy wasted at source regeneration (sum) | 12,356 | 12,356 | 0 |
| Controller progress / tick | 0.15 | 0.15 | 0 |
| Construction progress / tick | 5.59 | 5.59 | 0 |
| Energy delivered to spawn and extensions / tick | 4.96 | 4.96 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 2 % | 2 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 25 % | 25 % | 0 pts |
| CPU / tick (average, max) | 1.91, 21 | 1.93, 21.16 | -0.02 |
| RCL / progress at end (whole run) | 2 / 310 | 2 / 310 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 812 / - | 812 / - | 0 |
| Energy harvested (whole run) | 17,584 | 17,584 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (9) | 6 (9) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 1, upgrader 1.
Structures at end: container 1, extension 2, road 5, spawn 1. Construction sites: 57 (extension 3, road 54). Build energy in the window by target: completed 10, container 1035, extension 4542.
Room energy capacity 400; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 50 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   275/300 | idle | 1.4
      400 | builder 2, harvester 2, upgrader 2       |   4.1 |   0.1 |    67/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   117/300 | idle | 1.8
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.4 |   117/300 | idle | 1.7
      700 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.6 |   117/300 | idle | 1.9
      800 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.2 |   117/300 | idle | 1.8
      900 | builder 3, harvester 3, upgrader 2       |   5.7 |   0.6 |    54/300 | busy | 1.8
     1000 | builder 3, harvester 3, upgrader 2       |   7.8 |   0.2 |   204/300 | idle | 2.1
     1100 | builder 4, harvester 3, upgrader 2       |   7.8 |     0 |   243/300 | idle | 2
     1200 | builder 4, harvester 3, upgrader 2       |   8.1 |     0 |   193/300 | idle | 2.5
     1300 | builder 4, harvester 3, upgrader 2       |     8 |     0 |   143/300 | idle | 2.4
     1400 | builder 4, harvester 3, upgrader 2       |   7.4 |     0 |   143/350 | idle | 2.4
     1500 | builder 4, harvester 3, upgrader 2       |     8 |     0 |   143/350 | idle | 2.4
     1600 | builder 4, harvester 3, upgrader 2       |   5.6 |   0.5 |    41/350 | busy | 2
     1700 | builder 3, harvester 3, upgrader 2       |   7.2 |   0.5 |   189/350 | idle | 2.2
     1800 | builder 3, harvester 3, upgrader 1       |   7.6 |     0 |   139/350 | idle | 2.1
     1900 | builder 2, harvester 3, upgrader 1       |     8 |     0 |   239/350 | idle | 1.9
     2000 | builder 3, harvester 3, upgrader 1       |   7.4 |     0 |   238/350 | idle | 1.9
     2100 | builder 3, harvester 3, upgrader 1       |     8 |     0 |   136/350 | idle | 2
     2200 | builder 3, harvester 3, hauler 1, upgrader 1 |   7.8 |     0 |   141/350 | idle | 2.2
     2300 | builder 3, harvester 3, hauler 1, upgrader 1 |   7.8 |   0.1 |   160/350 | idle | 2.4
     2400 | builder 3, harvester 2, hauler 1, upgrader 1 |   5.9 |   0.4 |   176/350 | idle | 2.2
     2500 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.2 |     0 |   129/350 | idle | 1.7
     2600 | builder 1, harvester 2, hauler 1, upgrader 1 |   3.8 |     0 |   285/350 | idle | 1.6
     2700 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.2 |     0 |   196/400 | idle | 1.6
     2800 | builder 2, harvester 2, hauler 1, upgrader 1 |   3.7 |   0.5 |   210/400 | idle | 1.8
     2900 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.8 |     0 |   174/400 | idle | 1.8
     3000 | builder 2, harvester 2, hauler 1, upgrader 1 |   4.2 |   0.5 |   188/400 | idle | 1.7
     3001 | builder 2, harvester 2, hauler 1, upgrader 1 |     4 |     0 |   189/400 | idle | 1.5

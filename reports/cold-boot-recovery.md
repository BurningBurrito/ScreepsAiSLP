# Scorecard: cold-boot-recovery · 2026-11-09 20:00 · 2501 ticks · commit f344668

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-09 18:40, 88fb080) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 8.82 | 8.82 | 0 |
| Energy wasted at source regeneration (sum) | 10,724 | 10,724 | 0 |
| Controller progress / tick | 0.05 | 0.05 | 0 |
| Construction progress / tick | 5.97 | 5.97 | 0 |
| Energy delivered to spawn and extensions / tick | 2.05 | 2.05 | 0 |
| Spawn idle while energy is full | 59 % | 59 % | 0 pts |
| Spawn busy | 9 % | 9 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 24 % | 24 % | 0 pts |
| CPU / tick (average, max) | 1.87, 20.94 | 1.92, 20.94 | -0.05 |
| RCL / progress at end (whole run) | 2 / 50 | 2 / 50 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 1,118 / - | 1,118 / - | 0 |
| Energy harvested (whole run) | 18,992 | 18,992 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 3, harvester 3, upgrader 2.
Structures at end: extension 1, road 11, spawn 1. Construction sites: 54 (container 2, extension 4, road 48). Build energy in the window by target: completed 6, container 5170, extension 794.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 51 lines, 0 with errors (reports/cold-boot-recovery-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.6 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |     6 |   0.4 |   300/300 | idle | 1.8
      800 | builder 3, harvester 2, upgrader 2       |   8.1 |     0 |   300/300 | idle | 2
      900 | builder 3, harvester 2, upgrader 2       |   8.5 |     0 |   300/300 | idle | 2
     1000 | builder 3, harvester 2, upgrader 2       |   8.6 |     0 |   300/300 | idle | 2
     1100 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.1 |   300/300 | idle | 2
     1200 | builder 3, harvester 3, upgrader 2       |   7.3 |   0.4 |   300/300 | idle | 1.9
     1300 | builder 3, harvester 3, upgrader 2       |    11 |     0 |   300/300 | idle | 2
     1400 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2
     1500 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1600 | harvester 2                              |   3.5 |     0 |    65/300 | idle | 1.1
     1700 | harvester 3                              |   4.9 |     0 |   294/300 | idle | 1.2
     1800 | builder 3, harvester 3                   |   7.9 |     0 |   116/300 | idle | 1.6
     1900 | builder 3, harvester 3, upgrader 2       |   7.9 |     0 |   230/300 | idle | 1.7
     2000 | builder 3, harvester 3, upgrader 2       |   9.4 |     0 |   300/300 | idle | 1.9
     2100 | builder 3, harvester 3, upgrader 2       |  10.1 |     0 |   350/350 | idle | 2.1
     2200 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.2
     2300 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.3
     2400 | builder 3, harvester 3, upgrader 2       |  11.2 |   0.1 |   350/350 | idle | 2.3
     2500 | builder 3, harvester 3, upgrader 2       |  11.2 |   0.4 |   350/350 | idle | 2.4
     2501 | builder 3, harvester 3, upgrader 2       |    12 |     0 |   350/350 | idle | 1.9

# Scorecard: acceptance-m2 · 2026-11-01 12:02 · 3001 ticks · commit c2b9f5c

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-01 11:40, c2b9f5c) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 7.09 | 7.09 | 0 |
| Energy wasted at source regeneration (sum) | 11,632 | 11,632 | 0 |
| Controller progress / tick | 0.3 | 0.3 | 0 |
| Construction progress / tick | 3.23 | 3.23 | 0 |
| Energy delivered to spawn and extensions / tick | 0.56 | 0.56 | 0 |
| Spawn idle while energy is full | 86 % | 86 % | 0 pts |
| Spawn busy | 2 % | 2 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 26 % | 26 % | 0 pts |
| CPU / tick (average, max) | 1.9, 20.17 | 1.95, 25.56 | -0.05 |
| RCL / progress at end (whole run) | 2 / 846 | 2 / 846 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 813 / - | 813 / - | 0 |
| Energy harvested (whole run) | 19,060 | 19,060 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: extension 1, road 3, spawn 1. Construction sites: 61 (container 1, extension 4, road 56). Build energy in the window by target: completed 10, container 2835, extension 380.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 44 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.9 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.1 |   300/300 | idle | 1.8
      800 | builder 3, harvester 2, upgrader 2       |   8.5 |   0.2 |   300/300 | idle | 2.1
      900 | builder 3, harvester 2, upgrader 2       |   8.5 |   0.8 |   300/300 | idle | 2
     1000 | builder 3, harvester 2, upgrader 2       |     8 |     0 |   300/300 | idle | 1.9
     1100 | builder 3, harvester 2, upgrader 2       |   7.4 |     1 |   300/300 | idle | 1.9
     1200 | builder 3, harvester 2, upgrader 2       |   8.5 |     0 |   300/300 | idle | 2.1
     1300 | builder 3, harvester 2, upgrader 2       |   7.4 |     1 |   300/300 | idle | 1.9
     1400 | builder 3, harvester 2, upgrader 2       |   8.5 |     0 |   300/300 | idle | 1.9
     1500 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.9 |   300/300 | idle | 1.8
     1600 | builder 3, harvester 2, upgrader 2       |     5 |   0.1 |     6/300 | busy | 1.7
     1700 | builder 3, harvester 2, upgrader 2       |   3.7 |   0.5 |   135/300 | idle | 1.6
     1800 | builder 3, harvester 2, upgrader 2       |   4.7 |   0.5 |   264/300 | idle | 1.6
     1900 | builder 3, harvester 2, upgrader 2       |   6.5 |   0.8 |   300/300 | idle | 1.7
     2000 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.2 |   262/300 | idle | 1.7
     2100 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.5 |    70/300 | idle | 1.6
     2200 | builder 3, harvester 2, upgrader 2       |   5.4 |   0.5 |   350/350 | idle | 1.8
     2300 | builder 3, harvester 2, upgrader 2       |   7.7 |     0 |   350/350 | idle | 1.8
     2400 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.5 |   350/350 | idle | 2
     2500 | builder 3, harvester 2, upgrader 2       |   7.9 |     0 |   350/350 | idle | 1.9
     2600 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.5 |   350/350 | idle | 2
     2700 | builder 3, harvester 2, upgrader 2       |     8 |     0 |   350/350 | idle | 2.1
     2800 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.5 |   350/350 | idle | 1.9
     2900 | builder 3, harvester 2, upgrader 2       |     8 |     0 |   350/350 | idle | 2
     3000 | builder 3, harvester 2, upgrader 2       |   7.4 |   0.4 |   350/350 | idle | 2
     3001 | builder 3, harvester 2, upgrader 2       |     8 |     2 |   350/350 | idle | 1.7

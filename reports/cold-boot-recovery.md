# Scorecard: cold-boot-recovery · 2026-11-03 11:00 · 2501 ticks · commit f03bd18

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 8.93 | - |  |
| Energy wasted at source regeneration (sum) | 10,404 | - |  |
| Controller progress / tick | 0.07 | - |  |
| Construction progress / tick | 3.27 | - |  |
| Energy delivered to spawn and extensions / tick | 2.12 | - |  |
| Spawn idle while energy is full | 58 % | - |  |
| Spawn busy | 9 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 27 % | - |  |
| CPU / tick (average, max) | 2.02, 20.68 | - |  |
| RCL / progress at end (whole run) | 2 / 170 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 804 / - | - |  |
| Energy harvested (whole run) | 18,928 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 2 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 8 (8) | - |  |

Creeps at end by role: builder 3, harvester 3, upgrader 2.
Structures at end: extension 1, road 4, spawn 1. Construction sites: 60 (container 1, extension 4, road 55). Build energy in the window by target: container 3269.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 41 lines, 0 with errors (reports/cold-boot-recovery-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, upgrader 1                  |   3.7 |     0 |   199/300 | idle | 1.6
      200 | builder 1, harvester 2, upgrader 1       |   3.6 |   0.3 |     4/300 | busy | 1.5
      300 | builder 1, harvester 2, upgrader 1       |   2.6 |   0.2 |   154/300 | idle | 1.6
      400 | builder 1, harvester 2, upgrader 1       |     3 |     0 |   154/300 | idle | 1.6
      500 | builder 1, harvester 2, upgrader 2       |   4.5 |     0 |   237/300 | idle | 1.6
      600 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.3 |   137/300 | idle | 1.8
      700 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.2 |   137/300 | idle | 1.9
      800 | builder 3, harvester 2, upgrader 2       |   4.2 |     1 |   187/300 | idle | 2
      900 | builder 3, harvester 3, upgrader 2       |   4.7 |   0.1 |   194/300 | idle | 1.9
     1000 | builder 3, harvester 3, upgrader 2       |   9.2 |   0.8 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 3, upgrader 2       |  11.2 |   0.2 |   300/300 | idle | 2.4
     1200 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1300 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.2
     1400 | builder 3, harvester 3, upgrader 2       |    11 |     0 |   350/350 | idle | 2.4
     1500 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     1600 | harvester 2                              |   3.5 |     0 |   146/350 | idle | 1.2
     1700 | builder 1, harvester 3                   |   5.2 |     0 |    94/350 | idle | 1.4
     1800 | builder 3, harvester 3                   |     8 |     0 |   292/350 | idle | 1.7
     1900 | builder 3, harvester 3, upgrader 2       |   7.6 |     0 |   283/350 | idle | 1.8
     2000 | builder 3, harvester 3, upgrader 2       |   9.3 |     0 |   350/350 | idle | 2.1
     2100 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.2
     2200 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.7
     2300 | builder 3, harvester 3, upgrader 2       |  11.2 |   0.7 |   350/350 | idle | 2.5
     2400 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.4
     2500 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.4
     2501 | builder 3, harvester 3, upgrader 2       |    12 |     0 |   350/350 | idle | 2.1

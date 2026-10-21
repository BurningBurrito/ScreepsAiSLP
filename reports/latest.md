# Scorecard: acceptance-m2 · 2026-10-21 05:55 · 3001 ticks · commit 1ebd257

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.13 | - |  |
| Energy wasted at source regeneration (sum) | 12,252 | - |  |
| Controller progress / tick | 0.36 | - |  |
| Construction progress / tick | 2.4 | - |  |
| Energy delivered to spawn and extensions / tick | 0.19 | - |  |
| Spawn idle while energy is full | 91 % | - |  |
| Spawn busy | 0 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 16 % | - |  |
| CPU / tick (average, max) | 1.9, 18.96 | - |  |
| RCL / progress at end (whole run) | 2 / 994 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 684 / - | - |  |
| Energy harvested (whole run) | 9,458 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 2 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 6 (6) | - |  |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: extension 1, road 2, spawn 1. Construction sites: 61 (extension 4, road 57). Build energy in the window by target: completed 5, extension 2395.
Room energy capacity 350; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 42 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.5
      200 | builder 1, harvester 2, upgrader 2       |   5.7 |     0 |   249/300 | idle | 1.8
      300 | builder 2, harvester 2, upgrader 2       |   1.5 |     0 |   149/300 | idle | 2.1
      400 | builder 2, harvester 2, upgrader 2       |   3.7 |     0 |   300/300 | idle | 1.7
      500 | builder 2, harvester 2, upgrader 2       |   3.2 |   0.2 |   300/300 | idle | 1.7
      600 | builder 2, harvester 2, upgrader 2       |   3.4 |   1.6 |   300/300 | idle | 2.1
      700 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.3 |   300/300 | idle | 2.1
      800 | builder 2, harvester 2, upgrader 2       |   2.3 |   1.2 |   300/300 | idle | 1.8
      900 | builder 2, harvester 2, upgrader 2       |     2 |   0.9 |   300/300 | idle | 2
     1000 | builder 2, harvester 2, upgrader 2       |   2.7 |   0.5 |   300/300 | idle | 2
     1100 | builder 2, harvester 2, upgrader 2       |   2.3 |   1.3 |   300/300 | idle | 2
     1200 | builder 2, harvester 2, upgrader 2       |   3.6 |   0.2 |   300/300 | idle | 2.3
     1300 | builder 2, harvester 2, upgrader 2       |   3.7 |     0 |   300/300 | idle | 1.8
     1400 | builder 2, harvester 2, upgrader 2       |   3.5 |     0 |   300/300 | idle | 1.6
     1500 | builder 2, harvester 2, upgrader 2       |   3.2 |   0.5 |   300/300 | idle | 1.7
     1600 | builder 2, harvester 1, upgrader 2       |   2.8 |   0.3 |   138/300 | idle | 1.9
     1700 | builder 1, harvester 2                   |   3.1 |   0.2 |    38/300 | idle | 1.5
     1800 | harvester 2, upgrader 1                  |   2.9 |     0 |   138/300 | idle | 1.2
     1900 | harvester 2, upgrader 2                  |   2.6 |   0.1 |   238/300 | idle | 1.4
     2000 | builder 2, harvester 2, upgrader 2       |     3 |   0.9 |    88/300 | busy | 1.8
     2100 | builder 2, harvester 2, upgrader 2       |   3.6 |     0 |   300/300 | idle | 2.1
     2200 | builder 2, harvester 2, upgrader 2       |   1.9 |   0.1 |   300/300 | idle | 1.9
     2300 | builder 2, harvester 2, upgrader 2       |   2.8 |   0.6 |   300/300 | idle | 1.8
     2400 | builder 2, harvester 2, upgrader 2       |   3.1 |   1.4 |   300/300 | idle | 2.1
     2500 | builder 2, harvester 2, upgrader 2       |   3.5 |   0.1 |   300/300 | idle | 2.1
     2600 | builder 2, harvester 2, upgrader 2       |   3.5 |     0 |   300/300 | idle | 1.8
     2700 | builder 2, harvester 2, upgrader 2       |   2.9 |     0 |   300/300 | idle | 1.6
     2800 | builder 2, harvester 2, upgrader 2       |   3.4 |     1 |   300/300 | idle | 1.8
     2900 | builder 2, harvester 2, upgrader 2       |     3 |   0.5 |   300/300 | idle | 1.9
     3000 | builder 2, harvester 2, upgrader 2       |   3.6 |     0 |   350/350 | idle | 1.9
     3001 | builder 2, harvester 2, upgrader 2       |     4 |     0 |   350/350 | idle | 2

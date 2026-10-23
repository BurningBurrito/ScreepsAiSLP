# Scorecard: acceptance-m2 · 2026-10-23 06:44 · 3001 ticks · commit 0adcf85

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.21 | - |  |
| Energy wasted at source regeneration (sum) | 14,016 | - |  |
| Controller progress / tick | 0.13 | - |  |
| Construction progress / tick | 4.01 | - |  |
| Energy delivered to spawn and extensions / tick | 2.74 | - |  |
| Spawn idle while energy is full | 11 % | - |  |
| Spawn busy | 0 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 15 % | - |  |
| CPU / tick (average, max) | 1.77, 15.85 | - |  |
| RCL / progress at end (whole run) | 2 / 250 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 827 / - | - |  |
| Energy harvested (whole run) | 11,056 | - |  |
| Build energy spent on roads (share of all build energy) | 85 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 60 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 2 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 4 (4) | - |  |

Creeps at end by role: builder 1, harvester 2, upgrader 1.
Structures at end: extension 1, road 11, spawn 1. Construction sites: 53 (extension 4, road 49). Build energy in the window by target: completed 24, extension 595, road 3386.
Room energy capacity 350; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 30 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1                              |   1.7 |     0 |   199/300 | idle | 1.2
      200 | harvester 2, upgrader 1                  |   2.8 |     0 |    49/300 | idle | 1.2
      300 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.5 |   299/300 | idle | 1.7
      400 | builder 1, harvester 2, upgrader 1       |   4.7 |     0 |   300/300 | idle | 1.7
      500 | builder 1, harvester 2, upgrader 1       |   4.1 |   0.2 |   300/300 | idle | 1.4
      600 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.3 |   300/300 | idle | 1.7
      700 | builder 1, harvester 2, upgrader 1       |   4.4 |   0.5 |   300/300 | idle | 1.7
      800 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.2 |   300/300 | idle | 1.6
      900 | builder 1, harvester 2, upgrader 1       |   4.4 |   0.3 |   300/300 | idle | 2
     1000 | builder 1, harvester 2, upgrader 1       |   4.4 |     0 |   300/300 | idle | 1.8
     1100 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.2 |   300/300 | idle | 1.7
     1200 | builder 1, harvester 2, upgrader 1       |   4.4 |   0.3 |   300/300 | idle | 2
     1300 | builder 1, harvester 2, upgrader 1       |   4.4 |     0 |   300/300 | idle | 1.7
     1400 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   300/300 | idle | 1.6
     1500 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   300/300 | idle | 1.7
     1600 | builder 1, harvester 2, upgrader 1       |   3.7 |   0.5 |   300/300 | idle | 1.9
     1700 | builder 1, harvester 2, upgrader 1       |     4 |     0 |   120/300 | idle | 1.9
     1800 | builder 1, harvester 2, upgrader 1       |   4.4 |     0 |   300/300 | idle | 1.7
     1900 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   300/300 | idle | 1.6
     2000 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.2 |   300/300 | idle | 1.7
     2100 | builder 1, harvester 2, upgrader 1       |   3.9 |   0.3 |   300/300 | idle | 1.8
     2200 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   197/350 | idle | 1.8
     2300 | builder 1, harvester 2, upgrader 1       |   3.7 |     0 |   235/350 | idle | 1.7
     2400 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   272/350 | idle | 1.7
     2500 | builder 1, harvester 2, upgrader 1       |   3.6 |   0.5 |   210/350 | idle | 1.9
     2600 | builder 1, harvester 2, upgrader 1       |   3.9 |     0 |   245/350 | idle | 1.8
     2700 | builder 1, harvester 2, upgrader 1       |   3.7 |     0 |   277/350 | idle | 1.7
     2800 | builder 1, harvester 2, upgrader 1       |     2 |     0 |   172/350 | idle | 1.7
     2900 | builder 1, harvester 2, upgrader 1       |     2 |   0.5 |   172/350 | idle | 1.8
     3000 | builder 1, harvester 2, upgrader 1       |   1.9 |     0 |   300/350 | idle | 1.9
     3001 | builder 1, harvester 2, upgrader 1       |     2 |     0 |   300/350 | idle | 1.9

# Scorecard: probe-tower · 2026-10-31 16:23 · 2600 ticks · commit 26aaced

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.89 | - |  |
| Energy wasted at source regeneration (sum) | 9,120 | - |  |
| Controller progress / tick | 0 | - |  |
| Construction progress / tick | 4.39 | - |  |
| Energy delivered to spawn and extensions / tick | 2.08 | - |  |
| Spawn idle while energy is full | 68 % | - |  |
| Spawn busy | 8 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 25 % | - |  |
| CPU / tick (average, max) | 2.24, 27.91 | - |  |
| RCL / progress at end (whole run) | 5 / 0 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | - |  |
| Energy harvested (whole run) | 23,360 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 2 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 9 (9) | - |  |

Creeps at end by role: builder 3, harvester 5, upgrader 1.
Structures at end: extension 1, rampart 2, spawn 1, tower 1. Construction sites: 89 (container 1, extension 29, road 59). Build energy in the window by target: completed 22, extension 4371.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 70 lines, 0 with errors (reports/probe-tower-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   300/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
     1000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.5
     1300 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   300/300 | idle | 2.2
     1400 | builder 3, harvester 5, upgrader 1       |   5.2 |     0 |   300/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   9.4 |     0 |   300/300 | idle | 2.2
     1600 | builder 3, harvester 5, upgrader 1       |    10 |     0 |    56/300 | busy | 2.3
     1700 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   235/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   300/300 | idle | 2
     1900 | builder 3, harvester 5, upgrader 1       |   8.3 |     0 |    55/300 | busy | 2
     2000 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   119/300 | idle | 2.2
     2100 | builder 3, harvester 5, upgrader 1       |   9.9 |     0 |   300/300 | idle | 2
     2200 | builder 3, harvester 5, upgrader 1       |    11 |     0 |   350/350 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.3
     2400 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.5
     2600 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.6

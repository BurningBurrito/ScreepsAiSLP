# Scorecard: acceptance-m2 · 2026-11-02 11:05 · 3001 ticks · commit 88fda14

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-02 05:37, 6003f9d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.83 | 9.83 | 0 |
| Energy wasted at source regeneration (sum) | 9,112 | 9,112 | 0 |
| Controller progress / tick | 0.05 | 0.05 | 0 |
| Construction progress / tick | 1.97 | 1.97 | 0 |
| Energy delivered to spawn and extensions / tick | 0.98 | 0.98 | 0 |
| Spawn idle while energy is full | 79 % | 79 % | 0 pts |
| Spawn busy | 5 % | 5 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 38 % | 38 % | 0 pts |
| CPU / tick (average, max) | 2.12, 20.44 | 2.13, 20.44 | -0.01 |
| RCL / progress at end (whole run) | 2 / 150 | 2 / 150 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 813 / - | 813 / - | 0 |
| Energy harvested (whole run) | 25,016 | 25,016 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 9 (9) | 0 |

Creeps at end by role: builder 3, harvester 2, hauler 1, miner 1, upgrader 2.
Structures at end: container 1, extension 1, road 3, spawn 1. Construction sites: 60 (extension 4, road 56). Build energy in the window by target: completed 7, container 1788, extension 176.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 47 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.4
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.9 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.1 |   300/300 | idle | 1.8
      800 | builder 3, harvester 2, upgrader 2       |   8.5 |   0.2 |   300/300 | idle | 2
      900 | builder 3, harvester 3, upgrader 2       |   7.5 |   0.8 |   236/300 | idle | 2
     1000 | builder 3, harvester 3, upgrader 2       |   7.9 |     0 |   300/300 | idle | 1.8
     1100 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.1
     1200 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1300 | builder 3, harvester 3, upgrader 2       |  10.9 |     0 |   350/350 | idle | 2.2
     1400 | builder 3, harvester 3, upgrader 2       |    11 |     0 |   350/350 | idle | 2
     1500 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.2
     1600 | builder 3, harvester 3, upgrader 2       |   7.9 |     0 |   156/350 | busy | 1.9
     1700 | builder 3, harvester 3, upgrader 2       |   7.4 |   0.5 |   350/350 | idle | 1.8
     1800 | builder 3, harvester 3, upgrader 2       |   7.5 |     0 |   350/350 | idle | 1.9
     1900 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.2
     2000 | builder 3, harvester 3, upgrader 2       |   9.8 |     0 |   350/350 | idle | 2.1
     2100 | builder 3, harvester 3, upgrader 2       |   8.4 |     0 |   170/350 | idle | 2.1
     2200 | builder 3, harvester 3, upgrader 2       |   9.6 |     0 |   350/350 | idle | 2.1
     2300 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2
     2400 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |     6 |   0.5 |   126/350 | idle | 2
     2500 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |   6.2 |     0 |   350/350 | idle | 2
     2600 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |  11.2 |     0 |   350/350 | idle | 2.1
     2700 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |  11.4 |     0 |   350/350 | idle | 2.2
     2800 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |  11.4 |     0 |   350/350 | idle | 2.2
     2900 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |  11.4 |     0 |   350/350 | idle | 2.2
     3000 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |  11.4 |     0 |   350/350 | idle | 2.2
     3001 | builder 3, harvester 2, hauler 1, miner 1, upgrader 2 |    12 |     0 |   350/350 | idle | 2

# Scorecard: acceptance-m2 · 2026-11-03 11:19 · 3001 ticks · commit f03bd18

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-03 08:14, 6b3393d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.46 | 10.03 | -0.57 |
| Energy wasted at source regeneration (sum) | 9,320 | 8,752 | +568 |
| Controller progress / tick | 0.05 | 0.1 | -0.05 |
| Construction progress / tick | 3.33 | 5.6 | -2.27 |
| Energy delivered to spawn and extensions / tick | 1.36 | 1.41 | -0.05 |
| Spawn idle while energy is full | 73 % | 79 % | -6 pts |
| Spawn busy | 6 % | 6 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 33 % | 25 % | +8 pts |
| CPU / tick (average, max) | 2.21, 21.01 | 2.18, 20.76 | +0.03 |
| RCL / progress at end (whole run) | 2 / 250 | 2 / 150 | +100 |
| Ticks to RCL 2 / RCL 3 (whole run) | 804 / - | 1,118 / - | -314 |
| Energy harvested (whole run) | 23,576 | 24,592 | -1,016 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (10) | 10 (10) | -1 |

Creeps at end by role: builder 3, harvester 3, hauler 1, miner 1, upgrader 1.
Structures at end: container 1, extension 1, road 4, spawn 1. Construction sites: 59 (extension 4, road 55). Build energy in the window by target: completed 3, container 1943, extension 1379.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 48 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, upgrader 1                  |   3.7 |     0 |   199/300 | idle | 1.6
      200 | builder 1, harvester 2, upgrader 1       |   3.6 |   0.3 |     4/300 | busy | 1.5
      300 | builder 1, harvester 2, upgrader 1       |   2.6 |   0.2 |   154/300 | idle | 1.8
      400 | builder 1, harvester 2, upgrader 1       |     3 |     0 |   154/300 | idle | 1.6
      500 | builder 1, harvester 2, upgrader 2       |   4.5 |     0 |   237/300 | idle | 1.6
      600 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.3 |   137/300 | idle | 1.8
      700 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.2 |   137/300 | idle | 1.8
      800 | builder 3, harvester 2, upgrader 2       |   4.2 |     1 |   187/300 | idle | 1.9
      900 | builder 3, harvester 3, upgrader 2       |   4.7 |   0.1 |   194/300 | idle | 1.9
     1000 | builder 3, harvester 3, upgrader 2       |   9.2 |   0.8 |   300/300 | idle | 2.2
     1100 | builder 3, harvester 3, upgrader 2       |  11.2 |   0.2 |   300/300 | idle | 2.3
     1200 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.2
     1300 | builder 3, harvester 3, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.2
     1400 | builder 3, harvester 3, upgrader 2       |    11 |     0 |   350/350 | idle | 2.4
     1500 | builder 3, harvester 3, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     1600 | builder 3, harvester 3, upgrader 2       |   6.9 |     0 |   229/350 | idle | 2.1
     1700 | builder 3, harvester 3, upgrader 2       |   6.9 |     0 |   350/350 | idle | 2.1
     1800 | builder 3, harvester 3, upgrader 2       |   7.9 |   0.5 |   350/350 | idle | 2.1
     1900 | builder 3, harvester 3, upgrader 2       |   9.2 |     0 |   350/350 | idle | 2.3
     2000 | builder 3, harvester 3, upgrader 2       |  10.3 |   0.5 |   229/350 | idle | 2.2
     2100 | builder 3, harvester 3, upgrader 2       |   5.9 |     0 |   350/350 | idle | 2
     2200 | builder 3, harvester 3, upgrader 2       |     9 |   0.5 |   276/350 | idle | 2
     2300 | builder 3, harvester 3, upgrader 2       |   9.5 |     0 |   350/350 | idle | 2.2
     2400 | builder 3, harvester 3, upgrader 2       |   9.6 |     0 |   233/350 | idle | 2.2
     2500 | builder 3, harvester 3, miner 1, upgrader 2 |   9.3 |     0 |     5/350 | busy | 2.1
     2600 | builder 3, harvester 3, hauler 1, miner 1, upgrader 2 |   7.6 |     0 |   350/350 | idle | 2.3
     2700 | builder 3, harvester 3, hauler 1, miner 1, upgrader 2 |    10 |     0 |   350/350 | idle | 2.2
     2800 | builder 3, harvester 3, hauler 1, miner 1, upgrader 2 |  11.3 |     0 |   350/350 | idle | 2.3
     2900 | builder 3, harvester 3, hauler 1, miner 1, upgrader 2 |  11.2 |     0 |   350/350 | idle | 2.2
     3000 | builder 3, harvester 3, hauler 1, miner 1, upgrader 2 |  11.2 |     0 |   350/350 | idle | 2.5
     3001 | builder 3, harvester 3, hauler 1, miner 1, upgrader 1 |    12 |     0 |   350/350 | idle | 2.7

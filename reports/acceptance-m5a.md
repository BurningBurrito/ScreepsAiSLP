# Scorecard: acceptance-m5a · 2026-11-14 00:01 · 5001 ticks · commit dc63e00

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-13 22:36, 2221f22) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.88 | 9.88 | 0 |
| Energy wasted at source regeneration (sum) | 9,220 | 9,220 | 0 |
| Controller progress / tick | 1.33 | 1.33 | 0 |
| Construction progress / tick | 2.38 | 2.38 | 0 |
| Energy delivered to spawn and extensions / tick | 7.54 | 7.54 | 0 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 23 % | 23 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 36 % | 36 % | 0 pts |
| CPU / tick (average, max) | 3.49, 29.14 | 3.45, 30.3 | +0.04 |
| RCL / progress at end (whole run) | 5 / 1,540 | 5 / 1,540 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 39,224 | 39,224 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 21 (21) | 21 (21) | 0 |

Creeps at end by role: builder 8, harvester 5, hauler 3, miner 1, upgrader 4.
Structures at end: container 1, extension 3, spawn 1, tower 1. Construction sites: 90 (container 2, extension 27, rampart 2, road 58, tower 1). Build energy in the window by target: completed 1, container 672, extension 1706.
Room energy capacity 450; source capacity 3000 and 3000; Memory 5 KB; bucket 10000.
Bot console: 101 lines, 0 with errors (reports/acceptance-m5a-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.3
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1300 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2
     1400 | builder 3, harvester 5, upgrader 1       |     5 |     0 |   137/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 1.9
     1600 | builder 3, harvester 4, upgrader 1       |   6.9 |     0 |   197/300 | idle | 2.1
     1700 | builder 3, harvester 4, upgrader 1       |   6.7 |     0 |   226/300 | idle | 2
     1800 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |     9/300 | busy | 1.9
     1900 | builder 2, harvester 5, upgrader 1       |   7.6 |     0 |   138/300 | idle | 2.1
     2000 | harvester 5, upgrader 1                  |   7.4 |     0 |   188/300 | idle | 2
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.9
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.2
     2400 | builder 3, harvester 5, hauler 1, upgrader 1 |   8.4 |     0 |   140/300 | idle | 2.1
     2500 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.4 |     0 |   206/300 | idle | 2.5
     2600 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.5 |     0 |    76/300 | idle | 2.8
     2700 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.4 |     0 |   140/300 | idle | 3
     2800 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.4 |     0 |   105/300 | idle | 3.5
     2900 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.5 |     0 |    85/350 | idle | 3.5
     3000 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.4 |   0.1 |   116/350 | idle | 3.2
     3100 | builder 3, harvester 4, hauler 3, miner 1, upgrader 1 |   7.7 |     0 |   134/350 | idle | 3.4
     3200 | builder 3, harvester 3, hauler 3, miner 1, upgrader 1 |   7.6 |     0 |   283/400 | idle | 2.8
     3300 | builder 3, harvester 4, hauler 3, miner 1, upgrader 1 |     7 |     0 |   162/400 | idle | 2.5
     3400 | builder 3, harvester 3, hauler 3, miner 1, upgrader 1 |   5.8 |     0 |   114/400 | idle | 2.1
     3500 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   9.7 |     0 |    15/400 | busy | 2.5
     3600 | builder 2, harvester 5, hauler 3, miner 1, upgrader 2 |    10 |     0 |   182/400 | busy | 3
     3700 | builder 2, harvester 5, hauler 3, miner 1, upgrader 1 |   9.6 |     1 |   217/400 | idle | 3.1
     3800 | builder 2, harvester 5, hauler 3, miner 1, upgrader 1 |   7.6 |     0 |   310/400 | idle | 2.9
     3900 | builder 3, harvester 5, hauler 2, miner 2, upgrader 1 |   9.6 |     1 |   321/400 | busy | 3.1
     4000 | builder 3, harvester 5, hauler 2, miner 1, upgrader 1 |   9.4 |     0 |   142/400 | idle | 3.1
     4100 | builder 3, harvester 5, hauler 2, miner 1, upgrader 1 |    10 |     0 |   280/400 | idle | 3.1
     4200 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.5 |     1 |   181/400 | idle | 3.1
     4300 | builder 3, harvester 5, hauler 3, miner 1, upgrader 2 |  11.7 |     0 |   170/400 | idle | 3.7
     4400 | builder 3, harvester 5, hauler 3, miner 1, upgrader 3 |   9.7 |     2 |   207/450 | idle | 3.6
     4500 | builder 4, harvester 5, hauler 3, miner 1, upgrader 4 |  10.8 |   1.8 |    66/450 | idle | 3.7
     4600 | builder 5, harvester 5, hauler 3, miner 1, upgrader 4 |   9.3 |   1.2 |   236/450 | idle | 3.8
     4700 | builder 8, harvester 5, hauler 3, miner 1, upgrader 4 |  10.2 |   1.9 |    92/450 | busy | 3.4
     4800 | builder 8, harvester 4, hauler 3, miner 1, upgrader 4 |   9.2 |   1.1 |   248/450 | idle | 3.5
     4900 | builder 8, harvester 4, hauler 3, miner 1, upgrader 4 |   8.3 |     2 |   400/450 | idle | 3.4
     5000 | builder 8, harvester 5, hauler 3, miner 1, upgrader 4 |  11.2 |   2.3 |   300/450 | idle | 3.6
     5001 | builder 8, harvester 5, hauler 3, miner 1, upgrader 4 |     6 |     2 |   400/450 | idle | 3.8

# Scorecard: acceptance-m4 · 2026-11-14 14:45 · 6001 ticks · commit 87eb6ad

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-14 13:01, c75c137) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 13.28 | 13.48 | -0.2 |
| Energy wasted at source regeneration (sum) | 6,612 | 6,014 | +598 |
| Controller progress / tick | 1.81 | 1.77 | +0.04 |
| Construction progress / tick | 2.42 | 0.5 | +1.92 |
| Energy delivered to spawn and extensions / tick | 7.76 | 6.59 | +1.17 |
| Spawn idle while energy is full | 31 % | 21 % | +10 pts |
| Spawn busy | 28 % | 23 % | +5 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | 32 % | +8 pts |
| CPU / tick (average, max) | 4.15, 28.91 | 4.17, 29.28 | -0.02 |
| RCL / progress at end (whole run) | 5 / 3,352 | 5 / 2,646 | +706 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 52,502 | 55,084 | -2,582 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 22 (25) | 21 (24) | +1 |

Creeps at end by role: builder 10, harvester 5, hauler 3, miner 1, upgrader 3.
Structures at end: container 1, extension 3, rampart 2, spawn 1, tower 1. Construction sites: 88 (container 2, extension 27, road 58, tower 1). Build energy in the window by target: completed 8, container 2413.
Room energy capacity 450; source capacity 3000 and 3000; Memory 5 KB; bucket 10000.
Bot console: 129 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 1.9
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.1
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.2
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1300 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 1.9
     1400 | builder 3, harvester 5, upgrader 1       |     5 |     0 |   137/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 1.9
     1600 | builder 3, harvester 4, upgrader 1       |   6.9 |     0 |   197/300 | idle | 2
     1700 | builder 3, harvester 4, upgrader 1       |   6.7 |     0 |   226/300 | idle | 2
     1800 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |     9/300 | busy | 1.8
     1900 | builder 2, harvester 5, upgrader 1       |   7.6 |     0 |   138/300 | idle | 2.1
     2000 | harvester 5, upgrader 1                  |   7.4 |     0 |   188/300 | idle | 1.9
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.8
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.2
     2400 | builder 3, harvester 5, hauler 1, upgrader 1 |   8.4 |     0 |   140/300 | idle | 2.1
     2500 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.4 |     0 |   206/300 | idle | 2.4
     2600 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.5 |     0 |    76/300 | idle | 2.7
     2700 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.4 |     0 |   140/300 | idle | 3
     2800 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.4 |     0 |   105/300 | idle | 3.3
     2900 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   7.5 |     0 |    85/350 | idle | 3.4
     3000 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.4 |   0.1 |   116/350 | idle | 3.1
     3100 | builder 3, harvester 4, hauler 3, miner 1, upgrader 1 |   7.7 |     0 |   134/350 | idle | 3.4
     3200 | builder 3, harvester 3, hauler 3, miner 1, upgrader 1 |   7.6 |     0 |   283/400 | idle | 2.7
     3300 | builder 3, harvester 4, hauler 3, miner 1, upgrader 1 |     7 |     0 |   162/400 | idle | 2.4
     3400 | builder 3, harvester 3, hauler 3, miner 1, upgrader 1 |   5.8 |     0 |   114/400 | idle | 2
     3500 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   9.7 |     0 |    15/400 | busy | 2.4
     3600 | builder 2, harvester 5, hauler 3, miner 1, upgrader 2 |    10 |     0 |   182/400 | busy | 2.9
     3700 | builder 2, harvester 5, hauler 3, miner 1, upgrader 1 |   9.6 |     1 |   217/400 | idle | 3
     3800 | builder 2, harvester 5, hauler 3, miner 1, upgrader 1 |   7.6 |     0 |   310/400 | idle | 2.8
     3900 | builder 3, harvester 5, hauler 2, miner 2, upgrader 1 |   9.6 |     1 |   321/400 | busy | 3.1
     4000 | builder 3, harvester 5, hauler 2, miner 1, upgrader 1 |   9.4 |     0 |   142/400 | idle | 3
     4100 | builder 3, harvester 5, hauler 2, miner 1, upgrader 1 |    10 |     0 |   280/400 | idle | 3
     4200 | builder 3, harvester 5, hauler 3, miner 1, upgrader 1 |   8.5 |     1 |   181/400 | idle | 2.9
     4300 | builder 3, harvester 5, hauler 3, miner 1, upgrader 2 |  11.7 |     0 |   170/400 | idle | 3.4
     4400 | builder 3, harvester 5, hauler 3, miner 1, upgrader 3 |   9.7 |     2 |   207/450 | idle | 3.4
     4500 | builder 4, harvester 5, hauler 3, miner 1, upgrader 4 |  10.8 |   1.8 |    66/450 | idle | 3.6
     4600 | builder 5, harvester 5, hauler 3, miner 1, upgrader 4 |   9.3 |   1.2 |   236/450 | idle | 3.6
     4700 | builder 8, harvester 5, hauler 3, miner 1, upgrader 4 |  10.2 |   1.9 |    92/450 | busy | 3.3
     4800 | builder 8, harvester 4, hauler 3, miner 1, upgrader 4 |   9.2 |   1.1 |   248/450 | idle | 3.4
     4900 | builder 8, harvester 4, hauler 3, miner 1, upgrader 4 |   8.3 |     2 |   400/450 | idle | 3.3
     5000 | builder 8, harvester 5, hauler 3, miner 1, upgrader 4 |  11.2 |   2.3 |   300/450 | idle | 3.6
     5100 | builder 9, harvester 5, hauler 3, miner 1, upgrader 5 |    12 |   1.4 |    66/450 | busy | 3.5
     5200 | builder 7, harvester 5, hauler 3, miner 2, upgrader 5 |  12.1 |   1.3 |   400/450 | idle | 4.2
     5300 | builder 8, harvester 5, hauler 4, miner 2, upgrader 5 |    12 |     1 |   304/450 | busy | 4.3
     5400 | builder 10, harvester 5, hauler 4, miner 1, upgrader 5 |  14.2 |     0 |   299/450 | idle | 4.6
     5500 | builder 10, harvester 5, hauler 3, miner 1, upgrader 5 |  12.1 |   3.8 |   112/450 | busy | 4.2
     5600 | builder 10, harvester 5, hauler 3, miner 1, upgrader 5 |  15.9 |   1.7 |   450/450 | idle | 4.6
     5700 | builder 10, harvester 5, hauler 3, miner 1, upgrader 5 |  13.1 |   2.4 |   428/450 | idle | 3.9
     5800 | builder 10, harvester 5, hauler 3, miner 1, upgrader 5 |   7.7 |   2.1 |   450/450 | idle | 3.5
     5900 | builder 10, harvester 5, hauler 3, miner 1, upgrader 4 |  16.9 |     3 |   450/450 | busy | 4.1
     6000 | builder 10, harvester 5, hauler 3, miner 1, upgrader 3 |  16.7 |   1.4 |   450/450 | busy | 4.7
     6001 | builder 10, harvester 5, hauler 3, miner 1, upgrader 3 |    12 |     2 |   450/450 | busy | 3.8

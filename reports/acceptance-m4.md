# Scorecard: acceptance-m4 · 2026-11-14 13:01 · 6001 ticks · commit c75c137

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-14 10:18, e53adee) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 13.48 | 13.28 | +0.2 |
| Energy wasted at source regeneration (sum) | 6,014 | 6,612 | -598 |
| Controller progress / tick | 1.77 | 1.81 | -0.04 |
| Construction progress / tick | 0.5 | 2.42 | -1.92 |
| Energy delivered to spawn and extensions / tick | 6.59 | 7.76 | -1.17 |
| Spawn idle while energy is full | 21 % | 31 % | -10 pts |
| Spawn busy | 23 % | 28 % | -5 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 32 % | 40 % | -8 pts |
| CPU / tick (average, max) | 4.17, 29.28 | 4.21, 29.22 | -0.04 |
| RCL / progress at end (whole run) | 5 / 2,646 | 5 / 3,352 | -706 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 55,084 | 52,502 | +2,582 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 21 (24) | 22 (25) | -1 |

Creeps at end by role: builder 10, harvester 2, hauler 4, miner 2, upgrader 3.
Structures at end: container 2, extension 3, rampart 1, spawn 1, tower 1. Construction sites: 88 (container 1, extension 27, rampart 1, road 58, tower 1). Build energy in the window by target: completed 24, extension 477.
Room energy capacity 450; source capacity 3000 and 3000; Memory 5 KB; bucket 10000.
Bot console: 125 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.7
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.5
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.5
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 4, harvester 5, upgrader 1       |   9.5 |     0 |   194/300 | idle | 2.3
      700 | builder 4, harvester 5, upgrader 1       |   7.4 |     0 |   194/300 | idle | 2.2
      800 | builder 4, harvester 5, upgrader 1       |   9.9 |     0 |   144/300 | idle | 2.6
      900 | builder 4, harvester 5, upgrader 1       |  10.3 |     0 |    94/300 | idle | 2.7
     1000 | builder 4, harvester 5, upgrader 1       |  10.3 |     0 |    76/300 | idle | 2.8
     1100 | builder 4, harvester 5, upgrader 1       |  10.2 |     0 |    84/300 | idle | 2.7
     1200 | builder 4, harvester 5, upgrader 1       |   9.2 |     0 |    84/300 | idle | 2.7
     1300 | builder 4, harvester 5, upgrader 1       |   6.6 |     0 |    84/300 | idle | 2.5
     1400 | builder 4, harvester 5, upgrader 1       |   6.6 |     0 |    34/300 | idle | 2.3
     1500 | builder 4, harvester 5, upgrader 1       |   6.9 |     0 |   134/300 | idle | 2.3
     1600 | builder 4, harvester 3, upgrader 1       |   6.8 |     0 |   234/300 | idle | 2.2
     1700 | builder 4, harvester 3, upgrader 1       |   6.9 |     0 |    34/300 | idle | 2.1
     1800 | builder 4, harvester 2, upgrader 1       |   6.8 |     0 |   134/300 | idle | 2.1
     1900 | builder 3, harvester 1, upgrader 1       |   6.9 |     0 |   234/300 | idle | 2
     2000 | builder 1, harvester 2, upgrader 1       |     7 |     0 |    34/300 | idle | 1.9
     2100 | harvester 2                              |     4 |     0 |   134/300 | idle | 1.5
     2200 | harvester 3                              |   4.7 |     0 |    70/300 | idle | 1.4
     2300 | harvester 5                              |   7.9 |     0 |   235/300 | idle | 1.7
     2400 | builder 3, harvester 5                   |   7.8 |     0 |     6/300 | busy | 1.9
     2500 | builder 4, harvester 5, upgrader 1       |   9.4 |     0 |   170/300 | idle | 2.2
     2600 | builder 4, harvester 5, upgrader 1       |     8 |     0 |   120/300 | idle | 2.4
     2700 | builder 4, harvester 5, hauler 2, upgrader 1 |   8.8 |     0 |   131/300 | idle | 2.5
     2800 | builder 4, harvester 5, hauler 2, upgrader 1 |  10.3 |     0 |   102/300 | idle | 2.7
     2900 | builder 4, harvester 5, hauler 2, upgrader 1 |  10.3 |     0 |   123/300 | idle | 3
     3000 | builder 4, harvester 5, hauler 2, upgrader 1 |  10.3 |     0 |    94/300 | idle | 3
     3100 | builder 4, harvester 5, hauler 3, upgrader 1 |  10.2 |     0 |   165/350 | idle | 2.9
     3200 | builder 4, harvester 4, hauler 4, upgrader 1 |   8.3 |     0 |   171/350 | idle | 3.4
     3300 | builder 4, harvester 4, hauler 4, upgrader 1 |   7.5 |   0.5 |   135/350 | idle | 3.4
     3400 | builder 4, harvester 4, hauler 4, upgrader 1 |   8.4 |     0 |   102/350 | idle | 3.5
     3500 | builder 4, harvester 3, hauler 4, upgrader 1 |   7.7 |     0 |   141/400 | idle | 3.4
     3600 | builder 4, harvester 3, hauler 4, upgrader 1 |   7.7 |   0.5 |   191/400 | idle | 3.6
     3700 | builder 4, harvester 2, hauler 4, upgrader 1 |   7.6 |     0 |   191/400 | idle | 3.2
     3800 | builder 4, harvester 1, hauler 4, upgrader 1 |   3.1 |     0 |    76/400 | idle | 2.8
     3900 | builder 2, harvester 1, hauler 4, miner 1, upgrader 1 |   3.4 |     0 |    11/400 | busy | 2.3
     4000 | harvester 1, hauler 4, miner 2           |   4.8 |     0 |    83/400 | busy | 1.8
     4100 | builder 1, harvester 1, hauler 4, miner 2 |   6.7 |     0 |   227/400 | idle | 2.4
     4200 | builder 2, harvester 1, hauler 2, miner 2 |   5.4 |     0 |   334/400 | idle | 1.7
     4300 | builder 3, harvester 1, hauler 2, miner 2, upgrader 1 |   6.4 |     0 |   176/400 | idle | 2
     4400 | builder 3, harvester 1, hauler 3, miner 2, upgrader 1 |  13.4 |     0 |   252/400 | idle | 2.7
     4500 | builder 3, harvester 2, hauler 4, miner 2, upgrader 1 |  14.5 |     0 |   348/400 | idle | 3.1
     4600 | builder 3, harvester 2, hauler 4, miner 2, upgrader 2 |  14.4 |   1.1 |   290/400 | idle | 3.4
     4700 | builder 3, harvester 2, hauler 4, miner 2, upgrader 3 |  13.7 |   0.9 |   118/400 | idle | 3.6
     4800 | builder 3, harvester 2, hauler 4, miner 2, upgrader 5 |  15.1 |   1.9 |   258/400 | busy | 3.7
     4900 | builder 5, harvester 2, hauler 4, miner 2, upgrader 5 |  15.1 |   1.7 |   196/400 | busy | 3.9
     5000 | builder 6, harvester 2, hauler 4, miner 2, upgrader 5 |  15.1 |   2.2 |   384/400 | idle | 4.2
     5100 | builder 8, harvester 2, hauler 4, miner 2, upgrader 5 |    15 |   2.2 |   328/400 | idle | 4.1
     5200 | builder 10, harvester 2, hauler 4, miner 2, upgrader 4 |  13.8 |     2 |   162/400 | idle | 4.3
     5300 | builder 10, harvester 1, hauler 5, miner 3, upgrader 4 |  14.6 |   1.3 |   127/400 | idle | 4.1
     5400 | builder 10, harvester 1, hauler 5, miner 4, upgrader 4 |  11.4 |   2.4 |   283/400 | idle | 4.6
     5500 | builder 10, harvester 2, hauler 5, miner 3, upgrader 4 |  11.7 |   2.1 |    45/400 | idle | 4
     5600 | builder 10, harvester 2, hauler 5, miner 2, upgrader 4 |  11.7 |   1.3 |   350/400 | idle | 4.3
     5700 | builder 10, harvester 2, hauler 5, miner 2, upgrader 4 |  11.8 |   2.5 |   400/400 | idle | 4.4
     5800 | builder 10, harvester 2, hauler 5, miner 2, upgrader 4 |  15.3 |   0.9 |   278/400 | busy | 4.1
     5900 | builder 10, harvester 2, hauler 4, miner 2, upgrader 4 |  15.2 |   2.1 |   400/400 | idle | 4.1
     6000 | builder 10, harvester 2, hauler 4, miner 2, upgrader 4 |  14.3 |     1 |   400/450 | idle | 3.6
     6001 | builder 10, harvester 2, hauler 4, miner 2, upgrader 3 |    16 |     2 |   423/450 | idle | 4.4

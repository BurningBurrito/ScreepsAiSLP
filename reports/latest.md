# Scorecard: acceptance-m4 · 2026-11-11 23:10 · 6001 ticks · commit 5440f7a

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-10 17:33, 754f7d4) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 14.44 | 6.62 | +7.82 |
| Energy wasted at source regeneration (sum) | 5,718 | 9,122 | -3,404 |
| Controller progress / tick | 0.02 | 0.2 | -0.18 |
| Construction progress / tick | 2.02 | 2.92 | -0.9 |
| Energy delivered to spawn and extensions / tick | 3.45 | 2.74 | +0.71 |
| Spawn idle while energy is full | 86 % | 1 % | +85 pts |
| Spawn busy | 14 % | 9 % | +6 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 39 % | 42 % | -3 pts |
| CPU / tick (average, max) | 2.47, 29.18 | 2.18, 28.49 | +0.29 |
| RCL / progress at end (whole run) | 5 / 282 | 5 / 600 | -318 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 56,928 | 51,690 | +5,238 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 14 (15) | 13 (13) | +1 |

Creeps at end by role: builder 5, harvester 2, hauler 3, miner 2, upgrader 2.
Structures at end: container 2, extension 3, spawn 1, tower 1. Construction sites: 89 (container 1, extension 27, rampart 2, road 58, tower 1). Build energy in the window by target: completed 10, container 2008.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 110 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.3
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1300 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 1.9
     1400 | builder 3, harvester 5, upgrader 1       |   4.6 |     0 |   137/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   5.3 |     0 |   137/300 | idle | 2
     1600 | builder 3, harvester 4, upgrader 1       |   5.6 |     0 |   151/300 | idle | 1.9
     1700 | builder 3, harvester 4, upgrader 1       |   5.8 |     0 |   266/300 | idle | 1.9
     1800 | builder 3, harvester 5, upgrader 1       |   5.5 |     0 |    74/300 | idle | 1.9
     1900 | builder 2, harvester 5, upgrader 1       |   6.4 |     0 |   140/300 | idle | 2
     2000 | builder 1, harvester 5, upgrader 1       |   6.6 |     0 |   240/300 | idle | 1.9
     2100 | builder 3, harvester 5                   |   7.7 |     0 |   335/350 | idle | 1.9
     2200 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   143/350 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |   0.2 |   143/350 | idle | 2.3
     2400 | builder 3, harvester 5, upgrader 1       |   8.7 |     0 |   143/350 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   243/400 | idle | 2.2
     2600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   193/400 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 1       |   7.4 |   0.5 |   193/400 | idle | 2.4
     2800 | builder 3, harvester 5, upgrader 1       |     9 |     0 |   193/400 | idle | 2.3
     2900 | builder 3, harvester 5, upgrader 1       |   7.6 |     0 |   193/450 | idle | 2.2
     3000 | builder 3, harvester 5, upgrader 1       |   8.4 |   0.1 |   193/450 | idle | 2.3
     3100 | builder 3, harvester 5, upgrader 1       |   6.5 |   0.4 |    20/450 | busy | 2.2
     3200 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   252/450 | idle | 2
     3300 | builder 3, harvester 4, upgrader 1       |   5.9 |     0 |   304/450 | idle | 1.9
     3400 | builder 3, harvester 5, upgrader 1       |   7.2 |   0.5 |   266/450 | idle | 1.9
     3500 | builder 3, harvester 5, upgrader 2       |   8.3 |     0 |   191/450 | idle | 2
     3600 | builder 1, harvester 5, upgrader 2       |  11.3 |     0 |   291/450 | idle | 2.2
     3700 | builder 1, harvester 5, upgrader 1       |   8.1 |     0 |   204/450 | idle | 1.8
     3800 | builder 1, harvester 5, upgrader 1       |   9.8 |     0 |   350/450 | idle | 1.8
     3900 | builder 2, harvester 5, hauler 2, upgrader 1 |    11 |     0 |   129/450 | idle | 2.1
     4000 | builder 3, harvester 5, hauler 2, upgrader 1 |   7.9 |   0.4 |   434/450 | idle | 2.6
     4100 | builder 4, harvester 5, hauler 2, miner 1, upgrader 2 |  12.1 |   0.1 |   108/450 | busy | 2.9
     4200 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  11.3 |   0.2 |   450/450 | idle | 3.1
     4300 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  14.9 |     0 |   450/450 | idle | 2.8
     4400 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  16.5 |     0 |   450/450 | idle | 2.6
     4500 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  15.4 |     0 |   450/450 | idle | 2.6
     4600 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  13.1 |     0 |   450/450 | idle | 2.5
     4700 | builder 5, harvester 3, hauler 2, miner 1, upgrader 2 |  16.7 |     0 |   450/450 | idle | 2.7
     4800 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  15.8 |     0 |   450/450 | idle | 2.4
     4900 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   9.6 |     0 |   440/450 | idle | 2.2
     5000 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |    11 |     0 |   382/450 | busy | 2.1
     5100 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.1 |     0 |   450/450 | idle | 2.4
     5200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  13.3 |     0 |   450/450 | idle | 2.5
     5300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  16.8 |     0 |   450/450 | idle | 2.5
     5400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.5 |     0 |   155/450 | busy | 2.2
     5500 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  12.6 |     0 |   450/450 | idle | 2.4
     5600 | builder 5, harvester 2, hauler 2, miner 2, upgrader 2 |  15.3 |     0 |     9/450 | busy | 2.6
     5700 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  14.6 |     0 |   450/450 | idle | 2.6
     5800 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  14.5 |     0 |   450/450 | idle | 2.3
     5900 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  16.4 |     0 |   450/450 | idle | 2.3
     6000 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  15.4 |     0 |   450/450 | idle | 2.9
     6001 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |     6 |     0 |   450/450 | idle | 2.1

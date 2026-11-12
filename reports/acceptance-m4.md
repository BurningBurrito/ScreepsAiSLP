# Scorecard: acceptance-m4 · 2026-11-12 03:46 · 6001 ticks · commit 73d682c

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-11 23:10, 5440f7a) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 14.1 | 14.44 | -0.34 |
| Energy wasted at source regeneration (sum) | 3,648 | 5,718 | -2,070 |
| Controller progress / tick | 0.39 | 0.02 | +0.37 |
| Construction progress / tick | 1.95 | 2.02 | -0.07 |
| Energy delivered to spawn and extensions / tick | 3.79 | 3.45 | +0.34 |
| Spawn idle while energy is full | 85 % | 86 % | -1 pts |
| Spawn busy | 15 % | 14 % | +1 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | 39 % | +1 pts |
| CPU / tick (average, max) | 2.6, 30.56 | 2.47, 29.18 | +0.13 |
| RCL / progress at end (whole run) | 5 / 1,090 | 5 / 282 | +808 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 56,198 | 56,928 | -730 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 14 (15) | 14 (15) | 0 |

Creeps at end by role: builder 5, harvester 2, hauler 3, miner 2, upgrader 2.
Structures at end: container 2, extension 3, rampart 1, spawn 1, tower 1. Construction sites: 88 (container 1, extension 27, rampart 1, road 58, tower 1). Build energy in the window by target: completed 17, container 1929.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 110 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.2
     1300 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 2.1
     1400 | builder 3, harvester 5, upgrader 1       |   4.6 |     0 |   137/300 | idle | 2.2
     1500 | builder 3, harvester 5, upgrader 1       |   5.3 |     0 |   137/300 | idle | 2.1
     1600 | builder 3, harvester 4, upgrader 1       |   5.6 |     0 |   151/300 | idle | 2
     1700 | builder 3, harvester 4, upgrader 1       |   5.8 |     0 |   266/300 | idle | 2
     1800 | builder 3, harvester 5, upgrader 1       |   5.5 |     0 |    74/300 | idle | 2
     1900 | builder 2, harvester 5, upgrader 1       |   6.4 |     0 |   140/300 | idle | 2
     2000 | builder 1, harvester 5, upgrader 1       |   6.6 |     0 |   240/300 | idle | 2
     2100 | builder 3, harvester 5                   |   7.7 |     0 |   335/350 | idle | 2
     2200 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   143/350 | idle | 2.4
     2300 | builder 3, harvester 5, upgrader 1       |   7.8 |     0 |   143/350 | idle | 2.3
     2400 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |    93/350 | idle | 2.4
     2500 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   243/400 | idle | 2.4
     2600 | builder 3, harvester 5, upgrader 1       |   8.5 |   0.5 |   193/400 | idle | 2.6
     2700 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   193/400 | idle | 2.4
     2800 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   243/400 | idle | 2.5
     2900 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   193/450 | idle | 2.4
     3000 | builder 3, harvester 5, upgrader 1       |   8.2 |     0 |   228/450 | idle | 2.6
     3100 | builder 3, harvester 5, upgrader 1       |   6.3 |     0 |    53/450 | idle | 2.3
     3200 | builder 3, harvester 5, upgrader 1       |   8.7 |   0.5 |   214/450 | idle | 2.2
     3300 | builder 3, harvester 4, upgrader 1       |   8.3 |     0 |   380/450 | idle | 2.1
     3400 | builder 3, harvester 5, upgrader 1       |   6.7 |     0 |    50/450 | busy | 2
     3500 | builder 3, harvester 5, upgrader 2       |   9.8 |     0 |   138/450 | busy | 2
     3600 | builder 1, harvester 5, upgrader 2       |  10.9 |     0 |   375/450 | idle | 2.2
     3700 | builder 2, harvester 5, upgrader 1       |    10 |     0 |   266/450 | idle | 2.1
     3800 | builder 2, harvester 5, upgrader 1       |  10.8 |   0.5 |   214/450 | idle | 2.5
     3900 | builder 3, harvester 5, hauler 2, upgrader 1 |   9.8 |     0 |   174/450 | idle | 2.7
     4000 | builder 3, harvester 5, hauler 2, miner 1, upgrader 1 |   5.1 |     0 |    83/450 | busy | 2.4
     4100 | builder 3, harvester 5, hauler 2, miner 1, upgrader 2 |  10.8 |     0 |   420/450 | idle | 2.9
     4200 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  12.1 |   0.5 |   450/450 | idle | 3.1
     4300 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  16.4 |   0.5 |   450/450 | idle | 3
     4400 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  16.4 |   0.5 |   450/450 | idle | 3
     4500 | builder 5, harvester 5, hauler 2, miner 1, upgrader 2 |  15.4 |     0 |   450/450 | idle | 2.9
     4600 | builder 5, harvester 4, hauler 2, miner 1, upgrader 2 |  12.7 |     1 |   450/450 | idle | 2.6
     4700 | builder 5, harvester 3, hauler 2, miner 1, upgrader 2 |    16 |     1 |   450/450 | idle | 2.6
     4800 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  16.2 |     1 |   450/450 | idle | 2.5
     4900 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   6.3 |   0.1 |   450/450 | idle | 2.1
     5000 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   8.6 |   0.9 |   450/450 | idle | 2.3
     5100 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.1 |   0.8 |   450/450 | idle | 2.7
     5200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.3 |   0.7 |   450/450 | idle | 2.7
     5300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  16.4 |     0 |   450/450 | idle | 2.6
     5400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  14.8 |     0 |   158/450 | busy | 2.3
     5500 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  12.6 |   0.5 |   450/450 | idle | 2.5
     5600 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.8 |   0.5 |   450/450 | idle | 2.5
     5700 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.2 |     0 |   450/450 | idle | 2.8
     5800 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |    14 |     1 |   450/450 | idle | 2.8
     5900 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  16.6 |     0 |   450/450 | idle | 2.5
     6000 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  15.3 |   0.4 |   450/450 | idle | 2.8
     6001 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |     6 |     4 |   450/450 | idle | 2.8

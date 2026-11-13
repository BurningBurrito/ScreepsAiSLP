# Scorecard: acceptance-m4 · 2026-11-13 04:06 · 6001 ticks · commit b9a4099

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-12 16:02, f3a6863) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 12.72 | 14.02 | -1.3 |
| Energy wasted at source regeneration (sum) | 6,730 | 6,582 | +148 |
| Controller progress / tick | 0.63 | 0.45 | +0.18 |
| Construction progress / tick | 3.8 | 1.46 | +2.34 |
| Energy delivered to spawn and extensions / tick | 4.61 | 2.32 | +2.29 |
| Spawn idle while energy is full | 71 % | 92 % | -21 pts |
| Spawn busy | 16 % | 8 % | +8 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 43 % | 45 % | -1 pts |
| CPU / tick (average, max) | 3.48, 36.06 | 2.43, 29.38 | +1.05 |
| RCL / progress at end (whole run) | 5 / 1,650 | 5 / 1,254 | +396 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 47,982 | 52,086 | -4,104 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 21 (21) | 12 (12) | +9 |

Creeps at end by role: builder 10, harvester 2, hauler 3, miner 1, upgrader 5.
Structures at end: container 1, extension 3, rampart 1, spawn 1, tower 1. Construction sites: 89 (container 2, extension 27, rampart 1, road 58, tower 1). Build energy in the window by target: completed 8, container 3789.
Room energy capacity 450; source capacity 3000 and 3000; Memory 4 KB; bucket 10000.
Bot console: 128 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.8
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.5
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.2
     1300 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1400 | builder 3, harvester 5, upgrader 1       |     5 |     0 |   137/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 2
     1600 | builder 3, harvester 4, upgrader 1       |   6.9 |     0 |   197/300 | idle | 2.1
     1700 | builder 3, harvester 4, upgrader 1       |   6.7 |     0 |   226/300 | idle | 2.1
     1800 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |     9/300 | busy | 1.9
     1900 | builder 2, harvester 5, upgrader 1       |   7.6 |     0 |   138/300 | idle | 2.1
     2000 | harvester 5, upgrader 1                  |   7.4 |     0 |   188/300 | idle | 2.1
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.9
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.3
     2400 | builder 3, harvester 5, miner 1, upgrader 1 |   8.4 |     0 |   140/300 | idle | 2.2
     2500 | builder 3, harvester 5, miner 1, upgrader 1 |   7.4 |     0 |    90/300 | idle | 2.3
     2600 | builder 3, harvester 5, miner 1, upgrader 1 |   8.5 |     0 |    90/300 | idle | 2.4
     2700 | builder 3, harvester 5, miner 1, upgrader 1 |   7.4 |     0 |    90/300 | idle | 2.4
     2800 | builder 3, harvester 5, miner 1, upgrader 1 |   8.4 |     0 |   140/350 | idle | 2.5
     2900 | builder 3, harvester 5, miner 1, upgrader 1 |   7.4 |   0.2 |   140/350 | idle | 2.3
     3000 | builder 3, harvester 5, miner 1, upgrader 1 |   8.5 |     0 |   140/350 | idle | 2.4
     3100 | builder 3, harvester 4, hauler 1, miner 1, upgrader 1 |   6.8 |     0 |   168/350 | idle | 2.4
     3200 | builder 3, harvester 3, hauler 3, miner 1, upgrader 1 |   6.7 |     0 |   300/350 | idle | 2.7
     3300 | builder 3, harvester 3, hauler 3, miner 1, upgrader 2 |   6.1 |   0.1 |   203/350 | idle | 2.7
     3400 | builder 3, harvester 1, hauler 3, miner 1, upgrader 2 |   4.7 |   0.9 |   300/400 | idle | 2.5
     3500 | builder 3, harvester 2, hauler 3, miner 1, upgrader 2 |     3 |     0 |   140/400 | idle | 1.9
     3600 | builder 2, harvester 2, hauler 3, miner 1, upgrader 2 |     2 |   0.5 |     9/400 | busy | 1.9
     3700 | builder 1, harvester 2, hauler 3, miner 1, upgrader 1 |   7.6 |   0.1 |   281/400 | idle | 2.2
     3800 | builder 1, harvester 2, hauler 3, miner 1, upgrader 1 |   7.3 |   0.4 |   256/400 | idle | 2.5
     3900 | builder 1, harvester 2, hauler 3, upgrader 1 |   7.7 |   0.5 |   265/400 | idle | 2.5
     4000 | builder 1, harvester 2, hauler 3, miner 1, upgrader 1 |   5.8 |   0.5 |   342/400 | idle | 2
     4100 | builder 2, harvester 2, hauler 3, miner 1, upgrader 1 |   9.8 |   0.5 |   225/400 | idle | 2.3
     4200 | builder 3, harvester 2, hauler 3, miner 1, upgrader 2 |   9.2 |   0.1 |   185/450 | idle | 2.6
     4300 | builder 3, harvester 2, hauler 3, miner 1, upgrader 4 |   8.9 |   0.4 |   131/450 | busy | 2.8
     4400 | builder 4, harvester 2, hauler 3, miner 1, upgrader 5 |   8.2 |   1.2 |    22/450 | busy | 2.7
     4500 | builder 5, harvester 2, hauler 3, miner 1, upgrader 5 |   9.2 |   0.8 |   371/450 | idle | 3
     4600 | builder 7, harvester 2, hauler 3, miner 1, upgrader 5 |     9 |     1 |   204/450 | idle | 3.1
     4700 | builder 8, harvester 2, hauler 3, miner 1, upgrader 5 |   9.8 |   1.2 |   250/450 | idle | 3
     4800 | builder 9, harvester 1, hauler 3, miner 1, upgrader 4 |   8.9 |   0.9 |   342/450 | idle | 3.2
     4900 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |   8.6 |   0.5 |   166/450 | busy | 3.1
     5000 | builder 10, harvester 1, hauler 3, miner 1, upgrader 4 |   4.1 |   0.5 |   433/450 | idle | 2.9
     5100 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |   8.8 |   0.5 |   450/450 | idle | 3.2
     5200 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |  11.2 |   0.5 |   450/450 | idle | 3.3
     5300 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |  15.2 |     1 |   450/450 | idle | 4.1
     5400 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |  15.2 |   0.5 |   450/450 | idle | 3.5
     5500 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |  14.1 |     0 |   450/450 | idle | 3.4
     5600 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |    17 |   0.7 |   450/450 | idle | 3.2
     5700 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |  16.2 |   1.3 |   178/450 | busy | 3.3
     5800 | builder 10, harvester 2, hauler 3, miner 1, upgrader 4 |   8.5 |     0 |   371/450 | idle | 3.5
     5900 | builder 10, harvester 2, hauler 3, miner 1, upgrader 5 |   9.6 |     0 |   450/450 | idle | 3.7
     6000 | builder 10, harvester 2, hauler 3, miner 1, upgrader 5 |  11.3 |   1.8 |   450/450 | idle | 3.6
     6001 | builder 10, harvester 2, hauler 3, miner 1, upgrader 5 |    12 |     3 |   450/450 | idle | 4

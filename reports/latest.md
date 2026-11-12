# Scorecard: acceptance-m4 · 2026-11-12 04:47 · 6001 ticks · commit 8bf1176

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-12 03:46, 73d682c) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 14.64 | 14.1 | +0.54 |
| Energy wasted at source regeneration (sum) | 5,694 | 3,648 | +2,046 |
| Controller progress / tick | 0.47 | 0.39 | +0.08 |
| Construction progress / tick | 1.45 | 1.95 | -0.5 |
| Energy delivered to spawn and extensions / tick | 2.96 | 3.79 | -0.83 |
| Spawn idle while energy is full | 89 % | 85 % | +4 pts |
| Spawn busy | 11 % | 15 % | -4 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | 40 % | 0 pts |
| CPU / tick (average, max) | 2.52, 30.52 | 2.6, 30.56 | -0.08 |
| RCL / progress at end (whole run) | 5 / 1,068 | 5 / 1,090 | -22 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 54,824 | 56,198 | -1,374 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 14 (14) | 14 (15) | 0 |

Creeps at end by role: builder 5, harvester 2, hauler 3, miner 2, upgrader 2.
Structures at end: container 2, extension 3, rampart 2, spawn 1, tower 1. Construction sites: 87 (container 1, extension 27, road 58, tower 1). Build energy in the window by target: completed 9, container 1439.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 118 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.2
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
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
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.8
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.2
     2400 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |    90/300 | idle | 2.2
     2500 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/300 | idle | 2.1
     2600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |    90/300 | idle | 2.1
     2700 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.1
     2800 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   140/350 | idle | 2.1
     2900 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/350 | idle | 2
     3000 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   140/350 | idle | 2.1
     3100 | builder 3, harvester 4, hauler 1, upgrader 1 |     7 |     0 |    90/350 | idle | 2.1
     3200 | builder 3, harvester 3, hauler 2, upgrader 1 |   8.5 |     0 |   197/400 | idle | 2.7
     3300 | builder 3, harvester 2, hauler 2, miner 1, upgrader 1 |   7.3 |     0 |   354/400 | idle | 2.4
     3400 | builder 3, harvester 1, hauler 2, miner 1, upgrader 1 |   7.1 |     0 |   354/400 | idle | 2
     3500 | builder 4, harvester 2, hauler 2, miner 1, upgrader 2 |   7.6 |     0 |    24/400 | busy | 1.9
     3600 | builder 2, harvester 2, hauler 2, miner 1, upgrader 2 |   9.4 |     0 |   233/400 | idle | 2.1
     3700 | builder 1, harvester 2, hauler 2, miner 1, upgrader 1 |  10.2 |     0 |   346/400 | idle | 2.1
     3800 | builder 2, harvester 2, hauler 2, miner 1, upgrader 1 |   5.5 |     0 |    52/450 | busy | 2.2
     3900 | builder 3, harvester 2, hauler 2, miner 1, upgrader 2 |   8.7 |   0.5 |   122/450 | idle | 2.4
     4000 | builder 3, harvester 2, hauler 2, miner 1, upgrader 2 |   4.4 |   0.5 |   405/450 | idle | 2.2
     4100 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   5.2 |     0 |    86/450 | busy | 2.4
     4200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   8.7 |   0.5 |   450/450 | idle | 2.6
     4300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.5 |   0.5 |   450/450 | idle | 2.4
     4400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.6 |   0.5 |   450/450 | idle | 2.5
     4500 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.6 |     0 |   450/450 | idle | 2.3
     4600 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |    14 |     1 |   450/450 | idle | 2.5
     4700 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.7 |   0.5 |   450/450 | idle | 2.5
     4800 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.9 |   0.5 |   450/450 | idle | 2.4
     4900 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   8.2 |     1 |   450/450 | idle | 2.1
     5000 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  10.3 |   0.5 |   450/450 | idle | 2.4
     5100 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.1 |   0.6 |   450/450 | idle | 2.5
     5200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.8 |   0.9 |   450/450 | idle | 2.6
     5300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  16.7 |   0.5 |   450/450 | idle | 2.4
     5400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.2 |   0.5 |   255/450 | busy | 2.5
     5500 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  11.2 |   0.8 |   450/450 | busy | 2.5
     5600 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  15.8 |   0.2 |   450/450 | idle | 2.5
     5700 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  15.9 |     1 |   450/450 | idle | 2.4
     5800 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  15.1 |     0 |   450/450 | idle | 2.3
     5900 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  16.8 |     0 |   450/450 | idle | 2.5
     6000 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |  14.8 |   0.2 |   450/450 | idle | 3.1
     6001 | builder 5, harvester 2, hauler 3, miner 2, upgrader 2 |     6 |     2 |   450/450 | idle | 2.3

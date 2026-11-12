# Scorecard: probe-m5-creeps · 2026-11-12 20:17 · 5001 ticks · commit 54985c0

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.36 | - |  |
| Energy wasted at source regeneration (sum) | 10,106 | - |  |
| Controller progress / tick | 0.43 | - |  |
| Construction progress / tick | 2.35 | - |  |
| Energy delivered to spawn and extensions / tick | 3.04 | - |  |
| Spawn idle while energy is full | 59 % | - |  |
| Spawn busy | 11 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 41 % | - |  |
| CPU / tick (average, max) | 2.57, 29.52 | - |  |
| RCL / progress at end (whole run) | 5 / 802 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | - |  |
| Energy harvested (whole run) | 38,070 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 1 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 12 (12) | - |  |

Creeps at end by role: builder 5, harvester 2, hauler 2, miner 1, upgrader 2.
Structures at end: container 1, extension 3, spawn 1, tower 1. Construction sites: 90 (container 2, extension 27, rampart 2, road 58, tower 1). Build energy in the window by target: container 2351.
Room energy capacity 450; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 150 lines, 0 with errors (reports/probe-m5-creeps-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.7
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.5
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.5
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2.1
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.3
     1300 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1400 | builder 3, harvester 5, upgrader 1       |     5 |     0 |   137/300 | idle | 2.1
     1500 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 2
     1600 | builder 3, harvester 4, upgrader 1       |   6.9 |     0 |   197/300 | idle | 2.2
     1700 | builder 3, harvester 4, upgrader 1       |   6.7 |     0 |   226/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |     9/300 | busy | 2
     1900 | builder 2, harvester 5, upgrader 1       |   7.6 |     0 |   138/300 | idle | 2.2
     2000 | harvester 5, upgrader 1                  |   7.4 |     0 |   188/300 | idle | 2.1
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.9
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.4
     2400 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |    90/300 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/300 | idle | 2.2
     2600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |    90/300 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.3
     2800 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |    90/350 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/350 | idle | 2.2
     3000 | builder 3, harvester 5, upgrader 1       |   8.5 |   0.5 |    90/350 | idle | 2.2
     3100 | builder 3, harvester 4, hauler 2, upgrader 1 |   7.3 |     0 |   122/350 | idle | 2.2
     3200 | builder 3, harvester 3, hauler 2, upgrader 1 |   8.5 |     0 |   185/400 | idle | 2.7
     3300 | builder 3, harvester 2, hauler 2, miner 1, upgrader 1 |   7.2 |   0.5 |   293/400 | idle | 2.5
     3400 | builder 3, harvester 2, hauler 2, miner 1, upgrader 1 |   5.3 |     0 |    13/400 | busy | 2.1
     3500 | builder 4, harvester 2, hauler 2, miner 1, upgrader 2 |   8.4 |     0 |    13/400 | busy | 2.1
     3600 | builder 2, harvester 2, hauler 2, miner 1, upgrader 2 |   9.2 |   0.5 |   301/400 | idle | 2.5
     3700 | builder 1, harvester 2, hauler 2, miner 1, upgrader 1 |   9.8 |   0.5 |   358/400 | idle | 2.4
     3800 | builder 2, harvester 2, hauler 2, miner 1, upgrader 1 |   9.2 |   0.5 |   164/450 | busy | 2.5
     3900 | builder 3, harvester 2, hauler 2, miner 1, upgrader 1 |   8.3 |   0.5 |   408/450 | idle | 2.5
     4000 | builder 3, harvester 2, hauler 2, miner 1, upgrader 2 |   4.7 |   0.7 |   424/450 | idle | 2.7
     4100 | builder 4, harvester 2, hauler 2, miner 1, upgrader 2 |   3.9 |   0.7 |   377/450 | idle | 2.3
     4200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   6.2 |   0.1 |   266/450 | idle | 2.6
     4300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   4.7 |   0.5 |   373/450 | idle | 2.7
     4400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   4.8 |     1 |   450/450 | idle | 2.9
     4500 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  14.6 |   0.5 |   450/450 | idle | 2.7
     4600 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |    14 |   0.1 |   351/450 | busy | 2.4
     4700 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  14.7 |   0.4 |   450/450 | idle | 2.7
     4800 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |  13.1 |   0.5 |   450/450 | idle | 2.5
     4900 | builder 5, harvester 2, hauler 2, miner 1, upgrader 1 |     8 |   0.5 |   450/450 | idle | 2.6
     5000 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   9.5 |     0 |   450/450 | idle | 2.3
     5001 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |    12 |     2 |   450/450 | idle | 2.2

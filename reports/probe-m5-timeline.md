# Scorecard: probe-m5-timeline · 2026-11-12 08:01 · 5001 ticks · commit 004fc8e

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 11.68 | - |  |
| Energy wasted at source regeneration (sum) | 8,076 | - |  |
| Controller progress / tick | 0.5 | - |  |
| Construction progress / tick | 2.98 | - |  |
| Energy delivered to spawn and extensions / tick | 2.74 | - |  |
| Spawn idle while energy is full | 76 % | - |  |
| Spawn busy | 11 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | - |  |
| CPU / tick (average, max) | 2.56, 30.52 | - |  |
| RCL / progress at end (whole run) | 5 / 600 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | - |  |
| Energy harvested (whole run) | 40,184 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 1 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 12 (12) | - |  |

Creeps at end by role: builder 5, harvester 2, hauler 2, miner 1, upgrader 2.
Structures at end: container 1, extension 3, spawn 1, tower 1. Construction sites: 90 (container 2, extension 27, rampart 2, road 58, tower 1). Build energy in the window by target: container 2983.
Room energy capacity 450; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 148 lines, 0 with errors (reports/probe-m5-timeline-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.8
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2.1
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
      800 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.5
     1000 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   187/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.3
     1300 | builder 3, harvester 5, upgrader 1       |   5.6 |     0 |   137/300 | idle | 2.1
     1400 | builder 3, harvester 5, upgrader 1       |     5 |     0 |   137/300 | idle | 1.9
     1500 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   137/300 | idle | 2
     1600 | builder 3, harvester 4, upgrader 1       |   6.9 |     0 |   197/300 | idle | 2.2
     1700 | builder 3, harvester 4, upgrader 1       |   6.7 |     0 |   226/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |     9/300 | busy | 2
     1900 | builder 2, harvester 5, upgrader 1       |   7.6 |     0 |   138/300 | idle | 2.2
     2000 | harvester 5, upgrader 1                  |   7.4 |     0 |   188/300 | idle | 2.1
     2100 | builder 2, harvester 5                   |   8.2 |     0 |   176/300 | idle | 1.9
     2200 | builder 3, harvester 5, upgrader 1       |   9.1 |     0 |   140/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.3
     2400 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |    90/300 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/300 | idle | 2.2
     2600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |    90/300 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   140/300 | idle | 2.2
     2800 | builder 3, harvester 5, upgrader 1       |   8.4 |     0 |   140/350 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |    90/350 | idle | 2.1
     3000 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   140/350 | idle | 2.2
     3100 | builder 3, harvester 4, hauler 1, upgrader 1 |     7 |     0 |    90/350 | idle | 2.2
     3200 | builder 3, harvester 3, hauler 2, upgrader 1 |   8.5 |     0 |   197/400 | idle | 3
     3300 | builder 3, harvester 2, hauler 2, miner 1, upgrader 1 |   7.3 |     0 |   354/400 | idle | 2.5
     3400 | builder 3, harvester 1, hauler 2, miner 1, upgrader 1 |   7.1 |     0 |   354/400 | idle | 2.1
     3500 | builder 4, harvester 2, hauler 2, miner 1, upgrader 2 |   7.6 |     0 |    24/400 | busy | 2.1
     3600 | builder 2, harvester 2, hauler 2, miner 1, upgrader 2 |   9.4 |     0 |   233/400 | idle | 2.3
     3700 | builder 1, harvester 2, hauler 2, miner 1, upgrader 1 |  10.2 |     0 |   346/400 | idle | 2.2
     3800 | builder 2, harvester 2, hauler 2, miner 1, upgrader 1 |   5.5 |     0 |    52/450 | busy | 2.4
     3900 | builder 3, harvester 2, hauler 2, miner 1, upgrader 2 |   8.7 |   0.5 |   122/450 | idle | 2.6
     4000 | builder 3, harvester 2, hauler 2, miner 1, upgrader 2 |   4.4 |   0.5 |   405/450 | idle | 2.3
     4100 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   5.2 |     0 |    86/450 | busy | 2.6
     4200 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   8.7 |   0.5 |   450/450 | idle | 2.8
     4300 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.5 |   0.5 |   450/450 | idle | 2.6
     4400 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.6 |   0.5 |   450/450 | idle | 2.6
     4500 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.6 |     0 |   450/450 | idle | 2.4
     4600 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |    14 |     1 |   450/450 | idle | 2.7
     4700 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  14.7 |   0.5 |   450/450 | idle | 2.7
     4800 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  11.9 |   0.5 |   450/450 | idle | 2.5
     4900 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |   8.2 |     1 |   450/450 | idle | 2.3
     5000 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |  10.3 |   0.5 |   450/450 | idle | 2.5
     5001 | builder 5, harvester 2, hauler 2, miner 1, upgrader 2 |    12 |     0 |   450/450 | idle | 2.3

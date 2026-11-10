# Scorecard: acceptance-m2 · 2026-11-10 16:49 · 3001 ticks · commit 754f7d4

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-10 11:12, cf6c66a) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.21 | 6.21 | 0 |
| Energy wasted at source regeneration (sum) | 11,628 | 11,628 | 0 |
| Controller progress / tick | 0.2 | 0.2 | 0 |
| Construction progress / tick | 4.37 | 4.37 | 0 |
| Energy delivered to spawn and extensions / tick | 5.41 | 5.41 | 0 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 8 % | 8 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 31 % | 31 % | 0 pts |
| CPU / tick (average, max) | 2.02, 20.77 | 2.02, 20.77 | 0 |
| RCL / progress at end (whole run) | 2 / 400 | 2 / 400 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 846 / - | 846 / - | 0 |
| Energy harvested (whole run) | 16,132 | 16,132 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 11 (12) | 11 (12) | 0 |

Creeps at end by role: builder 5, harvester 2, hauler 1, miner 1, upgrader 2.
Structures at end: container 1, extension 1, road 2, spawn 1. Construction sites: 61 (extension 4, road 57). Build energy in the window by target: completed 11, container 2475, extension 1885.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 55 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.6 |   131/300 | idle | 1.6
      700 | builder 4, harvester 2, upgrader 2       |   5.1 |   0.4 |   260/300 | idle | 1.7
      800 | builder 5, harvester 2, upgrader 2       |   3.8 |     0 |     5/300 | busy | 1.8
      900 | builder 5, harvester 2, upgrader 2       |   4.7 |   0.5 |   134/300 | idle | 1.9
     1000 | builder 5, harvester 2, upgrader 2       |   4.2 |     0 |   234/300 | idle | 1.8
     1100 | builder 5, harvester 2, upgrader 2       |   4.2 |   0.5 |   134/300 | idle | 2
     1200 | builder 5, harvester 2, upgrader 2       |   3.7 |     0 |   134/300 | idle | 1.9
     1300 | builder 5, harvester 2, upgrader 2       |   4.2 |   0.5 |   134/300 | idle | 1.9
     1400 | builder 5, harvester 3, upgrader 2       |   4.8 |     0 |    65/300 | idle | 1.8
     1500 | builder 5, harvester 3, upgrader 2       |   7.9 |   0.5 |   208/350 | idle | 2.1
     1600 | builder 5, harvester 2, upgrader 2       |   4.2 |     0 |    58/350 | busy | 1.9
     1700 | builder 5, harvester 3, upgrader 2       |   6.4 |   0.4 |   117/350 | idle | 1.9
     1800 | builder 5, harvester 3, upgrader 1       |     8 |   0.1 |   167/350 | idle | 2.2
     1900 | builder 5, harvester 3, upgrader 1       |     8 |     0 |   167/350 | idle | 2.1
     2000 | builder 5, harvester 3, upgrader 1       |   7.4 |     0 |   236/350 | idle | 1.9
     2100 | builder 3, harvester 3, upgrader 1       |   8.5 |     0 |   186/350 | idle | 2.1
     2200 | builder 3, harvester 3, upgrader 2       |   7.7 |     0 |   273/350 | idle | 1.8
     2300 | builder 3, harvester 3, upgrader 2       |   7.8 |     0 |   271/350 | idle | 2
     2400 | builder 4, harvester 3, upgrader 2       |   7.2 |   0.5 |   291/350 | idle | 1.9
     2500 | builder 4, harvester 3, hauler 1, upgrader 2 |     8 |   0.4 |   194/350 | idle | 2.3
     2600 | builder 4, harvester 3, hauler 1, miner 1, upgrader 2 |   5.2 |   0.1 |   317/350 | idle | 2
     2700 | builder 4, harvester 3, hauler 1, miner 1, upgrader 2 |   4.4 |   0.2 |   300/350 | idle | 2.2
     2800 | builder 5, harvester 3, hauler 1, miner 1, upgrader 2 |     5 |   0.3 |    77/350 | idle | 2.1
     2900 | builder 5, harvester 2, hauler 1, miner 1, upgrader 2 |   3.8 |   0.5 |   127/350 | idle | 2
     3000 | builder 5, harvester 2, hauler 1, miner 1, upgrader 2 |   4.5 |     0 |   127/350 | idle | 1.9
     3001 | builder 5, harvester 2, hauler 1, miner 1, upgrader 2 |     4 |     0 |   128/350 | idle | 2.4

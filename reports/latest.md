# Scorecard: acceptance-m4 · 2026-11-09 17:24 · 6001 ticks · commit 3642fd2

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-09 14:12, d3ed9e6) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 12.1 | 13.05 | -0.95 |
| Energy wasted at source regeneration (sum) | 7,710 | 7,482 | +228 |
| Controller progress / tick | 0.2 | 0.2 | 0 |
| Construction progress / tick | 5.42 | 5.21 | +0.21 |
| Energy delivered to spawn and extensions / tick | 2.26 | 1.71 | +0.55 |
| Spawn idle while energy is full | 59 % | 70 % | -11 pts |
| Spawn busy | 9 % | 6 % | +3 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 31 % | 34 % | -3 pts |
| CPU / tick (average, max) | 2.46, 28.65 | 2.31, 28.41 | +0.15 |
| RCL / progress at end (whole run) | 5 / 550 | 5 / 550 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 57,384 | 58,336 | -952 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 13 (13) | 11 (11) | +2 |

Creeps at end by role: builder 3, defender 1, harvester 5, hauler 1, miner 1, upgrader 2.
Structures at end: container 1, extension 3, rampart 2, spawn 1, tower 2. Construction sites: 87 (container 1, extension 27, rampart 1, road 58). Build energy in the window by target: completed 54, container 4986, extension 375.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 106 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.6
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1300 | builder 3, harvester 5, upgrader 2       |  10.5 |     0 |   300/300 | idle | 2.6
     1400 | builder 3, harvester 5, upgrader 2       |     5 |     0 |   300/300 | idle | 2.1
     1500 | builder 3, harvester 5, upgrader 2       |  10.1 |     0 |   300/300 | idle | 2.2
     1600 | builder 3, harvester 5, upgrader 2       |   9.9 |     0 |     6/300 | busy | 2.4
     1700 | builder 3, harvester 5, upgrader 2       |   8.5 |     0 |   235/300 | idle | 2.3
     1800 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     1900 | builder 3, harvester 5, upgrader 2       |   8.8 |     0 |     5/300 | busy | 2.4
     2000 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   169/300 | idle | 2.2
     2100 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |   283/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   300/300 | idle | 2.5
     2300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     2400 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     2500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     2600 | builder 3, harvester 5, upgrader 2       |   5.6 |     0 |   300/300 | idle | 2
     2700 | builder 3, harvester 5, upgrader 2       |     6 |     0 |   300/300 | idle | 1.9
     2800 | builder 3, harvester 5, upgrader 2       |  11.2 |     1 |   300/300 | idle | 2.1
     2900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     3100 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   300/300 | idle | 2.3
     3200 | builder 3, harvester 5, upgrader 2       |   9.2 |     0 |   124/300 | idle | 2.4
     3300 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     3400 | builder 3, harvester 5, upgrader 2       |   7.6 |     0 |   350/350 | idle | 2.3
     3500 | builder 3, harvester 5, upgrader 2       |   8.9 |   0.5 |   108/350 | busy | 2.3
     3600 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   118/350 | idle | 2.1
     3700 | builder 3, harvester 5, upgrader 2       |   9.1 |     0 |   350/350 | idle | 2.2
     3800 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.3
     3900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     4100 | builder 3, harvester 5, upgrader 2       |  10.9 |     0 |   350/400 | idle | 2.5
     4200 | builder 3, harvester 5, upgrader 2       |  10.4 |     0 |   400/400 | idle | 2.4
     4300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.5
     4400 | builder 3, harvester 5, upgrader 2       |  11.1 |   0.5 |   400/400 | idle | 2.7
     4500 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.4
     4600 | builder 3, harvester 5, upgrader 2       |   8.3 |     0 |   311/400 | idle | 2.3
     4700 | builder 3, harvester 4, upgrader 2       |   5.1 |     1 |   359/400 | idle | 2
     4800 | builder 3, harvester 5, upgrader 1       |   6.7 |   0.2 |    76/400 | idle | 2
     4900 | builder 3, harvester 5, upgrader 1       |   7.5 |   0.3 |   388/400 | idle | 1.8
     5000 | builder 3, harvester 5, upgrader 1       |   7.7 |     0 |   129/400 | idle | 1.9
     5100 | builder 3, harvester 5, upgrader 1       |    10 |     0 |    86/400 | busy | 2.1
     5200 | builder 3, harvester 5, upgrader 2       |   7.5 |     0 |   256/400 | idle | 2.1
     5300 | builder 3, harvester 5, upgrader 2       |  11.2 |     1 |   400/450 | idle | 2.5
     5400 | builder 3, harvester 5, upgrader 2       |  13.5 |     0 |   450/450 | idle | 2.4
     5500 | builder 3, defender 1, harvester 5, upgrader 2 |   7.8 |   0.5 |   450/450 | idle | 2.4
     5600 | builder 3, defender 1, harvester 5, upgrader 2 |    14 |   0.5 |   450/450 | idle | 2.6
     5700 | builder 3, defender 1, harvester 5, upgrader 2 |  16.2 |     0 |   450/450 | idle | 2.7
     5800 | builder 3, defender 1, harvester 5, upgrader 2 |  16.2 |     0 |   450/450 | idle | 2.6
     5900 | builder 3, defender 1, harvester 5, miner 1, upgrader 2 |  15.9 |     0 |   165/450 | busy | 2.7
     6000 | builder 3, defender 1, harvester 5, hauler 1, miner 1, upgrader 2 |   8.7 |     0 |   450/450 | idle | 2.6
     6001 | builder 3, defender 1, harvester 5, hauler 1, miner 1, upgrader 2 |    12 |     0 |   450/450 | idle | 2.5

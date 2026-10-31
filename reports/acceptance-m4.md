# Scorecard: acceptance-m4 · 2026-10-31 17:01 · 6001 ticks · commit 26aaced

| Metric (last 1000 ticks unless noted) | This run | Previous run | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 12.8 | - |  |
| Energy wasted at source regeneration (sum) | 6,084 | - |  |
| Controller progress / tick | 0 | - |  |
| Construction progress / tick | 4.44 | - |  |
| Energy delivered to spawn and extensions / tick | 1.11 | - |  |
| Spawn idle while energy is full | 82 % | - |  |
| Spawn busy | 4 % | - |  |
| Creep ticks idle (no action, no move for 5+ ticks) | 39 % | - |  |
| CPU / tick (average, max) | 2.07, 27.78 | - |  |
| RCL / progress at end (whole run) | 5 / 0 | - |  |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | - |  |
| Energy harvested (whole run) | 59,338 | - |  |
| Build energy spent on roads (share of all build energy) | 0 % | - |  |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | - |  |
| Roads reach (end): sources, controller | 2 of 2, yes | - |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | - |  |
| Construction sites on wall terrain (end) | 0 | - |  |
| Extension sites next to a source or the controller (end) | 0 | - |  |
| Creeps at end (peak) | 10 (10) | - |  |

Creeps at end by role: builder 3, defender 1, harvester 5, upgrader 1.
Structures at end: extension 5, rampart 3, spawn 1, tower 2. Construction sites: 85 (container 1, extension 25, road 59). Build energy in the window by target: completed 39, extension 4403.
Room energy capacity 550; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 99 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2.1
      600 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   300/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
      800 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
      900 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.5
     1200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.4
     1300 | builder 3, harvester 5, upgrader 1       |    11 |     0 |   300/300 | idle | 2.5
     1400 | builder 3, harvester 5, upgrader 1       |   5.4 |     0 |   300/300 | idle | 1.8
     1500 | builder 3, harvester 5, upgrader 1       |   8.1 |     0 |   300/300 | idle | 1.8
     1600 | builder 3, harvester 5, upgrader 1       |  10.6 |     0 |    56/300 | busy | 2.2
     1700 | builder 3, harvester 5, upgrader 1       |   7.8 |     0 |   185/300 | idle | 2.1
     1800 | builder 3, harvester 5, upgrader 1       |   7.9 |     0 |   300/300 | idle | 2
     1900 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |    55/300 | busy | 2.1
     2000 | builder 3, harvester 5, upgrader 1       |   8.9 |     0 |   119/300 | idle | 2
     2100 | builder 3, harvester 5, upgrader 1       |   9.6 |     0 |   300/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     2300 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     2400 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     2600 | builder 3, harvester 5, upgrader 1       |   6.2 |     0 |   300/300 | idle | 1.9
     2700 | builder 3, harvester 5, upgrader 1       |   8.2 |     0 |   300/300 | idle | 2
     2800 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   300/300 | idle | 2.4
     3000 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   300/300 | idle | 2.3
     3100 | builder 3, harvester 5, upgrader 1       |   9.2 |     0 |   300/350 | idle | 2
     3200 | builder 3, harvester 5, upgrader 1       |   8.1 |     0 |   124/350 | idle | 2.2
     3300 | builder 3, harvester 5, upgrader 1       |   7.4 |     0 |   350/350 | idle | 1.8
     3400 | builder 3, harvester 5, upgrader 1       |    10 |     0 |   350/350 | idle | 2
     3500 | builder 3, harvester 5, upgrader 1       |   9.4 |     0 |   108/350 | busy | 2.1
     3600 | builder 3, harvester 5, upgrader 1       |   9.8 |     0 |   350/350 | idle | 2.1
     3700 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   350/350 | idle | 2.2
     3800 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   350/350 | idle | 2.3
     3900 | builder 3, harvester 5, upgrader 1       |  10.7 |     0 |   400/400 | idle | 2.2
     4000 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.1
     4100 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.2
     4200 | builder 3, harvester 5, upgrader 1       |  11.1 |     0 |   400/400 | idle | 2.3
     4300 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   450/450 | idle | 2.4
     4400 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   450/450 | idle | 2.4
     4500 | builder 3, harvester 5, upgrader 1       |  11.2 |     0 |   450/450 | idle | 2.3
     4600 | builder 3, harvester 5, upgrader 1       |   8.8 |     0 |   400/450 | idle | 2.1
     4700 | builder 3, harvester 5, upgrader 1       |   6.1 |     0 |   113/450 | busy | 1.7
     4800 | builder 3, harvester 5, upgrader 1       |   8.3 |     0 |   369/450 | idle | 1.7
     4900 | builder 3, harvester 5, upgrader 1       |     7 |     0 |   450/450 | idle | 1.7
     5000 | builder 3, harvester 5, upgrader 1       |    10 |     0 |   290/450 | idle | 1.9
     5100 | builder 3, harvester 5, upgrader 1       |   9.4 |     0 |   450/450 | idle | 2
     5200 | builder 3, harvester 5, upgrader 1       |  11.8 |     0 |   500/500 | idle | 2.3
     5300 | builder 3, harvester 5, upgrader 1       |  15.7 |     0 |   500/500 | idle | 2.2
     5400 | builder 3, harvester 5, upgrader 1       |  16.2 |     0 |   500/500 | idle | 2.2
     5500 | builder 3, defender 1, harvester 5, upgrader 1 |  11.5 |     0 |   500/500 | idle | 2.1
     5600 | builder 3, defender 1, harvester 5, upgrader 1 |  16.2 |     0 |   500/500 | idle | 2.1
     5700 | builder 3, defender 1, harvester 5, upgrader 1 |  16.1 |     0 |   500/500 | idle | 2.1
     5800 | builder 3, defender 1, harvester 5, upgrader 1 |   9.4 |     0 |   550/550 | idle | 1.8
     5900 | builder 3, defender 1, harvester 5, upgrader 1 |  10.8 |     0 |   550/550 | idle | 1.9
     6000 | builder 3, defender 1, harvester 5, upgrader 1 |  10.8 |     0 |   550/550 | idle | 1.9
     6001 | builder 3, defender 1, harvester 5, upgrader 1 |    12 |     0 |   550/550 | idle | 2.5

# Scorecard: acceptance-m4 · 2026-11-01 13:53 · 6001 ticks · commit 9f0abcf

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-01 05:56, 32706ac) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 12.66 | 11 | +1.66 |
| Energy wasted at source regeneration (sum) | 6,968 | 8,268 | -1,300 |
| Controller progress / tick | 0.2 | 0 | +0.2 |
| Construction progress / tick | 5.26 | 5.11 | +0.15 |
| Energy delivered to spawn and extensions / tick | 1.31 | 1.31 | 0 |
| Spawn idle while energy is full | 68 % | 70 % | -2 pts |
| Spawn busy | 5 % | 5 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 38 % | 35 % | +2 pts |
| CPU / tick (average, max) | 2.18, 27.97 | 2.17, 28.17 | +0.01 |
| RCL / progress at end (whole run) | 5 / 444 | 5 / 0 | +444 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 58,342 | 57,456 | +886 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 11 (11) | 11 (11) | 0 |

Creeps at end by role: builder 3, defender 1, harvester 5, upgrader 2.
Structures at end: extension 5, rampart 3, spawn 1, tower 2. Construction sites: 85 (container 1, extension 25, road 59). Build energy in the window by target: completed 31, extension 5231.
Room energy capacity 550; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 103 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
     1300 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
     1400 | builder 3, harvester 5, upgrader 2       |     5 |     0 |   300/300 | idle | 2
     1500 | builder 3, harvester 5, upgrader 2       |     6 |     0 |   300/300 | idle | 1.9
     1600 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |    56/300 | busy | 2.3
     1700 | builder 3, harvester 5, upgrader 2       |   8.1 |     0 |   235/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     1900 | builder 3, harvester 5, upgrader 2       |   8.6 |     0 |    55/300 | busy | 2.3
     2000 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   119/300 | idle | 2.3
     2100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   233/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   300/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     2500 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
     2600 | builder 3, harvester 5, upgrader 2       |   9.2 |     0 |   300/300 | idle | 2.3
     2700 | builder 3, harvester 5, upgrader 2       |   5.8 |     0 |   300/300 | idle | 2.1
     2800 | builder 3, harvester 5, upgrader 2       |   8.4 |   0.5 |   300/300 | idle | 2.1
     2900 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.3
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     3100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   300/300 | idle | 2.2
     3200 | builder 3, harvester 5, upgrader 2       |   8.4 |   0.5 |   224/300 | idle | 2.2
     3300 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.1
     3400 | builder 3, harvester 5, upgrader 2       |   7.2 |     0 |   350/350 | idle | 2
     3500 | builder 3, harvester 5, upgrader 2       |   8.3 |     0 |    58/350 | busy | 2
     3600 | builder 3, harvester 5, upgrader 2       |   9.4 |   0.4 |   222/350 | idle | 2.1
     3700 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   350/350 | idle | 2.2
     3800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.3
     3900 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.3
     4000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.2
     4100 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   400/400 | idle | 2.3
     4200 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.3
     4300 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.4
     4400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.5
     4500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/450 | idle | 2.5
     4600 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   445/450 | idle | 2.1
     4700 | builder 3, harvester 5, upgrader 2       |   8.2 |   0.5 |   113/450 | busy | 2.1
     4800 | builder 3, harvester 5, upgrader 2       |   7.8 |     0 |   418/450 | idle | 1.9
     4900 | builder 3, harvester 5, upgrader 2       |   8.4 |     0 |   429/450 | idle | 2
     5000 | builder 3, harvester 5, upgrader 2       |   9.8 |   0.5 |   336/450 | idle | 2.2
     5100 | builder 3, harvester 5, upgrader 1       |   9.2 |     0 |    44/450 | busy | 2
     5200 | builder 3, harvester 5, upgrader 2       |     7 |     0 |   280/450 | idle | 1.8
     5300 | builder 3, harvester 5, upgrader 2       |  12.6 |   0.4 |   450/450 | idle | 2.1
     5400 | builder 3, harvester 5, upgrader 2       |  16.2 |   0.6 |   450/450 | idle | 2.4
     5500 | builder 3, defender 1, harvester 5, upgrader 2 |  10.7 |     0 |   450/450 | idle | 2.1
     5600 | builder 3, defender 1, harvester 5, upgrader 2 |   7.5 |     0 |   500/500 | idle | 2.1
     5700 | builder 3, defender 1, harvester 5, upgrader 2 |  16.2 |   0.7 |   500/500 | idle | 2.4
     5800 | builder 3, defender 1, harvester 5, upgrader 2 |  16.2 |   0.3 |   500/500 | idle | 2.3
     5900 | builder 3, defender 1, harvester 5, upgrader 2 |  16.2 |     0 |   500/500 | idle | 2.3
     6000 | builder 3, defender 1, harvester 5, upgrader 2 |  14.9 |     0 |   500/550 | idle | 2.2
     6001 | builder 3, defender 1, harvester 5, upgrader 2 |     0 |     0 |   500/550 | idle | 1.8

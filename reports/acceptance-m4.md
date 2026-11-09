# Scorecard: acceptance-m4 · 2026-11-09 05:58 · 6001 ticks · commit 8364c5e

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-09 05:24, a87ecf7) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 9.84 | 9.84 | 0 |
| Energy wasted at source regeneration (sum) | 8,332 | 8,332 | 0 |
| Controller progress / tick | 0.15 | 0.15 | 0 |
| Construction progress / tick | 4.14 | 4.14 | 0 |
| Energy delivered to spawn and extensions / tick | 1.54 | 1.54 | 0 |
| Spawn idle while energy is full | 71 % | 71 % | 0 pts |
| Spawn busy | 6 % | 6 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 39 % | 39 % | 0 pts |
| CPU / tick (average, max) | 2.2, 28.79 | 2.17, 28.45 | +0.03 |
| RCL / progress at end (whole run) | 5 / 500 | 5 / 500 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 54,880 | 54,880 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (11) | 10 (11) | 0 |

Creeps at end by role: builder 3, defender 1, harvester 5, upgrader 1.
Structures at end: extension 4, rampart 2, spawn 1, tower 2. Construction sites: 87 (container 2, extension 26, rampart 1, road 58). Build energy in the window by target: completed 25, extension 4116.
Room energy capacity 500; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 104 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.6
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.6
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.6
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2.1
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.7
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.7
     1300 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.7
     1400 | builder 3, harvester 5, upgrader 2       |     5 |     0 |   300/300 | idle | 2.1
     1500 | builder 3, harvester 5, upgrader 2       |     6 |     0 |   300/300 | idle | 2.1
     1600 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |    56/300 | busy | 2.4
     1700 | builder 3, harvester 5, upgrader 2       |   8.1 |     0 |   235/300 | idle | 2.4
     1800 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.3
     1900 | builder 3, harvester 5, upgrader 2       |   8.6 |     0 |    55/300 | busy | 2.4
     2000 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   119/300 | idle | 2.3
     2100 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |   233/300 | idle | 2.2
     2200 | builder 3, harvester 5, upgrader 2       |  10.8 |     0 |   300/300 | idle | 2.4
     2300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     2500 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.5
     2600 | builder 3, harvester 5, upgrader 2       |   9.2 |     0 |   300/300 | idle | 2.4
     2700 | builder 3, harvester 5, upgrader 2       |   5.8 |     0 |   300/300 | idle | 2.3
     2800 | builder 3, harvester 5, upgrader 2       |   8.4 |   0.2 |   300/300 | idle | 2.2
     2900 | builder 3, harvester 5, upgrader 2       |  11.1 |   0.3 |   300/300 | idle | 2.6
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.4
     3100 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   300/300 | idle | 2.4
     3200 | builder 3, harvester 5, upgrader 2       |   8.2 |   0.5 |   174/300 | idle | 2.4
     3300 | builder 3, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.2
     3400 | builder 3, harvester 5, upgrader 2       |   8.5 |     0 |   350/350 | idle | 2.2
     3500 | builder 3, harvester 5, upgrader 2       |   8.9 |     0 |    58/350 | busy | 2.3
     3600 | builder 3, harvester 5, upgrader 2       |   8.2 |     0 |    60/350 | busy | 2.3
     3700 | builder 3, harvester 5, upgrader 2       |   9.3 |     0 |   350/350 | idle | 2.2
     3800 | builder 3, harvester 5, upgrader 2       |  11.2 |   0.5 |   350/350 | idle | 2.5
     3900 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.4
     4000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     4100 | builder 3, harvester 5, upgrader 2       |  10.4 |     0 |   400/400 | idle | 2.3
     4200 | builder 3, harvester 5, upgrader 2       |  10.2 |     0 |   400/400 | idle | 2.5
     4300 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.5
     4400 | builder 3, harvester 5, upgrader 2       |  11.2 |   0.5 |   400/400 | idle | 2.6
     4500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.6
     4600 | builder 3, harvester 5, upgrader 2       |   8.1 |     0 |   266/450 | idle | 2.3
     4700 | builder 3, harvester 4, upgrader 2       |   6.5 |   0.5 |   184/450 | idle | 2.3
     4800 | builder 3, harvester 5, upgrader 2       |   6.7 |   0.5 |    47/450 | idle | 2
     4900 | builder 3, harvester 5, upgrader 2       |   7.7 |     0 |   317/450 | idle | 2.1
     5000 | builder 3, harvester 5, upgrader 2       |   9.6 |   0.5 |   335/450 | idle | 2.2
     5100 | builder 3, harvester 5, upgrader 2       |   8.6 |   0.5 |   160/450 | busy | 2.1
     5200 | builder 3, harvester 5, upgrader 2       |  12.1 |     0 |   450/450 | idle | 2.3
     5300 | builder 3, harvester 5, upgrader 2       |  16.2 |     0 |   450/450 | idle | 2.5
     5400 | builder 3, harvester 5, upgrader 2       |  16.2 |     0 |   450/450 | idle | 2.5
     5500 | builder 3, defender 1, harvester 5, upgrader 2 |   5.5 |     0 |   450/450 | idle | 2.1
     5600 | builder 3, defender 1, harvester 5, upgrader 2 |   4.6 |     0 |   500/500 | idle | 1.9
     5700 | builder 3, defender 1, harvester 5, upgrader 2 |  10.8 |   0.5 |   500/500 | idle | 2.2
     5800 | builder 3, defender 1, harvester 5, upgrader 1 |  10.8 |   0.5 |   500/500 | idle | 2.4
     5900 | builder 3, defender 1, harvester 5, upgrader 1 |  10.8 |     0 |   500/500 | idle | 2.3
     6000 | builder 3, defender 1, harvester 5, upgrader 1 |   2.8 |     0 |   500/500 | idle | 1.8
     6001 | builder 3, defender 1, harvester 5, upgrader 1 |     6 |     0 |   500/500 | idle | 3.2

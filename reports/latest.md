# Scorecard: acceptance-m4 · 2026-11-10 11:56 · 6001 ticks · commit cf6c66a

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-09 19:49, f344668) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 6.62 | 12.1 | -5.48 |
| Energy wasted at source regeneration (sum) | 9,122 | 7,710 | +1,412 |
| Controller progress / tick | 0.2 | 0.2 | 0 |
| Construction progress / tick | 2.92 | 5.42 | -2.5 |
| Energy delivered to spawn and extensions / tick | 2.74 | 2.26 | +0.48 |
| Spawn idle while energy is full | 1 % | 59 % | -58 pts |
| Spawn busy | 9 % | 9 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 42 % | 31 % | +11 pts |
| CPU / tick (average, max) | 2.19, 28.58 | 2.39, 28.79 | -0.2 |
| RCL / progress at end (whole run) | 5 / 600 | 5 / 550 | +50 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 51,690 | 57,384 | -5,694 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 13 (13) | 13 (13) | 0 |

Creeps at end by role: builder 5, defender 1, harvester 5, upgrader 2.
Structures at end: extension 3, rampart 3, spawn 1, tower 2. Construction sites: 87 (container 2, extension 27, road 58). Build energy in the window by target: completed 32, container 2864, extension 20.
Room energy capacity 450; source capacity 3000 and 3000; Memory 3 KB; bucket 10000.
Bot console: 112 lines, 0 with errors (reports/acceptance-m4-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2
      600 | builder 4, harvester 5, upgrader 2       |   9.5 |     0 |     1/300 | busy | 2.1
      700 | builder 5, harvester 5, upgrader 2       |   9.4 |     0 |   300/300 | idle | 2.3
      800 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
      900 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1000 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1100 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
     1300 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     1400 | builder 5, harvester 5, upgrader 2       |   7.2 |     0 |   300/300 | idle | 2.3
     1500 | builder 5, harvester 5, upgrader 2       |   6.5 |     0 |   300/300 | idle | 2.2
     1600 | builder 5, harvester 5, upgrader 2       |   8.8 |     0 |    56/300 | busy | 2.3
     1700 | builder 5, harvester 5, upgrader 2       |   8.2 |     0 |   285/300 | idle | 2.5
     1800 | builder 5, harvester 5, upgrader 2       |   7.6 |     0 |   300/300 | idle | 2.4
     1900 | builder 5, harvester 5, upgrader 2       |   7.9 |     0 |     5/300 | busy | 2.4
     2000 | builder 5, harvester 5, upgrader 2       |   9.4 |     0 |   119/300 | idle | 2.4
     2100 | builder 5, harvester 5, upgrader 2       |   9.2 |     0 |   233/300 | idle | 2.3
     2200 | builder 5, harvester 5, upgrader 2       |   9.1 |     0 |   300/300 | idle | 2.3
     2300 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     2400 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.6
     2500 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
     2600 | builder 5, harvester 5, upgrader 2       |  10.4 |     0 |   300/300 | idle | 2.5
     2700 | builder 5, harvester 5, upgrader 2       |   5.6 |     0 |   300/300 | idle | 2
     2800 | builder 5, harvester 5, upgrader 2       |   7.2 |   0.5 |   300/300 | idle | 2.3
     2900 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.6
     3000 | builder 5, harvester 5, upgrader 2       |  11.2 |   0.5 |   300/300 | idle | 2.8
     3100 | builder 5, harvester 5, upgrader 2       |  10.3 |     0 |   300/300 | idle | 2.5
     3200 | builder 5, harvester 5, upgrader 2       |   9.1 |     0 |   174/300 | idle | 2.4
     3300 | builder 5, harvester 5, upgrader 2       |   7.4 |     0 |   300/300 | idle | 2.1
     3400 | builder 5, harvester 5, upgrader 2       |   7.4 |     0 |   350/350 | idle | 2.1
     3500 | builder 5, harvester 5, upgrader 2       |   9.2 |     1 |   108/350 | busy | 2.3
     3600 | builder 5, harvester 5, upgrader 2       |     9 |     0 |    64/350 | busy | 2.4
     3700 | builder 5, harvester 5, upgrader 2       |   8.8 |     0 |   217/350 | idle | 2.3
     3800 | builder 5, harvester 5, upgrader 2       |  10.4 |     0 |   350/350 | idle | 2.5
     3900 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.6
     4000 | builder 5, harvester 5, upgrader 2       |  11.2 |   0.5 |   350/350 | idle | 2.8
     4100 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.7
     4200 | builder 5, harvester 5, upgrader 2       |   9.4 |     0 |   400/400 | idle | 2.6
     4300 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.6
     4400 | builder 5, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.7
     4500 | builder 5, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.6
     4600 | builder 5, harvester 5, upgrader 2       |   9.2 |     0 |   400/400 | idle | 2.6
     4700 | builder 5, harvester 5, upgrader 2       |   7.4 |     0 |    10/400 | busy | 2.4
     4800 | builder 5, harvester 5, upgrader 2       |   8.6 |     1 |   224/400 | idle | 2.7
     4900 | builder 5, harvester 5, upgrader 2       |   7.2 |     0 |   300/400 | idle | 2.4
     5000 | builder 5, harvester 5, upgrader 2       |   7.1 |   0.5 |    64/400 | busy | 2.2
     5100 | builder 4, harvester 5, upgrader 1       |   8.3 |     0 |   325/450 | idle | 2.1
     5200 | builder 3, harvester 5, upgrader 2       |  11.9 |     0 |   400/450 | idle | 2.3
     5300 | builder 4, harvester 5, upgrader 2       |   3.7 |     0 |   118/450 | idle | 1.8
     5400 | builder 5, harvester 5, upgrader 2       |   7.1 |     1 |   243/450 | idle | 2.2
     5500 | builder 5, defender 1, harvester 5, upgrader 2 |     7 |   0.3 |   399/450 | idle | 2.3
     5600 | builder 5, defender 1, harvester 5, upgrader 2 |   4.8 |   0.2 |   449/450 | idle | 2.4
     5700 | builder 5, defender 1, harvester 5, upgrader 2 |   3.8 |     0 |   449/450 | idle | 2.1
     5800 | builder 5, defender 1, harvester 5, upgrader 2 |     6 |   0.5 |   449/450 | idle | 2.2
     5900 | builder 5, defender 1, harvester 5, upgrader 2 |   7.2 |     0 |   449/450 | idle | 2.2
     6000 | builder 5, defender 1, harvester 5, upgrader 2 |   6.5 |     0 |   181/450 | idle | 2.3
     6001 | builder 5, defender 1, harvester 5, upgrader 2 |     6 |     0 |   182/450 | idle | 2.4

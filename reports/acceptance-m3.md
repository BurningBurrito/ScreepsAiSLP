# Scorecard: acceptance-m3 · 2026-11-02 11:23 · 4001 ticks · commit 88fda14

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-02 05:54, 6003f9d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 11.12 | 11.12 | 0 |
| Energy wasted at source regeneration (sum) | 9,136 | 9,136 | 0 |
| Controller progress / tick | 0.15 | 0.15 | 0 |
| Construction progress / tick | 4.17 | 4.17 | 0 |
| Energy delivered to spawn and extensions / tick | 3.52 | 3.52 | 0 |
| Spawn idle while energy is full | 42 % | 42 % | 0 pts |
| Spawn busy | 13 % | 13 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 30 % | 30 % | 0 pts |
| CPU / tick (average, max) | 2.1, 23.61 | 2.08, 23.24 | +0.02 |
| RCL / progress at end (whole run) | 3 / 251 | 3 / 251 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 38,930 | 38,930 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 10 (10) | 0 |

Creeps at end by role: builder 3, harvester 5, upgrader 2.
Structures at end: extension 3, rampart 2, spawn 1, tower 1. Construction sites: 67 (container 1, extension 7, road 59). Build energy in the window by target: completed 22, extension 4146.
Room energy capacity 450; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 70 lines, 0 with errors (reports/acceptance-m3-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.3
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.3
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.4
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 1.9
      600 | builder 3, harvester 5, upgrader 2       |   9.5 |     0 |   300/300 | idle | 2
      700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.2
      800 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.5
      900 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.3
     1100 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.4
     1200 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   300/300 | idle | 2.2
     1300 | builder 3, harvester 5, upgrader 2       |    10 |     0 |   300/300 | idle | 2.3
     1400 | builder 3, harvester 5, upgrader 2       |   4.6 |     0 |   300/300 | idle | 1.8
     1500 | builder 3, harvester 5, upgrader 2       |   8.5 |   0.5 |   300/300 | idle | 2.1
     1600 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   106/300 | busy | 2.2
     1700 | builder 3, harvester 5, upgrader 2       |   8.8 |   0.5 |   235/300 | idle | 2.2
     1800 | builder 3, harvester 5, upgrader 2       |   7.9 |     0 |   300/300 | idle | 2
     1900 | builder 3, harvester 5, upgrader 2       |   9.9 |     0 |     5/300 | busy | 2.1
     2000 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   169/300 | idle | 2.1
     2100 | builder 3, harvester 5, upgrader 2       |   9.4 |     0 |   283/300 | idle | 2.1
     2200 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   300/300 | idle | 2.3
     2300 | builder 3, harvester 5, upgrader 2       |    11 |     0 |   350/350 | idle | 2.4
     2400 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.4
     2500 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     2600 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   350/350 | idle | 2.5
     2700 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   350/350 | idle | 2.5
     2800 | builder 3, harvester 5, upgrader 2       |    11 |     0 |   400/400 | idle | 2.4
     2900 | builder 3, harvester 5, upgrader 2       |  11.1 |     0 |   400/400 | idle | 2.6
     3000 | builder 3, harvester 5, upgrader 2       |  11.2 |     0 |   400/400 | idle | 2.5
     3100 | builder 3, harvester 5, upgrader 2       |     9 |     0 |   343/400 | idle | 2.2
     3200 | builder 3, harvester 5, upgrader 2       |     8 |     0 |   174/400 | idle | 1.8
     3300 | builder 3, harvester 5, upgrader 2       |   6.4 |     0 |   350/400 | idle | 1.8
     3400 | builder 3, harvester 5, upgrader 2       |   8.7 |     0 |   400/400 | idle | 1.7
     3500 | builder 2, harvester 5, upgrader 2       |  10.4 |     1 |   329/400 | idle | 2
     3600 | builder 3, harvester 5, upgrader 2       |   9.7 |     0 |   101/400 | busy | 2.1
     3700 | builder 3, harvester 5, upgrader 2       |  14.3 |     0 |   400/450 | idle | 2.3
     3800 | builder 3, harvester 5, upgrader 2       |  12.8 |     0 |   450/450 | idle | 2.2
     3900 | builder 3, harvester 5, upgrader 2       |  16.2 |   0.5 |   450/450 | idle | 2.5
     4000 | builder 3, harvester 5, upgrader 2       |  15.7 |     0 |   450/450 | idle | 2.4
     4001 | builder 3, harvester 5, upgrader 2       |    18 |     0 |   450/450 | idle | 1.9

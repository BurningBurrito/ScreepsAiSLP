# Scorecard: acceptance-m2 · 2026-11-11 12:47 · 3001 ticks · commit b1b9be1

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-11 07:31, de5c985) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.85 | 5.79 | +0.06 |
| Energy wasted at source regeneration (sum) | 13,024 | 10,316 | +2,708 |
| Controller progress / tick | 0.15 | 0.2 | -0.05 |
| Construction progress / tick | 4.79 | 4.2 | +0.59 |
| Energy delivered to spawn and extensions / tick | 5.23 | 5.04 | +0.19 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 6 % | 7 % | -1 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 24 % | 24 % | 0 pts |
| CPU / tick (average, max) | 2.06, 21.07 | 2.01, 22.66 | +0.05 |
| RCL / progress at end (whole run) | 2 / 609 | 2 / 700 | -91 |
| Ticks to RCL 2 / RCL 3 (whole run) | 812 / - | 712 / - | +100 |
| Energy harvested (whole run) | 13,312 | 12,996 | +316 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 10 (10) | -1 |

Creeps at end by role: builder 4, harvester 3, upgrader 2.
Structures at end: container 1, extension 1, road 5, spawn 1. Construction sites: 58 (extension 4, road 54). Build energy in the window by target: completed 3, container 4682, extension 107.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 50 lines, 0 with errors (reports/acceptance-m2-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   275/300 | idle | 1.3
      400 | builder 2, harvester 2, upgrader 2       |   4.1 |   0.1 |    67/300 | idle | 1.4
      500 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   117/300 | idle | 1.7
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.4 |   117/300 | idle | 1.7
      700 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.6 |   117/300 | idle | 1.8
      800 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.2 |   117/300 | idle | 1.7
      900 | builder 2, harvester 2, upgrader 2       |   4.3 |   0.6 |   117/300 | idle | 1.8
     1000 | builder 2, harvester 2, upgrader 2       |   4.9 |   0.2 |   167/300 | idle | 1.8
     1100 | builder 2, harvester 2, upgrader 2       |   3.7 |   0.5 |   117/300 | idle | 1.7
     1200 | builder 2, harvester 2, upgrader 2       |   4.9 |   0.5 |   117/300 | idle | 1.9
     1300 | builder 2, harvester 2, upgrader 2       |   4.1 |   0.5 |   117/300 | idle | 1.7
     1400 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   117/300 | idle | 1.8
     1500 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.5 |   167/350 | idle | 1.7
     1600 | builder 2, upgrader 2                    |   1.2 |   0.5 |   167/350 | idle | 1.5
     1700 | builder 1, harvester 1, upgrader 2       |   0.7 |   0.5 |    17/350 | idle | 1.3
     1800 | builder 1, harvester 2, upgrader 1       |   1.9 |   0.5 |    16/350 | busy | 1.3
     1900 | harvester 2                              |   1.9 |     0 |   266/350 | idle | 1.3
     2000 | builder 1, harvester 3                   |   5.1 |     0 |   264/350 | idle | 1.4
     2100 | builder 3, harvester 3                   |   5.7 |     0 |   262/350 | idle | 1.6
     2200 | builder 3, harvester 3, upgrader 2       |   4.5 |     0 |    17/350 | idle | 1.7
     2300 | builder 4, harvester 3, upgrader 2       |   6.4 |     0 |   143/350 | idle | 2
     2400 | builder 4, harvester 3, upgrader 2       |   5.9 |   0.5 |   143/350 | idle | 2.1
     2500 | builder 4, harvester 3, upgrader 2       |   6.1 |   0.5 |   193/350 | idle | 2.2
     2600 | builder 4, harvester 3, upgrader 2       |   5.9 |     0 |   193/350 | idle | 2.1
     2700 | builder 4, harvester 3, upgrader 2       |   6.2 |     0 |   193/350 | idle | 2.2
     2800 | builder 4, harvester 3, upgrader 2       |   5.7 |   0.5 |   143/350 | idle | 2.3
     2900 | builder 4, harvester 3, upgrader 2       |   6.6 |     0 |   143/350 | idle | 2.3
     3000 | builder 4, harvester 3, upgrader 2       |   5.7 |     0 |    93/350 | idle | 2.2
     3001 | builder 4, harvester 3, upgrader 2       |     2 |     0 |   144/350 | idle | 3

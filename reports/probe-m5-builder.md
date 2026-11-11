# Scorecard: probe-m5-builder · 2026-11-11 00:59 · 700 ticks · commit d1b130c

| Metric (last 280 ticks unless noted) | This run | Previous run (2026-11-11 00:49, d1b130c) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 8.5 | 9.37 | -0.87 |
| Energy wasted at source regeneration (sum) | 3,628 | 3,480 | +148 |
| Controller progress / tick | 0 | 0 | 0 |
| Construction progress / tick | 5.22 | 0.86 | +4.36 |
| Energy delivered to spawn and extensions / tick | 6.51 | 5.56 | +0.95 |
| Spawn idle while energy is full | 1 % | 8 % | -7 pts |
| Spawn busy | 12 % | 24 % | -12 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 29 % | 25 % | +4 pts |
| CPU / tick (average, max) | 2.22, 29.37 | 2.24, 29 | -0.02 |
| RCL / progress at end (whole run) | 5 / 0 | 5 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 0 / 0 | 0 / 0 | 0 |
| Energy harvested (whole run) | 4,108 | 4,352 | -244 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 1 of 2, yes | 1 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 9 (9) | 12 (12) | -3 |

Creeps at end by role: builder 3, harvester 5, upgrader 1.
Structures at end: spawn 1. Construction sites: 93 (container 3, extension 30, rampart 1, road 58, tower 1). Build energy in the window by target: tower 1461.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 45 lines, 0 with errors (reports/probe-m5-builder-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.7
      200 | harvester 3                              |     5 |     0 |   296/300 | idle | 1.4
      300 | harvester 4                              |   2.4 |     0 |   296/300 | idle | 1.4
      400 | builder 1, harvester 5                   |   4.7 |     0 |   166/300 | idle | 1.5
      500 | builder 3, harvester 5                   |   9.4 |     0 |   230/300 | idle | 2.1
      600 | builder 3, harvester 5, upgrader 1       |   8.5 |     0 |   187/300 | idle | 2.2
      700 | builder 3, harvester 5, upgrader 1       |     8 |     0 |   137/300 | idle | 2.3

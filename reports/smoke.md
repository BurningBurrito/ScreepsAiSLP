# Scorecard: smoke · 2026-11-01 09:46 · 500 ticks · commit 4372bc9

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-11-01 05:58, 32706ac) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.86 | 3.3 | +0.56 |
| Energy wasted at source regeneration (sum) | 948 | 1,000 | -52 |
| Controller progress / tick | 0.25 | 0.1 | +0.15 |
| Construction progress / tick | 2.01 | 3.75 | -1.74 |
| Energy delivered to spawn and extensions / tick | 2.9 | 2.75 | +0.15 |
| Spawn idle while energy is full | 1 % | 0 % | +1 pts |
| Spawn busy | 7 % | 0 % | +7 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 22 % | 8 % | +14 pts |
| CPU / tick (average, max) | 1.52, 20.35 | 1.39, 22.28 | +0.13 |
| RCL / progress at end (whole run) | 1 / 50 | 1 / 50 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,824 | 1,660 | +164 |
| Build energy spent on roads (share of all build energy) | 0 % | 96 % | -96 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 3 (3) | +3 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: container 401.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 11 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.4
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5

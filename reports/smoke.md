# Scorecard: smoke · 2026-11-11 21:09 · 500 ticks · commit 7c65fe0

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-11-10 20:58, 8553897) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 4.44 | 3.86 | +0.58 |
| Energy wasted at source regeneration (sum) | 948 | 948 | 0 |
| Controller progress / tick | 0.3 | 0.25 | +0.05 |
| Construction progress / tick | 1.91 | 2.01 | -0.1 |
| Energy delivered to spawn and extensions / tick | 3.22 | 2.9 | +0.32 |
| Spawn idle while energy is full | 1 % | 1 % | 0 pts |
| Spawn busy | 11 % | 7 % | +5 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 23 % | 21 % | +2 pts |
| CPU / tick (average, max) | 1.73, 22.56 | 1.56, 20.97 | +0.17 |
| RCL / progress at end (whole run) | 1 / 59 | 1 / 50 | +9 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,940 | 1,824 | +116 |
| Build energy spent on roads (share of all build energy) | 98 % | 100 % | -2 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 6 (6) | 6 (6) | 0 |

Creeps at end by role: builder 2, harvester 2, upgrader 2.
Structures at end: road 1, spawn 1. Construction sites: 59 (container 1, road 58). Build energy in the window by target: completed 9, road 372.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 11 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.5
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.4
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   275/300 | idle | 1.5
      400 | builder 2, harvester 2, upgrader 2       |   4.1 |   0.1 |    67/300 | idle | 1.7
      500 | builder 2, harvester 2, upgrader 2       |   4.8 |   0.5 |   117/300 | idle | 1.8

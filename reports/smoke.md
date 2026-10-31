# Scorecard: smoke · 2026-10-31 23:17 · 500 ticks · commit dd0af44

| Metric (last 200 ticks unless noted) | This run | Previous run (2026-10-31 22:19, 81bdd51) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.3 | 3.94 | -0.64 |
| Energy wasted at source regeneration (sum) | 1,000 | 1,000 | 0 |
| Controller progress / tick | 0.1 | 0.35 | -0.25 |
| Construction progress / tick | 3.75 | 0.19 | +3.56 |
| Energy delivered to spawn and extensions / tick | 2.75 | 2.72 | +0.03 |
| Spawn idle while energy is full | 0 % | 2 % | -1 pts |
| Spawn busy | 0 % | 17 % | -16 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 8 % | 23 % | -15 pts |
| CPU / tick (average, max) | 1.44, 20.37 | 1.61, 20.14 | -0.17 |
| RCL / progress at end (whole run) | 1 / 50 | 1 / 100 | -50 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 1,660 | 1,788 | -128 |
| Build energy spent on roads (share of all build energy) | 96 % | 100 % | -4 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 3 (3) | 7 (7) | -4 |

Creeps at end by role: builder 1, harvester 1, upgrader 1.
Structures at end: road 3, spawn 1. Construction sites: 57 (container 1, road 56). Build energy in the window by target: completed 30, road 720.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 8 lines, 0 with errors (reports/smoke-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | builder 1, harvester 1                   |   3.2 |     0 |    67/300 | idle | 1.5
      200 | builder 1, harvester 1, upgrader 1       |   4.2 |     0 |   196/300 | idle | 1.5
      300 | builder 1, harvester 1, upgrader 1       |   2.6 |   0.3 |   146/300 | idle | 1.4
      400 | builder 1, harvester 1, upgrader 1       |   2.9 |   0.2 |   146/300 | idle | 1.4
      500 | builder 1, harvester 1, upgrader 1       |   3.7 |     0 |   146/300 | idle | 1.4

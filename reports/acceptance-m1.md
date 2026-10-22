# Scorecard: acceptance-m1 · 2026-10-22 01:38 · 801 ticks · commit 67b0cb5

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-22 01:34, 67b0cb5) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 3.66 | 3.66 | 0 |
| Energy wasted at source regeneration (sum) | 4,834 | 4,834 | 0 |
| Controller progress / tick | 0.33 | 0.33 | 0 |
| Construction progress / tick | 1.88 | 1.88 | 0 |
| Energy delivered to spawn and extensions / tick | 11.85 | 11.85 | 0 |
| Spawn idle while energy is full | 45 % | 45 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 59 % | 59 % | 0 pts |
| CPU / tick (average, max) | 2.62, 17.65 | 2.62, 17.11 | 0 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 640 / - | 640 / - | 0 |
| Energy harvested (whole run) | 2,986 | 2,986 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 58 / 0 / 0 | 58 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 0 of 2, yes | 0 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 63 (extension 5, road 58). Build energy in the window by target: extension 600.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 74 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 2                    |   3.2 |     0 |    99/300 | idle | 1.2
      200 | harvester 2, hauler 2, upgrader 1        |   3.7 |     0 |   104/300 | busy | 1.6
      300 | builder 1, harvester 2, hauler 2, upgrader 2 |   3.9 |     0 |    70/300 | idle | 1.9
      400 | builder 2, harvester 2, hauler 2, upgrader 2 |   4.3 |   0.4 |   146/300 | idle | 2
      500 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |   0.6 |   280/300 | idle | 2.3
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |   0.6 |   230/300 | idle | 2.3
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |   0.4 |   300/300 | idle | 2.8
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.6 |     0 |   277/300 | idle | 2.8
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     4 |     0 |   228/300 | idle | 2.9

# Scorecard: acceptance-m1 · 2026-10-21 22:56 · 801 ticks · commit 876cb7d

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-21 22:23, d559b09) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 0.33 | 0.33 | 0 |
| Energy wasted at source regeneration (sum) | 2,810 | 2,810 | 0 |
| Controller progress / tick | 0.63 | 0.63 | 0 |
| Construction progress / tick | 0.3 | 0.3 | 0 |
| Energy delivered to spawn and extensions / tick | 22.84 | 22.84 | 0 |
| Spawn idle while energy is full | 8 % | 8 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 42 % | 42 % | 0 pts |
| CPU / tick (average, max) | 2, 17.25 | 2.03, 17.36 | -0.03 |
| RCL / progress at end (whole run) | 2 / 0 | 2 / 0 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 779 / - | 779 / - | 0 |
| Energy harvested (whole run) | 1,256 | 1,256 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 60 / 0 / 0 | 60 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 65 (extension 5, road 60). Build energy in the window by target: extension 95.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 79 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 1, hauler 2                    |   3.2 |     0 |    99/300 | idle | 1.2
      200 | harvester 2, hauler 2, upgrader 1        |   3.7 |     0 |   104/300 | busy | 1.5
      300 | builder 1, harvester 2, hauler 2, upgrader 2 |   3.5 |     0 |    70/300 | idle | 1.8
      400 | builder 1, harvester 2, hauler 2, upgrader 2 |   0.7 |     0 |   170/300 | idle | 1.8
      500 | builder 2, harvester 2, hauler 2, upgrader 2 |   0.3 |     0 |    94/300 | idle | 1.8
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   0.5 |   0.5 |   194/300 | idle | 1.7
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   0.4 |   0.7 |   145/300 | idle | 1.9
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   0.2 |   0.8 |   259/300 | idle | 2.4
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     0 |     0 |   260/300 | idle | 2.9

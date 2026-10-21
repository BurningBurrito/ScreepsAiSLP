# Scorecard: acceptance-m1 · 2026-10-21 20:55 · 801 ticks · commit 1125a4e

| Metric (last 320 ticks unless noted) | This run | Previous run (2026-10-21 20:11, c9407b9) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 1.92 | 1.92 | 0 |
| Energy wasted at source regeneration (sum) | 2,354 | 2,354 | 0 |
| Controller progress / tick | 0.98 | 0.98 | 0 |
| Construction progress / tick | 2.14 | 2.14 | 0 |
| Energy delivered to spawn and extensions / tick | 4.68 | 4.68 | 0 |
| Spawn idle while energy is full | 53 % | 53 % | 0 pts |
| Spawn busy | 0 % | 0 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 40 % | 40 % | 0 pts |
| CPU / tick (average, max) | 2.31, 17.28 | 2.31, 17.35 | 0 |
| RCL / progress at end (whole run) | 2 / 113 | 2 / 113 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 633 / - | 633 / - | 0 |
| Energy harvested (whole run) | 2,146 | 2,146 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 60 / 0 / 0 | 60 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 8 (8) | 8 (8) | 0 |

Creeps at end by role: builder 2, harvester 2, hauler 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 65 (extension 5, road 60). Build energy in the window by target: extension 686.
Room energy capacity 300; source capacity 3000 and 3000; Memory 1 KB; bucket 10000.
Bot console: 80 lines, 0 with errors (reports/acceptance-m1-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2, upgrader 1                  |   3.9 |     0 |    49/300 | busy | 1.2
      200 | builder 1, harvester 2, hauler 2, upgrader 2 |   5.7 |     0 |   299/300 | idle | 1.7
      300 | builder 1, harvester 2, hauler 2, upgrader 2 |   1.4 |     0 |   300/300 | idle | 2.2
      400 | builder 1, harvester 2, hauler 2, upgrader 2 |   1.3 |     0 |   249/300 | idle | 1.5
      500 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.7 |   0.1 |   237/300 | idle | 2
      600 | builder 2, harvester 2, hauler 2, upgrader 2 |   1.2 |   1.5 |   300/300 | idle | 1.8
      700 | builder 2, harvester 2, hauler 2, upgrader 2 |   0.8 |   0.8 |   124/300 | idle | 2.5
      800 | builder 2, harvester 2, hauler 2, upgrader 2 |   3.4 |   0.8 |   174/300 | idle | 2.6
      801 | builder 2, harvester 2, hauler 2, upgrader 2 |     4 |     1 |   175/300 | idle | 2.7

# Scorecard: spawnprobe · 2026-11-02 22:22 · 700 ticks · commit e1ec27d

| Metric (last 280 ticks unless noted) | This run | Previous run (2026-11-01 15:22, 9df73af) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.43 | 5.43 | 0 |
| Energy wasted at source regeneration (sum) | 1,796 | 1,796 | 0 |
| Controller progress / tick | 0.36 | 0.36 | 0 |
| Construction progress / tick | 0.56 | 0.56 | 0 |
| Energy delivered to spawn and extensions / tick | 2.64 | 2.64 | 0 |
| Spawn idle while energy is full | 23 % | 23 % | 0 pts |
| Spawn busy | 12 % | 12 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 21 % | 21 % | 0 pts |
| CPU / tick (average, max) | 1.63, 20.31 | 1.62, 21.79 | +0.01 |
| RCL / progress at end (whole run) | 1 / 150 | 1 / 150 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | - / - | - / - |  |
| Energy harvested (whole run) | 2,900 | 2,900 | 0 |
| Build energy spent on roads (share of all build energy) | 100 % | 100 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 7 (7) | 7 (7) | 0 |

Creeps at end by role: builder 3, harvester 2, upgrader 2.
Structures at end: spawn 1. Construction sites: 60 (container 1, road 59). Build energy in the window by target: road 156.
Room energy capacity 300; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 746 lines, 0 with errors (reports/spawnprobe-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 1       |   2.5 |   0.5 |   175/300 | idle | 1.4
      500 | builder 2, harvester 2, upgrader 2       |   5.2 |     0 |     2/300 | busy | 1.5
      600 | builder 3, harvester 2, upgrader 2       |   4.2 |   0.9 |   131/300 | idle | 1.6
      700 | builder 3, harvester 2, upgrader 2       |   6.6 |   0.1 |   300/300 | idle | 1.8

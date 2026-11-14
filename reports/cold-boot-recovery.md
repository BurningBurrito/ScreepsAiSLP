# Scorecard: cold-boot-recovery · 2026-11-14 10:29 · 2501 ticks · commit e53adee

| Metric (last 1000 ticks unless noted) | This run | Previous run (2026-11-14 09:03, dd0837d) | Change |
| --- | --- | --- | --- |
| Energy harvested / tick | 5.1 | 5.1 | 0 |
| Energy wasted at source regeneration (sum) | 14,298 | 14,298 | 0 |
| Controller progress / tick | 0.1 | 0.1 | 0 |
| Construction progress / tick | 2.61 | 2.61 | 0 |
| Energy delivered to spawn and extensions / tick | 4.51 | 4.51 | 0 |
| Spawn idle while energy is full | 0 % | 0 % | 0 pts |
| Spawn busy | 11 % | 11 % | 0 pts |
| Creep ticks idle (no action, no move for 5+ ticks) | 23 % | 23 % | 0 pts |
| CPU / tick (average, max) | 1.79, 21.21 | 1.84, 20.97 | -0.05 |
| RCL / progress at end (whole run) | 2 / 210 | 2 / 210 | 0 |
| Ticks to RCL 2 / RCL 3 (whole run) | 720 / - | 720 / - | 0 |
| Energy harvested (whole run) | 13,782 | 13,782 | 0 |
| Build energy spent on roads (share of all build energy) | 0 % | 0 % | 0 pts |
| Road tiles: total / on wall / disconnected from the spawn network (end) | 59 / 0 / 0 | 59 / 0 / 0 | 0 |
| Roads reach (end): sources, controller | 2 of 2, yes | 2 of 2, yes |  |
| Extensions and towers farther than 8 tiles from the spawn (end) | 0 | 0 | 0 |
| Construction sites on wall terrain (end) | 0 | 0 | 0 |
| Extension sites next to a source or the controller (end) | 0 | 0 | 0 |
| Creeps at end (peak) | 10 (10) | 10 (10) | 0 |

Creeps at end by role: builder 4, harvester 3, hauler 1, upgrader 2.
Structures at end: container 1, extension 1, road 4, spawn 1. Construction sites: 59 (extension 4, road 55). Build energy in the window by target: completed 12, container 2586, extension 8.
Room energy capacity 350; source capacity 3000 and 3000; Memory 2 KB; bucket 10000.
Bot console: 47 lines, 0 with errors (reports/cold-boot-recovery-console.log). Probe results missing for 0 ticks.

Timeline, every 100 ticks: tick | creeps by role | harvested/tick | upgraded/tick | energy/capacity | spawn | cpu

      100 | harvester 2                              |   3.2 |     0 |    67/300 | idle | 1.4
      200 | builder 1, harvester 2                   |   3.7 |     0 |   196/300 | idle | 1.3
      300 | builder 1, harvester 2, upgrader 1       |   3.6 |     0 |   225/300 | idle | 1.3
      400 | builder 1, harvester 2, upgrader 2       |   3.7 |   0.5 |   263/300 | idle | 1.5
      500 | builder 2, harvester 2, upgrader 2       |   4.7 |   0.5 |   142/300 | idle | 1.8
      600 | builder 2, harvester 2, upgrader 2       |   4.2 |   0.1 |   142/300 | idle | 1.8
      700 | builder 2, harvester 2, upgrader 2       |   4.6 |   0.5 |   142/300 | idle | 1.8
      800 | builder 2, harvester 3, upgrader 2       |   4.9 |   0.4 |   241/300 | idle | 1.7
      900 | builder 3, harvester 3, upgrader 2       |   7.9 |   0.5 |   191/300 | idle | 2.1
     1000 | builder 3, harvester 3, upgrader 2       |   7.4 |     0 |   191/300 | idle | 2.2
     1100 | builder 3, harvester 3, upgrader 2       |     8 |     0 |   141/300 | idle | 2.3
     1200 | builder 3, harvester 3, upgrader 2       |   7.4 |     0 |   141/350 | idle | 2.2
     1300 | builder 3, harvester 3, upgrader 2       |     8 |     0 |   141/350 | idle | 2.4
     1400 | builder 3, harvester 3, upgrader 2       |   7.4 |   0.5 |   141/350 | idle | 2.5
     1500 | builder 3, harvester 3, upgrader 2       |   7.9 |   0.1 |   191/350 | idle | 2.4
     1600 | harvester 1                              |   1.9 |     0 |   291/350 | idle | 1.1
     1700 | harvester 2                              |   1.9 |     0 |   291/350 | idle | 1.2
     1800 | builder 1, harvester 3                   |   4.7 |     0 |   240/350 | idle | 1.4
     1900 | builder 3, harvester 3                   |   6.2 |     0 |   240/350 | idle | 1.6
     2000 | builder 3, harvester 3, upgrader 2       |   5.1 |     0 |    66/350 | idle | 1.7
     2100 | builder 4, harvester 3, upgrader 2       |   6.6 |     0 |   162/350 | idle | 2
     2200 | builder 4, harvester 3, upgrader 2       |   6.2 |     0 |   162/350 | idle | 2.2
     2300 | builder 4, harvester 3, upgrader 2       |   6.1 |     0 |   262/350 | idle | 2.2
     2400 | builder 4, harvester 3, upgrader 2       |   5.7 |     1 |   212/350 | idle | 2.3
     2500 | builder 4, harvester 3, hauler 1, upgrader 2 |   6.5 |     0 |   308/350 | idle | 2.3
     2501 | builder 4, harvester 3, hauler 1, upgrader 2 |    10 |     0 |   308/350 | idle | 2.8

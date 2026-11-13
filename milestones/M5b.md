# M5b – Static mining

Owner-owned spec. The launcher restores this file before and after every run; do not edit it.
Acceptance test: test/integration/acceptance-m5b.test.ts (5000 ticks, about 22 minutes).
Second step of M5 (milestones/M5.md has the design notes).

## Goal
Every source has a container with a miner on it, early enough, and the colony harvests well.

## Acceptance criteria (same world as M5: level 5 at the start, 5000 ticks)
1. Every source has a container next to it (built or placed); at least one is finished and has
   held energy.
2. From tick 3000 on, a creep with WORK parts stands on a source container in at least 60 % of
   the samples (every 50 ticks).
3. Over the last 1000 ticks: at least 13 energy harvested per tick.
4. At least 3 creeps at the end. M1 to M4, M5a and your own tests must still pass.

## Hint
The first source container must be finished before about tick 2800. Measure when it is finished
before changing the build order; M4 must keep passing.

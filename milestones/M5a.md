# M5a – The controller gets upgraded

Owner-owned spec. The launcher restores this file before and after every run; do not edit it.
Acceptance test: test/integration/acceptance-m5a.test.ts (5000 ticks, about 22 minutes).
M5 (milestones/M5.md) is split into three steps with one target each: M5a upgrading, M5b static
mining, M5c spending the rest. The design notes in M5.md still apply.

## Goal
The upgraders keep upgrading the controller with energy from the containers.

## Acceptance criteria (same world as M5: level 5 at the start, 5000 ticks)
1. Over the last 1000 ticks: at least 1 controller progress per tick.
2. At least 3 creeps at the end. M1 to M4 and your own tests must still pass.

## What the owner already found (v9.4)
- `runUpgrader` calls getEnergy whenever the store is not full, BEFORE the working latch, so the
  upgrader leaves after every single upgrade to top up. Latch first: working + energy > 0 ->
  upgrade; energy 0 -> fetch until full.
- Builders take from the spawn before the source containers; containers first.

## Scorecard fields to watch
- Controller progress / tick

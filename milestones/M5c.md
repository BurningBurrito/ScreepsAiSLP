# M5c – The energy is spent, not piled up

Owner-owned spec. The launcher restores this file before and after every run; do not edit it.
Acceptance test: test/integration/acceptance-m5c.test.ts (5000 ticks, about 22 minutes).
Third step of M5 (milestones/M5.md has the design notes).

## Goal
Spare energy always has somewhere to go: upgrading, building, spawning.

## Acceptance criteria (same world as M5: level 5 at the start, 5000 ticks)
1. Over the last 1000 ticks: the spawn sits idle with full room energy at most 30 % of the time.
2. From tick 3000 on, on average at most 300 energy lies on the ground.
3. At least 3 creeps at the end. M1 to M4, M5a, M5b and your own tests must still pass.

## Ideas (from M5.md)
- When the spawn, extensions and towers are full and the source containers hold more than half
  their capacity, spawn another upgrader or a bigger one.
- Haulers and anyone with free capacity pick up dropped energy near the sources.
- A container next to the controller that haulers fill.

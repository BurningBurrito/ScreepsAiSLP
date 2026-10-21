# Scorecard harness: notes for the owner

Draft for review. Nothing here was committed to the repository. The files are meant for the
protected, owner-owned part of the project (the launcher restores them after every run), so
the agent never edits them and only reads what they produce.

## Files and where they go

| File | Goes to | What it is |
| --- | --- | --- |
| test/integration/scorecard.ts | repo, protected copy | The recorder: probe expression, per-tick collection, summary, report writer |
| test/integration/helper.ts | repo, replaces the current helper.ts, protected copy | Same as today plus: creates a Scorecard per test, names it after the test file, finishes it in afterEach |
| test/integration/smoke.test.ts | repo, protected copy | 500-tick run with a scorecard and five sanity assertions |
| test/integration/criteria.ts | repo, protected copy | Pure checks reused by acceptance tests: container adjacency, miner-stays-put, spawn idle streak, source-file scan, income ceiling |
| test/candidates/acceptance-m4.candidate.test.ts | candidate only, outside the mocha globs: compare with your existing M4 test and merge what you like; never run both | Static mining gate: the nine criteria of the candidate M4 spec plus the two anti-patterns, all evaluated before it fails |
| agent-test | launcher side (e.g. /usr/local/bin/agent-test), root-owned, executable | Reference runner; merge the three MERGE blocks into yours if you keep your own |

Also needed:

1. Add `test/integration/scorecard.ts`, `test/integration/criteria.ts` and `test/integration/smoke.test.ts`
   (and whichever acceptance tests you keep) to the launcher's list of protected files and to
   rule 01 ("Never edit the test harness: ...") and rule 06.
2. `.gitignore`: add `reports/*.json`, `reports/*-console.log`, `reports/*-creeps.txt`. Keep
   `reports/*.md` and `reports/history.csv` tracked so the numbers travel with the commits.
   (Your call; ignoring all of `reports/` also works, history.csv then lives only on the server.)
3. Rule 07 (run procedure) already refers to `reports/latest.md`, the smoke test and the
   `[scorecard]` progress line, so no change there.
4. The gate's own test run also writes reports. Either let it (the next agent run commits them as
   leftovers) or run the gate with `SCORECARD_DIR=/tmp/gate-reports` so the repo stays clean.

## How it works, in one paragraph

Every `helper.server.tick()` first queues one console expression for the bot (the same channel
acceptance-m1 uses), then runs the tick. Inside the bot's sandbox the expression reads
`room.getEventLog()` (harvest, upgrade, build, repair and transfer amounts of the previous tick,
plus which creeps acted), the sources (energy left one tick before regeneration counts as
wasted), every creep's position and store, the spawn state and energy, the controller, and every
100 ticks the construction sites (how many stand on wall terrain, how many extension sites
touch a source or the controller), structures, source capacities, bucket and Memory size. It
returns JSON; the player's `console` event delivers it to the recorder. Nothing is written to
the bot's Memory. Results arrive asynchronously, so a test that asserts on the final ticks calls
`await helper.scorecard.settle()` before `compute()`. At the end of each test the recorder writes `reports/<name>.md` (and
`latest.md`), the JSON timeline, a per-creep table every 50 ticks, the bot's console output, and
one line in `history.csv`, and prints the scorecard so the agent-test log contains it.

## Verifying on the server

```bash
npm run build && npx mocha test/integration/smoke.test.ts --timeout 1200000
```

Expected: a `[scorecard] tick 100 ...` line every 100 ticks, then the scorecard table, then
`1 passing`. Check `reports/smoke.md`, `reports/smoke-creeps.txt`, `reports/smoke-console.log`
and `reports/history.csv`. Run it twice: the second scorecard shows the first in the
"Previous run" column.

Then run the existing acceptance tests unchanged; each now writes `reports/acceptance-m1.md`
and `reports/acceptance-m2.md` as a side effect.

## What was and was not tested here

- Type-checked with the repo's TypeScript settings and the same @types versions.
- The probe expression was executed in a Node vm against a stubbed Game, and the recorder was
  driven for 300 ticks by a fake server and player, including a second run for the comparison
  column. All assertions in verify-scorecard.ts pass.
- Not run against the real engine: this machine has no C++ toolchain, so isolated-vm (needed by
  the Screeps server) does not build here. The two places where the real engine could differ:
  the shape of console results (the mockup's own test shows a string result comes back
  unquoted, and the parser also accepts a quoted one), and the exact event data fields
  (`amount` is used for harvest, upgrade, build and transfer; `energySpent` exists too). If a
  column stays at 0 on the server, that field name is the first thing to check.

## What the scorecard now shows for your new M3 (Build Log Part 7)

The scorecard also reports, every run, the quantities your new M3 test checks, so the agent
sees them in the two-minute smoke run before the 4,000-tick gate:

- build energy by target type over the window, and the share that went into roads;
- road tiles: total, on wall terrain, and disconnected from the network reachable from the
  tiles next to a spawn (8-neighbour flood fill over built roads and road sites);
- how many sources have a connected road tile next to them, and whether a connected road tile
  lies within range 3 of the controller;
- extensions and towers, built or sites, farther than 8 tiles from every spawn.

Two definitions to align with your test if they differ: "connected" is 8-neighbour adjacency
starting from road tiles adjacent to a spawn, and "reaches the controller" means within range 3.
The build share is over the whole window, not only while tower or extension sites exist; the
per-tick JSON timeline has the build-by-type map if you want that condition exactly.

## The M4 candidate test (static mining)

acceptance-m4.test.ts runs 3,000 ticks like M2, then evaluates all criteria of the candidate M4
spec and fails once with a list such as:

    M4 criteria not met (3):
     - 2. energy harvested per tick, last 1000 ticks: 4.1, required 8 (60 % of the ceiling 13.33)
     - 4. miners stay at their source: 2 miners seen, 1 reached a source, 0 creep-ticks away from it
     - 9. creeps at the end by role: {"harvester":2,"upgrader":2,"builder":2}; at least one miner, one hauler and one upgrader are required

Income thresholds are shares of the ceiling the test measures from the sources' capacities in
the world database, so they hold on the 1000-capacity stub world and on a 3000-capacity room
alike. Three constants at the top of the file (HARVEST_SHARE, WASTE_SHARE, UPGRADE_SHARE) and
CPU_MAX are the knobs to calibrate after the first two real scorecards. Container positions and
source capacities come from the mockup's world.roomObjects(), miner positions from the scorecard
timeline, and the two anti-pattern checks scan src/ with a regular expression (on today's code
the scan flags Math.random in roles/builder.ts, which is intended).

The expected first result on today's M2 code is a failure on criteria 1, 2, 4 and 9 at least;
that is the agent's to-do list for static mining. You already have an M4 test; this one is a
second opinion to compare criteria with, in particular the relative income thresholds, the
miner-stays-put check and the all-criteria-at-once failure message.

## Calibration warning for milestone thresholds

The stub world's sources are created with `energyCapacity: 1000` (see the mockup's
assets/rooms.json), not the 3000 of an owned room on the live server. The engine may raise the
capacity to 3000 at the first regeneration once the controller is owned; the scorecard reports
the capacity it sees ("source capacity" line), so the first real run answers this. Until then,
treat the 20-energy-per-tick ceiling and the M3 threshold of 12 harvested per tick as live-server
numbers, and set the stub-world thresholds from the first two scorecards.

## Reading the scorecard

- "Energy harvested / tick" against the ceiling tells you whether mining is the bottleneck.
- "Energy wasted at source regeneration" above a few hundred per window means a source is
  under-mined; zero with low harvest means creeps are not reaching the sources.
- "Spawn idle while energy is full" is unused capacity: spawning logic, not economy.
- "Creep ticks idle" counts creeps that neither acted (per the event log) nor moved for 5 ticks
  running; miners standing on a container count as active because harvesting is an event.
- "Probe results missing" above a handful means the console channel is dropping results; the
  numbers are then averages over fewer ticks, not wrong, but worth a look.
- The per-creep table (`<name>-creeps.txt`) is the debug snapshot FEEDBACK asked the agent to
  write: name, role, position, energy, ticks to live, and whether it acted, moved, or stood
  still, every 50 ticks.

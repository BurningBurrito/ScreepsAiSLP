# 07 – Run procedure (MANDATORY – the checklist for every scheduled run)

You work in runs of up to 4 hours. Nobody answers questions during a run. Every command
you start yourself is stopped after 30 seconds; only `agent-test` runs things longer
than that, in the background.

## A. Orientation (first 15 minutes; no code changes yet)
1. `git status --short` must be empty. If not: `git add -A` and
   `git commit -m "chore: leftover changes from previous run"`.
2. Read `LAST_GATE.md`. If a gate step failed (lint, tests or push), fixing it is the
   objective of this run. Nothing else comes first.
3. Read `/etc/agent-tasks/FEEDBACK.md`, the owner's notes and the one file outside the repository you read. For every item that is not yet listed under
   "Feedback acknowledged" in `status.md`: do what it says before any other work, then add
   `- Acknowledged <date>: <item> – done in <commit or file>` (or `– not done because …`)
   under that heading.
4. Read `status.md`. Your objective is the first unchecked milestone under
   "Upcoming Features". Read its spec in `milestones/<id>.md` and its acceptance test in
   `test/integration/acceptance-<id>.test.ts`. You may not edit either file.
5. Read `reports/latest.md` if it exists. Copy the scorecard lines that the milestone spec
   lists under "Scorecard fields to watch" into `status.md` under "In Progress" as
   `Baseline <date>: …`.
6. Read every file in `src/` that the milestone touches. Then write your plan under
   "In Progress": at most five steps, each small enough to be one commit.

## B. Work loop (repeat until the milestone acceptance test passes)
1. Make the smallest change that completes one step of the plan.
2. Fast checks, in this order; all must pass before anything else:
   `npm run lint -- --fix`, `npm run lint`, `npm run build`, `npm run test-unit`.
3. Behaviour check: `agent-test start test/integration/smoke.test.ts` (500 ticks, about
   2 minutes). Then `agent-test status 1`, and after that exactly the command it prints
   after "Next check". When it says FINISHED, read the scorecard it prints.
   A number that got worse than the baseline is a problem to understand before you
   continue, not something to try around.
4. Commit: `git add -A`, then `git commit -m "<type>: <what changed>; <the scorecard
   numbers that changed, before -> after>"`.
5. Update `status.md`: Change Log (with the numbers), In Progress (next plan step).
6. When you believe the milestone is complete:
   `agent-test start test/integration/acceptance-<id>.test.ts` (3000 ticks, about
   13 minutes). Check it as in step 3. Read the snapshot line and the failure message.
   The failure message names the criterion; go back to step 1 for that criterion only.
   While the test runs, read code or write `status.md`; do not idle.

## C. Stop conditions (leave the loop as soon as one is true)
- The acceptance test passed in this run → part D.
- The same acceptance criterion failed three times in a row → write under
  "Known Issues / Notes" what you measured, what you tried and what you think is wrong.
  Commit. Part D.
- One hour on the same problem without any scorecard number improving → same as above.
- Thirty minutes of run time left → part D, whatever the state.
- A test fails for a reason outside `src/` (port in use, storage process exited, module
  not found): `agent-test stop`, then start that test once more. If it fails the same way
  again, write the exact error under "Known Issues / Notes" and go to part D.
  Never touch `node_modules`, `test/integration/helper.ts`, acceptance tests or anything
  outside the repository to make a test pass.

## D. Finish ritual (always; plan 25 minutes for it)
1. `git status --short` must be empty. Commit what is left; never leave work uncommitted.
2. `agent-test start all`. Check it until FINISHED. Copy the result line
   ("N passing, M failing") into `status.md` under today's Change Log entry.
3. If the milestone passed: tick it in `status.md`, update `README.md` (rule 05), write
   the blog post (rule 05), and commit `docs: <milestone> complete`.
4. Final message, three lines: (1) what changed, with the scorecard numbers before and
   after; (2) the exact test result line; (3) what the next run should do first.

## Rules of thumb that keep runs out of trouble
- Never run `npm test`, `npx mocha` or any integration test directly: they take longer
  than 30 seconds and are stopped. Use `agent-test`.
- Never run the same command five times in a row; Cline stops the whole run when that
  happens. `agent-test status` counts up for exactly that reason.
- Never use `sleep`, `timeout`, `kill`, `pkill` or `killall`.
- Only one `agent-test` run at a time. `agent-test stop` ends it.
- When a number and your belief disagree, the number is right. Measure before you change
  the same code a second time.
- Every sentence you write in `status.md`, `README.md` or a blog post about what the code
  does must be true of the code in this commit. Before you write it, open the function
  that does it and name that function in the sentence.

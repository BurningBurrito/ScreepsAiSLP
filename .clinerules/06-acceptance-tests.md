# 06 – Acceptance tests and honest reporting (MANDATORY)

- Files named `test/integration/acceptance-*.test.ts` are written by the human. They define when a milestone is done.
- Never edit, rename, skip or delete them. The launcher restores the official copy after every run, then runs lint and all tests itself before pushing. If anything fails, nothing is pushed.
- If an acceptance test fails, fix the game code until it passes. If you believe the test itself is wrong, explain why in `status.md` under "Known Issues / Notes" and leave the test unchanged.
- Acceptance tests may take longer than 60 seconds; the 60-second guideline in rule 04 applies to your own tests.
- A milestone is complete only when its acceptance test passes in a run of `npm test` that you did in this run.
- Never claim in a commit message, `status.md`, the README or a blog post that tests pass unless you ran `npm test` in this run and saw it pass. Copy the real result line (for example "6 passing").
- Never claim you wrote, changed or simplified a test unless `git diff` shows that change.
- If something failed or is unfinished, say so plainly. An honest "not done yet" is always better than a wrong "done".
- The scorecard in `reports/latest.md` (and `reports/<test>.md`) is written by the test harness after every integration run, measured from the game's event log. When you describe how the colony performs, quote its numbers; never estimate, and never claim an improvement that the scorecard does not show.

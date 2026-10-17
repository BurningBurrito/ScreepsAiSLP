# 04 – "Done and verified" checklist (MANDATORY – run before every commit)

A task step is only done when ALL of these pass. Do every step, in order, with these exact commands:

1. `npm run lint -- --fix` then `npm run lint`
   → must end with 0 errors. Fix every error yourself.
2. `npm test`
   → runs unit tests AND integration tests (a real Screeps engine). Must show only "passing", no "failing", exit code 0.
   If a test fails: read the error, fix the code (not the test – unless the test itself is wrong, then explain why in the commit message).
3. New behavior needs a test:
   - logic without game objects → unit test in `test/unit/` (mocks in `test/unit/mock.ts`)
   - behavior in the game world → integration test in `test/integration/` (ticks the server, then checks Memory, creeps, rooms).
     Keep integration tests fast: only as many ticks as needed, each test well under 60 seconds.
4. `git diff --stat` → only files that belong to the task changed. No dependency changes in `package.json`.
5. Update `status.md` (rule 05): Change Log entry for today, Current State, In Progress, Upcoming Features.
6. If this step completed a milestone from "Upcoming Features": update `README.md` and write a blog post (rule 05).
7. `git add -A` then `git commit -m "<type>: <short summary>"`
   types: `feat` new behavior, `fix` bug fix, `test` tests only, `refactor` no behavior change, `docs` documentation, `chore` other.
8. `git status --short` → must be empty.
9. Final message of the run: what you did, the test result line ("N passing"), and what should come next.

If you cannot make lint and tests pass after 3 attempts: stop, commit nothing broken, revert your uncommitted changes with
`git checkout -- .` and `git clean -fd`, and record the problem in `status.md` (commit only that file).

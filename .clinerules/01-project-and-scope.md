# 01 – Project and scope (MANDATORY)

## Project
- ScreepsAiSLP: a bot for the game Screeps, written in TypeScript.
- Built from screeps-typescript-starter: Rollup bundles `src/` into `dist/main.js`; entry point `src/main.ts`.
- You work alone, without a human watching. Nobody will answer questions during a run.
  When something is unclear, make the most reasonable choice and write it down in `status.md` under "Known Issues / Notes".
- The repository is PUBLIC (a portfolio piece). Everything you write may be read by anyone.

## Sources of truth (never guess Screeps API behavior)
1. Type definitions: `node_modules/@types/screeps/index.d.ts`. Before using ANY game object, method, property or constant,
   search it there, for example: `grep -n "spawnCreep" node_modules/@types/screeps/index.d.ts`
2. This machine has no internet access. Do not try to reach websites or download anything; rely on the type definitions above and the code in this repository.
3. If the type definitions do not confirm it, do not use it. Write the open question in `status.md`.

## Start checklist (do every step, in order)
1. `git status --short` – must be empty. If not, commit the leftovers first (see your global rules).
2. Read `status.md` (create it from the template in rule 05 if it is missing).
3. Read the code in `src/` that your task touches before changing anything.
4. Decide the smallest useful step that moves the task forward. Prefer several small commits over one big change.

## Scope – NEVER do these
- Never work outside this repository folder. Never read files outside it (no home folder, no `/etc`, no other projects).
- Never install, remove or upgrade npm packages, and never edit the dependency lists in `package.json`.
  If you need a package, write the request in `status.md` and continue without it.
- Never download files, never use network tools (`curl`, `wget`, `ssh`, `nc`, `nmap` …), never scan or contact other machines.
- Never `git push`, never force anything, never rewrite history (`rebase`, `reset --hard`, `commit --amend` on pushed commits).
  Pushing is done automatically by the launcher after your run.
- Never edit files in `.clinerules/`, `.git/`, `.github/` or the build/test configuration
  (`package.json` scripts, `rollup.config.js`, `tsconfig*.json`, `.eslintrc.js`, `test/mocha.opts`) unless the task explicitly says so.
- Never write passwords, tokens, keys, IP addresses, host names, user names, home-folder paths or e-mail addresses into any file.
- Never upload code to any Screeps server (`npm run push-*`, `watch-*`).

## Test tooling – NEVER do these
- Never edit, patch or delete anything in `node_modules/`. After your run the launcher deletes `node_modules` and reinstalls it from `package-lock.json`, so such edits are thrown away anyway.
- Never edit the test harness: `test/integration/helper.ts`, `test/mocha.opts`, or the protected acceptance tests (`test/integration/acceptance-*.test.ts`). They are restored from a protected copy after every run.
- Never kill processes (`kill`, `pkill`, `killall`, `fuser -k`).
- If the test server will not start or a test fails for a reason outside `src/`, stop working on it. Write the exact error message in `status.md` under "Known Issues / Notes" and finish the run. A human will fix the test setup.

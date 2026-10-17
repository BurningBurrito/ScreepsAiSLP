# 03 – Code style and structure (MANDATORY)

## Brace and indent style: Allman (BSD/ANSI style)
- Opening braces go on their OWN line, for every block: functions, classes, if/else, loops, switch, try/catch.
- Indent with 4 spaces. No tabs.
- Example:
```ts
export function runHarvester(creep: Creep): void
{
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source === null)
    {
        return;
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        creep.moveTo(source);
    }
}
```
- ESLint checks the brace style. Fix automatically with `npm run lint -- --fix`, then check again with `npm run lint`.
- Never run Prettier – it would undo the Allman style.

## Folder structure (one responsibility per file)
- `src/main.ts` – only the loop: calls the managers in order. No game logic here.
- `src/roles/<role>.ts` – one file per creep role, exporting one `run<Role>(creep: Creep): void` function.
- `src/managers/<name>.ts` – colony-level logic (spawning, memory cleanup, construction, defense …).
- `src/types/memory.ts` – global Memory interfaces (`declare global { interface CreepMemory … }`).
- `src/config.ts` – tunable numbers (minimum creeps per role, intervals, thresholds) as named constants.
- `src/utils/` – small helpers. Keep `utils/ErrorMapper.ts` (it maps errors back to the TypeScript source).

## TypeScript rules
- `strict` mode is on: no implicit `any`, handle `null`/`undefined` explicitly.
- Every exported function has explicit parameter and return types.
- Use string-literal union types or `const` objects for fixed sets of values (e.g. `type Role = "harvester" | "upgrader" | "builder"`).
- No magic numbers in logic – put them in `src/config.ts` with a comment saying what they mean.
- Short, clear functions. Prefer clear code over clever code.

## Comments (the code is a public learning resource)
- Every file starts with a short comment: what this file is responsible for.
- Every exported function has a `/** … */` comment: what it does, its parameters, what it returns.
- Explain WHY in comments, especially Screeps-specific reasons (CPU, ticks, global reset), not only what.

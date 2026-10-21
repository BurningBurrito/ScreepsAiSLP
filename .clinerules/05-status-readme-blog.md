# 05 – status.md, README.md and blog posts (MANDATORY)

## status.md (repo root) – keep it current during the run, not only at the end
Template (create it if missing; keep these exact headings):
```
# ScreepsAiSLP Status

## Current State
Short description of what the bot can currently do.

## Change Log
### YYYY-MM-DD
- What changed, and which files.

## In Progress
- Anything started but not finished.

## Upcoming Features
- [ ] Planned feature (priority order, most important first)

## Known Issues / Notes
- Bugs, limitations, decisions you made on your own, questions for the human.

## Feedback acknowledged
- Acknowledged YYYY-MM-DD: <item from FEEDBACK.md> – done in <commit or file> (or: not done because …)

## Concepts Explained
- TypeScript and Screeps concepts already explained in a blog post (so later posts give only a short reminder).
```
- Newest Change Log date on top. Tick `- [x]` when a feature is done.

## README.md (repo root)
Keep this structure; update "Features" and "Status" whenever a milestone is completed:
1. Title and a 2–3 sentence description: a Screeps bot in TypeScript, written and maintained by an autonomous AI coding agent
   running on a local model, with a human reviewing.
2. **Status** – current milestone and one line on what the bot does now.
3. **Features** – checklist of what works (✅) and what is planned (⬜).
4. **How it works** – short overview of the code structure (`src/main.ts`, `roles/`, `managers/`).
5. **Development** – `npm install`, `npm run build`, `npm run lint`, `npm test`.
6. **Blog** – link to the `blog/` folder.
Never put private information (host names, IPs, e-mail addresses, paths) in the README.

## Blog post – write one after every completed milestone
- New file per post: `blog/YYYY-MM-DD-<short-slug>.md` (never edit old posts except to fix errors).
- Start with:
```
# <Title: Subtitle>
*<Month D, YYYY> · <N> min read · Written by Screeps Agent (a local AI model), reviewed by a human*
```
- Voice: first person, as the agent ("I built …", "I got this wrong at first …"). Casual but precise. Dry, self-aware humor is welcome.
- Explain every technical term the first time: **bold term**, then a short plain-language definition.
  Check "Concepts Explained" in status.md – for concepts already explained, give only a one-line reminder. Add new ones there.
- Structure:
  1. Opening: one or two sentences connecting to the previous post/milestone.
  2. Sections with short descriptive headings (a line starting with two hash signs and a space): what the goal was, how the code works (short code excerpts shown as indented code blocks, every code line indented by four spaces, each followed by a plain explanation of the TypeScript and Screeps ideas in it), how it was tested (real numbers: test results, CPU per tick, ticks simulated).
  3. What went wrong and how it was fixed: expected → what actually happened → the wrong assumption → the fix.
  4. Final section "What I learned, and what's next": bullets with **bold lead-ins**, then one sentence teasing the next milestone.
- Length: about 800–1,500 words. No images.
- No backtick characters anywhere in the post (no code fences, no inline code): write file, function and command names as plain text.
- Honest: describe failures plainly. Never claim tests passed if they did not.
- Never include private information (host names, IPs, e-mail addresses, user names, paths outside the repo).

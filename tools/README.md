# Launcher-side files (reference copies)

The live versions of these two files sit outside the repository, where the agent cannot edit
them. The copies here are for review and for keeping the two in sync; changing them here
changes nothing until the owner installs them.

- agent-test: the background test runner the agent uses (installed root-owned on the server,
  for example as /usr/local/bin/agent-test). The three blocks marked MERGE are the additions
  to an existing script: a progress line while running, the scorecard and failure text when
  finished, and clean-up of leftover engine processes on stop.
- screeps-standing.txt: the standing task the launcher hands to Cline for every scheduled run
  (/etc/agent-tasks/screeps-standing.txt). It is one page; the procedure lives in
  .clinerules/07-run-procedure.md.

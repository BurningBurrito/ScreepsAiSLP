/*
 * Acceptance test for milestone M4 (static mining with containers and haulers). Version 1, draft of 2026-10-21. Candidate for the owner's M4 (containers and static mining), to be compared with the M4 test the owner already wrote; not a replacement for it.
 * Written by the human reviewer. The agent must not edit this file:
 * the launcher restores the official copy before running the tests.
 *
 * The criteria are the numbered list in milestones/M4.md, one check each, in the same order and
 * with the same numbers in the failure text. Rates come from the scorecard
 * (test/integration/scorecard.ts), which measures from the room event log, not from the bot's
 * Memory. Thresholds that depend on income are a share of the ceiling the sources allow (sum of
 * source capacities over 300 ticks), because the stub world's sources may hold 1000 energy
 * instead of the live server's 3000. All criteria are evaluated before the test fails, so one
 * run reports every unmet criterion.
 */
import { assert } from "chai";
import * as path from "path";
import { ceilingPerTick, containersBySource, maxSpawnIdleFullStreak, minerStaysPut, RoomObjectLike, scanSourceFiles } from "../integration/criteria";
import { helper } from "../integration/helper";

const ROOM = "W0N1";
const TICKS = 3000;

// Thresholds. CALIBRATE the three shares and CPU_MAX from the first two real scorecards.
const HARVEST_SHARE = 0.6;   // 2. energy harvested per tick, at least this share of the ceiling
const WASTE_SHARE = 0.15;    // 3. energy left in sources at regeneration, at most this share of the energy offered in the window
const UPGRADE_SHARE = 0.2;   // 5. controller progress per tick, at least this share of the ceiling
const SPAWN_IDLE_MAX = 150;  // 6. consecutive ticks the spawn may sit idle with energy at capacity
const CPU_MAX = 10;          // 7. average CPU per tick over the window (the spec aims at 5; start generous)

const ROLE_MINER = "miner";
const ROLE_HAULER = "hauler";
const ROLE_UPGRADER = "upgrader";

function round(value: number): number
{
    return Math.round(value * 100) / 100;
}

describe("M4 acceptance: static mining with containers and haulers", function ()
{
    it("mines both sources from containers, hauls the energy, and keeps the economy numbers up", async function ()
    {
        this.timeout(1200000);

        for (let i = 0; i < TICKS; i += 1)
        {
            await helper.server.tick();
        }
        await helper.scorecard.settle();

        const s = helper.scorecard.compute();
        const timeline = helper.scorecard.timeline();
        const objects: RoomObjectLike[] = await helper.server.world.roomObjects(ROOM);
        const sources = objects.filter((o) => o.type === "source");
        const ceiling = ceilingPerTick(sources.map((o) => Number(o.energyCapacity) || 0));
        const offered = ceiling * s.window;
        const containers = containersBySource(objects);
        const miners = minerStaysPut(timeline, sources, ROLE_MINER);
        const idle = maxSpawnIdleFullStreak(timeline);
        const scan = scanSourceFiles(path.resolve("src"));
        const roles = s.creepsByRole;

        console.log("M4 acceptance snapshot after " + TICKS + " ticks: " + JSON.stringify({
            recordedTicks: s.ticks,
            window: s.window,
            ceilingPerTick: round(ceiling),
            sourceCapacity: sources.map((o) => o.energyCapacity),
            harvestedPerTick: s.harvestedPerTick,
            wastedEnergy: s.wastedEnergy,
            upgradePerTick: s.upgradePerTick,
            containers,
            miners: { seen: miners.miners, arrived: miners.arrived, violations: miners.violations.length },
            spawnIdleFullStreak: idle,
            cpuPerTick: s.cpuPerTick,
            sitesOnWall: s.sitesOnWall,
            extensionSitesNearSourceOrController: s.extensionSitesNearSourceOrController,
            roles,
            level: s.level,
            progress: s.progress,
            scan
        }));

        const failures: string[] = [];
        const check = (ok: boolean, message: string): void =>
        {
            if (!ok)
            {
                failures.push(message);
            }
        };

        check(s.ticks >= TICKS * 0.9,
            "0. the scorecard recorded only " + s.ticks + " of " + TICKS + " ticks (probe results missing; the numbers below are unreliable)");

        check(sources.length >= 2 && containers.sourcesWithContainer >= 2,
            "1. containers adjacent to distinct sources: " + containers.sourcesWithContainer + " of " + sources.length +
            " sources have one (" + containers.containers + " containers in the room)");

        check(s.harvestedPerTick >= HARVEST_SHARE * ceiling,
            "2. energy harvested per tick, last " + s.window + " ticks: " + s.harvestedPerTick + ", required " + round(HARVEST_SHARE * ceiling) +
            " (" + Math.round(HARVEST_SHARE * 100) + " % of the ceiling " + round(ceiling) + ")");

        check(s.wastedEnergy <= WASTE_SHARE * offered,
            "3. energy left in sources at regeneration, last " + s.window + " ticks: " + s.wastedEnergy + ", allowed " + Math.round(WASTE_SHARE * offered) +
            " (" + Math.round(WASTE_SHARE * 100) + " % of the " + Math.round(offered) + " offered)");

        const firstViolation = miners.violations.length > 0
            ? "; first: " + miners.violations[0].name + " at tick " + miners.violations[0].tick + ", range " + miners.violations[0].distance
            : "";
        check(miners.arrived >= 1 && miners.violations.length === 0,
            "4. miners stay at their source: " + miners.miners + " miners seen, " + miners.arrived + " reached a source, " +
            miners.violations.length + " creep-ticks away from it" + firstViolation);

        check(s.upgradePerTick >= UPGRADE_SHARE * ceiling,
            "5. controller progress per tick, last " + s.window + " ticks: " + s.upgradePerTick + ", required " + round(UPGRADE_SHARE * ceiling) +
            " (" + Math.round(UPGRADE_SHARE * 100) + " % of the ceiling)");

        check(idle.streak <= SPAWN_IDLE_MAX,
            "6. spawn idle with energy at capacity for " + idle.streak + " consecutive ticks from tick " + idle.startTick + ", allowed " + SPAWN_IDLE_MAX);

        check(s.cpuPerTick <= CPU_MAX,
            "7. average CPU per tick, last " + s.window + " ticks: " + s.cpuPerTick + ", allowed " + CPU_MAX);

        check(s.sitesOnWall === 0 && s.extensionSitesNearSourceOrController === 0,
            "8. construction sites on wall terrain: " + s.sitesOnWall + "; extension sites next to a source or the controller: " +
            s.extensionSitesNearSourceOrController + " (both must be 0)");

        check((roles[ROLE_MINER] || 0) >= 1 && (roles[ROLE_HAULER] || 0) >= 1 && (roles[ROLE_UPGRADER] || 0) >= 1,
            "9. creeps at the end by role: " + JSON.stringify(roles) + "; at least one " + ROLE_MINER + ", one " + ROLE_HAULER + " and one " + ROLE_UPGRADER + " are required");

        check(scan.hardcodedPositions.length === 0,
            "A. positions written as number literals in src/: " + scan.hardcodedPositions.join(", "));

        check(scan.randomInRoles.length === 0,
            "B. Math.random in role files: " + scan.randomInRoles.join(", "));

        if (failures.length > 0)
        {
            assert.fail("M4 criteria not met (" + failures.length + "):\n - " + failures.join("\n - ") + "\nScorecard: reports/acceptance-m4.md");
        }
    });
});

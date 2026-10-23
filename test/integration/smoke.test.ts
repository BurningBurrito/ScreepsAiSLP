/*
 * Smoke test: a short run on the stub world that prints the scorecard.
 * Written by the owner and protected like the acceptance tests. The agent runs it through
 * agent-test after every change (rule 07, step B3). It is a regression check that catches a
 * dead or erroring colony in about two minutes; it is not a milestone gate.
 * SMOKE_TICKS overrides the length (default 500).
 */
import { assert } from "chai";
import { helper } from "./helper";

const TICKS = Number(process.env.SMOKE_TICKS || 500);

describe("smoke: short run with scorecard", function ()
{
    it("keeps the colony alive, harvesting and error-free for " + TICKS + " ticks", async function ()
    {
        this.timeout(1200000);

        for (let i = 0; i < TICKS; i += 1)
        {
            await helper.server.tick();
        }

        await helper.scorecard.settle();
        const s = helper.scorecard.compute();
        console.log("smoke summary after " + TICKS + " ticks: " + JSON.stringify({
            creeps: s.creepsAtEnd,
            roles: s.creepsByRole,
            harvestedTotal: s.harvestedTotal,
            harvestedPerTick: s.harvestedPerTick,
            deliveredToSpawnTotal: s.transferToSpawnTotal,
            upgradePerTick: s.upgradePerTick,
            level: s.level,
            progress: s.progress,
            cpuPerTick: s.cpuPerTick,
            consoleErrors: s.consoleErrors,
            probeMisses: s.probeMisses
        }));

        assert.isAtLeast(s.ticks, Math.floor(TICKS * 0.9), "the scorecard recorded most ticks (probe results arrived)");
        assert.isAtLeast(s.creepsAtEnd, 1, "the colony has at least one creep at the end");
        assert.isAbove(s.harvestedTotal, 0, "energy was harvested");
        assert.isAbove(s.transferToSpawnTotal, 0, "energy reached the spawn or an extension");
        assert.isTrue(s.level > 1 || s.progress > 0, "the controller made progress");
        assert.equal(s.consoleErrors, 0, "the bot's console shows no errors (see reports/smoke-console.log)");
    });
});

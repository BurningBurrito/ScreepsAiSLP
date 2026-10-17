/**
 * CPU Reporter
 * Reports CPU usage and bucket status periodically.
 */

import { CPU_SUMMARY_INTERVAL } from "config";

/**
 * Reports CPU usage summary every N ticks.
 * Logs tick number, CPU used, CPU bucket, and creep counts per role.
 */
export function reportCPU(): void
{
    const currentTick = Game.time;

    // Only report every N ticks
    if (currentTick % CPU_SUMMARY_INTERVAL !== 0)
    {
        return;
    }

    // Calculate creep counts per role
    const creepCounts: { [role: string]: number } = {};
    for (const name in Game.creeps)
    {
        const role = Game.creeps[name].memory.role as string;
        creepCounts[role] = (creepCounts[role] || 0) + 1;
    }

    // Log CPU summary
    console.log(
        `=== CPU Summary (Tick ${currentTick}) ===`,
        `Used: ${Game.cpu.getUsed().toFixed(2)}`,
        `Bucket: ${Game.cpu.bucket}`,
        `Limit: ${Game.cpu.limit}`,
        `Creeps: ${JSON.stringify(creepCounts)}`
    );

    // Store last values for reference
    Memory.lastCpuUsage = Game.cpu.getUsed();
    Memory.lastCpuBucket = Game.cpu.bucket;
    Memory.lastCpuSummary = currentTick;
}

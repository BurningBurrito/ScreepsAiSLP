/**
 * Memory Manager
 * Responsible for cleaning up memory of dead creeps.
 */

/**
 * Cleans up memory by removing entries for creeps that no longer exist.
 * This should be called at the beginning of each tick to keep Memory small.
 */
export function cleanMemory(): void
{
    // Delete memory of dead creeps
    for (const name in Memory.creeps)
    {
        if (!(name in Game.creeps))
        {
            delete Memory.creeps[name];
        }
    }
}

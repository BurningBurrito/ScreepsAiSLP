/** 
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 * Upgraders harvest directly from sources only - they do NOT take energy from spawns.
 * This prevents energy from going in circles (spawn -> upgrader -> controller).
 */

/**
 * Runs the upgrader creep behavior.
 * Harvests directly from sources, then upgrades the controller.
 * Never takes energy from spawns - that's the harvester's job.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const controller = creep.room.controller;

    if (controller === undefined || controller === null)
    {
        return; // No controller in room
    }

    const controllerPos = controller.pos;
    const rangeToController = creep.pos.getRangeTo(controllerPos);
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
    {
        creep.memory.working = true;
    }

    if (creep.memory.working)
    {
        // Upgrade the controller
        if (rangeToController > 3)
        {
            // Move toward the controller
            creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 20, range: 3 });
        }
        else
        {
            // We are at the controller (range <= 3), upgrade it
            const upgradeCode = creep.upgradeController(controller);
            if (upgradeCode !== OK)
            {
                // Upgrade failed (e.g., controller is already at max level)
                // Switch to harvesting
                creep.memory.working = false;
            }
            else
            {
                // After upgrading, if store is empty, go harvest
                if (creep.store[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.working = false;
                }
            }
        }
    }
    else
    {
        // Creep is empty or nearly empty - harvest directly from sources
        // Do NOT take energy from spawns (that's the harvester's job)
        // This prevents energy from going in circles
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
        if (source !== null)
        {
            const sourceRange = creep.pos.getRangeTo(source);
            if (sourceRange === 1)
            {
                const harvestCode = creep.harvest(source);
                if (harvestCode !== OK)
                {
                    // Harvest failed - try again next tick
                }
            }
            else
            {
                creep.moveTo(source, { ignoreCreeps: true, reusePath: 20, range: 1 });
            }
        }
    }
}

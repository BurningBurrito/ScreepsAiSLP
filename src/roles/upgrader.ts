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

    const tick = Game.time;
    const creepName = creep.name;
    const controllerPos = controller.pos;
    
    // Check range to controller
    const rangeToController = creep.pos.getRangeTo(controllerPos);
    
    // If creep has energy, decide what to do
    if (creep.store[RESOURCE_ENERGY] > 10)
    {
        // Always try to move to controller first, regardless of store fullness
        // This ensures upgraders reach the controller to upgrade
        if (rangeToController > 3)
        {
            // Move toward the controller
            console.log(`[${tick}] ${creepName} moving to controller at ${controllerPos.x},${controllerPos.y} (range ${rangeToController})`);
            creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 20, range: 3 });
        }
        else
        {
            // We are at the controller (range <= 3), upgrade it
            const upgradeCode = creep.upgradeController(controller);
            if (upgradeCode !== OK)
            {
                console.log(`[${tick}] ${creepName} upgrade failed: ${upgradeCode} at range ${rangeToController}`);
            }
            else
            {
                console.log(`[${tick}] ${creepName} upgraded controller (range ${rangeToController}, store: ${creep.store[RESOURCE_ENERGY]})`);
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
        // Creep is nearly empty - harvest directly from sources
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
                    console.log(`[${tick}] ${creepName} harvest failed: ${harvestCode} (source at ${source.pos.x},${source.pos.y})`);
                }
            }
            else
            {
                console.log(`[${tick}] ${creepName} moving to source at ${source.pos.x},${source.pos.y} (range ${sourceRange})`);
                creep.moveTo(source, { ignoreCreeps: true, reusePath: 20 });
            }
        }
    }
}

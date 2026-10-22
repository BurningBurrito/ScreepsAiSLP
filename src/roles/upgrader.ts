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
        // If we can upgrade (range <= 3), do it
        if (rangeToController <= 3)
        {
            const upgradeCode = creep.upgradeController(controller);
            if (upgradeCode !== OK)
            {
                console.log(`[${tick}] ${creepName} upgrade failed: ${upgradeCode} at range ${rangeToController}`);
            }
            else
            {
                console.log(`[${tick}] ${creepName} upgraded controller (range ${rangeToController}, store: ${creep.store[RESOURCE_ENERGY]})`);
            }
        }
        // If we have energy but can't upgrade YET, check if store has free capacity
        // If store has free capacity, harvest to fill it before moving
        // This prevents getting stuck moving with a partially full store
        else if (creep.store.getFreeCapacity() > 0)
        {
            console.log(`[${tick}] ${creepName} harvesting (range ${rangeToController}, store: ${creep.store[RESOURCE_ENERGY]}, free: ${creep.store.getFreeCapacity()})`);
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
                    creep.moveTo(source, { ignoreCreeps: true, reusePath: 5 });
                }
            }
        }
        // Store is full and we can't upgrade - move to controller
        else
        {
            // Move toward the controller
            console.log(`[${tick}] ${creepName} moving to controller at ${controllerPos.x},${controllerPos.y} (range ${rangeToController})`);
            creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 5, range: 3 });
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
                creep.moveTo(source, { ignoreCreeps: true, reusePath: 5 });
            }
        }
    }
}

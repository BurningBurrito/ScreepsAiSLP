/** 
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 * Upgraders go directly to the controller and upgrade from their stored energy.
 * They harvest from sources only if their store runs low.
 */

/**
 * Runs the upgrader creep behavior.
 * Goes directly to the controller to upgrade, only harvesting if store is low.
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
    
    // If creep is full or has enough energy, upgrade the controller
    if (creep.store[RESOURCE_ENERGY] > 10)
    {
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
        else
        {
            // Move toward the controller
            console.log(`[${tick}] ${creepName} moving to controller at ${controllerPos.x},${controllerPos.y} (range ${rangeToController})`);
            creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 5, range: 3 });
        }
    }
    else
    {
        // Creep is nearly empty, try to pick up energy first from spawn/extension
        // If the spawn has energy, prioritize it (it's the colony's central storage)
        // Otherwise, fall through to harvesting from sources
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        const spawnWithEnergy = spawns.find(sp => sp.store.getUsedCapacity(RESOURCE_ENERGY) > 0);
        
        if (spawnWithEnergy !== undefined)
        {
            if (creep.withdraw(spawnWithEnergy, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                console.log(`[${tick}] ${creepName} moving to spawn (range ${creep.pos.getRangeTo(spawnWithEnergy)})`);
                creep.moveTo(spawnWithEnergy, { ignoreCreeps: true, reusePath: 5 });
            }
            return; // Try again next tick after picking up energy
        }

        // Priority 2: harvest from sources if nothing else available
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

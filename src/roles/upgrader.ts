/**
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 */

/**
 * Runs the upgrader creep behavior.
 * Upgrades the room controller continuously.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const controller = creep.room.controller;

    if (controller === undefined || controller === null)
    {
        return; // No controller in room
    }

    // If not carrying energy, try to get it from the controller or spawns
    if (creep.carry.energy === 0)
    {
        // Try to withdraw from spawns first
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
        {
            if (spawn.energy > 0)
            {
                if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn);
                }
                return;
            }
        }

        // If no energy in spawns, try to get from storage/terminal if they exist
        const storage = creep.room.storage;
        if (storage !== undefined && storage !== null && storage.store[RESOURCE_ENERGY] > 0)
        {
            if (creep.withdraw(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(storage);
            }
            return;
        }

        // As a last resort, try to pick up dropped energy
        const droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (resource) => resource.resourceType === RESOURCE_ENERGY,
        });

        if (droppedEnergy !== null)
        {
            if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(droppedEnergy);
            }
            return;
        }
    }

    // Upgrade the controller
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
    {
        creep.moveTo(controller);
    }
}

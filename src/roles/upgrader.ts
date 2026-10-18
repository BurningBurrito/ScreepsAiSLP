/**
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 * In M1, upgraders harvest energy from sources themselves.
 */

/**
 * Runs the upgrader creep behavior.
 * Harvests from sources when empty, then upgrades the controller.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const controller = creep.room.controller;

    if (controller === undefined || controller === null)
    {
        return; // No controller in room
    }

    // Update working state based on store capacity
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
    {
        creep.memory.working = true;
    }

    // If not working (empty store), harvest from sources
    if (!creep.memory.working)
    {
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source === null)
        {
            return; // No sources found
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source);
            return;
        }
    }

    // Upgrade the controller
    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE)
    {
        creep.moveTo(controller);
    }
}

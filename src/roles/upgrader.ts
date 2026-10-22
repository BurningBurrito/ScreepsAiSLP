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
    console.log(`Upgrader ${creep.name} running`);
    const controller = creep.room.controller;

    if (controller === undefined || controller === null)
    {
        console.log(`Upgrader ${creep.name}: no controller`);
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
            creep.moveTo(source, { ignoreCreeps: true, range: 1 });
            return;
        }
    }

    // Upgrade the controller
    const controllerPos = controller.pos;
    const rangeToController = creep.pos.getRangeTo(controllerPos);
    
    // Log debug info every 100 ticks
    if (Game.time % 100 === 0)
    {
        console.log(`Upgrader ${creep.name}: range=${rangeToController}, working=${String(creep.memory.working)}, store=${creep.store[RESOURCE_ENERGY]}/50, pos=(${creep.pos.x},${creep.pos.y})`);
    }
    
    if (rangeToController > 3)
    {
        const moveResult = creep.moveTo(controllerPos, { ignoreCreeps: true, range: 3 });
        // Fall back to directional movement if pathfinding fails (e.g., blocked by terrain)
        if (moveResult === ERR_NO_PATH || moveResult === ERR_NOT_FOUND)
        {
            const direction = creep.pos.getDirectionTo(controllerPos);
            creep.move(direction);
        }
    }
    else
    {
        const upgradeResult = creep.upgradeController(controller);
        if (Game.time % 100 === 0)
        {
            console.log(`Upgrader ${creep.name}: upgradeResult=${upgradeResult}`);
        }
    }
}

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

    // Debug: log controller position
    if (Game.time % 100 === 0)
    {
        const x: number = controller.pos.x;
        const y: number = controller.pos.y;
        console.log(`[upgrader] Controller at (${x}, ${y})`);
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
            const sourcePos = source.pos;
            
            // Always try to move towards source using directional movement
            // This is more reliable than moveTo when paths are blocked
            const direction = creep.pos.getDirectionTo(sourcePos);
            creep.move(direction);
            return;
        }
        // If we harvested successfully but are still not full, continue harvesting
        // (this handles the case where harvest returned ERR_NOT_IN_RANGE but we were in range)
        return;
    }

    // If working (full store), upgrade the controller
    const controllerPos = controller.pos;
    const rangeToController = creep.pos.getRangeTo(controllerPos);

    if (rangeToController > 3)
    {
        // Get direction to controller regardless of pathing state
        const direction = creep.pos.getDirectionTo(controllerPos);
        
        // Always try to move in the direction of the controller
        // This is critical for making progress when moveTo fails due to walls or pathing issues
        const moveResult = creep.move(direction);
        
        // If move fails, log for debugging (but don't block execution)
        if (moveResult !== OK && Game.time % 50 === 0)
        {
            const x: number = creep.pos.x;
            const y: number = creep.pos.y;
            console.log(`[upgrader] Move failed: ${moveResult} at (${x}, ${y})`);
        }
    }
    else
    {
        creep.upgradeController(controller);
    }
}

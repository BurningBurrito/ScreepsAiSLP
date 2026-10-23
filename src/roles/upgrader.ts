/** 
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 * Upgraders harvest directly from sources only - they do NOT take energy from spawns.
 * This prevents energy from going in circles (spawn -> upgrader -> controller).
 */

/**
 * Tries to move to adjacent tiles to find an alternative route
 * @param creep The creep to move
 * @param targetPos The target position to reach
 * @returns true if movement started successfully, false if completely stuck
 */
function fallbackMoveTo(creep: Creep, targetPos: RoomPosition): boolean
{
    // Get the direction from current position to target
    const dx = targetPos.x - creep.pos.x;
    const dy = targetPos.y - creep.pos.y;
    
    // Try all 8 directions in a smart order:
    // 1. Primary direction (toward target)
    // 2. Perpendicular directions
    // 3. All 8 directions if needed
    
    // First, try to move in a direction that gets us closer to the target
    const dirs: DirectionConstant[] = [];
    
    // Determine primary direction (horizontal or vertical)
    let primaryDir: DirectionConstant;
    if (Math.abs(dx) > Math.abs(dy))
    {
        primaryDir = dx > 0 ? RIGHT : LEFT;
    }
    else
    {
        primaryDir = dy > 0 ? BOTTOM : TOP;
    }
    
    // Add primary direction first
    dirs.push(primaryDir);
    
    // Add perpendicular directions
    if (Math.abs(dx) > Math.abs(dy))
    {
        dirs.push(TOP, BOTTOM);
    }
    else
    {
        dirs.push(LEFT, RIGHT);
    }
    
    // Try primary and perpendicular directions first
    for (const dir of dirs)
    {
        const result = creep.move(dir);
        if (result === OK)
        {
            return true;
        }
    }
    
    // If all directions failed, try all 8 directions
    const allDirs: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    for (const dir of allDirs)
    {
        const result = creep.move(dir);
        if (result === OK)
        {
            return true;
        }
    }
    
    return false;
}

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

    // Debug: log upgrader status every 100 ticks
    if (Game.time % 100 === 0)
    {
        const energyStr = String(creep.store[RESOURCE_ENERGY]);
        const capacityStr = String(creep.store.getCapacity(RESOURCE_ENERGY));
        const workingStr = String(creep.memory.working);
        const rangeStr = String(rangeToController);
        console.log("[Upgrader] " + creep.name + ": working=" + workingStr + ", rangeToController=" + rangeStr + ", energy=" + energyStr + "/" + capacityStr);
    }

    if (creep.memory.working)
    {
        // Upgrade the controller
        if (rangeToController > 3)
        {
            // Move toward the controller
            const moveResult = creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 15, range: 3 });
            if (Game.time % 100 === 0)
            {
                console.log("[Upgrader] " + creep.name + ": moveTo controller result=" + String(moveResult));
            }
            // If moveTo failed, try fallback movement
            // This can happen when the path is blocked by structures
            if (moveResult !== OK)
            {
                // Try fallback movement up to 5 times to get unstuck
                let attempts = 0;
                let fallbackSuccess = false;
                while (attempts < 5)
                {
                    fallbackSuccess = fallbackMoveTo(creep, controllerPos);
                    if (fallbackSuccess)
                    {
                        break;
                    }
                    attempts++;
                }
                if (fallbackSuccess && Game.time % 100 === 0)
                {
                    console.log("[Upgrader] " + creep.name + ": fallbackMoveTo controller succeeded after " + String(attempts) + " attempts");
                }
            }
        }
        else
        {
            // We are at the controller (range <= 3), upgrade it
            const upgradeCode = creep.upgradeController(controller);
            if (Game.time % 100 === 0)
            {
                console.log("[Upgrader] " + creep.name + ": upgradeController result=" + String(upgradeCode));
            }
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
                const moveResult = creep.moveTo(source, { ignoreCreeps: true, reusePath: 15, range: 1 });
                if (Game.time % 100 === 0)
                {
                    console.log("[Upgrader] " + creep.name + ": moveTo source result=" + String(moveResult));
                }
                // If moveTo failed, try fallback movement
                // This can happen when the path is blocked by structures
                if (moveResult !== OK)
                {
                    // Try fallback movement up to 5 times to get unstuck
                    let attempts = 0;
                    let fallbackSuccess = false;
                    while (attempts < 5)
                    {
                        fallbackSuccess = fallbackMoveTo(creep, source.pos);
                        if (fallbackSuccess)
                        {
                            break;
                        }
                        attempts++;
                    }
                    if (fallbackSuccess && Game.time % 100 === 0)
                    {
                        console.log("[Upgrader] " + creep.name + ": fallbackMoveTo source succeeded after " + String(attempts) + " attempts");
                    }
                }
            }
        }
    }
}

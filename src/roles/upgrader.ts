/**
 * Upgrader Role
 * Upgrades the controller to increase colony level.
 * In M1, upgraders go directly to the controller (don't harvest).
 */

/**
 * Runs the upgrader creep behavior.
 * Goes directly to the controller and upgrades it.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const controller = creep.room.controller;

    if (controller === undefined || controller === null)
    {
        return; // No controller in room
    }

    // Upgrade the controller directly
    // Upgraders don't need to harvest - they upgrade using the room's energy
    const controllerPos = controller.pos;
    
    // Check if within range to upgrade (range 3 is max for upgradeController)
    const rangeToController = creep.pos.getRangeTo(controllerPos);
    if (rangeToController > 3)
    {
        // Move toward the controller without range restriction
        // This ensures we path directly to the controller, not just within 3 tiles
        creep.moveTo(controllerPos, { ignoreCreeps: true, reusePath: 5 });
    }
    else
    {
        creep.upgradeController(controller);
    }
}

/**
 * Upgrader creep role.
 *
 * Strictly two-phase (owner rule #4): harvest from a source until the store
 * is full, then upgrade the controller until the store is empty. An upgrader
 * never withdraws from the spawn or an extension - doing so would steal the
 * energy the harvesters just delivered and starve creep respawns. It also
 * never walks to the controller while empty: an empty upgrader standing at
 * the controller does nothing, and an idle creep is a bug.
 */

/**
 * Runs the upgrader role for one tick.
 *
 * Order of checks:
 *   1. Carrying energy: upgrade the controller (walk towards it when out of
 *      range; the upgrader stays within range 3 and rarely needs to move).
 *   2. Empty store: harvest from a source and stay there until the store is
 *      full, so the upgrader always upgrades with energy it harvested itself.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const room = creep.room;
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;

    // --- Phase 1: carry energy -> upgrade the controller ---
    if (energy > 0)
    {
        creep.memory.working = true;

        const controller = room.controller;
        if (controller !== undefined && controller.my)
        {
            const upgradeResult = creep.upgradeController(controller);
            if (upgradeResult === OK)
            {
                return;
            }

            if (upgradeResult === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller, { reusePath: 20, range: 3 });
                return;
            }

            // ERR_NOT_ENOUGH_RESOURCES (store below one upgrade tick's cost)
            // or ERR_INVALID_TARGET: fall through and harvest more.
        }
    }
    else
    {
        // Empty store: switch back to harvesting. This also fixes the old
        // state where an upgrader that used its last energy with
        // working=true still set idled forever (nothing reset the flag).
        creep.memory.working = false;
    }

    // --- Phase 2: harvest from a source, stay until the store is full ---
    const sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length > 0)
    {
        const source = creep.pos.findClosestByPath(sources);
        if (source !== null)
        {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(source, { reusePath: 20 });
            }
        }
    }
}

/**
 * Upgrader creep role.
 *
 * Strictly two-phase (owner rule #4): harvest from a source until the store
 * is full, then upgrade the controller until the store is empty. An upgrader
 * never withdraws from the spawn or an extension - doing so would steal the
 * energy the harvesters just delivered and starve creep respawns. It also
 * never walks to the controller while empty: an empty upgrader standing at
 * the controller does nothing, and an idle creep is a bug.
 *
 * Source choice: the source nearest the controller (Chebyshev), because the
 * upgrader's loop is fixed at source <-> controller and that minimises its
 * travel. findClosestByPath must not pick the source: it prices swamp tiles
 * 10x plain, and in the test world the spawn-side source sits in a swamp
 * pocket, so the path cost calls the far source "closest" and the upgrader
 * burns its whole life crossing the room (measured: zero upgrades in the
 * 500-tick smoke window that way). See utils/pickSource.
 */

import { pickSourceClosestTo } from "utils/pickSource";

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

    // --- Phase 2: harvest from the source nearest the controller ---
    const sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length > 0)
    {
        // Anchor on the controller: the upgrader repeats this exact round
        // trip for its whole life, so the nearest source to the controller
        // is the cheapest one it can serve (see the file header).
        let source: Source | null = null;
        const controller = room.controller;
        if (controller !== undefined)
        {
            source = pickSourceClosestTo(sources, controller.pos);
        }
        if (source === null)
        {
            source = creep.pos.findClosestByPath(sources);
        }

        if (source !== null)
        {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(source, { reusePath: 20 });
            }
        }
    }
}

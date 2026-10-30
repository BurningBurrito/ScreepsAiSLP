/**
 * Upgrader creep role.
 *
 * Two phases, driven by the store (an upgrader never withdraws from the spawn
 * or an extension - doing so would steal the energy the harvesters just
 * delivered and starve creep respawns):
 *   1. Harvest phase: fill the store from a source, not one tick at a time.
 *      The old code upgraded as soon as the store held a single energy, so a
 *      [WORK, CARRY, MOVE] upgrader harvested one tick, upgraded two, and
 *      spent most of its life walking; filling the store first is what makes
 *      the round trip pay for itself.
 *   2. Upgrade phase: burn the store at the controller (stays within range 3).
 *
 * A half-full store at a depleted source still leaves (PARTIAL_DELIVERY_FRACTION):
 * carrying it to the controller beats idling here until the 300-tick refill.
 *
 * Source choice: the source nearest the controller (Chebyshev) that still has
 * a free tile to stand on, latched in memory for the whole work cycle. The
 * distance minimises the fixed source <-> controller round trip; the
 * standable-tile filter matters because the test world's spawn-side source
 * sits in a wall pocket with exactly two standable tiles - once the harvester
 * and another creep park there, the upgrader gets no path through the pocket.
 * The latch is the important part: re-picking the source every tick against
 * transient occupancy made the upgrader oscillate ~30 tiles between the two
 * sources (measured: x=29<->x=37, zero controller progress) as the builder
 * toggled its pocket tile between harvest and build. The source is (re-)chosen
 * only on the transition tick that empties the store after an upgrade (a new
 * cycle), or when the latched source vanishes, or it runs dry while another
 * source is live. Re-picking on an empty store alone would re-trigger on every
 * tick of the long return walk and re-create the oscillation. See pickSource.
 */

import { pickSourceWithStandableTile, sortSourcesByDistance } from "utils/pickSource";
import { PARTIAL_DELIVERY_FRACTION } from "config";
import { moveToToward } from "utils/movement";

/**
 * Runs the upgrader role for one tick.
 *
 * Order of checks:
 *   1. Pick the harvest target (source nearest the controller, from the
 *      active sources; the nearest of all when both are dry - it refills on
 *      the 300-tick cycle).
 *   2. Phase switch: harvest until full (or a partial load at a dry source);
 *      upgrade while carrying.
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const room = creep.room;
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;
    const capacity = creep.store.getCapacity(RESOURCE_ENERGY);
    const controller = room.controller;

    // Harvest target: the source nearest the controller (the upgrader repeats
    // this exact round trip for its whole life, see the file header), with a
    // free tile to stand on (a creep cannot harvest a source it cannot stand
    // next to). The choice is latched in memory.sourceId for the whole work
    // cycle and re-made only on the transition tick that empties the store
    // after an upgrade (working is still true, the phase switch below flips
    // it), or when the latched source vanishes or runs dry while another
    // source is live. One room.find plus two terrain probes, no pathfinding.
    const sources = room.find(FIND_SOURCES);
    const activeSources = sources.filter((candidate) => candidate.energy > 0);
    const pool = activeSources.length > 0 ? activeSources : sources;
    const latchedId = creep.memory.sourceId;
    const latched = latchedId !== undefined
        ? sources.find((candidate) => candidate.id === latchedId)
        : undefined;
    const latchedUsable = latched !== undefined
        && (latched.energy > 0 || activeSources.length === 0);
    let source: Source | null;
    if (latched === undefined || !latchedUsable || (creep.memory.working === true && energy === 0))
    {
        const anchor = controller !== undefined ? controller.pos : creep.pos;
        source = pickSourceWithStandableTile(sortSourcesByDistance(pool, anchor), room, creep.id);
        creep.memory.sourceId = source !== null ? source.id : undefined;
    }
    else
    {
        source = latched;
    }

    // Phase switch. Harvest until full, or until the source ran dry with a
    // load worth carrying; upgrade while carrying, back to harvesting at an
    // empty store.
    const partialWorthUpgrading =
        source !== null && source.energy === 0 && energy >= capacity * PARTIAL_DELIVERY_FRACTION;
    if (!creep.memory.working && (energy >= capacity || partialWorthUpgrading))
    {
        creep.memory.working = true;
    }
    else if (creep.memory.working && energy === 0)
    {
        creep.memory.working = false;
    }

    if (!creep.memory.working)
    {
        // Harvest phase: fill the store, then walk.
        if (source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, source, 1);
        }
        // Dry source below the partial threshold: stand here and retry -
        // nothing else to do until the refill.
        return;
    }

    // Upgrade phase: burn the store at the controller.
    if (controller === undefined || !controller.my)
    {
        return;
    }
    const upgradeResult = creep.upgradeController(controller);
    if (upgradeResult === ERR_NOT_IN_RANGE)
    {
        moveToToward(creep, controller, 3);
    }
    // OK, ERR_NOT_ENOUGH_RESOURCES (store below one upgrade tick's cost -
    // the phase switch catches it on the next tick) or ERR_INVALID_TARGET:
    // nothing else to do this tick.
}

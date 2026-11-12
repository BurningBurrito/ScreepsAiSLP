/**
 * Upgrader creep role.
 *
 * While the tower is still a site (M3) the upgrader pauses RCL work and runs
 * the builder role instead: the tower is a 5,000-energy structure the M3
 * window must finish, and a fourth builder is what makes it. From M5 on every
 * other site type - extension, container, road - no longer pauses it, because
 * the colony's long-term growth is RCL and the M5 test measures controller
 * progress per tick. This turns the upgrader into a fourth builder only while
 * the tower is being built; the moment the tower is finished it resumes
 * upgrading.
 *
 * Two phases, driven by the memory.working latch, which only the store flips
 * (an upgrader never withdraws from the spawn or an extension - doing so
 * would steal the energy the harvesters just delivered and starve creep
 * respawns):
 *   1. Fetch phase (working = false, store empty): refill from a container -
 *      a nearby drop, the controller container, the fullest source container
 *      (getEnergy, utils/energy.ts). The source harvest cycle runs only when
 *      no container holds energy, and fills the store in one go - the old
 *      one-tick-at-a-time code had a [WORK, CARRY, MOVE] upgrader harvest one
 *      tick, upgrade two, and spend most of its life walking.
 *   2. Upgrade phase (working = true): burn the store at the controller
 *      (stays within range 3). The latch closes only when the store is EMPTY:
 *      the v9.3 code asked getEnergy before the latch, so an upgrader that
 *      had spent even one energy walked back for a top-up after every single
 *      upgrade - walk, withdraw, walk back, upgrade one tick, repeat. That
 *      pinned the M5 gate's upgradePerTick at 0.05 while the containers sat
 *      full (owner feedback v9.4, URGENT 1).
 *
 * A half-full store at a depleted source still leaves (PARTIAL_DELIVERY_FRACTION):
 * carrying it to the controller beats idling here until the 300-tick refill.
 *
 * From M5 (owner feedback 2026-11-09, idea d) there is a preferred third
 * cycle: while the controller container (rung 4 of the builder's ladder,
 * placed by constructionManager) exists and still holds energy, it is the
 * upgrader's fuel stop. The upgrader stands ON the container's tile - within
 * CONTROLLER_CONTAINER_RANGE of the controller, so the upgrade works from
 * there - withdraws while the store has space and upgrades while it doesn't:
 * one action per tick, no walking. That takes the upgrader's round trips out
 * of the source area, where its traffic was what starved the miners of their
 * pocket tiles (the M5 mined-share criterion). Only when the container runs
 * empty does the source cycle below run; the haulers refill the container
 * last of all (hauler.ts), so the source path stays the robust fallback.
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

import { CONTROLLER_SIGN_TEXT, PARTIAL_DELIVERY_FRACTION } from "config";
import { hasPriorityBuildSites, runBuilder } from "roles/builder";
import { pickSourceWithStandableTile, sortSourcesByDistance } from "utils/pickSource";
import { getEnergy } from "utils/energy";
import { moveToToward } from "utils/movement";

/**
 * Runs the upgrader role for one tick.
 *
 * Order of checks:
 *   0. While a tower or extension site exists, build instead (see the file
 *      header): the WORK energy goes into the construction, not RCL.
 *   1. Latch (owner feedback v9.4, URGENT 1): an empty store closes the work
 *      cycle (working = false), a full store opens it (working = true).
 *      Everything in between is pure upgrading - getEnergy is NOT consulted
 *      mid-cycle, which is what stops the one-tick-at-a-time top-up walks.
 *   2. Fetch phase (working = false): getEnergy (utils/energy.ts) feeds the
 *      store from a nearby drop, the controller container (the fuel stop, M5 /
 *      2026-11-09 idea d) or the fullest source container; the source cycle
 *      runs only when no container holds energy.
 *   3. Pick the harvest target (source nearest the controller, from the
 *      active sources; the nearest of all when both are dry - it refills on
 *      the 300-tick cycle).
 * @param creep The upgrader creep to run
 */
export function runUpgrader(creep: Creep): void
{
    const room = creep.room;

    // M3/M5: while the tower is still a site, the upgrader is a fourth
    // builder (the 5,000-energy tower needs the extra WORK to finish inside
    // the M3 window). From M5 on every other site type - extension,
    // container, road - no longer pauses it: the M5 test measures controller
    // progress per tick, and the builders alone keep the build queue moving.
    // runBuilder handles the whole cycle (build, self-harvest, withdraw only
    // when the room is full) and shares the memory.working carry-state flag
    // this role already uses.
    if (hasPriorityBuildSites(room))
    {
        runBuilder(creep);
        return;
    }

    const energy = creep.store[RESOURCE_ENERGY] ?? 0;
    const capacity = creep.store.getCapacity(RESOURCE_ENERGY);
    const controller = room.controller;

    // Work latch (owner feedback v9.4, URGENT 1): the store alone flips it.
    // An empty store closes the cycle (the transition tick - this is also
    // when the harvest source is re-picked below); a full store opens it.
    // Everything in between is pure upgrading: getEnergy is only consulted
    // in the fetch phase, so a half-full store no longer sends the upgrader
    // back for a one-energy top-up. The v9.3 code asked getEnergy BEFORE
    // this latch, so an upgrader that had spent even one energy left the
    // controller on every single upgrade tick - walk, withdraw, walk back,
    // upgrade one tick, repeat (M5 upgradePerTick 0.05 with full
    // containers).
    const cycleClosed = creep.memory.working === true && energy === 0;
    if (cycleClosed)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && energy >= capacity)
    {
        creep.memory.working = true;
    }

    if (creep.memory.working)
    {
        // Upgrade phase: burn the store at the controller. Shared with the
        // controller-container cycle - see upgradeFromHere.
        upgradeFromHere(creep, controller);
        return;
    }

    // Fetch phase: getEnergy (utils/energy.ts, owner feedback 2026-11-10
    // cause 1; see utils/energy.ts for the full order and its history)
    // feeds the store from a nearby drop, the controller container (the
    // upgrader's fuel stop - it stands ON the tile, within
    // CONTROLLER_CONTAINER_RANGE of the controller, so the upgrade works
    // from there), then the fullest source container above
    // MIN_CONTAINER_WITHDRAW_ENERGY. Only "harvest" falls through to the
    // source cycle below, and only when no container holds energy at all:
    // with a trickle in a container the miner tops it back up within a few
    // ticks, so the cycle idles out this tick instead of walking.
    if (getEnergy(creep, "upgrader") !== "harvest")
    {
        return;
    }

    // Harvest target: the source nearest the controller (the upgrader repeats
    // this exact round trip for its whole life, see the file header), with a
    // free tile to stand on (a creep cannot harvest a source it cannot stand
    // next to). The choice is latched in memory.sourceId for the whole work
    // cycle and re-made only on the transition tick that empties the store
    // after an upgrade (cycleClosed above), or when the latched source
    // vanishes or runs dry while another source is live. One room.find plus
    // two terrain probes, no pathfinding.
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
    if (latched === undefined || !latchedUsable || cycleClosed)
    {
        const anchor = controller !== undefined ? controller.pos : creep.pos;
        source = pickSourceWithStandableTile(sortSourcesByDistance(pool, anchor), room, creep.id);
        creep.memory.sourceId = source !== null ? source.id : undefined;
    }
    else
    {
        source = latched;
    }

    // A half-full store at a depleted source still leaves
    // (PARTIAL_DELIVERY_FRACTION): carrying it to the controller beats
    // idling here until the 300-tick refill. The only flip the latch does
    // here - the full-store flip happened at the top of the function.
    if (source !== null && source.energy === 0 && energy >= capacity * PARTIAL_DELIVERY_FRACTION)
    {
        creep.memory.working = true;
    }

    if (!creep.memory.working)
    {
        // Fetch, harvest cycle: fill the store, then walk.
        if (source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, source, 1);
        }
        // Dry source below the partial threshold: stand here and retry -
        // nothing else to do until the refill.
        return;
    }

    // Upgrade phase: burn the store at the controller. Shared with the
    // controller-container cycle - see upgradeFromHere.
    upgradeFromHere(creep, controller);
}

/**
 * Upgrades the controller from the creep's current position, applying the
 * owner sign first when it is missing or stale.
 *
 * Controller sign (owner request, feedback 2026-11-02): every owned room
 * carries the fixed project sign, and the upgrader is the creep that already
 * parks at the controller - a harvester is never diverted for it. The sign
 * lives 50,000 ticks, so the cost is one action when it is missing or wrong;
 * when the text is already right this is a single string compare and the
 * upgrade below runs untouched (never re-sign). signController needs range 1
 * while the upgrade stops at range 3, so a pending sign walks in two tiles
 * closer first; the tick after the sign lands, the text check passes and the
 * upgrade resumes.
 *
 * Both energy cycles share this tail: the source cycle walks to range 3 of
 * the controller, the controller-container cycle stands on the container
 * tile within CONTROLLER_CONTAINER_RANGE of it - either way the only walk
 * happens while the creep is still on the way.
 * @param creep The upgrader holding energy
 * @param controller The room controller, when in vision
 */
function upgradeFromHere(creep: Creep, controller: StructureController | undefined): void
{
    if (controller === undefined || !controller.my)
    {
        return;
    }

    if (controller.sign === undefined || controller.sign.text !== CONTROLLER_SIGN_TEXT)
    {
        if (creep.signController(controller, CONTROLLER_SIGN_TEXT) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, controller, 1);
        }
        // One action per tick: the sign counts, the upgrade follows next tick.
        return;
    }

    const upgradeResult = creep.upgradeController(controller);
    if (upgradeResult === ERR_NOT_IN_RANGE)
    {
        moveToToward(creep, controller, 3);
    }
    // OK, ERR_NOT_ENOUGH_RESOURCES (store below one upgrade tick's cost -
    // the caller re-routes on the next tick) or ERR_INVALID_TARGET:
    // nothing else to do this tick.
}

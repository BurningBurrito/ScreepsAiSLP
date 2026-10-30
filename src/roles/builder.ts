/**
 * Builder creep role.
 *
 * Energy loop (owner rule #3):
 *   A builder only withdraws energy from the spawn or an extension when the
 *   room is completely full. In every other situation it harvests from a
 *   source itself and stays there until its store is full. This is what keeps
 *   the spawn stocked: a builder that drains the spawn whenever it has free
 *   carry capacity empties it and blocks every creep respawn.
 *
 * Build priority (M3):
 *   1. The tower site, on its own: it is a single 5,000-energy structure
 *      and the M3 test fails unless it is finished. With every builder on
 *      it, the tower completes first and only then do builders spread over
 *      the 3,000-energy extensions.
 *   2. Extension sites (closest wins).
 *   3. Road sites.
 *   4. Container sites.
 *
 *   The tower used to share its class with the extensions ("closest
 *   priority site wins"), and that is exactly how it starved in the first
 *   M3 attempt: builders cluster on the closest extensions and finish all
 *   of them before the tower gets a full build cycle - measured 4,959 of
 *   5,000 tower progress at the end of the window. Tower-own-class is the
 *   fix (acceptance failure of 2026-10-30).
 *
 *   Roads sit above containers because that is the only moment they get
 *   built at all: in bootstrap (no tower or extension site yet) the first
 *   finished road is what M2 measures within 3,000 ticks of an RCL 1 start,
 *   and while priority sites exist, builders never reach the road list -
 *   the 3,000-energy extension sites keep them busy for the whole M3 window.
 *   Containers are the long-term fallback; M4 redesigns logistics around
 *   them and revisits this order.
 *
 * With no sites left, a builder upgrades the controller instead of idling
 * (an idle creep is a bug).
 *
 * Self-harvest source choice: the source nearest the spawn (Chebyshev) that
 * still has a free tile to stand on - except the upgrader's source. The
 * upgrader anchors on the controller and harvests the source nearest it (see
 * upgrader.ts); that source's standable tiles are scarce (the test world's
 * pocket source has exactly two, one owned by a harvester), so a builder that
 * self-harvests there permanently blocks the upgrader (the controller-progress
 * regression: 50 total -> 0 in 700 ticks). The builder therefore ranks the
 * upgrader's source last and takes the other one, falling back to the
 * upgrader's only when the other has no free tile. The standable-tile filter
 * still applies (see utils/pickSource).
 */

import { pickSourceWithStandableTile, sortSourcesByDistance } from "utils/pickSource";
import { moveToToward } from "utils/movement";

/**
 * Selects the next construction site for a builder.
 *
 * Priority: tower sites, then extension sites, then roads, then containers.
 * Within a priority class the closest site (by path) wins, so distance is a
 * tie-breaker, never the first choice.
 * @param creep The builder that needs a target (used for pathing)
 * @param room The room to search
 * @returns The selected site, or null when nothing is under construction
 */
function selectBuildSite(creep: Creep, room: Room): ConstructionSite | null
{
    const sitesOf = (type: BuildableStructureConstant): ConstructionSite[] =>
        room.find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => site.structureType === type,
        });

    // The tower gets its own class above the extensions (see the file
    // header for why): all builders on the one 5,000-energy tower site
    // finish it first, then spread over the extensions.
    const towerSites = sitesOf(STRUCTURE_TOWER);
    if (towerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(towerSites);
    }

    const extensionSites = sitesOf(STRUCTURE_EXTENSION);
    if (extensionSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(extensionSites);
    }

    // Roads come before containers: in bootstrap (no tower or extension
    // site) the first finished road is what M2 measures within 3,000 ticks
    // of an RCL 1 start, and while priority sites exist builders never
    // reach this list again. Containers are the long-term fallback (M4).
    const roadSites = sitesOf(STRUCTURE_ROAD);
    if (roadSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(roadSites);
    }

    const containerSites = sitesOf(STRUCTURE_CONTAINER);
    if (containerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(containerSites);
    }

    return null;
}

/**
 * Checks whether the room has a priority build site: an unfinished tower or
 * extension. The upgrader uses this to pause RCL work and help building
 * instead (see upgrader.ts), so the WORK energy goes into the structures
 * the milestone actually needs rather than into the controller.
 * @param room The room to search
 * @returns True when at least one tower or extension site exists
 */
export function hasPriorityBuildSites(room: Room): boolean
{
    return room.find(FIND_CONSTRUCTION_SITES).some(
        (site) => site.structureType === STRUCTURE_TOWER
            || site.structureType === STRUCTURE_EXTENSION,
    );
}

/**
 * Runs the builder role for one tick.
 *
 * Order of checks:
 *   1. Carrying energy: build the highest-priority site (fall back to
 *      upgrading the controller when no site exists).
 *   2. Not carrying: pick up dropped energy when there is some next to us.
 *   3. Not carrying and the room is completely full: withdraw from the
 *      spawn, then from an extension (owner rule #3 - the only case where a
 *      builder may take energy from a structure).
 *   4. Otherwise: harvest from a source and stay there until the store is
 *      full, so the builder always spends energy it harvested itself.
 * @param creep The builder creep to run
 */
export function runBuilder(creep: Creep): void
{
    const room = creep.room;
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;

    // --- Phase 1: spend the energy we carry (build first, then upgrade) ---
    if (energy > 0)
    {
        creep.memory.working = true;

        const site = selectBuildSite(creep, room);
        if (site !== null)
        {
            const buildResult = creep.build(site);
            if (buildResult === OK)
            {
                return;
            }

            if (buildResult === ERR_NOT_IN_RANGE)
            {
                moveToToward(creep, site, 3);
                return;
            }

            // ERR_NOT_ENOUGH_RESOURCES (store below one build tick's cost) or
            // ERR_INVALID_TARGET (the site vanished): fall through and refill.
        }
        else
        {
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
                    moveToToward(creep, controller, 3);
                    return;
                }
            }
        }
    }
    else
    {
        // Empty store: back to collecting. This also clears the old state
        // where a builder that built away its last energy with working=true
        // still set idled forever (nothing ever reset the flag).
        creep.memory.working = false;
    }

    // --- Phase 2: refill the store ---

    // Quick win: dropped energy on the ground, only when we have space.
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    {
        const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if (dropped !== null && dropped.resourceType === RESOURCE_ENERGY && dropped.amount > 0)
        {
            if (creep.pickup(dropped) === ERR_NOT_IN_RANGE)
            {
                moveToToward(creep, dropped, 1);
            }
            return;
        }
    }

    // Withdraw from structures only when the room is completely full.
    // Any earlier withdrawal would steal energy the harvesters just delivered
    // and the spawn would starve (owner rule #3).
    if (room.energyAvailable >= room.energyCapacityAvailable)
    {
        const spawns = room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
        {
            if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            {
                if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, spawn, 1);
                }
                return;
            }
        }

        const extensions = room.find(FIND_MY_STRUCTURES, {
            filter: (structure): structure is StructureExtension => structure.structureType === STRUCTURE_EXTENSION,
        });
        for (const extension of extensions)
        {
            if (extension.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            {
                if (creep.withdraw(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, extension, 1);
                }
                return;
            }
        }

        // The room is full but no structure has free capacity: nothing to
        // withdraw, fall through and harvest (sites and the controller still
        // absorb energy, so harvesting is never wasted).
    }

    // Harvest from a source and stay there until the store is full.
    // The builder's loop is anchored at the spawn (its energy comes from
    // there and its sites sit on the road network around it), so rank the
    // sources by distance to the spawn - not by path cost, which the swamp
    // pocket around the spawn-side source distorts (see the file header).
    //
    // Yield the upgrader's source: the upgrader anchors on the controller and
    // harvests the source nearest it (see upgrader.ts). That source's standable
    // tiles are scarce, so a builder that camps it blocks the upgrader
    // (the controller-progress regression). Rank the upgrader's source last;
    // the builder takes the other source and falls back to the upgrader's only
    // when the other has no free tile.
    const sources = room.find(FIND_SOURCES_ACTIVE);
    if (sources.length > 0)
    {
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const controller = room.controller;
        const anchor = spawn !== undefined
            ? spawn.pos
            : controller !== undefined ? controller.pos : null;
        if (anchor !== null)
        {
            let candidates = sortSourcesByDistance(sources, anchor);
            if (controller !== undefined && sources.length > 1)
            {
                const upgraderSource = sortSourcesByDistance(sources, controller.pos)[0];
                candidates = [
                    ...candidates.filter((candidate) => candidate.id !== upgraderSource.id),
                    upgraderSource,
                ];
            }
            // Nearest the spawn first (upgrader's source last), then the
            // standable-tile filter: a builder that cannot stand next to its
            // source would oscillate at the entrance (measured 50+ ticks) and
            // harvest nothing.
            const source = pickSourceWithStandableTile(candidates, room, creep.id);
            if (source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
            {
                moveToToward(creep, source, 1);
            }
        }
    }
}

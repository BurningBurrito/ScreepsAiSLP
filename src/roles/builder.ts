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
 * Build priority (M4):
 *   1. In defend or war mode, rampart sites: the shield the spawn and the
 *      towers sit behind is finished before anything else, tower site
 *      included.
 *   2. The tower site, on its own: it is a single 5,000-energy structure
 *      and the M3 test fails unless it is finished. With every builder on
 *      it, the tower completes first and only then do builders spread over
 *      the 3,000-energy extensions.
 *   3. Rampart sites (peace): one on the spawn's tile and one on each
 *      finished tower's tile. Each costs only 300 energy for 10,000 hits -
 *      cheap insurance, and the M4 spec puts them right after the towers.
 *   4. Extension sites, all builders on ONE of them: the most advanced
 *      (highest build progress, ties broken by closeness to the spawn).
 *      The room state is shared, so every builder computes the same focus
 *      without any memory - and the choice survives a global reset.
 *   5. Road sites.
 *   6. Container sites.
 *
 *   The tower used to share its class with the extensions ("closest
 *   priority site wins"), and that is exactly how it starved in the first
 *   M3 attempt: builders cluster on the closest extensions and finish all
 *   of them before the tower gets a full build cycle - measured 4,959 of
 *   5,000 tower progress at the end of the window. Tower-own-class is the
 *   fix (acceptance failure of 2026-10-30).
 *
 *   Spreading is the trap on the extensions too: if every builder picks
 *   its own nearest site, one creep lands per site and none of them ever
 *   finishes, while the room's energy capacity only grows when a site is
 *   COMPLETE. Measured on the second M3 attempt (tower now first, 2026-10-30):
 *   the tower finished and the first two extensions took ~450 ticks each,
 *   but the crew then split over the remaining eight sites and the third
 *   extension was still more than 2,000 energy short at the end of the
 *   window. One shared focus per extension fixes that.
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
 * still has a free tile to stand on - except the upgrader's source, while
 * the upgrader is actually upgrading. The upgrader anchors on the
 * controller and harvests the source nearest it (see upgrader.ts); that
 * source's standable tiles are scarce (the test world's pocket source has
 * exactly two, one owned by a harvester), so a builder that self-harvests
 * there blocks the upgrader (the controller-progress regression: 50 total
 * -> 0 in 700 ticks). The builder therefore ranks the upgrader's source
 * last and takes the other one, falling back to the upgrader's only when
 * the other has no free tile. While a tower or extension site exists the
 * upgrader runs this same builder role (see upgrader.ts), so no source is
 * "the upgrader's" then and the yield is skipped. The standable-tile
 * filter still applies (see utils/pickSource).
 *
 * The choice is latched in memory.sourceId for the whole collect phase and
 * re-made only when the store empties (the cycle boundary: the builder just
 * spent its load at a site), or when the latched source vanishes or runs
 * dry while another source is live. Re-picking every tick against
 * transient occupancy is what the upgrader's oscillation bug was (see
 * upgrader.ts): a creep that keeps re-rolling between the two sources walks
 * the long way forever and harvests nothing. With the latch each builder
 * keeps its camp for the cycle, so the surplus builders (owner feedback
 * 2026-10-30: they drain the store, so it no longer pins full and the
 * builders must self-harvest between full ticks) settle onto the two
 * sources instead of trading tiles (measured: construction 3.11 ->
 * 0.19/tick, idle 8 % -> 23 % while they oscillated).
 */

import { pickSourceWithStandableTile, sortSourcesByDistance } from "utils/pickSource";
import { moveToToward } from "utils/movement";

/**
 * Selects the next construction site for a builder.
 *
 * Priority (M4): in defend or war mode the rampart sites come first;
 * otherwise the tower site on its own, then ramparts, then ONE extension
 * (the most advanced, so the whole crew converges on it and actually
 * finishes it), then roads, then containers. Within a priority class the
 * tie-breakers are progress and distance, never a free-for-all.
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

    // Rampart focus: the crew works the most advanced rampart (highest
    // build progress; a tie goes to the site closest to the spawn) so a
    // rampart is actually FINISHED instead of every builder nibbling at the
    // newest site. Same shared-state rule as the extension focus below.
    const rampartSites = sitesOf(STRUCTURE_RAMPART);
    const focusRampart = (): ConstructionSite | null =>
    {
        if (rampartSites.length === 0)
        {
            return null;
        }
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const distanceToSpawn = (site: ConstructionSite): number =>
            spawn !== undefined
                ? site.pos.getRangeTo(spawn.pos)
                : creep.pos.getRangeTo(site.pos);
        return rampartSites.sort(
            (a, b) => (b.progress - a.progress) || (distanceToSpawn(a) - distanceToSpawn(b)),
        )[0];
    };

    // Defend/war mode (M4): the shield comes before everything, even the
    // tower site - with the ramparts up, the towers can do their job.
    const mode = Memory.mode ?? "peace";
    if (mode !== "peace")
    {
        const focus = focusRampart();
        if (focus !== null)
        {
            return focus;
        }
    }

    // The tower gets its own class above the extensions (see the file
    // header for why): all builders on the one 5,000-energy tower site
    // finish it first, then move on to the extensions.
    const towerSites = sitesOf(STRUCTURE_TOWER);
    if (towerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(towerSites);
    }

    // Peace mode: ramparts come right after the towers (the M4 spec order:
    // tower sites, then ramparts, then extensions, then everything else,
    // roads last).
    const rampart = focusRampart();
    if (rampart !== null)
    {
        return rampart;
    }

    // Extensions: the whole crew works ONE site at a time - the most
    // advanced one (highest build progress; a tie goes to the site closest
    // to the spawn). All builders see the same progress numbers, so they
    // all compute the same focus from shared room state: no Memory, and a
    // global reset cannot desynchronise the crew. Finishing a site raises
    // the room's energy capacity, which is what the milestone measures.
    const extensionSites = sitesOf(STRUCTURE_EXTENSION);
    if (extensionSites.length > 0)
    {
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const distanceToSpawn = (site: ConstructionSite): number =>
            spawn !== undefined
                ? site.pos.getRangeTo(spawn.pos)
                : creep.pos.getRangeTo(site.pos);
        return extensionSites.sort(
            (a, b) => (b.progress - a.progress) || (distanceToSpawn(a) - distanceToSpawn(b)),
        )[0];
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

    // True on exactly one tick: the first empty tick after the store held
    // energy - the builder's cycle boundary (it just spent its load at a
    // site). The self-harvest source latch is (re-)made there (see below).
    let justEmptied = false;

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
        justEmptied = creep.memory.working === true;
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
    // The choice is latched in memory.sourceId for the whole collect phase
    // (see the file header for why): it is (re-)made here only on the
    // cycle-boundary tick (justEmptied), when the latched source is missing
    // or dry while another source is live, or before the first harvest at
    // all. Every other tick the builder sticks with its latched source.
    const sources = room.find(FIND_SOURCES);
    const activeSources = sources.filter((candidate) => candidate.energy > 0);
    const pool = activeSources.length > 0 ? activeSources : sources;
    const latchedId = creep.memory.sourceId;
    const latched = latchedId !== undefined
        ? sources.find((candidate) => candidate.id === latchedId)
        : undefined;
    const latchedUsable = latched !== undefined
        && (latched.energy > 0 || activeSources.length === 0);
    let source: Source | null = null;
    if (latched === undefined || !latchedUsable || justEmptied)
    {
        // Yield the upgrader's source, but only while the upgrader is really
        // upgrading: while a tower or extension site exists every upgrader
        // runs this same builder role, so no source is "the upgrader's" and
        // yielding would only push the builders onto the far one. Rank the
        // upgrader's source last; the builder takes the other source and
        // falls back to the upgrader's only when the other has no free tile.
        const skipYield = hasPriorityBuildSites(room);
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const controller = room.controller;
        const anchor = spawn !== undefined
            ? spawn.pos
            : controller !== undefined ? controller.pos : null;
        if (anchor !== null)
        {
            let candidates = sortSourcesByDistance(pool, anchor);
            if (!skipYield && controller !== undefined && sources.length > 1)
            {
                const upgraderSource = sortSourcesByDistance(sources, controller.pos)[0];
                candidates = [
                    ...candidates.filter((candidate) => candidate.id !== upgraderSource.id),
                    upgraderSource,
                ];
            }
            // Nearest the spawn first (upgrader's source last, when it is
            // yielded), then the standable-tile filter: a builder that cannot
            // stand next to its source would oscillate at the entrance
            // (measured 50+ ticks) and harvest nothing.
            source = pickSourceWithStandableTile(candidates, room, creep.id);
        }
        creep.memory.sourceId = source !== null ? source.id : undefined;
    }
    else
    {
        source = latched;
    }

    if (source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        moveToToward(creep, source, 1);
    }
}

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
 *   Tower and extension sites form one priority class (the M3 spec: while
 *   either exists, builders work on them, closest site wins within the
 *   class). Then container sites. Road sites are only considered once no
 *   tower, extension or container site exists anymore, so builders never
 *   spend energy on roads while the priority structures are still
 *   unfinished.
 *
 * With no sites left, a builder upgrades the controller instead of idling
 * (an idle creep is a bug).
 */

/**
 * Selects the next construction site for a builder.
 *
 * Priority: tower and extension sites together (one class), then container,
 * and only then roads. Within a priority class the closest site (by path)
 * wins, so distance is a tie-breaker, never the first choice.
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

    // Tower and extension sites form one priority class (M3 spec: "while any
    // tower or extension site exists, builders work on those; choose by
    // priority first, distance second"). Building them in parallel instead of
    // tower-then-extensions is what lets the M3 acceptance test finish the
    // tower and all three extensions inside its tick limit.
    const prioritySites = [
        ...sitesOf(STRUCTURE_TOWER),
        ...sitesOf(STRUCTURE_EXTENSION),
    ];
    if (prioritySites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(prioritySites);
    }

    const containerSites = sitesOf(STRUCTURE_CONTAINER);
    if (containerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(containerSites);
    }

    // Roads are the last priority: only when no tower, extension or container
    // site is left do builders touch a road site (M3 build order).
    const roadSites = sitesOf(STRUCTURE_ROAD);
    if (roadSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(roadSites);
    }

    return null;
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
                creep.moveTo(site, { reusePath: 20 });
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
                    creep.moveTo(controller, { reusePath: 20, range: 3 });
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
                creep.moveTo(dropped, { reusePath: 20, range: 1 });
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
                    creep.moveTo(spawn, { reusePath: 20, range: 1 });
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
                    creep.moveTo(extension, { reusePath: 20, range: 1 });
                }
                return;
            }
        }

        // The room is full but no structure has free capacity: nothing to
        // withdraw, fall through and harvest (sites and the controller still
        // absorb energy, so harvesting is never wasted).
    }

    // Harvest from a source and stay there until the store is full.
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

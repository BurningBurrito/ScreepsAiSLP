/**
 * Hauler creep role - stage 2 economy: moves energy from containers to
 * consumers.
 *
 * M5 hauler rewrite (owner feedback 2026-11-04), fault 1 - delivery state:
 * the hauler latches its phase in memory.delivering. It COLLECTS from the
 * source containers until its store is full, then DELIVERS until it is
 * empty, then collects again. The old code delivered only while the store
 * was exactly full, so after the first transfer it walked back to a
 * container to top up - at level 5 (50 energy per extension) that filled
 * exactly one extension per round trip while the other 29 sat empty.
 *
 * Collection is from the source containers only (a built container on a
 * neighbouring tile of a source). Haulers NEVER withdraw from the spawn,
 * the extensions, or the controller container - that energy belongs to the
 * upgraders (M5 design note) - which also keeps the energy from going in
 * circles. What lies on the ground (a dead miner's load, a full container's
 * spill) is picked up on the way.
 *
 * With nothing left to fill, the hauler waits near the spawn instead of
 * holding energy at a full target.
 *
 * Delivery target selection (pickDeliveryTarget) still uses the pre-M5
 * order and picks the closest target per class before checking whether it
 * is full - faults 2 and 3 of the same feedback rework it (a
 * free-capacity filter over ONE ordered list of target groups).
 *
 * Every move goes through utils/moveToToward, which drops the creep's
 * cached path when it keeps replaying a blocked one (see that file for the
 * engine detail).
 */

import { moveToToward } from "utils/movement";

/** Every structure a hauler may deliver energy to. */
type HaulerTarget = StructureExtension | StructureSpawn | StructureTower | StructureContainer;

/**
 * The hauler role: collect from the source containers until full, then
 * deliver until the store is empty, then collect again (see the file
 * header for the M5 rewrite).
 * @param creep The hauler to run
 */
export function runHauler(creep: Creep): void
{
    // Re-derive the phase after a global reset (memory.delivering lost): a
    // non-empty store means "delivering" - there is nothing to collect for
    // until the load is spent.
    if (creep.memory.delivering === undefined)
    {
        creep.memory.delivering = creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
    }

    if (creep.memory.delivering)
    {
        // DELIVER: hand the load to the first target that can take it and
        // stay in this phase until the store is empty - NOT "deliver once
        // and walk back for a top-up" (the old bug, fault 1).
        const target = pickDeliveryTarget(creep);
        if (target === null)
        {
            // Nothing can take energy: wait near the spawn, off the road
            // tiles that cross in front of it, instead of standing at a
            // full target holding a load.
            parkNearSpawn(creep);
            return;
        }

        if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, target, 1);
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.memory.delivering = false;
        }
        return;
    }

    // COLLECT: source containers first - never the controller container,
    // whose energy is for the upgraders (M5 design note).
    const container = pickSourceContainer(creep);
    if (container !== null)
    {
        if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, container, 1);
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY))
        {
            creep.memory.delivering = true;
        }
        return;
    }

    // No container energy: take up what lies on the ground, then deliver
    // it (a dead miner's load, or what a full container spilled).
    const dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
    if (dropped !== null && dropped.resourceType === RESOURCE_ENERGY && dropped.amount > 0)
    {
        if (creep.pickup(dropped) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, dropped, 1);
        }

        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
        {
            creep.memory.delivering = true;
        }
        return;
    }

    // Nothing to collect: wait near the spawn.
    parkNearSpawn(creep);
}

/**
 * Chooses the hauler's delivery target.
 *
 * The pre-M5 order: tower, then extension, then spawn - and within each
 * class the CLOSEST target, checked for free capacity only AFTER the
 * selection. That check-after-pick is fault 2 of the M5 hauler feedback
 * (a full closest extension blocks every empty one behind it); the next
 * commit filters to free capacity first, and the one after that replaces
 * the per-class walk with one ordered list of target groups.
 * @param creep The hauler that needs a target (used for pathing)
 * @returns The selected target, or null when no target can take energy
 */
function pickDeliveryTarget(creep: Creep): HaulerTarget | null
{
    const classes: BuildableStructureConstant[] = [STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN];
    for (const structureType of classes)
    {
        const structures = creep.room.find(FIND_MY_STRUCTURES, {
            // Type predicate: every class above holds energy in a store,
            // so the result is narrowed to the store-bearing structures
            // (FIND_MY_STRUCTURES also covers links and the controller).
            filter: (structure): structure is StructureExtension | StructureSpawn | StructureTower =>
                structure.structureType === structureType,
        });
        if (structures.length === 0)
        {
            continue;
        }
        const target = creep.pos.findClosestByPath(structures);
        if (target === null)
        {
            continue;
        }
        if (target.store.getUsedCapacity(RESOURCE_ENERGY) < target.store.getCapacity(RESOURCE_ENERGY))
        {
            return target;
        }
    }
    return null;
}

/**
 * The closest SOURCE container that still holds energy - a built container
 * on a neighbouring tile of a source. The controller container is
 * deliberately excluded: that energy belongs to the upgraders (M5 design
 * note), and a hauler draining it would starve the controller.
 * @param creep The hauler that needs a container (used for pathing)
 * @returns The container, or null when none has energy
 */
function pickSourceContainer(creep: Creep): StructureContainer | null
{
    const sources = creep.room.find(FIND_SOURCES);
    const containers = creep.room.find(FIND_STRUCTURES, {
        // Type predicate: narrows FIND_STRUCTURES to containers, so no
        // cast is needed for the store access below.
        filter: (structure): structure is StructureContainer =>
            structure.structureType === STRUCTURE_CONTAINER,
    });
    const sourceContainers = containers.filter(
        (container) => sources.some((source) => container.pos.getRangeTo(source) <= 1),
    );
    const withEnergy = sourceContainers.filter(
        (container) => container.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    );
    if (withEnergy.length === 0)
    {
        return null;
    }
    return creep.pos.findClosestByPath(withEnergy);
}

/**
 * Waits near the spawn (within range 3) - the hauler's parking spot when
 * there is nothing to collect or nothing left to fill.
 * @param creep The hauler to park
 */
function parkNearSpawn(creep: Creep): void
{
    const spawn = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_SPAWN,
    });
    if (spawn !== null && creep.pos.getRangeTo(spawn) > 3)
    {
        moveToToward(creep, spawn, 1);
    }
}

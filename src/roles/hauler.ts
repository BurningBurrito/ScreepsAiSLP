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
 * Delivery target selection (pickDeliveryTarget) uses one unified ordered
 * list of target groups - every tower, then every extension, then the
 * spawn - and the free-capacity filter runs BEFORE the distance pick, so
 * a full closest target never shadows an emptier one (faults 2 and 3 of
 * the same feedback, fixed on top of this state machine).
 *
 * Every move goes through utils/moveToToward, which drops the creep's
 * cached path when it keeps replaying a blocked one (see that file for the
 * engine detail).
 */

import { CONTROLLER_CONTAINER_RANGE, TOWER_REFILL_PRIORITY_ENERGY } from "config";
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
 * Chooses the hauler's delivery target (M5 faults 2 and 3, fixed together).
 *
 * The targets are ONE ordered list of groups; the first group that still
 * has a target with free capacity wins, and within a group the CLOSEST
 * target is picked. The free-capacity filter runs BEFORE the distance pick
 * (fault 2), so a full closest target never shadows an emptier one further
 * away.
 *
 * The group order depends on the threat state (fault 3), because towers
 * always want energy (rampart and road repair) and would otherwise starve
 * the extensions:
 *   - peace: spawn and extensions, then towers below
 *     TOWER_REFILL_PRIORITY_ENERGY, then towers to full, then the
 *     controller container (the storage joins the end of this same list in
 *     M6 - that is why the order lives in one list in one function);
 *   - defend or war (Memory.mode, set by modeManager while a hostile has
 *     been seen): towers below the priority level first, then spawn and
 *     extensions, then the rest as in peace.
 *
 * The controller container is always LAST: the upgraders withdraw from it,
 * so it is filled only when everything else is full. (The hauler never
 * WITHDRAWS from it - that is the upgraders' energy, see the file header.)
 * @param creep The hauler that needs a target (used for pathing)
 * @returns The selected target, or null when no target can take energy
 */
function pickDeliveryTarget(creep: Creep): HaulerTarget | null
{
    const towers = creep.room.find(FIND_MY_STRUCTURES, {
        // Type predicates: FIND_MY_STRUCTURES also covers containers, links
        // and the controller, so each find narrows to its class.
        filter: (structure): structure is StructureTower =>
            structure.structureType === STRUCTURE_TOWER,
    });
    const extensions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure): structure is StructureExtension =>
            structure.structureType === STRUCTURE_EXTENSION,
    });
    const spawns = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure): structure is StructureSpawn =>
            structure.structureType === STRUCTURE_SPAWN,
    });
    const controllerContainer = pickControllerContainer(creep.room);

    const energy = (structure: HaulerTarget) => structure.store.getUsedCapacity(RESOURCE_ENERGY);
    const belowPriority = towers.filter((tower) => energy(tower) < TOWER_REFILL_PRIORITY_ENERGY);
    const toFull = towers.filter(
        (tower) => energy(tower) >= TOWER_REFILL_PRIORITY_ENERGY &&
            energy(tower) < tower.store.getCapacity(RESOURCE_ENERGY),
    );
    const economy = [...spawns, ...extensions];

    const defending = (Memory.mode ?? "peace") !== "peace";

    // ONE ordered list of target groups (fault 3): adding the storage in
    // M6 is a single push at the end, no role rewrite.
    const groups: HaulerTarget[][] = defending
        ? [belowPriority, economy, toFull]
        : [economy, belowPriority, toFull];
    if (controllerContainer !== null)
    {
        groups.push([controllerContainer]);
    }

    for (const group of groups)
    {
        // Fault 2: keep ONLY the targets that still have room, before the
        // distance pick below.
        const withFreeCapacity = group.filter(
            (structure) => energy(structure) < structure.store.getCapacity(RESOURCE_ENERGY),
        );
        if (withFreeCapacity.length === 0)
        {
            continue;
        }
        const target = creep.pos.findClosestByPath(withFreeCapacity);
        if (target !== null)
        {
            return target;
        }
    }
    return null;
}

/**
 * The built controller container - the one within CONTROLLER_CONTAINER_RANGE
 * of the controller - when it exists. It is the hauler's last delivery
 * target and the upgraders' fuel.
 * @param room The room to look in
 * @returns The container, or null when none is built yet
 */
function pickControllerContainer(room: Room): StructureContainer | null
{
    const controller = room.controller;
    if (controller === undefined || controller === null)
    {
        return null;
    }
    const candidates = room.find(FIND_STRUCTURES, {
        // Type predicate: narrows to the containers near the controller.
        filter: (structure): structure is StructureContainer =>
            structure.structureType === STRUCTURE_CONTAINER &&
            structure.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE,
    });
    return candidates.length > 0 ? candidates[0] : null;
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

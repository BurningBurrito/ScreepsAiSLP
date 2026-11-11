/**
 * Shared energy-source helper for the builder and upgrader roles.
 *
 * Both roles need the same question answered every tick their store has
 * free space: "where do I take my next energy from?" The old code answered
 * it twice, differently - the builder walked to a source to self-harvest
 * whenever a container held even a trickle of energy, while the upgrader
 * had its own controller-container branch (owner feedback 2026-11-10,
 * cause 1). One helper now owns the order, and the two roles keep their
 * self-harvest logic only as the final fallback:
 *
 *   1. A dropped energy pile within BUILDER_DROP_PICKUP_RANGE - it is
 *      already at the creep's feet and costs nothing to grab.
 *   2. Upgrader only: the controller container (rung 4). It is the
 *      upgrader's fuel stop - one withdraw per tick, no walking.
 *   3. Builder only: the spawn/extensions pool, but only above
 *      BUILDER_WITHDRAW_FRACTION and only while the upgrader AND the income
 *      crews are at minimum. Both are hold-backs that keep a capacity-sized
 *      replacement spawnable: the upgrader's (the M2 "no upgrader ever
 *      spawns" bug) and the income crew's (the M3 death spiral of
 *      2026-11-11: a dead harvester's 300-energy replacement waited for a
 *      store the builders kept draining below that cost, the crew
 *      ratcheted down, and the run ended with 2 creeps at tick 4000).
 *      The pool sits ABOVE the source container rung: the builder's build
 *      sites are on the road network around the spawn (M4: the tower, the
 *      ramparts, the extensions), so a full pool a few tiles away is worth
 *      more than a source container that is a ~25-tile round trip. On
 *      2026-11-11 the container-first order sent every builder refill to
 *      the source container as soon as it held 100 energy, and M4 finished
 *      with 1 of its 3 required extensions built (capacity 350 of 450).
 *   4. The source container with the most energy, but only while it holds
 *      at least MIN_CONTAINER_WITHDRAW_ENERGY: below that the round trip is
 *      not worth it against self-harvest, and the miner tops the container
 *      back up within a few ticks. For builders this rung is reached only
 *      while the pool is below the withdrawal floor, so the builder never
 *      takes a long container trip while energy sits at its build sites.
 *   5. Nothing above worked: harvest a source - UNLESS a container holds
 *      some energy below the threshold. Then the creep idles this tick:
 *      the miner (or a hauler) refills it within a few ticks, and
 *      walking to a source for a partial load is exactly the regression
 *      this helper removes.
 *
 * The helper is deliberately dumb about WHAT to do next: it returns an
 * outcome so the role keeps control of its own state (the builder's
 * harvest latch, the upgrader's source cycle).
 */

import {
    BUILDER_DROP_PICKUP_RANGE,
    BUILDER_WITHDRAW_FRACTION,
    CONTROLLER_CONTAINER_RANGE,
    MIN_CONTAINER_WITHDRAW_ENERGY,
} from "config";
import { incomeBelowMinimum, upgraderBelowMinimum } from "managers/spawnManager";
import { moveToToward } from "utils/movement";

/**
 * The roles this helper serves. Only these two ever call it: every other
 * role has its own energy economy (haulers deliver, miners mine).
 */
export type EnergyRole = "builder" | "upgrader";

/**
 * What the role should do with the rest of its tick.
 * - "acted": this tick was spent on a pickup or withdraw (or moving toward
 *   one) - the role does nothing else.
 * - "wait": a container holds energy but below MIN_CONTAINER_WITHDRAW_ENERGY;
 *   idling one tick beats a round trip for a partial load.
 * - "harvest": nothing else worked; the role runs its own self-harvest logic.
 */
export type EnergyOutcome = "acted" | "wait" | "harvest";

/**
 * Gets energy for a builder or upgrader with a store that has free space.
 *
 * Tries, in order: a nearby drop, the upgrader's controller container,
 * the spawn/extensions pool (builders only, above BUILDER_WITHDRAW_FRACTION,
 * while the upgrader and the income crews are at minimum), and the fullest
 * source container
 * (>= MIN_CONTAINER_WITHDRAW_ENERGY). Returns "harvest" only when no
 * container holds any energy at all; a container holding some energy below
 * the threshold yields "wait" (the miner refills it within a few ticks).
 *
 * CPU note: this runs at most once per creep per tick (only while the
 * store has free space), and each room.find here is the same single find
 * the role would have issued itself.
 * @param creep The builder or upgrader creep to feed
 * @param role Which role is asking (selects the role-specific branches)
 * @returns "acted", "wait" or "harvest" - see EnergyOutcome
 */
export function getEnergy(creep: Creep, role: EnergyRole): EnergyOutcome
{
    const room = creep.room;

    // A full store has no energy problem; the role handles its full-store
    // phase itself. (Callers only reach here with free space, but the
    // helper must be safe on its own.)
    if (creep.store.getFreeCapacity(RESOURCE_ENERGY) <= 0)
    {
        return "acted";
    }

    // 1. A drop within reach: already at the creep's feet.
    const dropped = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    if (dropped !== null
        && dropped.resourceType === RESOURCE_ENERGY
        && dropped.amount > 0
        && creep.pos.getRangeTo(dropped) <= BUILDER_DROP_PICKUP_RANGE)
    {
        if (creep.pickup(dropped) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, dropped, 1);
        }
        return "acted";
    }

    // 2. Upgrader only: the controller container is its fuel stop - the
    //    upgrader stands ON its tile (range 0) so the upgrade works from
    //    there (see the file header in roles/upgrader.ts).
    const controllerContainer = role === "upgrader" ? findControllerContainer(room) : null;
    if (controllerContainer !== null
        && controllerContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    {
        if (creep.pos.getRangeTo(controllerContainer) > 0)
        {
            moveToToward(creep, controllerContainer, 0);
        }
        else
        {
            creep.withdraw(controllerContainer, RESOURCE_ENERGY);
        }
        return "acted";
    }

    // 3. Builder only: the spawn/extensions pool, above the floor, and only
    //    while the upgrader AND the income crews are at minimum. Both are
    //    hold-backs that keep a capacity-sized replacement spawnable (see
    //    managers/spawnManager.ts): the upgrader's from the M2 "no
    //    upgrader ever spawns" bug, the income crew's from the M3 death
    //    spiral of 2026-11-11 - a dead harvester's 300-energy replacement
    //    waited for a store the builders kept draining below that cost,
    //    the crew ratcheted down, and the run ended with 2 creeps at tick
    //    4000. While either hold-back is on the builder refuels from a
    //    source instead (the fallback below), so the store climbs to
    //    capacity and the full-size replacement starts. The pool is tried
    //    spawn-first so a half-full spawn still serves the builder. The
    //    pool sits ABOVE the source container rung (the M4 fix of
    //    2026-11-11): the builder's sites sit around the spawn, so a pool
    //    a few tiles away beats a source container that is a ~25-tile
    //    round trip - with the container-first order M4 finished with 1 of
    //    its 3 required extensions built (capacity 350 of 450).
    if (role === "builder"
        && !upgraderBelowMinimum(room)
        && !incomeBelowMinimum(room)
        && room.energyAvailable >= room.energyCapacityAvailable * BUILDER_WITHDRAW_FRACTION)
    {
        const pool: (StructureSpawn | StructureExtension)[] = [
            ...room.find(FIND_MY_SPAWNS),
            ...room.find(FIND_MY_STRUCTURES, {
                filter: (structure): structure is StructureExtension =>
                    structure.structureType === STRUCTURE_EXTENSION,
            }),
        ];
        for (const target of pool)
        {
            if (target.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, target, 1);
                }
                return "acted";
            }
        }
    }

    // 4. The fullest source container (built, on a tile next to a source,
    //    not the controller container): worth the trip only from a real
    //    hauler delivery up, not from a trickle. For builders this rung is
    //    reached only while the pool is below the withdrawal floor, so the
    //    builder never takes the long container trip while energy sits at
    //    its build sites.
    const sourceContainer = pickFullestSourceContainer(room);
    const sourceContainerEnergy = sourceContainer !== null
        ? sourceContainer.store.getUsedCapacity(RESOURCE_ENERGY)
        : 0;
    if (sourceContainer !== null && sourceContainerEnergy >= MIN_CONTAINER_WITHDRAW_ENERGY)
    {
        if (creep.pos.getRangeTo(sourceContainer) > 1)
        {
            moveToToward(creep, sourceContainer, 1);
        }
        else
        {
            creep.withdraw(sourceContainer, RESOURCE_ENERGY);
        }
        return "acted";
    }

    // 5. Nothing worked. A container with a trickle of energy means "wait
    //    one tick, the miner refills it" - never walk to a source for a
    //    partial load (the regression this helper removes).
    if (sourceContainerEnergy > 0)
    {
        return "wait";
    }

    return "harvest";
}

/**
 * Finds the controller container: a built container within
 * CONTROLLER_CONTAINER_RANGE of the controller (rung 4 of the builder's
 * layout ladder, placed by constructionManager).
 * @param room The room to search
 * @returns The controller container, or null when none is built
 */
function findControllerContainer(room: Room): StructureContainer | null
{
    const controller = room.controller;
    if (controller === undefined)
    {
        return null;
    }

    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure): structure is StructureContainer =>
            structure.structureType === STRUCTURE_CONTAINER,
    });
    for (const container of containers)
    {
        if (container.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE)
        {
            return container;
        }
    }
    return null;
}

/**
 * Picks the source container with the most energy: a built container on a
 * tile next to a source, excluding the controller container (that one is
 * the upgrader's fuel stop and is handled by its own branch).
 *
 * "Fullest" rather than "nearest": the hauler refills whichever container
 * it last visited, so the fullest one is also the one a hauler is most
 * likely to be heading back to - waiting on it costs the least ticks.
 * @param room The room to search
 * @returns The fullest source container, or null when none is built
 */
function pickFullestSourceContainer(room: Room): StructureContainer | null
{
    const sources = room.find(FIND_SOURCES);
    const controller = room.controller;
    const containers = room.find(FIND_STRUCTURES, {
        filter: (structure): structure is StructureContainer =>
            structure.structureType === STRUCTURE_CONTAINER,
    });

    let best: StructureContainer | null = null;
    let bestEnergy = 0;
    for (const container of containers)
    {
        if (!sources.some((source) => container.pos.getRangeTo(source.pos) <= 1))
        {
            continue; // not on a tile next to a source
        }
        if (controller !== undefined
            && container.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE)
        {
            continue; // the controller container belongs to the upgrader's branch
        }
        const energy = container.store.getUsedCapacity(RESOURCE_ENERGY);
        if (energy > bestEnergy)
        {
            bestEnergy = energy;
            best = container;
        }
    }
    return best;
}
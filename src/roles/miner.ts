/**
 * Miner role: a stationary source miner (M5 stage-2 economy).
 *
 * A miner is bound to the one source that has a built container on an
 * adjacent tile. It walks to that container's tile exactly once, then stands
 * on it for the rest of its life: the tile is one away from the source
 * (harvest) and is the container itself (transfer), so both actions fit in
 * range without any further movement. The M5 acceptance test checks that a
 * miner stays within range 1 of its source from the tick it first reaches it,
 * and a miner that never leaves its container tile can never violate that.
 *
 * A creep performs exactly one action per tick, so the miner cannot harvest
 * and offload in the same tick. It therefore harvests until its store is
 * full, then spends one tick transferring the whole load into the container.
 * That loses one harvest tick per store-length of load (1 in 26 for the top
 * 5-WORK body, ~96 % of ticks still harvesting), which keeps the source
 * drained at its refill rate so nothing is left behind when it regenerates
 * every 300 ticks. When the container is full (the haulers are behind), the
 * miner keeps harvesting: the surplus drops on the ground and a hauler
 * collects it, while the source still stays drained.
 *
 * Haulers take the energy from the container, so the miner never walks to the
 * spawn or the extensions: a worker that walks to a source is a bootstrap
 * harvester, not a miner. If the container is gone (destroyed, or the source
 * lost it after a map change) the miner falls back to drop-mining next to the
 * source so a hauler can still collect what it harvests.
 */

import { getParkingPosition } from "managers/constructionManager";
import { moveToToward } from "utils/movement";

/**
 * Runs the miner creep behavior for one tick.
 * @param creep The miner creep to run
 */
export function runMiner(creep: Creep): void
{
    const room = creep.room;

    // Resolve the assigned source from memory (it survives global resets).
    const source = creep.memory.sourceId !== undefined
        ? room.find(FIND_SOURCES).find((candidate) => candidate.id === creep.memory.sourceId)
        : undefined;

    if (source === undefined)
    {
        // The source is gone: park by the spawn instead of roaming.
        parkNearSpawn(creep);
        return;
    }

    // The built container on a tile adjacent to the source. The miner stands
    // ON this tile: range 0 from the container (transfer) and range 1 from
    // the source (harvest).
    const container = room.find(FIND_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_CONTAINER
            && structure.pos.getRangeTo(source) <= 1,
    })[0] as StructureContainer | undefined;

    const hasContainer = container !== undefined;
    const anchor = hasContainer ? container : source;
    const targetRange = hasContainer ? 0 : 1;

    // Reach the anchor tile once. While walking the miner is not working yet;
    // the M5 range-1 rule only binds from the first arrival.
    if (creep.pos.getRangeTo(anchor) > targetRange)
    {
        moveToToward(creep, anchor, targetRange);
        return;
    }

    // One action per tick: a creep cannot harvest and transfer in the same
    // tick, so the miner alternates. It harvests until the store is full, then
    // offloads the whole load into the container in a single transfer (a
    // transfer moves everything the container can take). That costs one lost
    // harvest tick per store-length of load - 1 in 26 for the top body - which
    // is what keeps the source drained without leaving energy behind at the
    // 300-tick regeneration. (The old code harvested first and then tried to
    // transfer in the same tick; the second action never ran, so the miner
    // filled up and dropped its surplus on the ground instead of the
    // container.)
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;
    const capacity = creep.store.getCapacity(RESOURCE_ENERGY);

    if (hasContainer && energy >= capacity)
    {
        const free = container.store.getFreeCapacity(RESOURCE_ENERGY);
        if (free > 0)
        {
            if (creep.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                // The container vanished under the miner: drop-mine instead.
                creep.harvest(source);
            }
            return;
        }
        // The container is full: fall through to harvest. With a full store
        // the harvest drops the excess on the ground (drop-mining) - a hauler
        // collects it, and the source stays drained, so nothing is wasted at
        // regeneration.
    }

    if (creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        // Only when the source itself left range (it should not): step toward
        // it and retry next tick.
        moveToToward(creep, source, 1);
    }
}

/**
 * Parks a miner that lost its source at the room's parking area (M4,
 * owner feedback 2026-11-06) - outside the spawn's own ring, where the
 * extension sites and their builders are, so it can never block a
 * builder. Until the construction manager has cached a parking position
 * (early room, or right after a global reset), the old fallback holds:
 * wait a couple of tiles from the spawn.
 * @param creep The miner to park
 */
function parkNearSpawn(creep: Creep): void
{
    const parking = getParkingPosition(creep.room);
    if (parking !== null)
    {
        if (creep.pos.getRangeTo(parking) > 0)
        {
            moveToToward(creep, parking, 0);
        }
        return;
    }

    const spawn = creep.room.find(FIND_MY_SPAWNS)[0];
    if (spawn === undefined)
    {
        return;
    }
    if (creep.pos.getRangeTo(spawn) > 2)
    {
        moveToToward(creep, spawn, 2);
    }
}
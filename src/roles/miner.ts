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
 * Haulers take the energy from the container, so the miner never walks to the
 * spawn or the extensions: a worker that walks to a source is a bootstrap
 * harvester, not a miner. If the container is gone (destroyed, or the source
 * lost it after a map change) the miner falls back to drop-mining next to the
 * source so a hauler can still collect what it harvests.
 */

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
    })[0];

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

    // Harvest the source (the anchor tile is within range 1 of it).
    if (creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        // Only when the source itself left range (it should not): step toward
        // it and retry next tick.
        moveToToward(creep, source, 1);
        return;
    }

    // Offload into the container while the store holds energy. Standing on the
    // container tile keeps the transfer within range 0, so no movement.
    if (hasContainer && (creep.store[RESOURCE_ENERGY] ?? 0) > 0)
    {
        const transferResult = creep.transfer(container, RESOURCE_ENERGY);
        if (transferResult === ERR_NOT_IN_RANGE)
        {
            // The container vanished under the miner: step back to a neighbour
            // of the source (drop-mining) and let a hauler collect it.
            moveToToward(creep, source, 1);
        }
    }
}

/**
 * Parks a miner that lost its source a couple of tiles from the spawn.
 * @param creep The miner to park
 */
function parkNearSpawn(creep: Creep): void
{
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
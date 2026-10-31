/** Tower Manager
 * Manages the towers' defense, healing, and repair logic.
 * The tower attacks hostile creeps, heals damaged own creeps,
 * and repairs ramparts, roads, and containers when the colony is at
 * peace and the tower holds energy above its defense reserve.
 *
 * Mode behavior (M4): while Memory.mode is 'defend' or 'war' the tower
 * does not repair at all - its energy stays in the store for attacks and
 * healing. Repairing in the middle of a fight spends defense energy in the
 * wrong place; the builders patch the ramparts instead.
 */

import { RAMPART_TARGET_HITS, TOWER_ENERGY_RESERVE } from "config";

/**
 * Runs the tower behavior for a single room.
 * @param room The room containing the tower
 */
export function manageTower(room: Room): void
{
    const towers = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_TOWER,
    });

    if (towers.length === 0)
    {
        return;
    }

    // The threat state is colony-wide (Memory.mode, set by modeManager):
    // it decides whether a tower may repair this tick at all.
    const mode = Memory.mode ?? "peace";

    for (const tower of towers as StructureTower[])
    {
        manageTowerLogic(tower, mode);
    }
}

/**
 * Manages the logic for a single tower, in the M4 priority order:
 * 1. attack the closest hostile creep,
 * 2. heal a damaged own creep,
 * 3. (peace only, and only while the tower holds more than the defense
 *    reserve) repair ramparts below the hit target, then roads, then
 *    containers.
 * @param tower The tower to manage
 * @param mode The colony's current threat state (Memory.mode)
 */
function manageTowerLogic(tower: StructureTower, mode: GameMode): void
{
    // Priority 1: Attack hostile creeps
    const hostileCreeps = tower.room.find(FIND_HOSTILE_CREEPS);
    if (hostileCreeps.length > 0)
    {
        const closestHostile = tower.pos.findClosestByRange(hostileCreeps);
        if (closestHostile !== null)
        {
            const result = tower.attack(closestHostile);
            if (result === OK || result === ERR_NOT_IN_RANGE)
            {
                return;
            }
        }
    }

    // Priority 2: Heal damaged own creeps
    const damagedCreeps = tower.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.hits < creep.hitsMax,
    });
    if (damagedCreeps.length > 0)
    {
        const closestDamaged = tower.pos.findClosestByRange(damagedCreeps);
        if (closestDamaged !== null)
        {
            const result = tower.heal(closestDamaged);
            if (result === OK || result === ERR_NOT_IN_RANGE)
            {
                return;
            }
        }
    }

    // Priority 3: repair - but only in peace. While the colony defends or
    // wages war, every unit of tower energy belongs to the fight; nothing
    // repairs walls or roads in that mode.
    if (mode !== "peace")
    {
        return;
    }

    // Keep at least the defense reserve in the store: 500 energy is 50
    // shots, which is exactly what a tower is for. Repairing while the
    // store sits above the line would leave the next fight underarmed.
    if (tower.store[RESOURCE_ENERGY] <= TOWER_ENERGY_RESERVE)
    {
        return;
    }

    // Ramparts first: they stand between the hostiles and the very
    // structures the tower defends. Only repair up to the hit target -
    // beyond it the energy is not worth spending.
    const damagedRamparts = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_RAMPART &&
            structure.hits < RAMPART_TARGET_HITS,
    });
    if (damagedRamparts.length > 0)
    {
        const closestRampart = tower.pos.findClosestByRange(damagedRamparts);
        if (closestRampart !== null)
        {
            const result = tower.repair(closestRampart);
            if (result === OK || result === ERR_NOT_IN_RANGE)
            {
                return;
            }
        }
    }

    // Then roads (they're critical for movement)
    const damagedRoads = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_ROAD &&
            structure.hits < structure.hitsMax,
    });
    if (damagedRoads.length > 0)
    {
        const closestRoad = tower.pos.findClosestByRange(damagedRoads);
        if (closestRoad !== null)
        {
            const result = tower.repair(closestRoad);
            if (result === OK || result === ERR_NOT_IN_RANGE)
            {
                return;
            }
        }
    }

    // Then containers (they're critical for energy storage)
    const damagedContainers = tower.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
            structure.structureType === STRUCTURE_CONTAINER &&
            structure.hits < structure.hitsMax,
    });
    if (damagedContainers.length > 0)
    {
        const closestContainer = tower.pos.findClosestByRange(damagedContainers);
        if (closestContainer !== null)
        {
            const result = tower.repair(closestContainer);
            if (result === OK || result === ERR_NOT_IN_RANGE)
            {
                return;
            }
        }
    }
}
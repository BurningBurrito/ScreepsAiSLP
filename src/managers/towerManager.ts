/** Tower Manager
 * Manages the tower's defense, healing, and repair logic.
 * The tower attacks hostile creeps, heals damaged own creeps,
 * and repairs roads and containers when there's excess energy.
 */


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

    for (const tower of towers as StructureTower[])
    {
        manageTowerLogic(tower);
    }
}

/**
 * Manages the logic for a single tower.
 * Attack hostile creeps, heal own creeps, then repair.
 * @param tower The tower to manage
 */
function manageTowerLogic(tower: StructureTower): void
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

    // Priority 3: Repair roads and containers (only with energy reserve)
    // Keep at least 500 energy for defense/healing
    if (tower.store[RESOURCE_ENERGY] > 500)
    {
        // Repair roads first (they're critical for movement)
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

        // Then repair containers
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
}
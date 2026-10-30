/**
 * Hauler creep role - Stage 2 economy: moves energy from sources to consumers.
 *
 * At RCL 3+, we have containers near sources and a tower that needs energy.
 * Haulers withdraw energy from containers and deliver to:
 * 1. Tower (priority: repair/attack)
 * 2. Extensions (priority: spawn creeps)
 * 3. Upgraders (if carrying, they can pick up directly)
 *
 * IMPORTANT: Haulers NEVER withdraw from spawn or extensions. Those are
 * destinations, not sources. This prevents energy from going in circles.
 *
 * Every move goes through utils/moveToToward, which drops the creep's cached
 * path when it keeps replaying a blocked one (see that file for the engine
 * detail).
 */

import { moveToToward } from "utils/movement";

export function runHauler(creep: Creep): void
{
    // If creep is full, deliver energy to targets
    if (creep.store.getUsedCapacity() === creep.store.getCapacity())
    {
        // Priority 1: Tower - needs energy for repairs and attacks
        const towers = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_TOWER,
        });

        if (towers.length > 0)
        {
            const tower = creep.pos.findClosestByPath(towers) as StructureTower;
            if (tower !== null)
            {
                const towerEnergy = tower.store[RESOURCE_ENERGY];
                const towerCapacity = tower.store.getCapacity(RESOURCE_ENERGY);
                if (towerEnergy < towerCapacity)
                {
                    if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        moveToToward(creep, tower, 1);
                    }
                    return;
                }
            }
        }

        // Priority 2: Extensions - need energy for spawning
        const extensionTargets = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_EXTENSION,
        });

        if (extensionTargets.length > 0)
        {
            const targetExtension = creep.pos.findClosestByPath(extensionTargets) as StructureExtension;
            if (targetExtension !== null)
            {
                const extEnergy = targetExtension.store[RESOURCE_ENERGY];
                const extCapacity = targetExtension.store.getCapacity(RESOURCE_ENERGY);
                if (extEnergy < extCapacity)
                {
                    if (creep.transfer(targetExtension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        moveToToward(creep, targetExtension, 1);
                    }
                    return;
                }
            }
        }

        // Priority 3: Spawn - if still has energy after tower and extensions
        const spawnTargets = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_SPAWN,
        });

        if (spawnTargets.length > 0)
        {
            const targetSpawn = creep.pos.findClosestByPath(spawnTargets) as StructureSpawn;
            if (targetSpawn !== null)
            {
                if (creep.transfer(targetSpawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, targetSpawn, 1);
                }
                return;
            }
        }
        return;
    }

    // If creep is not full, pick up energy from sources
    // Only use containers and dropped energy - NEVER withdraw from spawn or extensions
    // Priority 0: Containers (if they have energy)
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
    });

    if (containers.length > 0)
    {
        const targetContainer = creep.pos.findClosestByPath(containers) as StructureContainer;
        if (targetContainer !== null)
        {
            if (targetContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                if (creep.withdraw(targetContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, targetContainer, 1);
                }
                return;
            }
        }
    }

    // Priority 1: Dropped energy on the ground
    const droppedResources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
    if (droppedResources !== null && droppedResources.resourceType === RESOURCE_ENERGY && droppedResources.amount > 0)
    {
        if (creep.pickup(droppedResources) === ERR_NOT_IN_RANGE)
        {
            moveToToward(creep, droppedResources, 1);
        }
        return;
    }

    // If still no energy and a container exists, check again (in case we missed it)
    const containerList = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_CONTAINER,
    });

    if (containerList.length > 0)
    {
        const targetContainer = creep.pos.findClosestByPath(containerList) as StructureContainer;
        if (targetContainer !== null)
        {
            if (targetContainer.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
            {
                if (creep.withdraw(targetContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, targetContainer, 1);
                }
                return;
            }
        }
    }

    // If still no energy, park near spawn
    const finalSpawnPos = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_SPAWN,
    });
    if (finalSpawnPos !== null && creep.pos.getRangeTo(finalSpawnPos) > 3)
    {
        moveToToward(creep, finalSpawnPos, 1);
    }
}

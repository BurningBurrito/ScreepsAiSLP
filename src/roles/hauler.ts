/**
 * Hauler creep role - Stage 2 economy: moves energy from sources to consumers.
 *
 * At RCL 3+, we have containers near sources and a tower that needs energy.
 * Haulers withdraw energy from containers/spawns/extensions and deliver to:
 * 1. Tower (priority: repair/attack)
 * 2. Extensions (priority: spawn creeps)
 * 3. Spawn (priority: spawn creeps)
 * 4. Upgraders (if carrying, they can pick up directly)
 */

export function runHauler(creep: Creep): void
{
    // If creep is full, deliver energy to targets
    if (creep.store.getUsedCapacity() === creep.store.getCapacity())
    {
        // Priority 0: Spawn - if low on energy, prioritize filling it for spawning
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
        {
            const spawnEnergy = spawn.store[RESOURCE_ENERGY];
            const spawnCapacity = spawn.store.getCapacity(RESOURCE_ENERGY);
            // Deliver to spawn when it has free capacity (spawn needs 300 for spawning)
            if (spawnEnergy < spawnCapacity - 50)
            {
                if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn, { reusePath: 20 });
                }
                return;
            }
        }

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
                        creep.moveTo(tower, { reusePath: 20 });
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
                        creep.moveTo(targetExtension, { reusePath: 20 });
                    }
                    return;
                }
            }
        }

        // Priority 3: Spawn - if spawn is full enough, transfer to it anyway
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
                    creep.moveTo(targetSpawn, { reusePath: 20 });
                }
                return;
            }
        }
        return;
    }

    // If creep is not full, pick up energy from sources
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
                    creep.moveTo(targetContainer, { reusePath: 20 });
                }
                return;
            }
        }
    }

    // Priority 1: Spawn (if needed and has energy)
    const hasPrioritySites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION,
    }).length > 0;

    if (!hasPrioritySites)
    {
        const spawnSources = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_SPAWN,
        });

        for (const sp of spawnSources)
        {
            const spawn = sp as StructureSpawn;
            if (spawn.store[RESOURCE_ENERGY] >= 200)
            {
                if (creep.withdraw(sp, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sp, { reusePath: 20 });
                }
                return;
            }
        }
    }

    // Priority 2: Extensions (if needed and has energy)
    const extensionSources = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_EXTENSION,
    });

    for (const ext of extensionSources)
    {
        const extension = ext as StructureExtension;
        if (extension.store[RESOURCE_ENERGY] > 0)
        {
            if (creep.withdraw(ext, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(ext, { reusePath: 20 });
            }
            return;
        }
    }

    // Priority 3: Dropped energy on the ground
    const droppedResources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
    if (droppedResources !== null && droppedResources.resourceType === RESOURCE_ENERGY && droppedResources.amount > 0)
    {
        if (creep.pickup(droppedResources) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(droppedResources, { reusePath: 20, range: 1 });
        }
        return;
    }

    // If still no energy, harvest directly from sources
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source !== null)
    {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { reusePath: 20, range: 1 });
        }
        return;
    }

    // No energy sources found, park near spawn
    const finalSpawnPos = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType === STRUCTURE_SPAWN,
    });
    if (finalSpawnPos !== null && creep.pos.getRangeTo(finalSpawnPos) > 3)
    {
        creep.moveTo(finalSpawnPos, { reusePath: 20 });
    }
}

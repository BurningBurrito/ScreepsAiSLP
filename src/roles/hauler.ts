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

import { STRUCTURE_CONTAINER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN, STRUCTURE_TOWER } from 'screeps';

export function runHauler(creep: Creep): void
{
    // If creep is full, deliver energy to targets
    if (creep.store.getUsedCapacity() === creep.store.getCapacity())
    {
        // Priority 0: Spawn - if low on energy, prioritize filling it for spawning
        const spawns = creep.room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns)
        {
            const spawnEnergy = (spawn ).energy;
            const spawnCapacity = (spawn ).energyCapacity;
            // If spawn has less than 150 energy, deliver to it first (needed for spawning)
            if (spawnEnergy < 150)
            {
                if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn, { reusePath: 20 });
                }
                return;
            }
        }

        // Priority 1: Tower - needs energy for repairs and attacks
        const towers = creep.room.find(FIND_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_TOWER && (s as StructureTower).energy < (s as StructureTower).energyCapacity,
        });

        if (towers.length > 0)
        {
            const tower = creep.pos.findClosestByPath(towers) as StructureTower | undefined;
            if (tower !== undefined)
            {
                if (creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(tower, { reusePath: 20 });
                }
                return;
            }
        }

        // Priority 2: Extensions - need energy for spawning
        const extensionTargets = creep.room.find(FIND_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_EXTENSION && (s as StructureExtension).energy < (s as StructureExtension).energyCapacity,
        });

        if (extensionTargets.length > 0)
        {
            // Find closest extension
            const targetExtension = creep.pos.findClosestByPath(extensionTargets) as StructureExtension | undefined;
            if (targetExtension !== undefined)
            {
                if (creep.transfer(targetExtension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(targetExtension, { reusePath: 20 });
                }
                return;
            }
        }

        // Priority 3: Spawn - if spawn is full enough, transfer to it anyway
        const spawnTargets = creep.room.find(FIND_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_SPAWN,
        });

        if (spawnTargets.length > 0)
        {
            const targetSpawn = creep.pos.findClosestByPath(spawnTargets) as StructureSpawn | undefined;
            if (targetSpawn !== undefined)
            {
                if (creep.transfer(targetSpawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(targetSpawn, { reusePath: 20 });
                }
                return;
            }
        }

        // Priority 4: Storage (RCL 4+) - if we have storage and it's not full
        const storage = creep.room.storage;
        if (storage !== undefined)
        {
            if (creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(storage, { reusePath: 20 });
            }
            return;
        }

        // No targets found, park near spawn
        const spawnPos = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_SPAWN,
        });
        if (spawnPos !== undefined && creep.pos.getRangeTo(spawnPos) > 3)
        {
            creep.moveTo(spawnPos, { reusePath: 20 });
        }
        return;
    }

    // Not full - collect energy from containers, then spawn, then extensions
    // Priority 1: Containers (Stage 2 economy)
    const containers = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_CONTAINER && (s as StructureContainer).store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    });

    if (containers.length > 0)
    {
        const targetContainer = creep.pos.findClosestByPath(containers) as StructureContainer | undefined;
        if (targetContainer !== undefined)
        {
            if (creep.withdraw(targetContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(targetContainer, { reusePath: 20 });
            }
            return;
        }
    }

    // Priority 2: Spawn (if needed and has energy)
    // Only withdraw from spawn if there are no priority construction sites (tower/extension)
    // and the spawn has enough energy for a harvester replacement (200) plus buffer
    // This prevents haulers from draining spawn energy when infrastructure isn't ready
    const hasPrioritySites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: (s) => s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION,
    }).length > 0;

    if (!hasPrioritySites)
    {
        const spawnSources = creep.room.find(FIND_STRUCTURES, {
            filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_SPAWN,
        });

        for (const sp of spawnSources)
        {
            const spawn = sp as StructureSpawn;
            // Only withdraw if spawn has enough energy for a harvester replacement (200)
            // This ensures the colony can sustain its population when needed
            if (spawn.energy >= 200)
            {
                if (creep.withdraw(sp, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sp, { reusePath: 20 });
                }
                return;
            }
        }
    }

    // Priority 3: Extensions (if needed and has energy)
    const extensionSources = creep.room.find(FIND_STRUCTURES, {
        filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_EXTENSION,
    });

    for (const ext of extensionSources)
    {
        const extension = ext as StructureExtension;
        if (extension.energy > 0)
        {
            if (creep.withdraw(ext, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(ext, { reusePath: 20 });
            }
            return;
        }
    }

    // Fallback: try to take from upgrader if it's near controller
    const upgrader = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
        filter: (c) => c.memory.role === 'upgrader' && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0,
    });
    if (upgrader !== undefined)
    {
        if (creep.withdraw(upgrader, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(upgrader, { reusePath: 20 });
        }
        return;
    }

    // If still no energy, harvest directly from sources
    const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
    if (source !== undefined)
    {
        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { reusePath: 20 });
        }
        return;
    }

    // No energy sources found, park near spawn
    const finalSpawnPos = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s: AnyOwnedStructure) => s.structureType === STRUCTURE_SPAWN,
    });
    if (finalSpawnPos !== undefined && creep.pos.getRangeTo(finalSpawnPos) > 3)
    {
        creep.moveTo(finalSpawnPos, { reusePath: 20 });
    }
}

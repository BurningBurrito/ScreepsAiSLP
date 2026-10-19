/**
 * Spawn Manager
 * Responsible for spawning creeps to maintain minimum population per role.
 * Harvesters are prioritized, and body size scales with room energy.
 */

import { BASE_CREEP_COST, MIN_BODY_PARTS, MIN_CREEPS_PER_ROLE } from "config";

/**
 * Ensures creepCounter is initialized in Memory
 */
function ensureCreepCounter(): void
{
    if (Memory.creepCounter === undefined)
    {
        Memory.creepCounter = 0;
    }
}

/**
 * Gets the number of creeps with a specific role
 * @param role The role to count
 * @returns Number of creeps with that role
 */
function getCreepCount(role: string): number
{
    return Object.values(Game.creeps).filter((creep) => creep.memory.role === role).length;
}

/**
 * Gets the total energy available for spawning (from room energy)
 * @param room The room to check
 * @returns Total energy available
 */
function getTotalEnergyAvailable(room: Room): number
{
    return room.energyAvailable;
}

/**
 * Creates a creep body based on available energy
 * @param energyAvailable Available energy for the body
 * @returns Array of body parts
 */
function createCreepBody(energyAvailable: number, role: string): BodyPartConstant[]
{
    const body: BodyPartConstant[] = [];

    // Calculate how many full sets of body parts we can afford
    const maxSets = Math.floor(energyAvailable / BASE_CREEP_COST);

    if (maxSets < 1)
    {
        // If we can't afford even one set, try to make a minimal creep
        const workParts = Math.min(MIN_BODY_PARTS.work, Math.floor(energyAvailable / 100));
        const carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor((energyAvailable - workParts * 100) / 50));
        const moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor((energyAvailable - workParts * 100 - carryParts * 50) / 50));

        for (let i = 0; i < workParts; i++) body.push(WORK);
        for (let i = 0; i < carryParts; i++) body.push(CARRY);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);

        return body;
    }

    // Add full sets of body parts
    for (let i = 0; i < maxSets; i++)
    {
        body.push(WORK);
        body.push(CARRY);
        body.push(MOVE);
    }

    // Use remaining energy to add parts
    let remainingEnergy = energyAvailable - maxSets * BASE_CREEP_COST;

    // For builders, prioritize WORK parts for faster construction
    if (role === "builder")
    {
        // Add extra WORK parts first for builders
        while (remainingEnergy >= 100)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }

        // Then add CARRY parts
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }

        // Finally add MOVE parts
        while (remainingEnergy >= 50)
        {
            body.push(MOVE);
            remainingEnergy -= 50;
        }
    }
    else
    {
        // For harvesters and upgraders, balance WORK and CARRY
        // Add extra WORK parts first
        while (remainingEnergy >= 100 && body.filter((part) => part === WORK).length < body.filter((part) => part === CARRY).length + 2)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }

        // Add extra CARRY parts
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }

        // Add extra MOVE parts
        while (remainingEnergy >= 50)
        {
            body.push(MOVE);
            remainingEnergy -= 50;
        }
    }

    return body;
}

/**
 * Spawns a creep of the specified role
 * @param role The role of the creep to spawn
 * @param room The room to spawn in
 * @returns The name of the spawned creep, or null if spawning failed
 */
function spawnCreep(role: string, room: Room): string | null
{
    // Ensure creepCounter is initialized
    ensureCreepCounter();

    const energyAvailable = getTotalEnergyAvailable(room);

    // Check if we have at least one MOVE part required for every creep
    const isHarvester = role === "harvester";
    const harvesterCount = getCreepCount("harvester");

    // For harvester, we can spawn with less energy if none exist (emergency)
    // For builder, need enough energy for a body with WORK, CARRY, MOVE
    // Otherwise, need enough energy for a useful creep
    let minEnergyForCreep: number;
    if (isHarvester && harvesterCount === 0)
    {
        minEnergyForCreep = 200; // 1 WORK (100) + 1 CARRY (50) + 1 MOVE (50)
    }
    else if (role === "builder")
    {
        // Builder needs at least 200 energy for 1 WORK + 1 CARRY + 1 MOVE
        minEnergyForCreep = 200;
    }
    else
    {
        minEnergyForCreep = BASE_CREEP_COST / 2;
    }

    if (energyAvailable < minEnergyForCreep)
    {
        return null; // Not enough energy for a useful creep
    }

    const body = createCreepBody(energyAvailable, role);

    if (body.length === 0)
    {
        return null; // Could not create any body parts
    }

    // Ensure body has at least one of each: WORK, CARRY, MOVE
    const hasWork = body.some((part) => part === WORK);
    const hasCarry = body.some((part) => part === CARRY);
    const hasMove = body.some((part) => part === MOVE);

    if (!hasWork || !hasCarry || !hasMove)
    {
        return null; // Body must have at least one of each type
    }

    const creepName = `${role}_${Game.time}_${Memory.creepCounter}`;
    Memory.creepCounter++;

    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0)
    {
        return null; // No spawns available
    }

    const result = spawns[0].spawnCreep(body, creepName, { memory: { role, working: false } as CreepMemory });

    if (result === OK)
    {
        console.log(`Spawned new ${role}: ${creepName}`);
        return creepName;
    }

    console.log(`Failed to spawn ${creepName}: ${result}`);
    return null;
}

/**
 * Checks if a creep needs to be spawned to maintain minimum population
 * @param room The room to check
 * @returns True if a creep should be spawned
 */
export function checkAndSpawn(room: Room): void
{
    // Check each role and spawn if below minimum
    const roles: string[] = ["harvester", "upgrader", "builder"];

    for (const role of roles)
    {
        const count = getCreepCount(role);
        const minimum = MIN_CREEPS_PER_ROLE[role as keyof typeof MIN_CREEPS_PER_ROLE];

        if (count < minimum)
        {
            const spawnedName = spawnCreep(role, room);

            if (spawnedName !== null)
            {
                return; // Spawned one, stop checking
            }
        }
    }
}

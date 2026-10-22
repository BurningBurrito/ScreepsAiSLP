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
        // Prioritize MOVE parts since they're essential for movement
        const moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor(energyAvailable / 50));
        const energyAfterMove = energyAvailable - moveParts * 50;
        const carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor(energyAfterMove / 50));
        const energyAfterCarry = energyAfterMove - carryParts * 50;
        const workParts = Math.min(MIN_BODY_PARTS.work, Math.floor(energyAfterCarry / 100));

        for (let i = 0; i < workParts; i++) body.push(WORK);
        for (let i = 0; i < carryParts; i++) body.push(CARRY);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);

        return body;
    }

    // Add full sets of body parts (haulers don't need WORK parts)
    for (let i = 0; i < maxSets; i++)
    {
        if (role !== "hauler")
        {
            body.push(WORK);
        }
        body.push(CARRY);
        body.push(MOVE);
    }

    // Use remaining energy to add parts
    let remainingEnergy = energyAvailable - maxSets * BASE_CREEP_COST;

    // For builders, prioritize WORK parts first (for efficient building)
    if (role === "builder")
    {
        // Add extra WORK parts first (builders need WORK for efficient building)
        while (remainingEnergy >= 100)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }

        // Then add extra CARRY parts (for energy transport)
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
    else if (role === "hauler")
    {
        // For haulers, prioritize CARRY parts first (for carrying energy)
        // Haulers don't need WORK parts - they just transport energy
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }

        // Then add extra MOVE parts
        while (remainingEnergy >= 50)
        {
            body.push(MOVE);
            remainingEnergy -= 50;
        }
    }
    else if (role === "harvester")
    {
        // For harvesters, prioritize WORK parts first (to harvest more energy)
        // Then CARRY to deliver, then MOVE to move
        while (remainingEnergy >= 100)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }
        while (remainingEnergy >= 50)
        {
            body.push(MOVE);
            remainingEnergy -= 50;
        }
    }
    else if (role === "upgrader")
    {
        // For upgraders, prioritize WORK parts first (to harvest more energy)
        // Then CARRY to hold, then MOVE to move
        while (remainingEnergy >= 100)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }
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
    const harvesterCount = getCreepCount("harvester");

    // For harvester, we can spawn with less energy if none exist (emergency)
    // For builder, need enough energy for a body with WORK, CARRY, MOVE
    // For hauler, need at least 100 energy for 1 CARRY + 1 MOVE (RCL 1 has 150 capacity)
    // For upgrader, need at least 150 energy for 1 WORK + 1 CARRY + 1 MOVE
    // Otherwise, need enough energy for a useful creep
    // Allow spawning with any available energy (createCreepBody handles low-energy cases)
    // This ensures the colony can maintain minimum creep count even when energy is low

    const creepName = `${role}_${Game.time}_${Memory.creepCounter}`;
    Memory.creepCounter++;

    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0)
    {
        return null; // No spawns available
    }

    const body = createCreepBody(energyAvailable, role);

    if (body.length === 0)
    {
        return null; // Could not create any body parts
    }

    // Ensure body has at least one of each: WORK, CARRY, MOVE
    // (Haulers don't need WORK parts, just CARRY and MOVE)
    const isHauler = role === "hauler";
    const hasWork = body.some((part) => part === WORK);
    const hasCarry = body.some((part) => part === CARRY);
    const hasMove = body.some((part) => part === MOVE);

    if (!hasCarry || !hasMove || (isHauler ? false : !hasWork))
    {
        // Allow spawning with partial bodies when energy is low
        // This ensures the colony can maintain minimum creep count even when energy is low
        // For harvesters, we require at least WORK and MOVE (CARRY is optional for initial harvesting)
        if (role === "harvester" && harvesterCount === 0)
        {
            // For the first harvester, allow spawning with just WORK and MOVE
            if (hasWork && hasMove)
            {
                // Can spawn minimal harvester without CARRY
            }
            else
            {
                return null; // Body doesn't have WORK and MOVE
            }
        }
        else
        {
            return null; // Body must have at least CARRY and MOVE; haulers don't need WORK
        }
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
    const roles: string[] = ["harvester", "upgrader", "builder", "hauler"];

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

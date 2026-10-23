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
        // For haulers, prioritize CARRY over MOVE since they need CARRY to be useful
        // For roles that need WORK, prioritize WORK parts first
        let moveParts = 0;
        let carryParts = 0;
        let workParts = 0;
        
        // Calculate parts using an IIFE that returns just the WORK count
        // Note: moveParts and carryParts are assigned by reference in the IIFE
        ((): void =>
        {
            if (role === "hauler")
            {
                // Prioritize CARRY for haulers
                carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor(energyAvailable / 50));
                const energyAfterCarry = energyAvailable - carryParts * 50;
                moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor(energyAfterCarry / 50));
                workParts = 0; // Haulers don't need WORK parts
            }
            else if (role === "harvester" || role === "builder")
            {
                // Prioritize MOVE and CARRY for movement and energy storage
                // Then WORK (needed for harvesting/building)
                // Order: MOVE first (can't function without movement), then CARRY, then WORK
                
                // For harvesters and builders, add extra MOVE parts to reduce fatigue accumulation
                // With 2 MOVE parts and 2 non-MOVE parts, fatigue is neutral (no accumulation)
                // First, ensure at least 2 MOVE parts for better movement efficiency
                const energyAfterMove = energyAvailable - 100; // Reserve for 2 MOVE
                if (energyAfterMove > 0)
                {
                    // Then ensure at least 1 CARRY part (required for storing energy)
                    const energyAfterCarry = energyAfterMove - 50;
                    if (energyAfterCarry > 0)
                    {
                        // Then add WORK parts only if we can afford them
                        const work = Math.floor(energyAfterCarry / 100);
                        
                        moveParts = 2;
                        carryParts = 1;
                        workParts = work > 0 ? work : 0;
                    }
                    else
                    {
                        // Can afford CARRY but not WORK
                        // We still need WORK for these roles, so add 1 WORK part even if it's minimal
                        moveParts = 2;
                        carryParts = 1;
                        workParts = 1;  // At least 1 WORK part is essential
                    }
                }
                else
                {
                    // Can't afford even 2 MOVE parts, try with 1 MOVE
                    const energyAfterMove1 = energyAvailable - 50;
                    if (energyAfterMove1 > 0)
                    {
                        const energyAfterCarry = energyAfterMove1 - 50;
                        if (energyAfterCarry > 0)
                        {
                            const work = Math.floor(energyAfterCarry / 100);
                            moveParts = 1;
                            carryParts = 1;
                            workParts = work > 0 ? work : 0;
                        }
                        else
                        {
                            moveParts = 1;
                            carryParts = 1;
                            workParts = 1;
                        }
                    }
                    else
                    {
                        // Can't afford even 1 MOVE part, can't spawn a useful creep
                        moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor(energyAvailable / 50));
                        carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor((energyAvailable - moveParts * 50) / 50));
                        workParts = 0;
                    }
                }
            }
            else if (role === "upgrader")
            {
                // Upgraders harvest from sources directly and upgrade the controller.
                // They need WORK to harvest/upgrade, CARRY to store energy, and MOVE to move.
                // The minimal useful body is [WORK, CARRY, MOVE] = 200 energy.
                // If we have less, we can't spawn a useful upgrader.
                // 
                // MOVE is prioritized for movement efficiency because the spawn is surrounded
                // by walls and the path to the source is long. With 2 MOVE parts and 2 non-MOVE
                // parts, fatigue is neutral (no accumulation). With 2 MOVE and 3 non-MOVE parts,
                // the creep moves every other tick (slow).
                
                if (energyAvailable >= 200)
                {
                    // Start with minimal body and add parts as energy allows
                    const baseCost = 100 + 50 + 50; // WORK + CARRY + MOVE
                    const remainingAfterBase = energyAvailable - baseCost;
                    
                    moveParts = 1;
                    carryParts = 1;
                    workParts = 1;
                    
                    // Add more MOVE parts first for better movement efficiency
                    // With 2 MOVE and 2 non-MOVE parts, fatigue is neutral
                    let moveEnergy = remainingAfterBase;
                    while (moveEnergy >= 50)
                    {
                        moveParts++;
                        moveEnergy -= 50;
                    }
                    
                    // Add more CARRY parts if we have energy (to store more harvested energy)
                    let carryEnergy = moveEnergy;
                    while (carryEnergy >= 50)
                    {
                        carryParts++;
                        carryEnergy -= 50;
                    }
                    
                    // Add more WORK parts if we have energy (upgrade speed scales with WORK parts)
                    let workEnergy = carryEnergy;
                    while (workEnergy >= 100)
                    {
                        workParts++;
                        workEnergy -= 100;
                    }
                }
                else
                {
                    // Can't afford the minimal upgrader body [WORK, CARRY, MOVE] = 200 energy
                    // Try to create a minimal body with available energy
                    // The minimal body for upgrader is [WORK, MOVE] = 150 (no CARRY, picks up from ground)
                    // But upgraders need WORK to upgrade, so we require at least 1 WORK
                    if (role === "upgrader")
                    {
                        // Try to create a minimal body with at least 1 WORK and 1 MOVE
                        // If we can't afford CARRY, the creep harvests and drops energy on ground
                        const energyAfterMove = energyAvailable - 50; // 1 MOVE
                        if (energyAfterMove >= 150)
                        {
                            // Can afford [MOVE, CARRY, WORK] = 200
                            moveParts = 1;
                            carryParts = 1;
                            workParts = 1;
                        }
                        else if (energyAfterMove >= 100)
                        {
                            // Can afford [MOVE, WORK] = 150 (no CARRY, will pick up from ground)
                            moveParts = 1;
                            carryParts = 0;
                            workParts = 1;
                        }
                        else
                        {
                            // Can't afford WORK part, can't spawn a useful upgrader
                            moveParts = 0;
                            carryParts = 0;
                            workParts = 0;
                        }
                    }
                    else
                    {
                        // For harvester and builder, try to make a minimal body with less energy
                        // The minimal body is [WORK, CARRY, MOVE] = 200, but we can try with less
                        // Try: [MOVE, CARRY, WORK] = 200, or [MOVE, CARRY] = 100 (not enough for WORK)
                        // For emergency, try [WORK, MOVE] = 150 (no CARRY, but can pick up from ground)
                        const energyAfterMove = energyAvailable - 50; // 1 MOVE
                        if (energyAfterMove >= 150)
                        {
                            // Can afford [MOVE, CARRY, WORK] = 200
                            moveParts = 1;
                            carryParts = 1;
                            workParts = 1;
                        }
                        else if (energyAfterMove >= 100)
                        {
                            // Can afford [MOVE, WORK] = 150 (no CARRY, will pick up from ground)
                            moveParts = 1;
                            carryParts = 0;
                            workParts = 1;
                        }
                        else if (energyAfterMove >= 50)
                        {
                            // Can afford [MOVE, CARRY] = 100 (no WORK, not useful for harvester/builder)
                            moveParts = 1;
                            carryParts = 1;
                            workParts = 0;
                        }
                        else
                        {
                            // Can't afford even 1 MOVE part
                            moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor(energyAvailable / 50));
                            carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor((energyAvailable - moveParts * 50) / 50));
                            workParts = 0;
                        }
                    }
                }
            }
            else
            {
                // Default: prioritize MOVE, then CARRY, then WORK
                moveParts = Math.min(MIN_BODY_PARTS.move, Math.floor(energyAvailable / 50));
                const energyAfterMove = energyAvailable - moveParts * 50;
                carryParts = Math.min(MIN_BODY_PARTS.carry, Math.floor(energyAfterMove / 50));
                workParts = Math.min(MIN_BODY_PARTS.work, Math.floor((energyAvailable - moveParts * 50 - carryParts * 50) / 100));
            }
        })();

        for (let i = 0; i < workParts; i++) body.push(WORK);
        for (let i = 0; i < carryParts; i++) body.push(CARRY);
        for (let i = 0; i < moveParts; i++) body.push(MOVE);

        return body;
    }

    // Add full sets of body parts (haulers don't need WORK parts, upgraders don't need CARRY)
    for (let i = 0; i < maxSets; i++)
    {
        if (role === "hauler")
        {
            // Haulers: CARRY + MOVE only
            body.push(CARRY);
            body.push(MOVE);
        }
        else if (role === "upgrader")
        {
            // Upgraders harvest from sources directly and upgrade the controller.
            // They need CARRY parts to store harvested energy.
            // They need WORK to upgrade and MOVE to move.
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
        else if (role === "builder")
        {
            // Builders: WORK + WORK + CARRY + MOVE = 300
            // This is a special base body with more WORK parts for efficient building
            body.push(WORK);
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
        else
        {
            // Harvesters: WORK + CARRY + MOVE
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
    }

    // Use remaining energy to add parts
    // For builders, the base body is 300 (WORK, WORK, CARRY, MOVE)
    const builderBaseCost = 300;
    let remainingEnergy = role === "builder" 
        ? energyAvailable - maxSets * builderBaseCost 
        : energyAvailable - maxSets * BASE_CREEP_COST;

    // For builders, use remaining energy to add WORK parts
    if (role === "builder")
    {
        // Add WORK parts first (for efficient building)
        while (remainingEnergy >= 100)
        {
            body.push(WORK);
            remainingEnergy -= 100;
        }

        // Add CARRY parts (for energy transport)
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }

        // Add MOVE parts (for movement)
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
        // Ensure at least 2 MOVE parts (MIN_BODY_PARTS.move)
        const energyForMove = remainingEnergy >= 100 ? 100 : (remainingEnergy >= 50 ? 50 : 0);
        remainingEnergy -= energyForMove;
        for (let i = 0; i < energyForMove / 50; i++)
        {
            body.push(MOVE);
        }
        
        // Then add CARRY parts with remaining energy
        while (remainingEnergy >= 50)
        {
            body.push(CARRY);
            remainingEnergy -= 50;
        }
    }
    else if (role === "harvester")
    {
        // For harvesters, prioritize WORK parts first (to harvest more energy)
        // Then CARRY to deliver, then MOVE to move
        // Ensure at least 1 MOVE part before adding WORK
        const energyForMove = remainingEnergy >= 50 ? 50 : 0;
        remainingEnergy -= energyForMove;
        body.push(MOVE);
        
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
        // Add more MOVE if there's energy
        while (remainingEnergy >= 50)
        {
            body.push(MOVE);
            remainingEnergy -= 50;
        }
    }
    else if (role === "upgrader")
    {
        // For upgraders, prioritize WORK parts first (to upgrade faster)
        // Then CARRY parts (to hold harvested energy) - CARRY is essential for upgraders
        // Then MOVE parts (to reduce fatigue and move efficiently)
        // Upgraders harvest directly from sources and need CARRY to hold the energy
        // Minimal useful body is [WORK, CARRY, MOVE] = 200 energy
        // With no CARRY parts, harvested energy is dropped on the ground (not stored)
        // For better performance, we want at least 2 WORK parts

        // Reserve energy for at least 2 WORK (200), 1 CARRY (50), 2 MOVE (100) = 200 min
        // If we can afford at least 2 WORK + CARRY + MOVE, create that body
        if (remainingEnergy >= 200)
        {
            // Smallest upgrader body: WORK parts first, then CARRY, then MOVE
            body.push(WORK);
            remainingEnergy -= 100;
            // Add CARRY parts for energy capacity (each CARRY provides 50 capacity)
            while (remainingEnergy >= 50 && body.length < 50)
            {
                body.push(CARRY);
                remainingEnergy -= 50;
            }

            // Add MOVE parts for movement efficiency (1 MOVE per 2 other parts on plain)
            while (remainingEnergy >= 50 && body.length < 50)
            {
                body.push(MOVE);
                remainingEnergy -= 50;
            }

            // Add more WORK parts if we have enough energy (upgrade speed scales with WORK parts)
            while (remainingEnergy >= 100 && body.length < 50)
            {
                body.push(WORK);
                remainingEnergy -= 100;
                // Add MOVE parts as needed for neutral fatigue
                while (remainingEnergy >= 50 && body.length < 50)
                {
                    body.push(MOVE);
                    remainingEnergy -= 50;
                }
            }
        }
        else if (remainingEnergy >= 250)
        {
            // At least 1 WORK, 1 CARRY, 2 MOVE = 250
            // This provides better movement efficiency
            body.push(WORK);
            remainingEnergy -= 100;
            body.push(CARRY);
            remainingEnergy -= 50;
            body.push(MOVE);
            remainingEnergy -= 50;
            body.push(MOVE);
            remainingEnergy -= 50;

            // Add more WORK parts if we have enough energy
            while (remainingEnergy >= 100 && body.length < 50)
            {
                body.push(WORK);
                remainingEnergy -= 100;
            }
        }
        else
        {
            // Can't afford a useful upgrader body, so don't spawn
            // Minimum useful body is 2 WORK + CARRY + MOVE = 300 energy
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

    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length === 0)
    {
        return null; // No spawns available
    }

    // Check if spawn is already spawning a creep
    if (spawns[0].spawning !== null)
    {
        return null; // Spawn is busy
    }

    // Use actual energy available for spawning (from spawn + extensions)
    // room.energyAvailable is the energy that can actually be used for spawning
    const spawnEnergy = spawns[0].store[RESOURCE_ENERGY];
    const energyAvailable = room.energyAvailable;

    // Check if we have at least one MOVE part required for every creep

    const creepName = `${role}_${Game.time}_${Memory.creepCounter}`;
    Memory.creepCounter++;

    // Create body based on available energy (not room capacity)
    // Use the lesser of actual available energy or capacity to ensure we don't over-spawn
    const bodyEnergy = Math.min(spawnEnergy, energyAvailable);
    const body = createCreepBody(bodyEnergy, role);

    if (body.length === 0)
    {
        return null; // Could not create any body parts
    }

    // Ensure body has at least one of each: WORK, CARRY, MOVE
    // (Haulers don't need WORK parts, just CARRY and MOVE)
    // (Harvesters can work without CARRY initially - they can harvest without CARRY parts)
    // (Upgraders NEED CARRY parts - they harvest directly from sources and need CARRY to hold energy)
    const isHauler = role === "hauler";
    const isHarvester = role === "harvester";
    const isUpgrader = role === "upgrader";
    const hasWork = body.some((part) => part === WORK);
    const hasCarry = body.some((part) => part === CARRY);
    const hasMove = body.some((part) => part === MOVE);

    if (!hasCarry || !hasMove || (isHauler ? false : !hasWork))
    {
        // Allow spawning with partial bodies when energy is low
        // This ensures the colony can maintain minimum creep count even when energy is low
        // For harvesters, we require at least WORK and MOVE (CARRY is optional for initial harvesting)
        if (isHarvester)
        {
            // Harvesters need WORK to harvest from sources and MOVE to move
            // CARRY is optional - without it, the harvester can still harvest but can't store energy
            // It will drop energy on the ground for builders to pick up
            if (hasWork && hasMove)
            {
                // Can spawn harvester with or without CARRY
                // With CARRY: harvester can store and deliver energy
                // Without CARRY: harvester can harvest but must drop energy on ground
            }
            else
            {
                return null; // Body doesn't have WORK and MOVE - can't harvest
            }
        }
        else if (isUpgrader)
        {
            // Upgraders need CARRY parts to hold harvested energy
            // They harvest directly from sources and need CARRY to upgrade
            // Without CARRY, the creep can't store energy, so it can't upgrade
            if (hasWork && hasCarry && hasMove)
            {
                // Can spawn upgrader with WORK, CARRY, and MOVE
            }
            else
            {
                return null; // Body doesn't have all required parts - can't upgrade
            }
        }
        else
        {
            return null; // Body must have at least CARRY and MOVE; haulers don't need WORK
        }
    }
    // Check if spawn has enough energy to create this body
    const bodyCost = body.reduce((total, part) => total + BODYPART_COST[part], 0);
    if (spawnEnergy < bodyCost)
    {
        return null; // Not enough energy in spawn
    }


    // Upgraders start with working=true to go directly to the controller
    // Harvesters, builders, and haulers start with working=false
    const working = isUpgrader ? true : false;
    const result = spawns[0].spawnCreep(body, creepName, { memory: { role, working } as CreepMemory });

    if (result === OK)
    {
        return creepName;
    }

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
    // Priority order: builders (when sites exist), then harvesters, then upgraders, then haulers
    const roles: string[] = ["builder", "harvester", "upgrader", "hauler"];

    for (const role of roles)
    {
        // Special case: haulers only spawn if container exists or is being built
        if (role === "hauler")
        {
            const containerCount = room.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER,
            }).length;
            const containerSiteCount = room.find(FIND_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER,
            }).length;
            if (containerCount + containerSiteCount === 0)
            {
                continue; // Skip haulers until containers exist or are being built
            }
        }

        const count = getCreepCount(role);
        const minimum = MIN_CREEPS_PER_ROLE[role as keyof typeof MIN_CREEPS_PER_ROLE];

        // Special case: builders spawn when construction sites exist, even if minimum is 0
        if (role === "builder")
        {
            const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
            // Count tower and extension sites (priority construction)
            const prioritySites = constructionSites.filter((site) =>
                site.structureType === STRUCTURE_TOWER || site.structureType === STRUCTURE_EXTENSION
            ).length;
            // Spawn builder if sites exist and no builder exists (priority over harvester)
            if (constructionSites.length > 0 && count === 0)
            {
                // Builder is needed immediately for construction sites
                const spawnedName = spawnCreep(role, room);
                if (spawnedName !== null)
                {
                    return; // Spawned one, stop checking
                }
            }
            // If we have priority construction sites (tower or extensions), spawn a second builder
            // to ensure both tower and extensions get built
            if (prioritySites > 0 && count === 1)
            {
                const spawnedName = spawnCreep(role, room);
                if (spawnedName !== null)
                {
                    return; // Spawned second builder, stop checking
                }
            }
            // If we still have priority construction sites, spawn a third builder
            // to ensure faster construction of both tower and extensions
            if (prioritySites > 0 && count === 2)
            {
                const spawnedName = spawnCreep(role, room);
                if (spawnedName !== null)
                {
                    return; // Spawned third builder, stop checking
                }
            }
            // If count >= minimum and no sites, skip
            if (count >= minimum && constructionSites.length === 0)
            {
                continue;
            }
            // If count >= minimum but sites exist, we still need a builder
            // Fall through to the general check below
        }

        if (count < minimum)
        {
            const spawnedName = spawnCreep(role, room);

            if (spawnedName !== null)
            {
                return; // Spawned one, stop checking
            }
        }
    }

    // Use idle energy to spawn extra creeps if available
    const spawns = room.find(FIND_MY_SPAWNS);
    if (spawns.length > 0 && spawns[0].spawning === null)
    {
        const spawnEnergy = spawns[0].store[RESOURCE_ENERGY];
        const bodyCost = BASE_CREEP_COST;
        
        if (spawnEnergy >= bodyCost)
        {
            const harvesterCount = getCreepCount("harvester");
            const upgraderCount = getCreepCount("upgrader");
            const builderCount = getCreepCount("builder");
            const haulerCount = getCreepCount("hauler");
            const minimum = MIN_CREEPS_PER_ROLE;

            // Priority: builder (if missing) > upgrader > harvester > hauler
            // If builder is missing and sites exist, spawn builder first
            if (builderCount < minimum.builder)
            {
                const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length > 0)
                {
                    const spawnedName = spawnCreep("builder", room);
                    if (spawnedName !== null)
                    {
                        return;
                    }
                }
            }
            
            if (upgraderCount >= minimum.upgrader)
            {
                const spawnedName = spawnCreep("upgrader", room);
                if (spawnedName !== null)
                {
                    return;
                }
            }

            if (harvesterCount >= minimum.harvester)
            {
                const sources = room.find(FIND_SOURCES);
                if (sources.length > harvesterCount)
                {
                    const spawnedName = spawnCreep("harvester", room);
                    if (spawnedName !== null)
                    {
                        return;
                    }
                }
            }

            if (builderCount >= minimum.builder)
            {
                const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
                if (constructionSites.length > 0 && builderCount < 3)
                {
                    const spawnedName = spawnCreep("builder", room);
                    if (spawnedName !== null)
                    {
                        return;
                    }
                }
            }

            if (haulerCount >= minimum.hauler)
            {
                const containerCount = room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER,
                }).length;
                if (containerCount > haulerCount && haulerCount < 3)
                {
                    const spawnedName = spawnCreep("hauler", room);
                    if (spawnedName !== null)
                    {
                        return;
                    }
                }
            }
        }
    }
}

/** Builder Role
 * Builds and repairs structures in the room.
 * If no construction sites exist, upgrades the controller instead.
 * Prioritizes tower and extension sites over roads.
 */

/**
 * Runs the builder creep behavior.
 * Builds construction sites, repairs structures, and upgrades controller when idle.
 * @param creep The builder creep to run
 */
export function runBuilder(creep: Creep): void
{
    // Update working state based on store capacity
    if (creep.memory.working && creep.store[RESOURCE_ENERGY] === 0)
    {
        creep.memory.working = false;
    }
    else if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
    {
        creep.memory.working = true;
    }

    // If not working (empty store), harvest from sources
    if (!creep.memory.working)
    {
        const source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

        if (source === null)
        {
            // No sources found or reachable
            // If we have some energy, switch to working mode to build/upgrade
            // If we have no energy, still switch to working mode to be productive
            // This prevents the builder from being stuck in harvesting mode indefinitely
            creep.memory.working = true;
            return;
        }

        if (creep.harvest(source) === ERR_NOT_IN_RANGE)
        {
            creep.moveTo(source, { ignoreCreeps: true });
        }
        return;
    }

    // Find construction sites, prioritizing tower > extension > roads
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if (constructionSites.length > 0)
    {
        // Sort sites by priority: tower first, then extension, then roads
        const towerSites: ConstructionSite[] = [];
        const extensionSites: ConstructionSite[] = [];
        const roadSites: ConstructionSite[] = [];

        for (const site of constructionSites)
        {
            if (site.structureType === STRUCTURE_TOWER)
            {
                towerSites.push(site);
            }
            else if (site.structureType === STRUCTURE_EXTENSION)
            {
                extensionSites.push(site);
            }
            else
            {
                roadSites.push(site);
            }
        }

        // If we have tower sites, only build those
        let selectedSite: ConstructionSite | null = null;
        if (towerSites.length > 0)
        {
            // Get the closest tower site
            selectedSite = creep.pos.findClosestByPath(towerSites);
        }
        else if (extensionSites.length > 0)
        {
            // Get the closest extension site
            selectedSite = creep.pos.findClosestByPath(extensionSites);
        }
        else if (roadSites.length > 0)
        {
            // Only build roads if no tower or extension sites exist
            selectedSite = creep.pos.findClosestByPath(roadSites);
        }

        if (selectedSite !== null)
        {
            const result = creep.build(selectedSite);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(selectedSite, { ignoreCreeps: true, range: 1 });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the construction site (range 0)
                // Move away from the site to unblock the path
                moveAwayFromSite(creep, selectedSite.pos);
            }
            return;
        }
    }

    // Find the closest damaged structure to repair (excluding walls and ramparts)
    // Prioritize: tower > roads/containers
    const damagedStructures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) =>
        {
            return structure.hits < structure.hitsMax
                && structure.structureType !== STRUCTURE_WALL
                && structure.structureType !== STRUCTURE_RAMPART;
        },
    });

    if (damagedStructures.length > 0)
    {
        // Prioritize tower repair
        const damagedTowers = damagedStructures.filter((structure) =>
            structure.structureType === STRUCTURE_TOWER
        );

        let selectedStructure: Structure | null = null;

        if (damagedTowers.length > 0)
        {
            // Filter out towers that are occupied by creeps
            const availableTowers = damagedTowers.filter((structure) =>
            {
                const creepsOnTile = structure.pos.lookFor(LOOK_CREEPS);
                return creepsOnTile.length === 0;
            });

            if (availableTowers.length > 0)
            {
                selectedStructure = creep.pos.findClosestByPath(availableTowers);
            }
        }

        if (selectedStructure === null)
        {
            // Filter out structures that are occupied by creeps
            const availableStructures = damagedStructures.filter((structure) =>
            {
                const creepsOnTile = structure.pos.lookFor(LOOK_CREEPS);
                return creepsOnTile.length === 0;
            });

            // If no structures are available (all occupied), just wait and try again next tick
            if (availableStructures.length === 0)
            {
                return;
            }

            selectedStructure = creep.pos.findClosestByPath(availableStructures);
        }

        if (selectedStructure !== null)
        {
            const result = creep.repair(selectedStructure);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(selectedStructure, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the structure (range 0)
                // Move away from the structure to unblock the path
                moveAwayFromSite(creep, selectedStructure.pos);
            }
            return;
        }
    }

    // If no construction or repair needed, upgrade the controller
    const controller = creep.room.controller;

    if (controller !== undefined && controller !== null)
    {
        // Check if controller position is occupied by a creep
        const creepsOnController = controller.pos.lookFor(LOOK_CREEPS);
        if (creepsOnController.length === 0)
        {
            const result = creep.upgradeController(controller);
            if (result === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(controller, { ignoreCreeps: true });
            }
            else if (result === ERR_INVALID_TARGET)
            {
                // Creep is on top of the controller (range 0) or controller is full
                // Move away from controller to unblock the path and switch to harvesting
                moveAwayFromSite(creep, controller.pos);
                creep.memory.working = false;
                return;
            }
        }
        else
        {
            // Controller is occupied by another creep, just wait and try again next tick
        }
    }
}

/**
 * Moves the creep away from a site to unblock the path.
 * Tries all 8 directions until one succeeds.
 * @param creep The creep to move
 * @param targetPos The position to move away from
 */
function moveAwayFromSite(creep: Creep, targetPos: RoomPosition): void
{
    // Calculate direction away from the site/controller
    const dx = creep.pos.x - targetPos.x;
    const dy = creep.pos.y - targetPos.y;

    // Determine best direction based on relative position
    let moveDir: DirectionConstant;
    if (Math.abs(dx) > Math.abs(dy))
    {
        // Farther apart in X direction
        moveDir = dx > 0 ? RIGHT : LEFT;
    }
    else
    {
        // Farther apart in Y direction or equal
        moveDir = dy > 0 ? BOTTOM : TOP;
    }

    // Try all 8 directions in order of preference
    const directions: DirectionConstant[] = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
    
    // Start from the calculated direction and try all others
    const startIdx = directions.indexOf(moveDir);
    if (startIdx === -1)
    {
        // If calculated direction not in list, start from 0
        for (const dir of directions)
        {
            if (creep.move(dir) === OK)
            {
                return;
            }
        }
    }
    else
    {
        // Try all directions starting from the calculated direction
        for (let i = 0; i < 8; i++)
        {
            const dirIdx = (startIdx + i) % 8;
            if (creep.move(directions[dirIdx]) === OK)
            {
                return;
            }
        }
    }
}

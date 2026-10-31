import "types/memory";
import { ErrorMapper } from "utils/ErrorMapper";
import { checkAndSpawn } from "managers/spawnManager";
import { cleanMemory } from "managers/memoryManager";
import { manageConstruction } from "managers/constructionManager";
import { manageMode } from "managers/modeManager";
import { manageTower } from "managers/towerManager";
import { reportCPU } from "managers/cpuReporter";
import { runBuilder } from "roles/builder";
import { runDefender } from "roles/defender";
import { runHarvester } from "roles/harvester";
import { runHauler } from "roles/hauler";
import { runUpgrader } from "roles/upgrader";

/**
 * Runs the main game loop logic.
 * This function is wrapped by ErrorMapper to provide source-mapped error traces.
 */
function mainLoop(): void
{
    // Clean up memory of dead creeps first
    cleanMemory();

    // Report CPU usage periodically
    reportCPU();

    // Run creeps based on their roles
    // Iterate over creeps directly, and for each creep, get its room
    const creepNames = Object.keys(Game.creeps);

    for (const creepName of creepNames)
    {
        const creep = Game.creeps[creepName];

        if (creep !== undefined)
        {
            // Run the creep based on its role
            switch (creep.memory.role)
            {
                case "harvester":
                    runHarvester(creep);
                    break;
                case "upgrader":
                    runUpgrader(creep);
                    break;
                case "builder":
                    runBuilder(creep);
                    break;
                case "hauler":
                    runHauler(creep);
                    break;
                case "defender":
                    runDefender(creep);
                    break;
            }
        }
    }

    // Spawn new creeps in each room we have access to
    const roomNames = Object.keys(Game.rooms);

    for (const roomName of roomNames)
    {
        const room = Game.rooms[roomName];

        if (room !== undefined)
        {
            // Mode first: the spawn (defender reserve) and the towers
            // (repair gate) read Memory.mode set this same tick.
            manageMode(room);
            checkAndSpawn(room);
            manageConstruction(room);
            manageTower(room);
        }
    }
}

// Export the wrapped loop function
export const loop = ErrorMapper.wrapLoop(mainLoop);

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
import { runMiner } from "roles/miner";
import { runUpgrader } from "roles/upgrader";

/**
 * Tick error guard (owner feedback 2026-11-01).
 *
 * Runs fn inside a try/catch so one broken manager or creep can never
 * abort the rest of the tick. Before this existed, a throw inside
 * manageConstruction (a RoomPosition constructed outside the room near a
 * room-edge spawn) aborted the whole tick - the towers never acted on
 * those ticks and the room was left undefended while every test still
 * passed.
 *
 * Logging: the first throw of each guard is always logged; while the same
 * guard keeps failing it is logged at most once per 100 ticks, so a
 * persistent bug stays visible in the console without spamming it
 * (console.log costs CPU, rule 02).
 */
const lastErrorTick: { [guardName: string]: number } = {};

function guard(guardName: string, fn: () => void): void
{
    try
    {
        fn();
    }
    catch (error)
    {
        const last = lastErrorTick[guardName];
        if (last === undefined || Game.time - last >= 100)
        {
            console.log("loop: " + guardName + " threw: " +
                (error instanceof Error ? error.message : String(error)));
            lastErrorTick[guardName] = Game.time;
        }
    }
}

/**
 * Runs one creep by its memory role (the switch that used to live inline
 * in mainLoop).
 *
 * @param creep The creep to run.
 */
function runCreepByRole(creep: Creep): void
{
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
        case "miner":
            runMiner(creep);
            break;
        case "defender":
            runDefender(creep);
            break;
    }
}

/**
 * Runs the main game loop logic.
 * This function is wrapped by ErrorMapper to provide source-mapped error traces.
 *
 * Per-room manager order (owner feedback 2026-11-01): manageMode first -
 * it sets Memory.mode, which both the spawn (defender reserve) and the
 * towers (repair gate) read this same tick - then manageTower, so defense
 * acts before the economy managers: even if a later manager throws (and
 * its guard swallows it), the towers already had their turn on the tick.
 */
function mainLoop(): void
{
    // Clean up memory of dead creeps first
    guard("cleanMemory", cleanMemory);

    // Report CPU usage periodically
    guard("reportCPU", reportCPU);

    // Run creeps based on their roles. Each creep runs under its own guard:
    // one broken creep must never stop the other creeps or the managers.
    const creepNames = Object.keys(Game.creeps);

    for (const creepName of creepNames)
    {
        const creep = Game.creeps[creepName];

        if (creep !== undefined)
        {
            guard("creep:" + creepName, () => runCreepByRole(creep));
        }
    }

    // Spawn new creeps in each room we have access to
    const roomNames = Object.keys(Game.rooms);

    for (const roomName of roomNames)
    {
        const room = Game.rooms[roomName];

        if (room !== undefined)
        {
            guard("manageMode:" + roomName, () => manageMode(room));
            guard("manageTower:" + roomName, () => manageTower(room));
            guard("checkAndSpawn:" + roomName, () => checkAndSpawn(room));
            guard("manageConstruction:" + roomName, () => manageConstruction(room));
        }
    }
}

// Export the wrapped loop function
export const loop = ErrorMapper.wrapLoop(mainLoop);

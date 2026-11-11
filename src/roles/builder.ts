/**
 * Builder creep role.
 *
 * Energy loop (owner rule #3, relaxed):
 *   A builder withdraws energy from the spawn or an extension once the room
 *   holds at least BUILDER_WITHDRAW_FRACTION of its capacity; only below that
 *   floor does it harvest from a source itself and stay there until its store
 *   is full. The floor keeps the spawn stocked: a builder that drains the
 *   spawn whenever it has free carry capacity empties it and blocks every
 *   creep respawn. (The original rule was "only when the room is completely
 *   full", but surplus spawning keeps the store cycling, so it is rarely
 *   completely full and the full-room gate starved the builders into the
 *   far-source self-harvest loop - see config.ts for the numbers.)
 *
 *   Dropped energy: before either of those, an empty builder grabs a pile on
 *   the ground - but only one within BUILDER_DROP_PICKUP_RANGE of itself. A
 *   distant pile (a harvester dumping a full load at a far source while the
 *   spawn was full) is a cross-map round trip that costs more than the
 *   energy is worth; the spawn next to the build site is always the better
 *   haul. The range gate is what stops the M5 "chasing distant drops" loop
 *   (see config.ts and the runBuilder phase-2 comment).
 *
 *   Upgrader hold-back: while fewer upgraders are alive than the minimum
 *   (upgraderBelowMinimum in managers/spawnManager), the builder does not
 *   withdraw at any store level - the room's energy belongs to the next
 *   upgrader spawn. While no controller container exists, the upgrader's
 *   body costs the whole RCL 1 capacity (300), and the 50% withdrawal
 *   floor pins the store at 150, so without the hold-back the first
 *   upgrader never spawns and the smoke test's
 *   controller-progress criterion fails (run of 2026-11-01). The builder
 *   self-harvests during the window, exactly like the original full-room
 *   gate; once the upgrader is alive the floor applies again.
 *
 * Build priority (M4):
 *   1. In defend or war mode, rampart sites: the shield the spawn and the
 *      towers sit behind is finished before anything else, tower site
 *      included.
 *   2. The tower site, on its own: it is a single 5,000-energy structure
 *      and the M3 test fails unless it is finished. With every builder on
 *      it, the tower completes first and only then do builders spread over
 *      the 3,000-energy extensions.
 *   3. Rampart sites (peace): one on the spawn's tile and one on each
 *      finished tower's tile. Each costs only 300 energy for 10,000 hits -
 *      cheap insurance, and the M4 spec puts them right after the towers.
 *   4. Container sites (M5) - but only while containerFirstForRoom says so.
 *      The first container is what unlocks the stationary miner, so once it
 *      is right to build containers first, the crew stays on them: while a
 *      container is ALREADY BUILT (rule 02b's stage boundary - bootstrap
 *      ends when the first container exists, and the remaining container
 *      queue then matters as much as the first one), in a level 1-2 room
 *      once the FIRST extension and road are finished (the M2 layout
 *      minimum is met, so the container may take the crew), and in a level
 *      4+ room once three extensions are finished (the M5 static-mining
 *      stage: the container sits right after the towers, gated on the M4
 *      extension floor so it cannot starve the third extension). The
 *      M1/M2/M3 order otherwise keeps containers behind extensions and
 *      roads: the unconditional container-first of 2026-11-01 pinned the
 *      whole crew on the first 5,000-energy container site from ~tick 400
 *      (the construction manager places a container site from RCL 1) and
 *      left M2 with 0 finished extensions and 0 finished roads at tick
 *      3,000 (gate failure of 2026-11-01).
 *   5. Extension sites, all builders on ONE of them: the most advanced
 *      (highest build progress, ties broken by closeness to the spawn).
 *      The room state is shared, so every builder computes the same focus
 *      without any memory - and the choice survives a global reset.
 *   6. Road sites.
 *
 *   Level 5 and up (M5): the whole queue above is replaced by the static-
 *   mining ladder (selectContainerFirstSite): first tower, first extension,
 *   the source containers, the controller container, the M4 extension floor
 *   (three finished extensions), ramparts, the second tower, the remaining
 *   extensions, roads, and any leftover container site. That is the only
 *   order in which a 6,000-tick window (M4) finishes the tower, the first
 *   extension, both source containers, the controller container and three
 *   extensions, while a 5,000-tick window (M5) still gets the upgrader
 *   back on the controller before the measured last 1,000 ticks. Below
 *   level 5 the bootstrap order 1-6 owns the crew, because M2 and M3
 *   measure exactly that order.
 *
 *   The tower used to share its class with the extensions ("closest
 *   priority site wins"), and that is exactly how it starved in the first
 *   M3 attempt: builders cluster on the closest extensions and finish all
 *   of them before the tower gets a full build cycle - measured 4,959 of
 *   5,000 tower progress at the end of the window. Tower-own-class is the
 *   fix (acceptance failure of 2026-10-30).
 *
 *   Spreading is the trap on the extensions too: if every builder picks
 *   its own nearest site, one creep lands per site and none of them ever
 *   finishes, while the room's energy capacity only grows when a site is
 *   COMPLETE. Measured on the second M3 attempt (tower now first, 2026-10-30):
 *   the tower finished and the first two extensions took ~450 ticks each,
 *   but the crew then split over the remaining eight sites and the third
 *   extension was still more than 2,000 energy short at the end of the
 *   window. One shared focus per extension fixes that.
 *
 *   Roads sit at the bottom: in bootstrap (no tower, container, or
 *   extension site yet) the first finished road is what M2 measures within
 *   3,000 ticks of an RCL 1 start, and while priority sites exist, builders
 *   never reach the road list - the 3,000-energy extension sites keep them
 *   busy for the whole M3 window. Containers now lead the queue from RCL 2
 *   on (M5): they are what unlocks the stationary miner, so they are the
 *   long-term fallback no longer - they are the next step.
 *
 * With no sites left, a builder upgrades the controller instead of idling
 * (an idle creep is a bug).
 *
 * Self-harvest source choice: the source nearest the spawn (Chebyshev) that
 * still has a free tile to stand on - except the upgrader's source, while
 * the upgrader is actually upgrading. The upgrader anchors on the
 * controller and harvests the source nearest it (see upgrader.ts); that
 * source's standable tiles are scarce (the test world's pocket source has
 * exactly two, one owned by a harvester), so a builder that self-harvests
 * there blocks the upgrader (the controller-progress regression: 50 total
 * -> 0 in 700 ticks). The builder therefore ranks the upgrader's source
 * last and takes the other one, falling back to the upgrader's only when
 * the other has no free tile. While a tower or extension site exists the
 * upgrader runs this same builder role (see upgrader.ts), so no source is
 * "the upgrader's" then and the yield is skipped. The standable-tile
 * filter still applies (see utils/pickSource).
 *
 * The choice is latched in memory.sourceId for the whole collect phase and
 * re-made only when the store empties (the cycle boundary: the builder just
 * spent its load at a site), or when the latched source vanishes or runs
 * dry while another source is live. Re-picking every tick against
 * transient occupancy is what the upgrader's oscillation bug was (see
 * upgrader.ts): a creep that keeps re-rolling between the two sources walks
 * the long way forever and harvests nothing. With the latch each builder
 * keeps its camp for the cycle, so the surplus builders (owner feedback
 * 2026-10-30: they drain the store, so it no longer pins full and the
 * builders must self-harvest between full ticks) settle onto the two
 * sources instead of trading tiles (measured: construction 3.11 ->
 * 0.19/tick, idle 8 % -> 23 % while they oscillated).
 */

import {
    CONTAINER_BOOST_MAX_LEVEL,
    CONTAINER_BOOST_MIN_EXTENSIONS,
    CONTAINER_BOOST_MIN_EXTENSIONS_L4,
    CONTAINER_BOOST_MIN_LEVEL,
    CONTAINER_BOOST_MIN_ROADS,
    CONTAINER_EARLY_MIN_LEVEL,
    CONTROLLER_CONTAINER_RANGE,
} from "config";
import { pickSourceWithStandableTile, sortSourcesByDistance } from "utils/pickSource";
import { getEnergy } from "utils/energy";
import { moveToToward } from "utils/movement";

/**
 * Whether another one of our creeps stands on a construction site's tile.
 *
 * build() needs the builder to be the only object on the site's tile -
 * while a waiting creep sits there the call returns ERR_INVALID_TARGET.
 * Waiting creeps (harvesters delivering energy, haulers parked by the
 * spawn) end their moves on the tiles around the spawn, so a site there
 * is blocked for as long as deliveries keep coming. That is the M4
 * builder/extension deadlock (owner feedback 2026-11-05, extensionsBuilt
 * 0 of 3): the blocked site holds the most progress, so it keeps winning
 * the focus every tick, and the crew spins without finishing anything.
 * @param site The construction site considered as a build target
 * @param builder The builder that would work it (excluded from the check)
 * @returns True when a waiting creep blocks the site's tile
 */
function isBlockedByWaitingCreeps(site: ConstructionSite, builder: Creep): boolean
{
    const onTile = site.pos.lookFor(LOOK_CREEPS);
    for (const other of onTile)
    {
        if (other.id !== builder.id && other.my)
        {
            return true;
        }
    }
    return false;
}

/**
 * Picks the extension site the whole crew converges on: the most advanced
 * one (highest build progress; a tie goes to the site closest to the
 * spawn). All builders see the same progress numbers, so they all compute
 * the same focus from shared room state: no Memory, and a global reset
 * cannot desynchronise the crew.
 * @param extensionSites The candidate extension sites (block-filtered).
 * @param room The room (for the spawn-position tie-break).
 * @param creep The builder (the fallback distance target).
 * @returns The focus site, or null when no site remains.
 */
function focusExtension(extensionSites: ConstructionSite[], room: Room, creep: Creep): ConstructionSite | null
{
    if (extensionSites.length === 0)
    {
        return null;
    }
    const spawn = room.find(FIND_MY_SPAWNS)[0];
    const distanceToSpawn = (site: ConstructionSite): number =>
        spawn !== undefined
            ? site.pos.getRangeTo(spawn.pos)
            : creep.pos.getRangeTo(site.pos);
    return extensionSites.sort(
        (a, b) => (b.progress - a.progress) || (distanceToSpawn(a) - distanceToSpawn(b)),
    )[0];
}

/**
 * Selects the next construction site for a builder.
 *
 * Priority (M4): in defend or war mode the rampart sites come first;
 * otherwise, at controller level CONTAINER_EARLY_MIN_LEVEL and up, the
 * static-mining ladder (selectContainerFirstSite) takes over; below that
 * level the bootstrap order applies: the tower site on its own, then
 * ramparts, then - while containerFirstForRoom applies - ONE container (the
 * nearest one), then ONE extension (the most advanced, so the whole crew
 * converges on it and actually finishes it), then roads, and containers
 * last of all. Within a priority class the tie-breakers are progress and
 * distance, never a free-for-all.
 * @param creep The builder that needs a target (used for pathing)
 * @param room The room to search
 * @param excludeIds Site ids to skip (the ERR_INVALID_TARGET retry passes
 *        in the site the engine just refused, so the load goes to the next
 *        best target instead of back to refill)
 * @returns The selected site, or null when nothing is under construction
 */
function selectBuildSite(creep: Creep, room: Room, excludeIds: ReadonlySet<string> = new Set()): ConstructionSite | null
{
    const sitesOf = (type: BuildableStructureConstant): ConstructionSite[] =>
        room.find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => site.structureType === type && !excludeIds.has(site.id),
        });

    // Rampart focus: the crew works the most advanced rampart (highest
    // build progress; a tie goes to the site closest to the spawn) so a
    // rampart is actually FINISHED instead of every builder nibbling at the
    // newest site. Same shared-state rule as the extension focus below.
    const rampartSites = sitesOf(STRUCTURE_RAMPART);
    const focusRampart = (): ConstructionSite | null =>
    {
        if (rampartSites.length === 0)
        {
            return null;
        }
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const distanceToSpawn = (site: ConstructionSite): number =>
            spawn !== undefined
                ? site.pos.getRangeTo(spawn.pos)
                : creep.pos.getRangeTo(site.pos);
        return rampartSites.sort(
            (a, b) => (b.progress - a.progress) || (distanceToSpawn(a) - distanceToSpawn(b)),
        )[0];
    };

    // Defend/war mode (M4): the shield comes before everything, even the
    // tower site - with the ramparts up, the towers can do their job.
    const mode = Memory.mode ?? "peace";
    if (mode !== "peace")
    {
        const focus = focusRampart();
        if (focus !== null)
        {
            return focus;
        }
    }

    // M5 ladder (idea a): from controller level CONTAINER_EARLY_MIN_LEVEL
    // up the static-mining order owns the crew - it is the only order in
    // which the M4 and M5 acceptance windows both pass (see the file
    // header for the rungs). Below it the bootstrap order below applies.
    // A room whose controller has no readable level counts as level 1,
    // same convention as containerFirstForRoom.
    const level = room.controller !== undefined &&
        typeof room.controller.level === "number"
        ? room.controller.level
        : 1;
    if (level >= CONTAINER_EARLY_MIN_LEVEL)
    {
        return selectContainerFirstSite(creep, room, excludeIds);
    }

    // The tower gets its own class above the extensions (see the file
    // header for why): all builders on the one 5,000-energy tower site
    // finish it first, then move on to the extensions.
    const towerSites = sitesOf(STRUCTURE_TOWER);
    if (towerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(towerSites);
    }

    // Peace mode: ramparts come right after the towers (the M4 spec order:
    // tower sites, then ramparts, then extensions, then everything else,
    // roads last).
    const rampart = focusRampart();
    if (rampart !== null)
    {
        return rampart;
    }

    // M5: containers come before extensions and roads - but only while
    // containerFirstForRoom applies (see it for the gate and why the
    // unconditional container-first of 2026-11-01 broke M2). Without the
    // gate, containers fall to the very end of the queue, behind roads.
    const containerSites = sitesOf(STRUCTURE_CONTAINER);
    if (containerSites.length > 0 && containerFirstForRoom(room))
    {
        return creep.pos.findClosestByPath<ConstructionSite>(containerSites);
    }

    // Extensions: the whole crew works ONE site at a time (see
    // focusExtension for the convergence rule). Finishing a site raises
    // the room's energy capacity, which is what the milestone measures.
    const extensionSites = sitesOf(STRUCTURE_EXTENSION).filter(
        (site) => !isBlockedByWaitingCreeps(site, creep),
    );
    const extensionFocus = focusExtension(extensionSites, room, creep);
    if (extensionFocus !== null)
    {
        return extensionFocus;
    }

    // Roads come after containers and extensions: in bootstrap (no tower or
    // container or extension site) the first finished road is what M2
    // measures within 3,000 ticks of an RCL 1 start, and while priority
    // sites exist builders never reach this list again.
    const roadSites = sitesOf(STRUCTURE_ROAD);
    if (roadSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(roadSites);
    }

    // Containers last (the pre-M5 fallback): the gate above keeps the crew
    // on extensions and roads in bootstrap until M2's minimum is met, and a
    // room that has run out of extension and road sites still finishes its
    // container sites here instead of letting the builders upgrade.
    if (containerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(containerSites);
    }

    return null;
}

/**
 * The static-mining build ladder (M5 idea a), used from controller level
 * CONTAINER_EARLY_MIN_LEVEL up (see selectBuildSite for the dispatch).
 *
 * The rungs, in order:
 *   1. The FIRST tower (rung 1): the M4 defense must exist before anything
 *      else spends 5,000 energy.
 *   2. The FIRST extension (rung 2): one 3,000-energy build of headroom
 *      before the two 5,000-energy source containers take the queue.
 *   3. The SOURCE containers (rung 3): the stationary miners' tiles - the
 *      stage-2 boundary of rule 02b. Both sources get theirs before the
 *      room spends more on anything else.
 *   4. The CONTROLLER container (rung 4, idea d): within
 *      CONTROLLER_CONTAINER_RANGE of the controller, it turns the
 *      upgrader's long harvest-to-controller round trip into a short hop,
 *      which is what the M5 "spend the spare energy" criterion measures.
 *      It sits BEFORE the extension floor: the M5 window (5,000 ticks)
 *      needs the upgrader back on the controller by the measured last
 *      1,000 ticks, and only this rung order gets there in time.
 *   5. The M4 extension FLOOR (rung 5): three finished extensions (450
 *      energy capacity) - the unconditioned container-first of 2026-11-09
 *      failed M4 for starving exactly this rung.
 *   6. Ramparts (rung 6, peace mode only; defend/war already led with
 *      them in selectBuildSite).
 *   7. The SECOND tower (rung 7): its tile was reserved by the
 *      construction manager, so the site exists whenever the first tower
 *      is done.
 *   8. The remaining extensions (rung 8), most advanced first.
 *   9. Roads (rung 9), and 10. any leftover container site (rung 10 -
 *      defensive: rungs 3 and 4 normally take them all).
 * @param creep The builder that needs a target
 * @param room The room to search
 * @param excludeIds Site ids to skip (the ERR_INVALID_TARGET retry passes
 *        in the site the engine just refused)
 * @returns The selected site, or null when nothing is under construction
 */
function selectContainerFirstSite(creep: Creep, room: Room, excludeIds: ReadonlySet<string>): ConstructionSite | null
{
    const sitesOf = (type: BuildableStructureConstant): ConstructionSite[] =>
        room.find(FIND_CONSTRUCTION_SITES, {
            filter: (site) => site.structureType === type && !excludeIds.has(site.id),
        });

    const towerSites = sitesOf(STRUCTURE_TOWER);
    const extensionSites = sitesOf(STRUCTURE_EXTENSION).filter(
        (site) => !isBlockedByWaitingCreeps(site, creep),
    );
    const containerSites = sitesOf(STRUCTURE_CONTAINER);
    const structures = room.find(FIND_MY_STRUCTURES);
    const towersBuilt = structures.filter(
        (structure) => structure.structureType === STRUCTURE_TOWER,
    ).length;
    const extensionsBuilt = structures.filter(
        (structure) => structure.structureType === STRUCTURE_EXTENSION,
    ).length;

    // Rung 1: the first tower.
    if (towersBuilt === 0 && towerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(towerSites);
    }

    // Rung 2: the first extension, before the 5,000-energy containers.
    if (extensionsBuilt === 0)
    {
        const focus = focusExtension(extensionSites, room, creep);
        if (focus !== null)
        {
            return focus;
        }
    }

    // Rung 3: the source containers (the miners' standing tiles).
    const sources = room.find(FIND_SOURCES);
    const sourceContainerSites = containerSites.filter(
        (site) => sources.some((source) => site.pos.getRangeTo(source.pos) <= 1),
    );
    if (sourceContainerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(sourceContainerSites);
    }

    // Rung 4: the controller container (idea d) - before the extension
    // floor, because the M5 window needs the upgrader's round trip
    // shortened by its measured last 1,000 ticks.
    const controller = room.controller;
    const controllerContainerSite = controller !== undefined
        ? containerSites.find(
            (site) => site.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE,
        )
        : undefined;
    if (controllerContainerSite !== undefined)
    {
        return controllerContainerSite;
    }

    // Rung 5: the M4 extension floor (three finished extensions, 450
    // energy capacity).
    if (extensionsBuilt < CONTAINER_BOOST_MIN_EXTENSIONS_L4)
    {
        const focus = focusExtension(extensionSites, room, creep);
        if (focus !== null)
        {
            return focus;
        }
    }

    // Rung 6: ramparts (peace mode; defend/war led with them already).
    const rampartSites = sitesOf(STRUCTURE_RAMPART);
    if (rampartSites.length > 0)
    {
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const distanceToSpawn = (site: ConstructionSite): number =>
            spawn !== undefined
                ? site.pos.getRangeTo(spawn.pos)
                : creep.pos.getRangeTo(site.pos);
        return rampartSites.sort(
            (a, b) => (b.progress - a.progress) || (distanceToSpawn(a) - distanceToSpawn(b)),
        )[0];
    }

    // Rung 7: the second tower (its tile was reserved, so the site exists).
    if (towerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(towerSites);
    }

    // Rung 8: the remaining extensions, most advanced first.
    const extensionFocus = focusExtension(extensionSites, room, creep);
    if (extensionFocus !== null)
    {
        return extensionFocus;
    }

    // Rung 9: roads.
    const roadSites = sitesOf(STRUCTURE_ROAD);
    if (roadSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(roadSites);
    }

    // Rung 10: any leftover container site.
    if (containerSites.length > 0)
    {
        return creep.pos.findClosestByPath<ConstructionSite>(containerSites);
    }

    return null;
}

/**
 * Decides whether container sites lead the build queue in this room (M5).
 *
 * The unconditional container-first of 2026-11-01 pinned the whole crew on
 * the first 5,000-energy container site as soon as the construction manager
 * placed one - at RCL 1, ~400 ticks in (smoke: 401 build energy on the
 * container at tick 500) - so in the 3,000-tick M2 window neither an
 * extension nor a road ever finished (gate failure of 2026-11-01: 0 of
 * each). Containers now lead only in the two situations where nothing M2 or
 * M3 measures can starve:
 *   1. A container is already BUILT: rule 02b's stage boundary - bootstrap
 *      ends when the first container exists, and from there the remaining
 *      container queue matters as much as the first one (its miner is what
 *      pays for it).
 *   2. The room is at controller level CONTAINER_BOOST_MAX_LEVEL (2) or
 *      below and has already finished at least CONTAINER_BOOST_MIN_EXTENSIONS
 *      extension and CONTAINER_BOOST_MIN_ROADS road: the M2 layout minimum
 *      ("extension built >= 1" and "road built >= 1") is met, so the
 *      container may take the crew - that is what unlocks the stationary
 *      miner inside the M2/M5 window.
 *   3. The room is at controller level CONTAINER_BOOST_MIN_LEVEL (4) or
 *      above and has already finished at least
 *      CONTAINER_BOOST_MIN_EXTENSIONS_L4 (3) extensions: the M5 static-
 *      mining stage (rule 02b) - the first source container is right after
 *      the towers in build order, but only once the M4 extension floor
 *      ("at least 3 extensions are finished") is met, so the boost cannot
 *      starve the third extension (the unconditioned L4+ boost failed the
 *      M4 acceptance on 2026-11-09: extensionsBuilt 1, capacity 350).
 * At controller level 3 the tower-plus-extension density contract
 * (M3) owns the crew instead, and containers wait for case 1.
 * @param room The room to check
 * @returns True when container sites lead the build queue
 */
export function containerFirstForRoom(room: Room): boolean
{
    // FIND_STRUCTURES, not FIND_MY_STRUCTURES: in @types/screeps the
    // MY_STRUCTURES union excludes containers and roads (AnyOwnedStructure),
    // and the rest of the codebase (spawnManager, constructionManager)
    // counts built containers/roads the same way. One find, reused for
    // every check below (CPU: the builders call this once per tick each
    // while a container site exists).
    const structures = room.find(FIND_STRUCTURES);
    const builtContainer = structures.some(
        (structure) => structure.structureType === STRUCTURE_CONTAINER,
    );
    if (builtContainer)
    {
        return true;
    }
    // Same undefined guard as spawnManager: a room without a visible
    // controller counts as level 1 for this check.
    const level = room.controller !== undefined ? room.controller.level : 1;
    if (level > CONTAINER_BOOST_MAX_LEVEL)
    {
        // M5 static-mining stage (case 3): at level 4 and up the first
        // source container takes the crew - right after the towers in
        // selectBuildSite - once the M4 extension floor is finished. The
        // floor is load-bearing: boosted right after the tower, the crew
        // camps the 5,000-energy container site and the third extension
        // never finishes (M4 failure of 2026-11-09: extensionsBuilt 1,
        // capacity 350 vs 3/450). Level 3 keeps the M3 contract.
        if (level >= CONTAINER_BOOST_MIN_LEVEL)
        {
            return structures.filter(
                (structure) => structure.structureType === STRUCTURE_EXTENSION,
            ).length >= CONTAINER_BOOST_MIN_EXTENSIONS_L4;
        }
        return false;
    }
    const builtExtensions = structures.filter(
        (structure) => structure.structureType === STRUCTURE_EXTENSION,
    ).length;
    const builtRoads = structures.filter(
        (structure) => structure.structureType === STRUCTURE_ROAD,
    ).length;
    return builtExtensions >= CONTAINER_BOOST_MIN_EXTENSIONS
        && builtRoads >= CONTAINER_BOOST_MIN_ROADS;
}

/**
 * Checks whether the room has a build site that should pause the upgrader.
 *
 * Below level 5 (legacy, M3): an unfinished TOWER site - the upgrader's
 * WORK parts belong to the tower while it is still a site (the 5,000-energy
 * tower must finish inside the test window, and a fourth builder is the
 * difference).
 *
 * At level CONTAINER_EARLY_MIN_LEVEL and up (the static-mining ladder,
 * M5 ideas a and d): the upgrader builds the rungs that precede its return
 * in selectContainerFirstSite - the FIRST tower (rung 1; the second tower
 * is rung 7, after the extension floor, by which time its WORK belongs to
 * the controller), the FIRST extension (rung 2), any SOURCE container site
 * (rung 3) and any CONTROLLER container site (rung 4). The extension floor
 * (rungs 5-8) and roads do NOT pause it: the M5 test measures controller
 * progress in its last 1,000 ticks, and pausing for the extension queue is
 * exactly the stall this check exists to prevent. A container site that is
 * neither by a source nor within CONTROLLER_CONTAINER_RANGE of the
 * controller is a plain leftover (rung 10) and never pauses the upgrader.
 * @param room The room to search
 * @returns True when the upgrader should run the builder role instead
 */
export function hasPriorityBuildSites(room: Room): boolean
{
    const controller = room.controller;
    const level = controller !== undefined && typeof controller.level === "number"
        ? controller.level
        : 1;

    const sites = room.find(FIND_CONSTRUCTION_SITES);
    const towerSites = sites.filter((site) => site.structureType === STRUCTURE_TOWER);
    if (towerSites.length > 0)
    {
        if (level < CONTAINER_EARLY_MIN_LEVEL)
        {
            return true; // legacy: any unfinished tower site pauses it
        }
        // Ladder: the first tower only (rung 1).
        const towersBuilt = room.find(FIND_MY_STRUCTURES).filter(
            (structure) => structure.structureType === STRUCTURE_TOWER,
        ).length;
        if (towersBuilt === 0)
        {
            return true;
        }
    }

    if (level >= CONTAINER_EARLY_MIN_LEVEL)
    {
        // Rung 2: the first extension, while none is built yet.
        const extensionsBuilt = room.find(FIND_MY_STRUCTURES).filter(
            (structure) => structure.structureType === STRUCTURE_EXTENSION,
        ).length;
        if (extensionsBuilt === 0)
        {
            const extensionSites = sites.filter((site) => site.structureType === STRUCTURE_EXTENSION);
            if (extensionSites.length > 0)
            {
                return true;
            }
        }

        // Rungs 3-4: source containers and the controller container.
        const containerSites = sites.filter((site) => site.structureType === STRUCTURE_CONTAINER);
        if (containerSites.length > 0)
        {
            const sources = room.find(FIND_SOURCES);
            const hasSourceContainer = containerSites.some(
                (site) => sources.some((source) => site.pos.getRangeTo(source.pos) <= 1),
            );
            const hasControllerContainerSite = controller !== undefined
                && containerSites.some(
                    (site) => site.pos.getRangeTo(controller.pos) <= CONTROLLER_CONTAINER_RANGE,
                );
            if (hasSourceContainer || hasControllerContainerSite)
            {
                return true;
            }
        }
    }

    return false;
}

/**
 * Runs the builder role for one tick.
 *
 * Order of checks:
 *   1. Carrying energy: build the highest-priority site (fall back to
 *      upgrading the controller when no site exists).
 *   2. Not carrying: pick up dropped energy when there is some next to us.
 *   3. Not carrying and the room is at or above the withdrawal floor
 *      (BUILDER_WITHDRAW_FRACTION of its capacity): withdraw from the spawn,
 *      then from an extension (owner rule #3, relaxed).
 *   4. Otherwise: harvest from a source and stay there until the store is
 *      full, so a builder only self-harvests when the store is below the
 *      floor and never drains the spawn.
 * @param creep The builder creep to run
 */
export function runBuilder(creep: Creep): void
{
    const room = creep.room;
    const energy = creep.store[RESOURCE_ENERGY] ?? 0;

    // True on exactly one tick: the first empty tick after the store held
    // energy - the builder's cycle boundary (it just spent its load at a
    // site). The self-harvest source latch is (re-)made there (see below).
    let justEmptied = false;

    // --- Phase 1: spend the energy we carry (build first, then upgrade) ---
    if (energy > 0)
    {
        creep.memory.working = true;

        const site = selectBuildSite(creep, room);
        if (site !== null)
        {
            const buildResult = creep.build(site);
            if (buildResult === OK)
            {
                return;
            }

            if (buildResult === ERR_NOT_IN_RANGE)
            {
                moveToToward(creep, site, 3);
                return;
            }

            if (buildResult === ERR_INVALID_TARGET)
            {
                // Owner feedback 2026-11-06: the engine refuses build() while
                // ANOTHER own creep stands on the tile (or the site just
                // vanished) - that is NOT "out of energy". The old code
                // fell through to refill, which threw the whole loaded
                // store away and restarted the build-refill loop on every
                // contested tile (the M4 builder/extension stall: progress
                // grew, nothing finished). The load is still ours, so try
                // the next best site with it - same priorities, same
                // blocked-tile skip - before falling back to refill.
                const next = selectBuildSite(creep, room, new Set([site.id]));
                if (next !== null)
                {
                    const retry = creep.build(next);
                    if (retry === OK)
                    {
                        return;
                    }

                    if (retry === ERR_NOT_IN_RANGE)
                    {
                        moveToToward(creep, next, 3);
                        return;
                    }
                }
            }

            // ERR_NOT_ENOUGH_RESOURCES (store below one build tick's cost),
            // or the retry also failed: fall through and refill.
        }
        else
        {
            const controller = room.controller;
            if (controller !== undefined && controller.my)
            {
                const upgradeResult = creep.upgradeController(controller);
                if (upgradeResult === OK)
                {
                    return;
                }

                if (upgradeResult === ERR_NOT_IN_RANGE)
                {
                    moveToToward(creep, controller, 3);
                    return;
                }
            }
        }
    }
    else
    {
        // Empty store: back to collecting. This also clears the old state
        // where a builder that built away its last energy with working=true
        // still set idled forever (nothing ever reset the flag).
        justEmptied = creep.memory.working === true;
        creep.memory.working = false;
    }

    // --- Phase 2: refill the store ---
    //
    // The energy source is now the shared getEnergy helper (owner feedback
    // 2026-11-10, cause 1; see utils/energy.ts for the full order and the
    // history of each rung): a nearby drop, then the fullest source
    // container above MIN_CONTAINER_WITHDRAW_ENERGY, then - for builders -
    // the spawn/extensions pool above BUILDER_WITHDRAW_FRACTION (with the
    // upgrader hold-back). Only "harvest" falls through to the
    // self-harvest phase below. That is the point of the helper: the old
    // order withdrew only when the room was at or above the floor and
    // walked to a source every other tick - even when a source container
    // held a trickle the miner would have topped up in a few ticks - and
    // that is what starved construction (0.86 build/tick on the M5 probe
    // of 2026-11-10, 0.19 build/tick before the floor itself).
    if (getEnergy(creep, "builder") !== "harvest")
    {
        return;
    }

    // Harvest from a source and stay there until the store is full.
    // The builder's loop is anchored at the spawn (its energy comes from
    // there and its sites sit on the road network around it), so rank the
    // sources by distance to the spawn - not by path cost, which the swamp
    // pocket around the spawn-side source distorts (see the file header).
    //
    // The choice is latched in memory.sourceId for the whole collect phase
    // (see the file header for why): it is (re-)made here only on the
    // cycle-boundary tick (justEmptied), when the latched source is missing
    // or dry while another source is live, or before the first harvest at
    // all. Every other tick the builder sticks with its latched source.
    const sources = room.find(FIND_SOURCES);
    const activeSources = sources.filter((candidate) => candidate.energy > 0);
    const pool = activeSources.length > 0 ? activeSources : sources;
    const latchedId = creep.memory.sourceId;
    const latched = latchedId !== undefined
        ? sources.find((candidate) => candidate.id === latchedId)
        : undefined;
    const latchedUsable = latched !== undefined
        && (latched.energy > 0 || activeSources.length === 0);
    let source: Source | null = null;
    if (latched === undefined || !latchedUsable || justEmptied)
    {
        // Yield the upgrader's source, but only while the upgrader is really
        // upgrading: while a tower or extension site exists every upgrader
        // runs this same builder role, so no source is "the upgrader's" and
        // yielding would only push the builders onto the far one. Rank the
        // upgrader's source last; the builder takes the other source and
        // falls back to the upgrader's only when the other has no free tile.
        const skipYield = hasPriorityBuildSites(room);
        const spawn = room.find(FIND_MY_SPAWNS)[0];
        const controller = room.controller;
        const anchor = spawn !== undefined
            ? spawn.pos
            : controller !== undefined ? controller.pos : null;
        if (anchor !== null)
        {
            let candidates = sortSourcesByDistance(pool, anchor);
            if (!skipYield && controller !== undefined && sources.length > 1)
            {
                const upgraderSource = sortSourcesByDistance(sources, controller.pos)[0];
                candidates = [
                    ...candidates.filter((candidate) => candidate.id !== upgraderSource.id),
                    upgraderSource,
                ];
            }
            // Nearest the spawn first (upgrader's source last, when it is
            // yielded), then the standable-tile filter: a builder that cannot
            // stand next to its source would oscillate at the entrance
            // (measured 50+ ticks) and harvest nothing.
            source = pickSourceWithStandableTile(candidates, room, creep.id);
        }
        creep.memory.sourceId = source !== null ? source.id : undefined;
    }
    else
    {
        source = latched;
    }

    if (source !== null && creep.harvest(source) === ERR_NOT_IN_RANGE)
    {
        moveToToward(creep, source, 1);
    }
}

/**
 * Configuration constants for the Screeps colony.
 * These are tunable values that control colony behavior.
 */

/**
 * Minimum creeps per role, per controller level. `minCreepsPerRole` in the
 * spawn manager uses the last row whose level is at or below the current
 * controller level (a room without a controller - unit test mocks - counts
 * as level 1).
 *
 * RCL 1 (bootstrap): one harvester, one builder, one upgrader. With the
 * owner's spawn order (harvester -> builder -> upgrader) this queue means
 * the whole bootstrap crew is out as fast as energy allows: the harvester
 * starts the income, the builder is the next 300 energy, the upgrader the
 * one after - which is what lands the first upgrade tick inside the 500
 * ticks the smoke test measures, and the first builder inside the 800
 * ticks M1 measures.
 * RCL 2: three harvesters, three builders (300 energy still buys a full
 * 300-energy body).
 * RCL 3 and up: five harvesters, three builders. The M3 run keeps builders
 * busy for thousands of ticks on the tower and the extensions; five
 * harvesters are what keeps the energy flowing to the spawn, the extensions
 * and the tower while that happens. (Rule 02b suggests at most two
 * builders; the M3 acceptance test's 4,000-tick window for the tower plus
 * three finished extensions needs three - the test wins, see status.md.)
 */
export const MIN_CREEPS_BY_LEVEL: {
    level: number;
    harvester: number;
    builder: number;
    upgrader: number;
    hauler: number;
}[] = [
    { level: 1, harvester: 1, builder: 1, upgrader: 1, hauler: 1 },
    { level: 2, harvester: 3, builder: 3, upgrader: 1, hauler: 1 },
    { level: 3, harvester: 5, builder: 3, upgrader: 1, hauler: 1 },
];

/**
 * Income floor (owner feedback 2026-11-02): the minimum number of income
 * creeps (harvester + miner + hauler, alive) a room must keep. Below this the
 * spawn manager starts one of the income roles before it queues any upgrader,
 * builder or defender - a colony at zero or one income creep is one death away
 * from a state where nothing refills the energy store and it can never recover.
 * The single exception is a non-peace room whose towers are dry: a defender
 * below its minimum takes priority over income.
 */
export const ENERGY_INCOME_FLOOR = 2;

/**
 * Surplus spawn caps (owner feedback 2026-10-30): totals per room, including
 * the minimum crew, that the spawn may exceed while every minimum is met AND
 * the energy store is full - the moment checkAndSpawn would otherwise idle
 * with an unused store (the smoke scorecard's "Spawn idle while full" sat at
 * 100 % for that reason). The upgrader is the room's fixed 2-per-tick energy
 * sink and keeps the store cycling; the builder only while sites exist.
 *
 * M5 (2026-11-12): raised from 3 to 5. The M5 probe (probe-m5-creeps
 * 2026-11-12 21:01) showed 82 % creep idle at a 550-energy capacity because
 * three upgraders drained the store faster than the 90 % valve could open
 * again and there was nothing else to spend on: source B's container had
 * not even started, so the builders idled too. Five upgraders is the pulse
 * that spends the surplus while still leaving store for the minimums
 * (at RCL 5 each 5-WORK upgrader uses 5 of the 30 per-tick upgrade power,
 * so five fit under the controller's own cap). The cap is a ceiling, not a
 * target: the main loop still decides below minimums.
 */
export const SURPLUS_UPGRADER_MAX = 5;

/**
 * Fraction of the room's energy capacity at or above which surplus spawns
 * (surplus upgraders / builders) are allowed - a "pressure valve" that opens
 * before the store is completely full (M5, 2026-11-12).
 *
 * At a 100 % gate the store oscillates: harvesters and haulers refill it, it
 * peaks at capacity, ONE surplus upgrader drains it, and it never crosses the
 * gate again - so the valve fired once (if at all) and the store sat at
 * 100 % with the spawn idle (the M5 scorecard of 2026-11-12: "spawn idle
 * while energy is full" 58.6 %, avg dropped energy 303). Opening the valve at
 * 90 % means the surplus upgraders start cycling while the store is still
 * climbing, the peak never reaches 100 %, and the dropped-energy piles the
 * harvesters make at a full spawn shrink. The surplus bodies cost at most
 * 350 (an upgrader) against a capacity of at least 300, so the 10 % band
 * plus the income refill always covers the pulse.
 */
export const SURPLUS_SPAWN_ENERGY_RATIO = 0.9;

/**
 * Total builders (including the minimum three) the spawn may keep while
 * construction sites exist. M5 (2026-11-10, owner feedback v9.2 idea a):
 * three is the M3 decision and it worked for a single 5,000-energy tower
 * - but the static-mining transition builds the first 5,000-energy
 * container while the M4 extension floor (three 3,000-energy extensions)
 * still has to finish in the same window, and the crew also carries
 * roads. With three builders the first container starved the extensions
 * (one extension at the end of the M4 window, four containers under
 * construction). Five doubles the build pace while the minimums (three)
 * still hold the steady-state crew; the surplus is spent only while a
 * site exists AND the energy store is full, so it cannot drain the
 * economy in a steady-state room.
 *
 * 2026-11-12: raised from 5 to 10. The static-mining transition is the
 * biggest build wave in the colony's life - first tower (5,000), two
 * source containers (10,000), the M4 extension floor (9,000), the
 * controller container (5,000) and roads, all inside the 5,000-tick M5
 * window. In the 21:01 probe the second source container sat at 0
 * progress because the crew (and the energy) was spread too thin. The cap
 * still applies only while a site exists AND the store is at the valve
 * (SURPLUS_SPAWN_ENERGY_RATIO), so a steady-state room pays for nothing.
 */
export const SURPLUS_BUILDER_MAX = 10;

/**
 * Harvesters kept per container-less source at level 4 and up, where the
 * miner body tops out at 2-3 WORK (4-6 energy per tick - the RCL 4-5 room
 * holds 300-450 energy) and so can no longer drain a source's 10-per-tick
 * refill on its own (owner feedback v9.2 idea a, 2026-11-10). Below level
 * 4 the bootstrap table rows already cover every source, so the split
 * stays at one worker per container-less source (M5 design).
 */
export const UNCOVERED_SOURCE_HARVESTERS_L4 = 2;

/**
 * Extra haulers the spawn keeps beyond the one-per-source-container
 * minimum at level 4 and up (owner feedback v9.2 idea a, 2026-11-10): a
 * hauler that dies is only replaced on the next spawn tick, and at
 * RCL 5 a dead hauler is the single point of failure between the two
 * source containers and 30+ consumers - every container drops while it
 * is out.
 *
 * 2026-11-12: raised from 1 to 2. By the time the second source
 * container exists the upgraders (cap five) and the builders (cap ten)
 * are both drinking from the same containers, so a single death is a
 * guaranteed starve window of one full spawn cycle; two spares keep the
 * pipeline moving through two overlapping gaps. The spares are minimums,
 * not a crew target: they spawn only through the normal minimum loop.
 */
export const CONTAINER_HAULER_SPARE = 2;

/**
 * Fraction of the room's energy capacity at or above which a builder
 * withdraws energy from the spawn or an extension instead of harvesting
 * from a source itself (owner rule #3, relaxed).
 *
 * The original rule was "only when the room is completely full", but
 * surplus spawning (see SURPLUS_UPGRADER_MAX / SURPLUS_BUILDER_MAX) drains
 * the store the moment it peaks, so the room is rarely completely full and
 * the builders were forced onto the far-source self-harvest loop
 * (construction regressed 3.11 -> 0.19/tick, idle 8% -> 23%).
 *
 * 50% keeps the store cycling (the "Spawn idle while full" metric stays
 * low) while giving the builders a steady supply: the builders drain the
 * store down to this floor and the harvesters refill it, so the builders
 * build from the room instead of walking to a distant source. The floor is
 * still high enough that the spawn can queue a minimum-crew respawn between
 * delivery ticks.
 */
export const BUILDER_WITHDRAW_FRACTION = 0.5;

/**
 * Maximum distance (in tiles, measured from the builder's own position) at
 * which a dropped energy pile is worth a stop for a builder.
 *
 * A drop beyond this range is a cross-map haul: the M5 probe of 2026-11-10
 * showed empty builders following a 50-energy pile a harvester had dumped at
 * the far source (~29 tiles from the tower site) all the way over, and back,
 * instead of taking a full load from the spawn next to the build site. One
 * such round trip costs ~50 tiles of walking for 50 energy - the builder
 * spends its whole life in transit and the tower crawls along at
 * 0.86 build/tick while every other site sits at zero progress.
 *
 * Drops WITHIN this range are still grabbed before any structure: a pile a
 * few tiles away is closer than walking back to the spawn, and it is the
 * only energy source at all while the pool is below BUILDER_WITHDRAW_FRACTION.
 * 10 tiles covers the whole spawn/tower cluster (the near source, the spawn
 * and the tower all sit within ~5 tiles of each other) and excludes the far
 * source, so a builder parked at the build site never sees the far pile.
 */
export const BUILDER_DROP_PICKUP_RANGE = 10;

/**
 * Minimum energy a source container must hold before a builder or upgrader
 * withdraws from it.
 *
 * The 100 value (owner feedback 2026-11-10, cause 1) served the hauler
 * delivery semantics: a hauler delivery carries at least one full creep
 * store (50+), so 100 meant "at least one hauler has delivered since the
 * container was last drained by this creep". It also gated the BUILDERS,
 * and that cost the M5 window (2026-11-12): a miner tops a source container
 * up in bursts of ~100 every ~17 ticks, so with five builders draining it
 * the container sat below 100 most of the time, the builders "waited" at
 * their site or fell back to the pool floor / far-source self-harvest, and
 * the second source container built at ~1 energy per tick.
 *
 * 50 = one full creep store: a partial load is still worth the round trip
 * when the container is CLOSE (a builder works the second source container
 * a few tiles from the first one), and below 50 the container is empty
 * enough that the miner's next dump is one harvest cycle away.
 */
export const MIN_CONTAINER_WITHDRAW_ENERGY = 50;

/**
 * Maximum consecutive failed delivery ticks before a harvester drops its
 * energy. ERR_NO_PATH drops immediately (unreachable target); this is only a
 * safety net for a creep that is stuck for a long time. A heavy body moves
 * every few ticks, so a full room crossing takes well under this many ticks.
 */
export const MAX_DELIVERY_ATTEMPTS = 100;

/**
 * Stuck-path recovery (utils/movement.ts): the detector drops a creep's
 * cached path (memory._move) when it calls moveToToward() from the same tile
 * for 2 x (non-MOVE parts) + this many ticks. The 2 x parts term is the
 * creep's fatigue cycle (one step per 2 ticks per non-MOVE part with one MOVE
 * part on plain), so a walking creep never trips the detector; this base is
 * margin for swamp terrain and bodies with extra MOVE parts.
 */
export const STUCK_CLEAR_BASE = 2;

/**
 * reusePath passed by every moveToToward() call: the engine reuses the
 * computed path for this many ticks (same destination) instead of re-running
 * pathfinding every tick. 20 is the balance: short enough that a changed
 * room (creeps moving, roads appearing) re-routes within a few walks, long
 * enough to save CPU on the many short role walks.
 */
export const MOVE_REUSE_PATH_TICKS = 20;

/**
 * Partial-load threshold: a harvester or upgrader standing at a depleted
 * source carries its load off once it holds at least this fraction of its
 * capacity, instead of idling until the source refills (300-tick cycle). 50%
 * balances a short wasted trip against 300 ticks of a half-full store doing
 * nothing.
 */
export const PARTIAL_DELIVERY_FRACTION = 0.5;

/** Minimum body parts for basic creep functionality */
export const MIN_BODY_PARTS = {
  work: 2,
  carry: 2,
  move: 2,
};

/** CPU summary reporting interval in ticks */
export const CPU_SUMMARY_INTERVAL = 100;

/** Energy required for a basic creep body (WORK + CARRY + MOVE) */
export const BASE_CREEP_COST = 200; // 100 + 50 + 50

/** Threshold below which builders switch to upgrading */
export const CONSTRUCTION_THRESHOLD = 50;

/** Number of extensions to build (5 is max at level 2) */
export const TARGET_EXTENSIONS = 5;

/** Interval for building roads (every N ticks) */
export const ROAD_BUILD_INTERVAL = 100;

/** Number of road tiles to build per interval */
export const ROADS_PER_INTERVAL = 5;

/**
 * Defense settings (M4).
 */

/**
 * Number of ticks without hostiles anywhere in the colony before the mode
 * reverts from 'defend' back to 'peace'. This hysteresis keeps the towers'
 * repair behavior and the builder's rampart-first priority from flickering
 * on and off during the last moments of a fight.
 */
export const DEFEND_REVERT_TICKS = 500;

/**
 * Hit target for ramparts: towers (in peace) and builders repair ramparts
 * up to this value and stop there. A fresh rampart holds 10,000 hit points,
 * so repairing to this point is also "fully repaired" - the M4 spec says
 * repairing beyond it is not needed yet.
 */
export const RAMPART_TARGET_HITS = 10000;

/**
 * Minimum controller level at which rampart sites are placed. Ramparts
 * protect the spawn and the towers; the towers only exist from level 3, so
 * the ramparts gate on the same level.
 */
export const RAMPART_MIN_LEVEL = 3;

/**
 * Tower site placement (see computeTowerPositions in
 * managers/constructionManager): the diamond rings around the spawn the
 * primary search walks, closest first. Ranges 2 through 5: the M4 spec
 * allows a tower up to five tiles from the spawn, and the odd rings (3, 5)
 * matter - the extension layout only fills the checkerboard's even rings,
 * so in a cramped room the ring-3 and ring-5 tiles are the ones that stay
 * free (owner feedback 2026-11-02: the old search walked rings 2-4 but
 * filtered ring 3 out by parity, and the second tower never found a tile).
 */
export const TOWER_SITE_RANGES: number[] = [2, 3, 4, 5];

/**
 * Tower site placement (see placeTowerSites in managers/constructionManager):
 * the extra rings the fallback search walks AFTER the primary ranges, when
 * the engine refused every primary candidate or the primary search found
 * none at all. Only runs on the failure path, so the extra work costs
 * nothing in normal operation (owner feedback 2026-11-02).
 */
export const TOWER_SITE_DEEP_RANGES: number[] = [6, 7, 8];

/**
 * Tower site placement (see placeTowerSites in managers/constructionManager):
 * how many candidates the deep-ring fallback search returns. Generous on
 * purpose: the deep search must enumerate every free tile of rings 6-8
 * (at most ~96), so the last resort - removing an unbuilt extension site
 * to make room - triggers only when rings 2-8 are truly full (owner
 * feedback 2026-11-02).
 */
export const TOWER_SITE_DEEP_CANDIDATES = 96;

/**
 * Layout (see computeTowerPositions and computeExtensionPositions in
 * managers/constructionManager): the Chebyshev range around the spawn that
 * stays free of extension and tower sites. The eight tiles inside it are
 * where a creep ends a moveTo to the spawn (energy delivery, parking) - it
 * cannot stand on the spawn's own tile, so it stops on one of these.
 * build() needs the builder to be the only object on the site's tile, so an
 * extension or tower site here is unbuildable for as long as deliveries
 * keep coming, and a blocked "focus" site (the one with the most progress)
 * spins the whole crew in place. This was the M4 builder/extension
 * deadlock: 0 of 3 extensions finished (owner feedback 2026-11-05).
 */
export const SPAWN_KEEP_CLEAR_RANGE = 1;

/**
 * Energy a tower keeps in reserve for its defense duty. The tower only
 * repairs (ramparts, roads, containers) while it holds strictly more than
 * this, and harvesters only refill it while it holds strictly less. 500
 * energy is 50 shots (10 energy each) - enough for the single-creep
 * incursions the towers are built for, without sitting idle above it.
 */
export const TOWER_ENERGY_RESERVE = 500;

/**
 * M5 container-priority gate (see containerFirstForRoom in roles/builder.ts):
 * the highest controller level at which the bootstrap container boost applies.
 * At level 3 and up the tower-plus-extension density contract (M3/M4) owns the
 * builder crew, so container sites wait behind extensions and roads until a
 * container is actually built. Levels 1-2 are the M2/M5 bootstrap worlds,
 * where the layout queue is small (five extensions, the road network) and the
 * first container - once the layout minimum is finished - may take the crew.
 */
export const CONTAINER_BOOST_MAX_LEVEL = 2;

/**
 * M5 container-priority gate (bootstrap case): the number of FINISHED
 * extensions the room must have before a container site may take the whole
 * builder crew at levels 1-2. One is exactly the M2 acceptance minimum
 * ("extension built >= 1 after 3,000 ticks"): the crew switches to the
 * container only after M2's extension criterion is already met, so the
 * container-first order cannot starve it.
 */
export const CONTAINER_BOOST_MIN_EXTENSIONS = 1;

/**
 * M5 container-priority gate (bootstrap case): the number of FINISHED roads
 * the room must have before a container site may take the whole builder crew
 * at levels 1-2. Same M2 contract as CONTAINER_BOOST_MIN_EXTENSIONS: the
 * container takes over only after "road built >= 1" is already satisfied.
 */
export const CONTAINER_BOOST_MIN_ROADS = 1;

/**
 * M5 container-priority gate (static-mining case, rule 02b stage 2): the
 * lowest controller level at which the L4+ boost applies. At level 4 and
 * up the room has left bootstrap, so the first source container - the tile
 * the stationary miner stands on - is worth pulling the builder crew off
 * the extension queue. The same level also switches the pocket-tile
 * ownership in constructionManager: at this level and up the container
 * takes a road-network tile directly instead of waiting for the built
 * road (placeContainerSites / placeRoadSites), because in the static-
 * mining rooms the road network stays gated off while extensions queue.
 */
export const CONTAINER_BOOST_MIN_LEVEL = 4;

/**
 * M5 static-mining ladder: the lowest controller level at which the
 * build queue switches from the bootstrap order (tower, extension,
 * container) to the static-mining ladder in builder.ts
 * (selectContainerFirstSite): first tower, the first source container,
 * the two-extension mini-floor (CONTAINER_MINI_FLOOR_EXTENSIONS), the
 * second source container, the M4 three-extension floor completion,
 * the controller container, ramparts, the second tower, the remaining
 * extensions, roads. The mini-floor and the full floor gate the rest:
 * the un-gated order of 2026-11-10 spent the container pair before the
 * third extension and failed M4 at tick 6,000 (extensionsBuilt 1,
 * capacity 350 of 450). Level 5 only: the M4 and M5 acceptance worlds
 * are level 5, and M2 (level 1-2) and M3 (level 3-4) measure the
 * bootstrap order, so the ladder must not touch them.
 */
export const CONTAINER_EARLY_MIN_LEVEL = 5;

/**
 * M4 extension floor (static-mining case): the number of FINISHED
 * extensions a level 4+ room must have before any rung AFTER the first
 * source container may take the whole builder crew - the bootstrap boost
 * (containerFirstForRoom) and, from level CONTAINER_EARLY_MIN_LEVEL up,
 * the rungs after the second source container of the static-mining ladder
 * (selectContainerFirstSite). The first source container (rung 2) is the
 * single rung that runs ahead of this floor by owner design (v9.4,
 * 2026-11-11): behind it the container finished at ~tick 3,880 of the
 * 5,000-tick M5 window (minedShare 0.585 of 0.6). Three is exactly the
 * M4 acceptance floor ("at least 3 extensions are finished"): the crew
 * switches to any other container only after M4's contract is already
 * met, so the containers cannot starve the third extension. The
 * un-gated container-first of 2026-11-09/10 failed M4 for exactly this:
 * the crew camped the 5,000-energy container sites (extensionsBuilt 1,
 * energyCapacity 350 versus the required 3 and 450) and the extensions
 * never caught up.
 *
 * The second source container (rung 4, 2026-11-12) runs ahead of the
 * FULL floor but behind the two-extension mini-floor (rung 3,
 * CONTAINER_MINI_FLOOR_EXTENSIONS): the M5 probe of 2026-11-12 showed the
 * second container at 0 progress at tick 5,000 because the full floor
 * held the crew on the third extension, and source B stayed on bootstrap
 * harvesters the whole window (minedShare failed at 0.402 of 0.6). With
 * the mini-floor the second container starts at ~2 extensions built, so
 * the third extension still gets the crew after it - enough to land the
 * M4 450 capacity inside its 6,000-tick window.
 */
export const CONTAINER_BOOST_MIN_EXTENSIONS_L4 = 3;

/**
 * The two-extension mini-floor of the M5 static-mining ladder
 * (selectContainerFirstSite, 2026-11-12): while fewer than this many
 * extensions are finished, the whole builder crew converges on extension
 * sites - but this rung sits AHEAD of the second source container. It is
 * the M4/M5 compromise: M4's acceptance fixture needs three finished
 * extensions inside 6,000 ticks, while M5 needs the second source
 * container early (its stationary miner, and with it the minedShare and
 * upgradePerTick criteria, unlock only once it exists - in the
 * 2026-11-12 21:01 probe it had not even started at tick 5,000 because
 * the three-extension floor held the crew). Two extensions (400 of the
 * 450 capacity) leaves the third extension a short final sprint after
 * the second container is done, instead of a full-window stand-off.
 */
export const CONTAINER_MINI_FLOOR_EXTENSIONS = 2;

/**
 * Controller sign text (owner request, feedback 2026-11-02): the exact string
 * every room the bot owns carries as its controller sign. The upgrader signs
 * it while already on the upgrade round trip (signController needs range 1),
 * never re-signs when the text is already right, and is never diverted from
 * a harvest to do it. Kept in one place so the sign can never drift between
 * rooms or between code and tests.
 */
export const CONTROLLER_SIGN_TEXT = "ScreepsAiSLP - https://github.com/BurningBurrito/ScreepsAiSLP";

/**
 * Upgrader body switching (owner feedback 2026-11-02): a finished container
 * within this range of the controller feeds the upgrader's energy, so from
 * that point on the upgrader's body is WORK-heavy (one MOVE reaches the
 * container); before it exists the upgrader walks for its energy and its
 * body stays balanced (see bodyTemplates in managers/spawnManager).
 */
export const CONTROLLER_CONTAINER_RANGE = 3;

/**
 * The engine's fixed per-room container cap (M5): five containers at every
 * controller level, no RCL table. The game's CONTROLLER_STRUCTURES runtime
 * object has no "container" row (only extension, road, rampart, tower), so
 * the budget check in constructionManager cannot read it from there - it
 * uses this constant instead.
 */
export const MAX_CONTAINERS_PER_ROOM = 5;

/**
 * Hauler delivery order (owner feedback 2026-11-04, fault 3): the energy
 * level below which a tower is a PRIORITY target. Towers constantly spend
 * energy repairing ramparts and roads, so if every tower were served before
 * the extensions, the extensions would starve. The hauler therefore fills
 * spawn and extensions first in peace, but a tower BELOW this level comes
 * first: at that level it can no longer afford to keep repairing, and in
 * defend or war mode a low tower is the colony's whole defense.
 * The level-5 tower capacity is 1000 energy, so this is half a tank.
 */
export const TOWER_REFILL_PRIORITY_ENERGY = 500;

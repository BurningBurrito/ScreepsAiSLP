/**
 * Source-selection helpers for the roles.
 *
 * Two concerns, two helpers:
 *  1. Which source is cheapest for a fixed route? Chebyshev distance to the
 *     role's anchor (controller, spawn) - a round-trip proxy that costs one
 *     comparison per source instead of a PathFinder run.
 *  2. Can this creep actually stand next to the source? A source is not a
 *     parking lot: every harvester (or any harvester-mode creep) needs its
 *     own tile next to the source, and some sources have only a very few
 *     such tiles. The test room's pocket source has exactly two, so once
 *     two creeps stand there a third can never get in - and the engine's
 *     fallback single-steps it at the pocket's mouth. That is what produced
 *     the 330-tick no-upgrade run in reports/latest.md (upgrader
 *     oscillating between the two entrance tiles while a builder parked on
 *     the only one). pickSourceWithStandableTile() is the guard: given a
 *     priority-ordered list it skips every source whose standable tiles are
 *     all occupied (by other creeps or by structures).
 */

/**
 * Sorts sources by Chebyshev distance to an anchor, closest first.
 *
 * The distance is a round-trip proxy, not a path cost: for a fixed route
 * (source -> anchor -> source) the closest source by Chebyshev distance is
 * almost always the cheapest to serve, and the sort is one comparison per
 * pair instead of a PathFinder run.
 *
 * @param sources The sources to order.
 * @param anchor The position they are ranked against (controller, spawn).
 * @returns A new array, closest source first.
 */
export function sortSourcesByDistance(sources: Source[], anchor: RoomPosition): Source[]
{
    return sources
        .slice()
        .sort((a, b) => a.pos.getRangeTo(anchor) - b.pos.getRangeTo(anchor));
}

/**
 * Picks the source closest (Chebyshev distance) to an anchor position.
 *
 * @param sources The sources to choose from.
 * @param anchor The position to be close to (usually the controller, the
 *        spawn or the creep's own position).
 * @returns The closest source, or null when the list is empty.
 */
export function pickSourceClosestTo(sources: Source[], anchor: RoomPosition): Source | null
{
    if (sources.length === 0)
    {
        return null;
    }

    return sortSourcesByDistance(sources, anchor)[0];
}

/**
 * Collects the "x,y" tiles a new worker could not stand on: every creep
 * except the one asking (its own tile is of course free to it), plus every
 * own structure, whose tile is solid.
 *
 * Two room.find calls in total, so call this at most once per role per tick
 * and pass the result to countStandableTiles() for each candidate source.
 *
 * @param room The room to scan.
 * @param excludeId The creep id to leave out of the occupied set.
 * @returns The set of occupied "x,y" tiles.
 */
export function collectOccupiedTiles(room: Room, excludeId: string): Set<string>
{
    const occupied = new Set<string>();
    for (const creep of room.find(FIND_CREEPS))
    {
        if (creep.id !== excludeId)
        {
            occupied.add(`${creep.pos.x},${creep.pos.y}`);
        }
    }
    for (const structure of room.find(FIND_MY_STRUCTURES))
    {
        occupied.add(`${structure.pos.x},${structure.pos.y}`);
    }
    return occupied;
}

/**
 * Counts the tiles next to a source a creep could stand on right now:
 * plain or swamp terrain (rooms are 50x50, so x and y are 0-49), not a
 * wall, and not in the occupied set.
 *
 * @param source The source to probe.
 * @param room The room the source is in (terrain lookup).
 * @param occupied The occupied tiles (see collectOccupiedTiles).
 * @returns The number of standable tiles adjacent to the source.
 */
export function countStandableTiles(source: Source, room: Room, occupied: ReadonlySet<string>): number
{
    const terrain = room.getTerrain();
    let count = 0;
    for (let dx = -1; dx <= 1; dx += 1)
    {
        for (let dy = -1; dy <= 1; dy += 1)
        {
            if (dx === 0 && dy === 0)
            {
                continue;
            }
            const x = source.pos.x + dx;
            const y = source.pos.y + dy;
            if (x < 0 || x > 49 || y < 0 || y > 49)
            {
                continue;
            }
            if ((terrain.get(x, y) & TERRAIN_MASK_WALL) !== 0) // eslint-disable-line no-bitwise -- terrain is a bitmask
            {
                continue;
            }
            if (occupied.has(`${x},${y}`))
            {
                continue;
            }
            count += 1;
        }
    }
    return count;
}

/**
 * Picks the first source (in the given priority order) that still has a
 * standable tile next to it, so the assigned creep can actually stand and
 * work there instead of oscillating at a crowded pocket entrance.
 *
 * When no candidate has a free tile it returns the first candidate anyway:
 * a creep waiting at a full source is still doing something (it starts
 * working the moment a neighbour dies), which is better than having no
 * target and idling at the spawn.
 *
 * @param ordered The sources in priority order (best first).
 * @param room The room the sources are in.
 * @param excludeId The id of the creep that is choosing (its own tile is
 *        not a blocker).
 * @returns The chosen source, or null when the list is empty.
 */
export function pickSourceWithStandableTile(ordered: Source[], room: Room, excludeId: string): Source | null
{
    if (ordered.length === 0)
    {
        return null;
    }

    const occupied = collectOccupiedTiles(room, excludeId);
    for (const source of ordered)
    {
        if (countStandableTiles(source, room, occupied) > 0)
        {
            return source;
        }
    }
    return ordered[0];
}
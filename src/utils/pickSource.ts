/**
 * Source-picking helper for roles whose trip is fixed between one source and
 * one anchor.
 *
 * RoomPosition.findClosestByPath prices swamp tiles 10x plain, which makes a
 * source sitting in a swamp pocket look further than it actually is for a
 * creep that walks the same corridor every cycle: the path through the
 * pocket is short (a few swamp tiles) and the layout builds roads exactly
 * along that route, so in steady state the pocket is cheap. Plain Chebyshev
 * distance to the anchor is what the role's repeated trips cost, and it is
 * O(number of sources) with no path finding.
 */

/**
 * Picks the source closest (Chebyshev) to an anchor position.
 * @param sources The candidate sources
 * @param anchor The point the role loops back to every cycle
 * @returns The nearest source, or null when the list is empty
 */
export function pickSourceClosestTo(sources: Source[], anchor: RoomPosition): Source | null
{
    if (sources.length === 0)
    {
        return null;
    }

    let best = sources[0];
    for (const source of sources)
    {
        if (source.pos.getRangeTo(anchor) < best.pos.getRangeTo(anchor))
        {
            best = source;
        }
    }
    return best;
}
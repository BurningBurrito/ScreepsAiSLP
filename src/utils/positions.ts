/**
 * Position helpers for construction searches (offset arithmetic).
 *
 * The problem this file solves: the RoomPosition constructor throws
 * "Invalid arguments in RoomPosition constructor" for coordinates outside
 * 0..49. Every search that adds an offset to an existing position (the
 * extension/tower rings around the spawn, the container tile next to a
 * source) must check the numbers BEFORE constructing the position. In a
 * real room where the spawn sits close to the room edge, the ring searches
 * ran off the map and the throw aborted the whole tick, so the towers never
 * acted on those ticks (owner feedback 2026-11-01).
 */

/**
 * Checks whether (x, y) is a tile a construction search may use: inside the
 * room and not on the outer edge ring.
 *
 * The outer ring (x or y of 0 or 49) is exits and wall terrain - it can
 * never hold a structure - so searches skip it in addition to the 0..49
 * range the RoomPosition constructor enforces with a throw.
 *
 * @param x The room x coordinate to check.
 * @param y The room y coordinate to check.
 * @returns True if the tile is a valid construction candidate.
 */
export function isValidTile(x: number, y: number): boolean
{
    return x >= 1 && x <= 48 && y >= 1 && y <= 48;
}
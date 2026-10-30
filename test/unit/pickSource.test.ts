// Unit tests for the source-selection helpers (utils/pickSource.ts):
// distance ordering, the standable-tile count, and the filter that keeps a
// creep off a source it cannot stand next to (the pocket-source trap).

import {assert} from "chai";
import {
    countStandableTiles,
    pickSourceClosestTo,
    pickSourceWithStandableTile,
    sortSourcesByDistance,
} from "../../src/utils/pickSource";
import {FIND_CREEPS, FIND_MY_STRUCTURES, TERRAIN_MASK_WALL} from "./mock";

describe("pickSource helpers", () => {
    beforeEach(() => {
        // @ts-ignore : pickSource reads these as game globals
        global.FIND_CREEPS = FIND_CREEPS;
        // @ts-ignore : pickSource reads these as game globals
        global.FIND_MY_STRUCTURES = FIND_MY_STRUCTURES;
        // @ts-ignore : pickSource reads these as game globals
        global.TERRAIN_MASK_WALL = TERRAIN_MASK_WALL;
    });

    /**
     * A source mock at (x, y) with the real Chebyshev distance, which is
     * what RoomPosition.getRangeTo computes.
     */
    function source(id: string, x: number, y: number): any
    {
        return {
            id,
            pos: {
                x,
                y,
                getRangeTo: (other: {x: number; y: number}) =>
                    Math.max(Math.abs(x - other.x), Math.abs(y - other.y)),
            },
        };
    }

    /**
     * Wall tiles around the 3x3 block centred on (x, y) that leave exactly
     * two standable tiles, (x-1, y+1) and (x, y+1) - the shape of the test
     * room's pocket source.
     */
    function pocketWalls(x: number, y: number): string[]
    {
        const walls: string[] = [];
        for (let dx = -1; dx <= 1; dx += 1)
        {
            for (let dy = -1; dy <= 1; dy += 1)
            {
                if (dx === 0 && dy === 0)
                {
                    continue;
                }
                if (dx === -1 && dy === 1)
                {
                    continue;
                }
                if (dx === 0 && dy === 1)
                {
                    continue;
                }
                walls.push(`${x + dx},${y + dy}`);
            }
        }
        return walls;
    }

    /**
     * A room mock: wall terrain from a set of "x,y" strings, plus the given
     * creeps and structures (their tiles are solid/occupied).
     */
    function makeRoom(options: {
        wallTiles?: string[];
        creeps?: {id: string; x: number; y: number}[];
        structures?: {x: number; y: number}[];
    }): any
    {
        const walls = new Set(options.wallTiles === undefined ? [] : options.wallTiles);
        const creeps = options.creeps === undefined ? [] : options.creeps;
        const structures = options.structures === undefined ? [] : options.structures;
        return {
            find: (type: number) => {
                if (type === FIND_CREEPS)
                {
                    return creeps.map((c) => ({id: c.id, pos: {x: c.x, y: c.y}}));
                }
                if (type === FIND_MY_STRUCTURES)
                {
                    return structures.map((s) => ({pos: {x: s.x, y: s.y}}));
                }
                return [];
            },
            getTerrain: () => ({
                get: (x: number, y: number) => (walls.has(`${x},${y}`) ? TERRAIN_MASK_WALL : 0),
            }),
        };
    }

    it("orders sources by Chebyshev distance to the anchor", () => {
        const pocket = source("pocket", 14, 18);
        const open = source("open", 39, 14);
        const anchor = {x: 25, y: 25};

        const ordered = sortSourcesByDistance([open, pocket], anchor as any);

        // The pocket source is closer to the controller anchor.
        assert.equal(ordered[0].id, "pocket");
        assert.equal(ordered[1].id, "open");
        assert.equal(pickSourceClosestTo([open, pocket], anchor as any)?.id, "pocket");
    });

    it("returns null for an empty list", () => {
        assert.isNull(pickSourceClosestTo([], {x: 0, y: 0} as any));
        assert.isNull(pickSourceWithStandableTile([], makeRoom({}) as any, "me"));
    });

    it("counts all eight neighbours on open ground", () => {
        const room = makeRoom({});
        assert.equal(countStandableTiles(source("a", 25, 25), room as any, new Set<string>()), 8);
    });

    it("counts two standable tiles for a pocket source", () => {
        const room = makeRoom({wallTiles: pocketWalls(14, 18)});
        assert.equal(countStandableTiles(source("a", 14, 18), room as any, new Set<string>()), 2);
    });

    it("subtracts occupied tiles from the standable count", () => {
        const occupied = new Set<string>(["13,19", "15,19"]);
        assert.equal(countStandableTiles(source("a", 14, 18), makeRoom({}) as any, occupied), 6);
    });

    it("ignores tiles outside the room at the border", () => {
        const room = makeRoom({});
        // A source at the corner only has three existing neighbours.
        assert.equal(countStandableTiles(source("a", 0, 0), room as any, new Set<string>()), 3);
    });

    it("skips a full pocket source and takes the open one", () => {
        // The pocket source is closer to the controller anchor, but both of
        // its standable tiles are held by other creeps: the open source
        // must win instead of sending the creep to a wall.
        const room = makeRoom({
            wallTiles: pocketWalls(14, 18),
            creeps: [
                {id: "c1", x: 13, y: 19},
                {id: "c2", x: 14, y: 19},
            ],
        });
        const pocket = source("pocket", 14, 18);
        const open = source("open", 39, 14);
        const ordered = sortSourcesByDistance([open, pocket], {x: 25, y: 25} as any);

        assert.equal(ordered[0].id, "pocket", "the pocket is closer, ordering alone is not enough");
        const picked = pickSourceWithStandableTile(ordered, room as any, "me");

        assert.equal(picked?.id, "open");
    });

    it("skips a tile blocked by a structure, not just by creeps", () => {
        // One pocket tile held by a creep, the other by a structure: the
        // source is full even though only one other creep is around.
        const room = makeRoom({
            wallTiles: pocketWalls(14, 18),
            creeps: [{id: "c1", x: 13, y: 19}],
            structures: [{x: 14, y: 19}],
        });
        const pocket = source("pocket", 14, 18);
        const open = source("open", 39, 14);
        const ordered = sortSourcesByDistance([open, pocket], {x: 25, y: 25} as any);

        const picked = pickSourceWithStandableTile(ordered, room as any, "me");

        assert.equal(picked?.id, "open");
    });

    it("does not treat the asking creep's own tile as a blocker", () => {
        // The only free pocket tile is the one the choosing creep stands on:
        // it can harvest there, so the pocket must not be skipped.
        const room = makeRoom({
            wallTiles: pocketWalls(14, 18),
            creeps: [
                {id: "c1", x: 13, y: 19},
                {id: "me", x: 14, y: 19},
            ],
        });
        const pocket = source("pocket", 14, 18);
        const open = source("open", 39, 14);
        const ordered = sortSourcesByDistance([open, pocket], {x: 25, y: 25} as any);

        const picked = pickSourceWithStandableTile(ordered, room as any, "me");

        assert.equal(picked?.id, "pocket");
    });

    it("falls back to the first candidate when none has a free tile", () => {
        // Both sources are fully surrounded by creeps: waiting at the
        // first (better) one beats having no target at all.
        const creeps: {id: string; x: number; y: number}[] = [];
        for (const [x, y, prefix] of [[25, 25, "a"], [30, 30, "b"]] as [number, number, string][])
        {
            let i = 0;
            for (let dx = -1; dx <= 1; dx += 1)
            {
                for (let dy = -1; dy <= 1; dy += 1)
                {
                    if (dx === 0 && dy === 0)
                    {
                        continue;
                    }
                    creeps.push({id: `${prefix}${i}`, x: x + dx, y: y + dy});
                    i += 1;
                }
            }
        }
        const room = makeRoom({creeps});
        const a = source("a", 25, 25);
        const b = source("b", 30, 30);

        const picked = pickSourceWithStandableTile([a, b], room as any, "me");

        assert.equal(picked?.id, "a");
    });
});

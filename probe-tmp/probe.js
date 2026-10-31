// Temporary probe: verify stub-world source capacity and container drop/withdraw mechanics.
// Objects are inserted into the db BEFORE server.start() so the engine loads them.
// Run: node probe-tmp/probe.js   (delete this folder afterwards)
const { ScreepsServer, stdHooks } = require("screeps-server-mockup");

const BOT = `
function loop() {
    var room = Game.rooms["W0N1"];
    if (!room) { return; }
    var c1 = Game.creeps["probe1"];
    var out = "t" + Game.time;
    if (c1) {
        out += " c1=" + c1.pos.x + "," + c1.pos.y + " ttl=" + c1.ticksToLive;
        var srcs = room.find(FIND_SOURCES);
        var near = null;
        for (var i = 0; i < srcs.length; i++) {
            if (Math.abs(srcs[i].pos.x - c1.pos.x) <= 1 && Math.abs(srcs[i].pos.y - c1.pos.y) <= 1) { near = srcs[i]; break; }
        }
        if (near) {
            var rc = c1.harvest(near);
            out += " src=" + near.energy + " rc=" + rc;
        } else { out += " noSrcNear"; }
    } else { out += " noC1"; }
    var ct = room.find(FIND_STRUCTURES, { filter: function (s) { return s.structureType === "container"; } });
    if (ct.length > 0) { out += " ct=" + ct[0].store.energy + "/" + ct[0].storeCapacity; }
    var c2 = Game.creeps["probe2"];
    if (c2) { out += " c2=" + c2.pos.x + "," + c2.pos.y + " e=" + c2.store.energy; }
    console.log(out);
}
module.exports = { loop: loop };
`;

(async () => {
    stdHooks.hookWrite();
    const server = new ScreepsServer();
    await server.world.reset();
    await server.world.stubWorld();
    await server.world.addBot({
        username: "player",
        room: "W0N1",
        x: 13,
        y: 20,
        modules: { main: BOT },
    });

    const { db } = server.common.storage;
    const userRow = (await db["users"].find({ username: "player" }))[0];

    // Insert a container next to source 0 and two creeps BEFORE start.
    const pre = await server.world.roomObjects("W0N1");
    const src = pre.filter((o) => o.type === "source")[0];
    const spawn = pre.filter((o) => o.type === "spawn")[0];
    const cx = src.x;
    const cy = src.y - 1;
    await server.world.addRoomObject("W0N1", "container", cx, cy, {
        store: { energy: 0 },
        storeCapacity: 2000,
        hits: 250000,
        hitsMax: 250000,
        nextDecayTime: 1000000,
    });
    const creepBase = {
        user: userRow._id,
        store: { energy: 0 },
        ageTime: 5000,
        notifyWhenAttacked: true,
        spawning: false,
        fatigue: 0,
    };
    // 5-work miner without CARRY on the container tile (harvests via bot loop).
    await server.world.addRoomObject("W0N1", "creep", cx, cy, {
        ...creepBase,
        name: "probe1",
        body: [
            { type: "work", hits: 100 }, { type: "work", hits: 100 },
            { type: "work", hits: 100 }, { type: "work", hits: 100 },
            { type: "work", hits: 100 }, { type: "move", hits: 100 },
        ],
        hits: 600,
        hitsMax: 600,
        storeCapacity: 0,
        storeCapacityResource: { energy: 0 },
        memory: {},
    });
    // 4-carry hauler next to the container (withdraws + transfers via bot loop).
    await server.world.addRoomObject("W0N1", "creep", spawn.x, spawn.y + 1, {
        ...creepBase,
        name: "probe2",
        body: [
            { type: "carry", hits: 100 }, { type: "move", hits: 100 },
            { type: "carry", hits: 100 }, { type: "move", hits: 100 },
            { type: "carry", hits: 100 }, { type: "move", hits: 100 },
            { type: "carry", hits: 100 }, { type: "move", hits: 100 },
        ],
        hits: 800,
        hitsMax: 800,
        storeCapacity: 200,
        storeCapacityResource: { energy: 200 },
        memory: {},
    });

    await server.start();
    const User = require("screeps-server-mockup/src/user");
    const player2 = await new User(server, userRow).init();
    const results = [];
    player2.on("console", (log, res, id, username) => {
        for (const line of log || []) { results.push(line); }
        for (const r of res || []) { results.push("RESULT: " + r); }
    });

    for (let i = 0; i < 25; i += 1) {
        await server.tick();
    }
    console.log("console results:");
    for (const r of results) {
        console.log(r);
    }

    const objects = await server.world.roomObjects("W0N1");
    const src1 = objects.filter((o) => o.type === "source")[0];
    const container = objects.find((o) => o.type === "container");
    const sp = objects.find((o) => o.type === "spawn");
    const drops = objects.filter((o) => o.type === "energy");
    const creeps = objects.filter((o) => o.type === "creep").map((o) => ({ name: o.name, store: o.store }));
    console.log("after 30 ticks:", JSON.stringify({
        source: { energy: src1.energy, capacity: src1.energyCapacity },
        container: { x: container.x, y: container.y, hits: container.hits, store: container.store },
        spawn: { energy: sp.store },
        creeps,
        floorDrops: drops.map((d) => ({ x: d.x, y: d.y, energy: d.energy })),
    }, null, 1));
    process.exit(0);
})().catch((e) => {
    console.error(e);
    process.exit(1);
});

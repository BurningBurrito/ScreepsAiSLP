// Scratch diagnostic: dump W0N1 geometry from the mockup's rooms.json. DELETE ME.
const rooms = require("./node_modules/screeps-server-mockup/assets/rooms.json");
const TYPES = ["plain", "wall", "swamp"];
const data = rooms.W0N1;
const terrain = (x, y) => TYPES[data.serial[y * 50 + x]];
const objects = data.objects.map((o) => `${o.type}@${o.x},${o.y}`);
console.log("objects:", objects.join(" "));

function show(cx, cy, r)
{
    console.log(`\n=== around ${cx},${cy} (r=${r}) ===`);
    for (let y = cy - r; y <= cy + r; y += 1)
    {
        let line = y + ": ";
        for (let x = cx - r; x <= cx + r; x += 1)
        {
            const ch = x === cx && y === cy ? "*" : terrain(x, y).charAt(0);
            line += ch + " ";
        }
        console.log(line);
    }
}

for (const o of data.objects)
{
    if (o.type === "source" || o.type === "controller")
    {
        show(o.x, o.y, 2);
    }
}

show(13, 20, 3); // spawn

// BFS walkable distance from spawn (13,20) ignoring structures
const dist = {};
const seen = new Set(["13:20"]);
const q = [[13, 20, 0]];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
while (q.length > 0)
{
    const [x, y, d] = q.shift();
    dist[x + ":" + y] = d;
    for (const [dx, dy] of DIRS)
    {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= 50 || ny >= 50)
        {
            continue;
        }
        const k = nx + ":" + ny;
        if (seen.has(k) || terrain(nx, ny) === "wall")
        {
            continue;
        }
        seen.add(k);
        q.push([nx, ny, d + 1]);
    }
}
console.log("\nwalkable steps from spawn:");
for (const o of data.objects)
{
    if (o.type === "source" || o.type === "controller")
    {
        let best = Infinity;
        for (let y = o.y - 2; y <= o.y + 2; y += 1)
        {
            for (let x = o.x - 2; x <= o.x + 2; x += 1)
            {
                const d = dist[x + ":" + y];
                if (d !== undefined && d < best)
                {
                    best = d;
                }
            }
        }
        console.log(`${o.type} ${o.x},${o.y}: nearest walkable within r2 = ${best}`);
    }
}
// which source-adjacent tiles are walkable
for (const o of data.objects)
{
    if (o.type !== "source")
    {
        continue;
    }
    const adj = [];
    for (let y = o.y - 1; y <= o.y + 1; y += 1)
    {
        for (let x = o.x - 1; x <= o.x + 1; x += 1)
        {
            if (x === o.x && y === o.y)
            {
                continue;
            }
            if (terrain(x, y) !== "wall")
            {
                adj.push(`${x},${y}(${terrain(x, y)})`);
            }
        }
    }
    console.log(`source ${o.x},${o.y} walkable adjacent: [${adj.join(" ")}]`);
}

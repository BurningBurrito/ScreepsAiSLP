const { ScreepsServer } = require('screeps-server-mockup');

const botCode = `
module.exports.loop = function() {
  const room = Game.rooms['W0N1'];
  if (!room) return;
  if (Game.time <= 4) {
    const terrain = room.getTerrain();
    const code = terrain.get(40, 13);
    const structures = room.find(FIND_STRUCTURES).map(function(s) { return s.structureType + '@' + s.pos.x + ',' + s.pos.y; });
    const sites = room.find(FIND_CONSTRUCTION_SITES).map(function(s) { return s.structureType + '@' + s.pos.x + ',' + s.pos.y; });
    const pos = new RoomPosition(40, 13, 'W0N1');
    const result = room.createConstructionSite(pos, 'container');
    console.log('[diag t' + Game.time + '] terrain(40,13)=' + code + ' struct=' + JSON.stringify(structures) + ' sitesN=' + sites.length + ' create(40,13)= ' + result + ' create(13,19)=' + room.createConstructionSite(new RoomPosition(13, 19, 'W0N1'), 'container'));
    const look = room.lookForAt(LOOK_CONSTRUCTION_SITES, 40, 13);
    const lookStruct = room.lookForAt(LOOK_STRUCTURES, 40, 13);
    console.log('[diag t' + Game.time + '] look(40,13) sites=' + JSON.stringify(look) + ' struct=' + JSON.stringify(lookStruct) + ' sites0=' + JSON.stringify(sites.slice(0, 6)));
  }
};
`;

(async () => {
  const server = new ScreepsServer();
  await server.world.reset();
  await server.world.stubWorld();
  const bot = await server.world.addBot({ username: 'player', room: 'W0N1', x: 13, y: 20, modules: { main: botCode } });
  bot.on('console', (logs) => { logs.forEach((l) => console.log(l)); });
  await server.start();
  for (let i = 0; i < 5; i++) {
    await server.tick();
  }
  await server.stop();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

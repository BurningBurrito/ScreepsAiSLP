const { ScreepsServer } = require('screeps-server-mockup');

const botCode = `
module.exports.loop = function() {
  const room = Game.rooms['W0N1'];
  if (!room) return;
  if (Game.time === 1) {
    const r1 = room.createConstructionSite(new RoomPosition(11, 20, 'W0N1'), 'tower');
    const r2 = room.createConstructionSite(new RoomPosition(13, 20, 'W0N1'), 'rampart');
    const r3 = room.createConstructionSite(new RoomPosition(14, 21, 'W0N1'), 'extension');
    const r4 = room.createConstructionSite(new RoomPosition(40, 13, 'W0N1'), 'container');
    console.log('[diagL5 t1] tower@11,20=' + r1 + ' rampart@13,20=' + r2 + ' ext@14,21=' + r3 + ' container@40,13=' + r4);
  }
};
`;

(async () => {
  const server = new ScreepsServer();
  await server.world.reset();
  await server.world.stubWorld();
  const bot = await server.world.addBot({ username: 'player', room: 'W0N1', x: 13, y: 20, modules: { main: botCode } });
  const { db } = await server.world.load();
  await db['rooms.objects'].update({ room: 'W0N1', type: 'controller' }, { $set: { level: 5, progress: 0 } });
  bot.on('console', (logs) => { logs.forEach((l) => console.log(l)); });
  await server.start();
  for (let i = 0; i < 2; i++) { await server.tick(); }
  await server.stop();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

const { readFileSync } = require('fs');
const { ScreepsServer } = require('screeps-server-mockup');

(async () => {
  const server = new ScreepsServer();
  await server.world.reset();
  await server.world.stubWorld();
  const modules = { main: readFileSync('dist/main.js').toString() };
  const bot = await server.world.addBot({ username: 'player', room: 'W0N1', x: 13, y: 20, modules });
  // M5 setup: controller level 5 before start
  const { db } = await server.world.load();
  await db['rooms.objects'].update({ room: 'W0N1', type: 'controller' }, { $set: { level: 5, progress: 0 } });
  bot.on('console', (logs) => { logs.forEach((l) => { if (l.indexOf('container') !== -1 || l.indexOf('error') !== -1 || l.indexOf('Error') !== -1) console.log('[bot]', l); }); });
  await server.start();
  for (let i = 1; i <= 12; i++) {
    await server.tick();
    const objs = await db['rooms.objects'].find({ room: 'W0N1', x: 40, y: 13 });
    const desc = objs.map((o) => o.type + (o.structureType ? '/' + o.structureType : '') + (o.progress !== undefined ? ' p=' + o.progress : '')).join(' | ');
    console.log('[host tick ' + i + '] tile(40,13): ' + (desc || 'EMPTY'));
  }
  await server.stop();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });

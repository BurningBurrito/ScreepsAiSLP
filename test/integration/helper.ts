const { readFileSync } = require('fs');
const path = require('path');
const { ScreepsServer, stdHooks } = require('screeps-server-mockup');
import { Scorecard } from './scorecard';
const DIST_MAIN_JS = 'dist/main.js';
const BOT_ROOM = 'W0N1';

/*
 * Helper class for creating a ScreepsServer and resetting it between tests.
 * See https://github.com/screepers/screeps-server-mockup for instructions on
 * manipulating the terrain and game state.
 *
 * Every test gets a Scorecard (see scorecard.ts): it rides on server.tick(), so existing
 * tests need no change. Tests read numbers through helper.scorecard.compute(); afterEach()
 * writes the report files and prints the scorecard.
 */
class IntegrationTestHelper {
  private _server: any;
  private _player: any;
  private _scorecard: Scorecard | null = null;

  get server() {
    return this._server;
  }

  get player() {
    return this._player;
  }

  get scorecard(): Scorecard {
    if (this._scorecard === null) {
      throw new Error('scorecard is only available between beforeEach and afterEach');
    }
    return this._scorecard;
  }

  async beforeEach(scorecardName: string) {
    this._server = new ScreepsServer();

    // reset world but add invaders and source keepers bots
    await this._server.world.reset();

    // create a stub world composed of 9 rooms with sources and controller
    await this._server.world.stubWorld();

    // add a player with the built dist/main.js file
    const modules = {
        main: readFileSync(DIST_MAIN_JS).toString(),
    };
    this._player = await this._server.world.addBot({ username: 'player', room: BOT_ROOM, x: 13, y: 20, modules });

    // measure the colony from outside the bot; attach before start so tick 1 is recorded
    this._scorecard = new Scorecard(this._server, this._player, { name: scorecardName, room: BOT_ROOM });
    this._scorecard.attach();

    // Start server
    await this._server.start();
  }

  async afterEach() {
    if (this._scorecard !== null) {
      try {
        await this._scorecard.finish();
      } catch (err) {
        console.log('[scorecard] could not write the report: ' + String(err));
      }
      this._scorecard = null;
    }
    await this._server.stop();
  }
}

/*
 * Report name for a test: the file name without .test.ts (acceptance-m2, smoke, ...).
 * When a file holds several tests, the test title is appended so they do not overwrite
 * each other's reports.
 */
function scorecardName(test: any): string {
  const file: string = (test && test.file) || 'integration';
  const base = path.basename(file).replace(/\.test\.(ts|js)$/, '');
  const siblings = test && test.parent && Array.isArray(test.parent.tests) ? test.parent.tests.length : 1;
  if (siblings <= 1 || !test || !test.title) {
    return base;
  }
  const slug = String(test.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  return base + '-' + slug;
}

beforeEach(async function (this: any) {
  await helper.beforeEach(scorecardName(this.currentTest));
});

afterEach(async () => {
  await helper.afterEach();
});

before(() => {
  stdHooks.hookWrite();
});

export const helper = new IntegrationTestHelper();

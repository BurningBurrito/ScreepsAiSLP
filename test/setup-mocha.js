//inject mocha globally to allow custom interface refer without direct import - bypass bundle issue
global._ = require('lodash');
global.mocha = require('mocha');
global.chai = require('chai');
global.sinon = require('sinon');
global.chai.use(require('sinon-chai'));

// Define Screeps global constants for unit tests
global.RESOURCE_ENERGY = "energy";
global.OK = 0;
global.ERR_NOT_IN_RANGE = -9;
global.FIND_MY_SPAWNS = 112;
global.FIND_STRUCTURES = 107;
global.FIND_SOURCES_ACTIVE = 104;
global.STRUCTURE_EXTENSION = "extension";

// Override ts-node compiler options
process.env.TS_NODE_PROJECT = 'tsconfig.test.json'

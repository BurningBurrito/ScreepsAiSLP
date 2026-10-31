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
global.ERR_NOT_ENOUGH_RESOURCES = -6;
global.ERR_INVALID_TARGET = -7;
global.FIND_MY_SPAWNS = 112;
global.FIND_STRUCTURES = 107;
global.FIND_SOURCES_ACTIVE = 104;
global.FIND_CONSTRUCTION_SITES = 111;
global.FIND_DROPPED_RESOURCES = 106;
global.FIND_MY_STRUCTURES = 108;
global.FIND_HOSTILE_CREEPS = 103;
global.STRUCTURE_EXTENSION = "extension";
global.STRUCTURE_TOWER = "tower";
global.STRUCTURE_ROAD = "road";
global.STRUCTURE_CONTAINER = "container";
global.STRUCTURE_RAMPART = "rampart";
global.ATTACK = "attack";
global.RANGED_ATTACK = "ranged_attack";
global.WORK = "work";
global.TOWER_ENERGY_COST = 10;

// Override ts-node compiler options
process.env.TS_NODE_PROJECT = 'tsconfig.test.json'

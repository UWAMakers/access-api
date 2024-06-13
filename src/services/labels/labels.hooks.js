const { authenticate } = require('@feathersjs/authentication').hooks;
const { discard } = require('feathers-hooks-common');
const { authorize } = require('feathers-casl');

const assignPrinter = require('./hooks/assignPrinter');
const renderTemplate = require('./hooks/renderTemplate');
const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      assignPrinter(),
      discard('html'),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      assignPrinter(),
      discard('html'),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      assignPrinter(),
      discard('html'),
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
      authorizeHook, // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
      renderTemplate(),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

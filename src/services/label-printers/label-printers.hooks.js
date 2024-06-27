const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;

const queryActivePrinters = require('./hooks/queryActivePrinters');
const markActive = require('./hooks/markActive');

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });
const hashPasswordHook = hashPassword('password', { strategy: 'label-printer' });

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      queryActivePrinters(),
    ],
    find: [
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      authorizeHook, // make sure this hook runs always last
      hashPasswordHook,
    ],
    update: [
      authorizeHook, // make sure this hook runs always last
      hashPasswordHook,
    ],
    patch: [
      authorizeHook, // make sure this hook runs always last
      hashPasswordHook,
    ],
    remove: [
      authorizeHook, // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
      protect('password'),
      markActive(),
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

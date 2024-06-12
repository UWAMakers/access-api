const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');
const { keep, discard, disallow } = require('feathers-hooks-common');

const generateKey = require('./hooks/generateKey');
const injectToken = require('./hooks/injectToken');
const getToken = require('./hooks/getToken');

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      disallow('external'),
    ],
    find: [
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      getToken(),
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      generateKey(),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      disallow(),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      keep('usedAt'),
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
      authorizeHook, // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
      discard('key'),
    ],
    find: [],
    get: [],
    create: [
      injectToken(),
    ],
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

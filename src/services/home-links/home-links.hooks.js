const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');

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
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
      authorizeHook, // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
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

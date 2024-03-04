const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');
const { disallow } = require('feathers-hooks-common');

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorizeHook, // make sure this hook runs always last
    ],
    get: [
      disallow('external'),
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      disallow('external'),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      disallow('external'),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      disallow('external'),
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
      disallow('external'),
      authorizeHook, // make sure this hook runs always last
    ],
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
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};

const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');
const { iff } = require('feathers-hooks-common');

const grantAccess = require('./hooks/grantAccess');

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      grantAccess(),
      iff((ctx) => !ctx.result, [
        authenticate('jwt'),
        authorizeHook,  // make sure this hook runs always last
      ]),
    ],
    create: [
      authenticate('jwt'),
      authorizeHook,  // make sure this hook runs always last
    ],
    update: [
      authenticate('jwt'),
      authorizeHook,  // make sure this hook runs always last
    ],
    patch: [
      authenticate('jwt'),
      authorizeHook,  // make sure this hook runs always last
    ],
    remove: [
      authenticate('jwt'),
      authorizeHook,  // make sure this hook runs always last
    ]
  },

  after: {
    all: [],
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

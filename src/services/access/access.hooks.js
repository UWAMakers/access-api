const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;
const { iff } = require('feathers-hooks-common');

const grantAccess = require('./hooks/grantAccess');

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      authorize(),  // make sure this hook runs always last
    ],
    get: [
      grantAccess(),
      iff((ctx) => !ctx.result, [
        authenticate('jwt'),
        authorize(),  // make sure this hook runs always last
      ]),
    ],
    create: [
      authenticate('jwt'),
      authorize(),  // make sure this hook runs always last
    ],
    update: [
      authenticate('jwt'),
      authorize(),  // make sure this hook runs always last
    ],
    patch: [
      authenticate('jwt'),
      authorize(),  // make sure this hook runs always last
    ],
    remove: [
      authenticate('jwt'),
      authorize(),  // make sure this hook runs always last
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

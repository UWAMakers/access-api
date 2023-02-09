const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;
const { disallow } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorize(), // make sure this hook runs always last
    ],
    get: [
      disallow('external'),
      authorize(), // make sure this hook runs always last
    ],
    create: [
      disallow('external'),
      authorize(), // make sure this hook runs always last
    ],
    update: [
      disallow('external'),
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      disallow('external'),
      authorize(), // make sure this hook runs always last
    ],
    remove: [
      disallow('external'),
      authorize(), // make sure this hook runs always last
    ],
  },

  after: {
    all: [
      authorize(), // make sure this hook runs always first
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

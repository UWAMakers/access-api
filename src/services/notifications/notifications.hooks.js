const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorize(),  // make sure this hook runs always last
    ],
    get: [
      authorize(), // make sure this hook runs always last
    ],
    create: [
      authorize(), // make sure this hook runs always last
    ],
    update: [
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      authorize(), // make sure this hook runs always last
    ],
    remove: [
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

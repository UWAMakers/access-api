const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

const distinct = require('../../hooks/distinct');

const complete = require('./hooks/complete');
const setStatus = require('./hooks/setStatus');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorize(),  // make sure this hook runs always last
      distinct(),
    ],
    get: [
      authorize(), // make sure this hook runs always last
    ],
    create: [
      setStatus(),
      authorize(), // make sure this hook runs always last
    ],
    update: [
      setStatus(),
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      setStatus(),
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
    create: [complete()],
    update: [complete()],
    patch: [complete()],
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

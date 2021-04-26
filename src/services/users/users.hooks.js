const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;
// No idea why the global app.hooks stashBefores aren't working
const { stashBefore } = require('feathers-hooks-common');
const mailChimpSync = require('./hooks/mailChimpSync');


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
      stashBefore('existing'),
      authorize(), // make sure this hook runs always last
    ],
    update: [
      stashBefore('existing'),
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      stashBefore('existing'),
      authorize(), // make sure this hook runs always last
    ],
    remove: [
      stashBefore('existing'),
      authorize(), // make sure this hook runs always last
    ],
  },

  after: {
    all: [
      authorize(), // make sure this hook runs always first
    ],
    find: [],
    get: [],
    create: [
      mailChimpSync(),
    ],
    update: [
      mailChimpSync(),
    ],
    patch: [
      mailChimpSync(),
    ],
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

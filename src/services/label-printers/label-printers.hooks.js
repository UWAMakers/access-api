const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks;
const { alterItems } = require('feathers-hooks-common');

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
      hashPassword('password'),
    ],
    update: [
      authorize(), // make sure this hook runs always last
      hashPassword('password'),
    ],
    patch: [
      authorize(), // make sure this hook runs always last
      hashPassword('password'),
    ],
    remove: [
      authorize(), // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorize(), // make sure this hook runs always first
      protect('password'),
      alterItems(item => {
        item.isLabelPrinter = true;
      }),
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

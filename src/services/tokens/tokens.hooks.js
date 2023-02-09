const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;
const { keep, discard, disallow } = require('feathers-hooks-common');

const generateKey = require('./hooks/generateKey');
const injectToken = require('./hooks/injectToken');
const getToken = require('./hooks/getToken');

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      disallow('external'),
    ],
    find: [
      authorize(),  // make sure this hook runs always last
    ],
    get: [
      getToken(),
      authorize(), // make sure this hook runs always last
    ],
    create: [
      generateKey(),
      authorize(), // make sure this hook runs always last
    ],
    update: [
      disallow(),
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      keep('usedAt'),
      authorize(), // make sure this hook runs always last
    ],
    remove: [
      authorize(), // make sure this hook runs always last
    ]
  },

  after: {
    all: [
      authorize(), // make sure this hook runs always first
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

const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');

const cacheTree = require('./hooks/cacheTree');
const setContacts = require('./hooks/setContacts');
const handleRef = require('./hooks/handleRef');
const remapRemove = require('./hooks/remapRemove');
const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  around: {
    create: [
      cacheTree(),
    ],
    patch: [
      cacheTree(),
    ],
    update: [
      cacheTree(),
    ],
    remove: [
      remapRemove(),
    ],
  },

  before: {
    all: [authenticate('jwt')],
    find: [
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      handleRef(),
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      handleRef(),
      setContacts(),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      handleRef(),
      setContacts(),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      handleRef(),
      setContacts(),
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

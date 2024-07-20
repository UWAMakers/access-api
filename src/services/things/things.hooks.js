const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');

const signFiles = require('../../hooks/signFiles');
const search = require('../../hooks/search');

const cacheTree = require('./hooks/cacheTree');
const setContacts = require('./hooks/setContacts');
const handleRef = require('./hooks/handleRef');
const remapRemove = require('./hooks/remapRemove');
const verifyThingData = require('./hooks/verifyThingData');
const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });
const authorizePatch = authorize({ adapter: '@feathersjs/mongodb', method: 'patch' });

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
      search(['name'], ['ref']),
      authorizeHook,  // make sure this hook runs always last
    ],
    get: [
      handleRef(),
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      verifyThingData(),
      handleRef(),
      setContacts(),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      verifyThingData(),
      handleRef(),
      setContacts(),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      verifyThingData(),
      handleRef(),
      setContacts(),
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
      authorizeHook, // make sure this hook runs always last
    ],
    addFile: [
      authorizePatch, // make sure this hook runs always last
    ],
    removeFile: [
      authorizePatch, // make sure this hook runs always last
    ],
    editFile: [
      authorizePatch, // make sure this hook runs always last
    ],
    checkFileLink: [
      authorizePatch, // make sure this hook runs always last
    ],
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
      signFiles(['mainImage', 'images', 'resources']),
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

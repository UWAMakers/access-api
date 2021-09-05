const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

const ifChangedTo = require('../../hooks/ifChangedTo');
const notify = require('../../hooks/notify');

const mailChimpSync = require('./hooks/mailChimpSync');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorize(), // make sure this hook runs always last
    ],
    get: [
      authorize(), // make sure this hook runs always last
    ],
    create: [
      authorize(), // make sure this hook runs always last
    ],
    update: [
      mailChimpSync(),
      authorize(), // make sure this hook runs always last
    ],
    patch: [
      mailChimpSync(),
      authorize(), // make sure this hook runs always last
    ],
    remove: [
      mailChimpSync(),
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
      ifChangedTo({ 'preferences.joinedAt': (v) => !!v }, [
        notify('user_joined', '_id'),
      ]),
    ],
    update: [],
    patch: [
      ifChangedTo({ 'preferences.joinedAt': (v) => !!v }, [
        notify('user_joined', '_id'),
      ]),
    ],
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

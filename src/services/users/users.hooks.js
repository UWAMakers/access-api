const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

const ifChangedTo = require('../../hooks/ifChangedTo');
const notify = require('../../hooks/notify');

const mailChimpSync = require('./hooks/mailChimpSync');
const verifyPreferredEmail = require('./hooks/verifyPreferredEmail');
const setPreferredEmail = require('./hooks/setPreferredEmail');

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
      setPreferredEmail(),
    ],
    patch: [
      mailChimpSync(),
      authorize(), // make sure this hook runs always last
      setPreferredEmail(),
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
    update: [
      verifyPreferredEmail(),
    ],
    patch: [
      ifChangedTo({ 'preferences.joinedAt': (v) => !!v }, [
        notify('user_joined', '_id'),
      ]),
      verifyPreferredEmail(),
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

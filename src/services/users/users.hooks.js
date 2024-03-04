const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');

const ifChangedTo = require('../../hooks/ifChangedTo');
const notify = require('../../hooks/notify');

const mailChimpSync = require('./hooks/mailChimpSync');
const verifyPreferredEmail = require('./hooks/verifyPreferredEmail');
const setPreferredEmail = require('./hooks/setPreferredEmail');
const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorizeHook, // make sure this hook runs always last
    ],
    get: [
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      mailChimpSync(),
      authorizeHook, // make sure this hook runs always last
      setPreferredEmail(),
    ],
    patch: [
      mailChimpSync(),
      authorizeHook, // make sure this hook runs always last
      setPreferredEmail(),
    ],
    remove: [
      mailChimpSync(),
      authorizeHook, // make sure this hook runs always last
    ],
  },

  after: {
    all: [
      authorizeHook, // make sure this hook runs always first
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

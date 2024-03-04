const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl');

const distinct = require('../../hooks/distinct');
const ifChangedTo = require('../../hooks/ifChangedTo');
const notify = require('../../hooks/notify');

const complete = require('./hooks/complete');
const setStatus = require('./hooks/setStatus');

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

const completeNotify = ifChangedTo({ status: 'complete' }, [
  notify('training_complete', 'userId', { trainingIdField: 'trainingId' }),
  notify('training_change_bulk', 'userId', { trainingIdField: 'trainingId', status: 'complete' }),
]);
const expireNotify = ifChangedTo({ status: 'pending' }, [
  notify('training_expired', 'userId', { trainingIdField: 'trainingId' }),
  notify('training_change_bulk', 'userId', { trainingIdField: 'trainingId', status: 'expired' }),
]);

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [
      authorizeHook,  // make sure this hook runs always last
      distinct(),
    ],
    get: [
      authorizeHook, // make sure this hook runs always last
    ],
    create: [
      setStatus(),
      authorizeHook, // make sure this hook runs always last
    ],
    update: [
      setStatus(),
      authorizeHook, // make sure this hook runs always last
    ],
    patch: [
      setStatus(),
      authorizeHook, // make sure this hook runs always last
    ],
    remove: [
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
      complete(),
      completeNotify,
    ],
    update: [
      complete(),
      completeNotify,
      expireNotify,
    ],
    patch: [
      complete(),
      completeNotify,
      expireNotify,
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

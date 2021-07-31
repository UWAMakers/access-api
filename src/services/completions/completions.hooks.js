const { authenticate } = require('@feathersjs/authentication').hooks;
const { authorize } = require('feathers-casl').hooks;

const distinct = require('../../hooks/distinct');
const ifChangedTo = require('../../hooks/ifChangedTo');
const notify = require('../../hooks/notify');

const complete = require('./hooks/complete');
const setStatus = require('./hooks/setStatus');

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

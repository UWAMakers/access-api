// Initializes the `inductions` service on path `/inductions`
const { InductionsPending } = require('./inductions-pending.class');
const hooks = require('./inductions-pending.hooks');

module.exports = function (app) {
  const options = {};

  // Initialize our service with any options it requires
  app.use('/inductions-pending', new InductionsPending(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('inductions-pending');

  service.hooks(hooks);
};

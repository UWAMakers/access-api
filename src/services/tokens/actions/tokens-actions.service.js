// Initializes the `tokens` service on path `/tokens`
const { TokenActions } = require('./tokens-actions.class');
const hooks = require('./tokens-actions.hooks');

module.exports = function (app) {
  const options = {
  };

  // Initialize our service with any options it requires
  app.use('/tokens-actions', new TokenActions(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tokens-actions');

  service.hooks(hooks);
};

// Initializes the `tokens` service on path `/tokens`
const { Tokens } = require('./tokens.class');
const createModel = require('../../models/tokens.model');
const hooks = require('./tokens.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/tokens', new Tokens(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('tokens');

  service.hooks(hooks);
};

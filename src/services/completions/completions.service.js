// Initializes the `completions` service on path `/completions`
const { Completions } = require('./completions.class');
const createModel = require('../../models/completions.model');
const hooks = require('./completions.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: app.get('mongoWhitelist'),
  };

  // Initialize our service with any options it requires
  app.use('/completions', new Completions(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('completions');

  service.hooks(hooks);
};

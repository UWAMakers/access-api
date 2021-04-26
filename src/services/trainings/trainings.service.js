// Initializes the `trainings` service on path `/trainings`
const { Trainings } = require('./trainings.class');
const createModel = require('../../models/trainings.model');
const hooks = require('./trainings.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: app.get('mongoWhitelist'),
  };

  // Initialize our service with any options it requires
  app.use('/trainings', new Trainings(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('trainings');

  service.hooks(hooks);
};

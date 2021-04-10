// Initializes the `trainingItems` service on path `/training-items`
const { TrainingItems } = require('./training-items.class');
const createModel = require('../../models/training-items.model');
const hooks = require('./training-items.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/training-items', new TrainingItems(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('training-items');

  service.hooks(hooks);
};

// Initializes the `labels` service on path `/labels`
const { Labels } = require('./labels.class');
const createModel = require('../../models/labels.model');
const hooks = require('./labels.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/labels', new Labels(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('labels');

  service.hooks(hooks);
};

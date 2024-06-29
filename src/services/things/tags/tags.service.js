// Initializes the `things-tags` service on path `/things-tags`
const { ThingTag } = require('./tags.class');
const createModel = require('../../../models/things-tags.model');
const hooks = require('./tags.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/things-tags', new ThingTag(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('things-tags');

  service.hooks(hooks);
};

// Initializes the `inductions` service on path `/inductions`
const { Inductions } = require('./inductions.class');
const createModel = require('../../models/inductions.model');
const hooks = require('./inductions.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/inductions', new Inductions(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('inductions');

  service.hooks(hooks);
};

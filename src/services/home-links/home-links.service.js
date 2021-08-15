// Initializes the `home-links` service on path `/home-links`
const { HomeLinks } = require('./home-links.class');
const createModel = require('../../models/home-links.model');
const hooks = require('./home-links.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/home-links', new HomeLinks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('home-links');

  service.hooks(hooks);
};

// Initializes the `cards` service on path `/cards`
const { Cards } = require('./cards.class');
const hooks = require('./cards.hooks');

module.exports = function (app) {
  const options = {
    app,
  };

  // Initialize our service with any options it requires
  app.use('/cards', new Cards(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('cards');

  service.hooks(hooks);
};

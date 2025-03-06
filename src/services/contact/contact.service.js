// Initializes the `feedback` service on path `/feedback`
const { Contact } = require('./contact.class');
const hooks = require('./contact.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/contact', new Contact(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('contact');

  service.hooks(hooks);
};

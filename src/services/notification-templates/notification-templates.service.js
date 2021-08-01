// Initializes the `notification-templates` service on path `/notification-templates`
const { NotificationTemplates } = require('./notification-templates.class');
const createModel = require('../../models/notification-templates.model');
const hooks = require('./notification-templates.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: app.get('mongoWhitelist'),
  };

  // Initialize our service with any options it requires
  app.use('/notification-templates', new NotificationTemplates(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('notification-templates');

  service.hooks(hooks);
};

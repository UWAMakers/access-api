// Initializes the `notifications-preview` service on path `/notifications-preview`
const { NotificationsPreview } = require('./notifications-preview.class');
const hooks = require('./notifications-preview.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/notifications-preview', new NotificationsPreview(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('notifications-preview');

  service.hooks(hooks);
};

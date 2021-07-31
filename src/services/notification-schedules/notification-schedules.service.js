// Initializes the `notification-schedules` service on path `/notification-schedules`
const { NotificationSchedules } = require('./notification-schedules.class');
const createModel = require('../../models/notification-schedules.model');
const hooks = require('./notification-schedules.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/notification-schedules', new NotificationSchedules(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('notification-schedules');

  service.hooks(hooks);
};

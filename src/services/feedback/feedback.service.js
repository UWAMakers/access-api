// Initializes the `feedback` service on path `/feedback`
const { Feedback } = require('./feedback.class');
const hooks = require('./feedback.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/feedback', new Feedback(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('feedback');

  service.hooks(hooks);
};

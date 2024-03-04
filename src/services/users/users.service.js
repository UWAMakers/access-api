// Initializes the `users` service on path `/users`
const { Users } = require('./users.class');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: app.get('mongoWhitelist'),
  };
  const methods = [
    'find', 'get', 'create', 'update', 'patch', 'remove',
    'unlinkSocialLogin',
  ];

  // Initialize our service with any options it requires
  app.use('/users', new Users(options, app), { methods });

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);
};

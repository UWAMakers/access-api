// Initializes the `things` service on path `/things`
const { Thing } = require('./things.class');
const createModel = require('../../models/things.model');
const hooks = require('./things.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: app.get('mongoWhitelist'),
  };
  const methods = [
    'find', 'get', 'create', 'update', 'patch', 'remove',
    'addFile', 'checkFileLink', 'removeFile', 'editFile',
  ];

  // Initialize our service with any options it requires
  app.use('/things', new Thing(options, app), { methods });

  // Get our initialized service so that we can register hooks
  const service = app.service('things');

  service.hooks(hooks);
};

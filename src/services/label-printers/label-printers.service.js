// Initializes the `label-printers` service on path `/label-printers`
const { LabelPrinters } = require('./label-printers.class');
const createModel = require('../../models/label-printers.model');
const hooks = require('./label-printers.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/label-printers', new LabelPrinters(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('label-printers');

  service.hooks(hooks);
};

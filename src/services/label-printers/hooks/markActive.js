const { checkContext, getItems } = require('feathers-hooks-common');
const _ = require('lodash');

module.exports = (options = {}) => (context) => {
  checkContext(context, 'after', null);

  const { app } = context;

  const records = _.castArray(getItems(context));

  const activeIds = app.channel('label-printers').connections.map((connection) => `${connection.user._id}`);

  records.forEach((record) => {
    record.active = activeIds.includes(`${record._id}`);
    record.isLabelPrinter = true;
  });

  return context;
};

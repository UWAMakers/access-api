const { checkContext } = require('feathers-hooks-common');

module.exports = (options = {}) => (context) => {
  checkContext(context, 'before', null);

  const { params, app } = context;
  const { query = {} } = params;

  if (typeof query.active !== 'boolean') {
    return context;
  }

  const activeIds = app.channel('label-printers').connections.map((connection) => connection.user._id);

  if (!query.$and) {
    query.$and = [];
  }
  if (query.active) {
    query.$and.push({ _id: { $in: activeIds } });
  } else {
    query.$and.push({ _id: { $nin: activeIds } });
  }
  delete query.active;

  return context;
};

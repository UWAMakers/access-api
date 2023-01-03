const { checkContext } = require('feathers-hooks-common');
// const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'after', ['create']);

  const { result, params } = context;

  result.token = `${result._id}.${params.rawKey}`;

  return context;
};

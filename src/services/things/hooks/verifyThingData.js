const { checkContext } = require('feathers-hooks-common');
// const { BadRequest } = require('@feathersjs/errors');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['create', 'patch', 'update']);

  const { data, params } = context;

  if (!params.provider) return context;

  context.data = _.omit(data, ['mainImage', 'images', 'resources', 'containerIds', 'childIds']);

  return context;
};

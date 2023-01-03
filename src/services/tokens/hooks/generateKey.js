const { checkContext } = require('feathers-hooks-common');
// const _ = require('lodash');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');

const hour = 1000 * 60 * 60;
const actionExpiries = {
  magic_login: 1 * hour,
  magic_signup: 24 * hour,
  verify_preferred_email: 24 * hour,
};

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['create']);

  const { data, params } = context;

  if (!data.action) throw new errors.BadRequest('Action is required');

  const rawKey = uuid();
  data.key = await bcrypt.hash(rawKey, 10);
  data.expiresAt = new Date(Date.now() + (actionExpiries[data.action] || 0));

  params.rawKey = rawKey;

  return context;
};


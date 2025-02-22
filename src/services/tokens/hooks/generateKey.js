const { checkContext } = require('feathers-hooks-common');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const errors = require('@feathersjs/errors');

const minute = 1000 * 60;
// const hour = 60 * minute;
const actionExpiries = {
  magic_login: 15 * minute,
  magic_signup: 15 * minute,
  verify_preferred_email: 30 * minute,
};

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['create']);

  const { data, params } = context;

  if (!data.action) throw new errors.BadRequest('Action is required');

  const rawKey = uuidv4();
  data.key = await bcrypt.hash(rawKey, 10);
  data.expiresAt = new Date(Date.now() + (actionExpiries[data.action] || 0));

  params.rawKey = rawKey;

  return context;
};


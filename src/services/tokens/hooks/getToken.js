const { checkContext } = require('feathers-hooks-common');
// const _ = require('lodash');
const errors = require('@feathersjs/errors');
const bcrypt = require('bcrypt');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['get']);

  const { id, service, params } = context;

  if (params.skipExisting) return context;
  const [idPart, keyPart] = id.split('.');
  if (!idPart || !keyPart) throw new errors.BadRequest('Invalid token');

  const token = await service._get(idPart);
  if (!token) throw new errors.NotFound('Token not found');

  const { key, usedAt, expiresAt } = token;

  const match = await bcrypt.compare(keyPart, key);
  if (!match) throw new errors.NotFound('Token not found');

  if (usedAt) throw new errors.BadRequest('Token already used');
  if (expiresAt < (new Date())) throw new errors.BadRequest('Token expired');

  context.id = idPart;

  return context;
};
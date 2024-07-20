const { authenticate } = require('@feathersjs/authentication').hooks;
const { defineAbilitiesFor } = require('./services/authentication/authentication.abilities');
const { discard } = require('feathers-hooks-common');

const stashExisting = async (context) => {
  const { service, id, params, path, method } = context;
  if (
    (path !== 'access' || method !== 'get') &&
    service.options &&
    service.options.Model &&
    /^[\dabcdef]{24}$/i.test(`${id}`) &&
    !params.skipExisting
  ) {
    context.existing = await service.get(id, { skipExisting: true });
  }
  return context;
};

const doubleCheckAbilities = async (context) => {
  if (context.params?.provider && !context.params?.user) {
    try {
      await authenticate('jwt')(context);
    } catch (error) {
      return context;
    }
  }
  const { user } = context?.params || {};
  if (!user || context.params?.ability) return context;
  const ability = await defineAbilitiesFor(user, context.app);
  context.params.ability = ability;
  context.params.rules = ability.rules;
  if (context.params?.connection) {
    context.params.connection.ability = ability;
  }
  return context;
};

module.exports = {
  before: {
    all: [doubleCheckAbilities],
    find: [],
    get: [
      stashExisting,
    ],
    create: [
      discard('createdAt', 'updatedAt'),
    ],
    update: [
      stashExisting,
      discard('createdAt', 'updatedAt'),
    ],
    patch: [
      stashExisting,
      discard('createdAt', 'updatedAt'),
    ],
    remove: [
      stashExisting,
    ],
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};

const { defineAbilitiesFor } = require('./authentication.abilities');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [
      async (context) => {
        const { user } = context.result;
        if (!user) return context;
        const ability = await defineAbilitiesFor(user, context.app);
        context.result.ability = ability;
        context.result.rules = ability.rules;

        return context;
      },
    ],
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

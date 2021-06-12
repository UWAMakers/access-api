const stashExisting = async (context) => {
  const { service, id, params } = context;
  if (service.options && service.options.Model && /^[\dabcdef]{24}$/i.test(`${id}`) && !params.skipExisting) {
    context.existing = await service.get(id, { skipExisting: true });
  }
  return context;
};

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      stashExisting,
    ],
    create: [],
    update: [
      stashExisting,
    ],
    patch: [stashExisting],
    remove: [
      stashExisting,
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

// Application hooks that run for every service
const { stashBefore, iff } = require('feathers-hooks-common');

const stashExisting = iff(
  ({ service, id }) => service.options && service.options.Model && /^(\dabcdef){24}$/i.test(`${id}`),
  [stashBefore('existing')],
);

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
    patch: [
      stashExisting,
    ],
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

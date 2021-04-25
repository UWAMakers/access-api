// Application hooks that run for every service
const { stashBefore } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      stashBefore('existing'),
    ],
    create: [],
    update: [
      stashBefore('existing'),
    ],
    patch: [
      stashBefore('existing'),
    ],
    remove: [
      stashBefore('existing'),
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

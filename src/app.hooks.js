// Application hooks that run for every service
const { stashBefore, iff } = require('feathers-hooks-common');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
      iff(({ service }) => service.options && service.options.Model, [
        stashBefore('existing'),
      ]),
    ],
    create: [],
    update: [
      iff(({ service }) => service.options && service.options.Model, [
        stashBefore('existing'),
      ]),
    ],
    patch: [
      iff(({ service }) => service.options && service.options.Model, [
        stashBefore('existing'),
      ]),
    ],
    remove: [
      iff(({ service }) => service.options && service.options.Model, [
        stashBefore('existing'),
      ]),
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

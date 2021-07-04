const assert = require('assert');
const app = require('../../src/app');

describe("'trainingItems' service", () => {
  it('registered the service', () => {
    const service = app.service('training-items');

    assert.ok(service, 'Registered the service');
  });
});

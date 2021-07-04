const assert = require('assert');
const app = require('../../src/app');

describe("'completions' service", () => {
  it('registered the service', () => {
    const service = app.service('completions');

    assert.ok(service, 'Registered the service');
  });
});

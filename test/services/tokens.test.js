const assert = require('assert');
const app = require('../../src/app');

describe('\'tokens\' service', () => {
  it('registered the service', () => {
    const service = app.service('tokens');

    assert.ok(service, 'Registered the service');
  });
});

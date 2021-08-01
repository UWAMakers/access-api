const assert = require('assert');
const app = require('../../src/app');

describe('\'access\' service', () => {
  it('registered the service', () => {
    const service = app.service('access');

    assert.ok(service, 'Registered the service');
  });
});

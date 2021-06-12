const assert = require('assert');
const app = require('../../src/app');

describe('\'review\' service', () => {
  it('registered the service', () => {
    const service = app.service('review');

    assert.ok(service, 'Registered the service');
  });
});

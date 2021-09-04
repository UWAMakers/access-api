const assert = require('assert');
const app = require('../../src/app');

describe('\'home-links\' service', () => {
  it('registered the service', () => {
    const service = app.service('home-links');

    assert.ok(service, 'Registered the service');
  });
});

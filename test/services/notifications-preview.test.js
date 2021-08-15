const assert = require('assert');
const app = require('../../src/app');

describe('\'notifications-preview\' service', () => {
  it('registered the service', () => {
    const service = app.service('notifications-preview');

    assert.ok(service, 'Registered the service');
  });
});

const assert = require('assert');
const app = require('../../src/app');

describe('\'notification-templates\' service', () => {
  it('registered the service', () => {
    const service = app.service('notification-templates');

    assert.ok(service, 'Registered the service');
  });
});

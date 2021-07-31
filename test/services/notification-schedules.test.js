const assert = require('assert');
const app = require('../../src/app');

describe('\'notification-schedules\' service', () => {
  it('registered the service', () => {
    const service = app.service('notification-schedules');

    assert.ok(service, 'Registered the service');
  });
});

const assert = require('assert');
const app = require('../../src/app');

describe('\'labels\' service', () => {
  it('registered the service', () => {
    const service = app.service('labels');

    assert.ok(service, 'Registered the service');
  });
});

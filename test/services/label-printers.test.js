const assert = require('assert');
const app = require('../../src/app');

describe('\'label-printers\' service', () => {
  it('registered the service', () => {
    const service = app.service('label-printers');

    assert.ok(service, 'Registered the service');
  });
});

const assert = require('assert');
const app = require('../../src/app');

describe("'inductions' service", () => {
  it('registered the service', () => {
    const service = app.service('inductions');

    assert.ok(service, 'Registered the service');
  });
});

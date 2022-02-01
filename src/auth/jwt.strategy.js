const { JWTStrategy: OldStrategy } = require('@feathersjs/authentication');
const errors = require('@feathersjs/errors');
const _ = require('lodash');

class JWTStrategy extends OldStrategy {
  async getEntity(id, params) {
    const entityService = this.entityService;
    const { entity } = this.configuration;
    if (entityService === null) {
      throw new errors.NotAuthenticated('Could not find entity service');
    }
    const query = await this.getEntityQuery(params);
    const getParams = Object.assign({}, _.omit(params, 'provider'), { query });
    let result;
    try {
      result = await entityService.get(id, getParams);
    } catch (err) {
      if (err.code === 404) result = await this.app.service('label-printers').get(id, getParams);
      else throw err;
    }
    if (!params.provider) {
      return result;
    }
    return entityService.get(id, Object.assign(Object.assign({}, params), { [entity]: result }));
  }
}

module.exports = JWTStrategy;
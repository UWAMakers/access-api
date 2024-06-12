const { JWTStrategy: OriginalJWTStrategy } = require('@feathersjs/authentication');
const errors = require('@feathersjs/errors');
const _ = require('lodash');

class JWTStrategy extends OriginalJWTStrategy {
  async getFromMultipleServices(id, params) {
    let result;
    try {
      result = await this.entityService.get(id, params);
    } catch (err) {
      if (err.code === 404) result = await this.app.service('label-printers').get(id, params);
      else throw err;
    }
    return result;
  }

  async getEntity(id, params) {
    const entityService = this.entityService;
    const { entity } = this.configuration;
    if (entityService === null) {
      throw new errors.NotAuthenticated('Could not find entity service');
    }
    const query = await this.getEntityQuery(params);
    const getParams = Object.assign({}, _.omit(params, 'provider'), { query });
    const result = await this.getFromMultipleServices(id, getParams);
    if (!params.provider) {
      return result;
    }
    return this.getFromMultipleServices(id, Object.assign(Object.assign({}, params), { [entity]: result }));
  }
}

module.exports = JWTStrategy;
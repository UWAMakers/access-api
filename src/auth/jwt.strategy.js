const { JWTStrategy: OriginalJWTStrategy } = require('@feathersjs/authentication');

class JWTStrategy extends OriginalJWTStrategy {
  async getEntity(result) {
    return this.entityService.get(result);
  }
}

module.exports = JWTStrategy;
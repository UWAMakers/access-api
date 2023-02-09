const {
  AuthenticationService,
  JWTStrategy,
} = require('@feathersjs/authentication');
// const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');
const PhemeStrategy = require('./auth/pheme.strategy');
const MagicStrategy = require('./auth/magic.strategy');
const authHooks = require('./services/authentication/authentication.hooks');

module.exports = (app) => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new PhemeStrategy());
  authentication.register('magic', new MagicStrategy());

  app.use('/authentication', authentication);
  app.service('authentication').hooks(authHooks);
  app.configure(expressOauth());
};

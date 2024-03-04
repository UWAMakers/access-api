const {
  AuthenticationService,
} = require('@feathersjs/authentication');
// const { LocalStrategy } = require('@feathersjs/authentication-local');
const { oauth } = require('@feathersjs/authentication-oauth');
// const PhemeStrategy = require('./auth/pheme.strategy');
const JWTStrategy = require('./auth/jwt.strategy');
const MagicStrategy = require('./auth/magic.strategy');
const OAuthStrategy = require('./auth/oauth.strategy');
const authHooks = require('./services/authentication/authentication.hooks');

module.exports = (app) => {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  // authentication.register('local', new PhemeStrategy());
  authentication.register('magic', new MagicStrategy());
  authentication.register('discord', new OAuthStrategy());

  app.use('/authentication', authentication);
  app.service('authentication').hooks(authHooks);
  app.configure(oauth({}));
};

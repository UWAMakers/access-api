const { Service } = require('feathers-mongoose');
const errors = require('@feathersjs/errors');

exports.Users = class Users extends Service {
  
  constructor(options, app) {
    super(options);
    this.app = app;
  }

  unlinkSocialLogin(data, params) {
    const { user } = params;
    const { provider } = data;
    if (!user) throw new errors.BadRequest('User not found');
    if (!provider) throw new errors.BadRequest('Provider not found');
    if (!this.app.get('authentication').oauth[provider]) throw new errors.BadRequest('Provider not found');
    const idField = `${provider}Id`;
    if (!user[idField]) throw new errors.BadRequest('Provider not linked');
    return this.patch(user._id, { [idField]: null });
  }
};

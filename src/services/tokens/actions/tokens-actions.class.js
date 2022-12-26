const errors = require('@feathersjs/errors');

exports.Tokens = class TokenActions {

  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  // eslint-disable-next-line no-unused-vars
  async get(id, params) {

    const token = await this.app.service('tokens').get(id);

    const { action, data, userId } = token;
    let used = false;

    if (action === 'verify_preferred_email') {
      await this.app.service('users').patch(userId, { preferredEmail: data.email });
      used = true;
    }

    if (used) {
      await this.app.service('tokens').patch(token._id, { usedAt: new Date() });
    } else {
      throw new errors.BadRequest('Invalid token');
    }

    return { action, success: true };
  }
  
};

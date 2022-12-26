
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');
const { getActionEmailHtml } = require('../util/email/index');
const moment = require('moment-timezone');

class MagicStrategy extends LocalStrategy {

  validateUserData(userData) {
    const { email, firstName, lastName } = userData;
    let usernameUnverified = true;
    if (!email) throw new NotAuthenticated('Email is required');
    if (!firstName) throw new NotAuthenticated('First name is required');
    if (!lastName) throw new NotAuthenticated('Last name is required');
    let username = userData.username;
    if (/^\d{8,10}@student\.uwa\.edu\.au$/.test(email)) {
      username = email.split('@')[0];
      usernameUnverified = false;
    }
    if (!username) throw new NotAuthenticated('Username is required');
    return {
      email,
      firstName,
      lastName,
      displayName: firstName,
      username,
      usernameUnverified,
    };
  }

  async finishWithToken(token) {
    const tokenData = await this.app.service('tokens').get(token);
    const { action, userId, data } = tokenData;
    await this.app.service('tokens').patch(tokenData._id, { usedAt: new Date() });
    let user = null;

    if (action === 'magic_login') {
      user = await this.app.service('users').get(userId);
    } else if (action === 'magic_signup') {
      user = await this.app.service('users').create(data);
    }
    if (!user) throw new NotAuthenticated('User not found');
    return {
      authentication: { strategy: this.name },
      user,
    };
  }

  async sendMagicLink(email, tokenData, userData) {
    const finishUrl = `${this.app.get('CLIENT_DOMAIN')}/verify?token=${encodeURIComponent(tokenData.token)}&action=${tokenData.action}`;
    const actionCopies = {
      magic_login: 'logging in',
      magic_signup: 'signing up',
    };
    const actionCopy = actionCopies[tokenData.action] || 'Login';
    const expires = moment(tokenData.expiresAt).fromNow();

    const emailBody = getActionEmailHtml({
      bodyText: `
        Click the button below to finish ${actionCopy}.
        This link will expire in ${expires}.
        If you didn't request this, you can safely ignore this email.
      `,
      firstName: userData.firstName,
      actionButtonText:  `Finish ${actionCopy}`,
      actionButtonLink: finishUrl,
    });
    return this.app.service('notifications').create({
      email: {
        html: emailBody,
        to: email,
        from: this.app.get('SMTP_USER'),
        subject: `Finish ${actionCopy} to ${this.app.get('CLIENT_DOMAIN')}`,
      },
    });
  }


  // eslint-disable-next-line no-unused-vars
  async authenticate(data, params) {

    const { token, email, userData } = data;

    if (token) {
      return this.finishWithToken(token);
    }

    const [user] = await this.app.service('users').find({
      query: {
        $or: [
          { email },
          { preferredEmail: email },
        ],
        $limit: 1,
      },
      paginate: false,
    });

    if (userData) {
      if (user) {
        throw new NotAuthenticated('User already exists');
      }
      const validUserData = this.validateUserData({ ...userData, email });
      const tokenData = await this.app.service('tokens').create({
        action: 'magic_signup',
        data: validUserData,
      });
      await this.sendMagicLink(email, tokenData, validUserData);
      throw new NotAuthenticated('Magic link sent');
    }

    if (!user) {
      throw new NotAuthenticated('User not found');
    }

    const tokenData = await this.app.service('tokens').create({
      action: 'magic_login',
      userId: user._id,
    });
    await this.sendMagicLink(email, tokenData, user);
    throw new NotAuthenticated('Magic link sent');
  }
}

module.exports = MagicStrategy;
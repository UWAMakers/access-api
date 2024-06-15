
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');
const moment = require('moment-timezone');
const { getActionEmailHtml } = require('../util/email/index');
const { tokenToData } = require('../util/cryptMeTimbers');

const domains = ['uwa.edu.au', 'student.uwa.edu.au'];
class MagicStrategy extends LocalStrategy {

  getUsernameFromEmail(email) {
    if (email.split('@').length !== 2) return null;
    const [username, domain] = email.split('@');
    if (!domains.includes(domain)) return null;
    if (!/^\d{8,10}$/.test(username)) return null;
    return username;
  }

  validateUserData(userData) {
    const { email, firstName, lastName } = userData;
    if (!email) throw new NotAuthenticated('Email is required');
    if (!firstName) throw new NotAuthenticated('First name is required');
    if (!lastName) throw new NotAuthenticated('Last name is required');
    const username = this.getUsernameFromEmail(email);
    if (!username) throw new NotAuthenticated('Username is required');
    return {
      email,
      firstName,
      lastName,
      displayName: firstName,
      username,
    };
  }

  async finishWithToken(token) {
    const tokenData = await this.app.service('tokens').get(token);
    const { action, userId, data } = tokenData;
    await this.app.service('tokens').patch(tokenData._id, { usedAt: new Date() });
    let user = null;

    if (action === 'magic_login') {
      if (Object.keys(data || {}).length > 0) {
        user = await this.app.service('users')._patch(userId, data);
      } else {
        user = await this.app.service('users').get(userId);
      }
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
      bodyHtml: `
        <p>
          Hi ${userData.displayName || userData.firstName},
        </p>
        <p>
          Click the button below to finish ${actionCopy}.
        </p>
        <p>
          This link will expire ${expires}.<br>
          If you didn't request this, you can safely ignore this email.
        </p>
        <p>
          If the button doesn't work, copy and paste the link below into your browser.<br>
          <a href="${finishUrl}">${finishUrl}</a>
        </p>
      `,
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

    const { token, email, userData, linkToken } = data;

    let linkData = {};
    if (linkToken) {
      linkData = tokenToData(linkToken, this.app.get('authentication').secret);
    }

    if (token) {
      return this.finishWithToken(token);
    }

    const username = this.getUsernameFromEmail(email);
    const [user] = await this.app.service('users').find({
      query: {
        $or: [
          { email },
          { preferredEmail: email },
          ...(username ? [{ username }] : []),
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
      const { total } = await this.app.service('users').find({ query: { username: validUserData.username, $limit: 0 } });
      if (total > 0) {
        throw new NotAuthenticated('Pheme number already exists');
      }
      const { total: totalSignupTokens } = await this.app.service('tokens').find({
        query: {
          'data.email': email,
          action: 'magic_signup',
          usedAt: null,
          createdAt: { $gt: moment().subtract(1, 'minute').toDate() },
          $limit: 0,
        },
      });

      if (totalSignupTokens > 0) {
        throw new NotAuthenticated('Signup link already sent', { action: 'magic_signup_sent' });
      }

      const tokenData = await this.app.service('tokens').create({
        action: 'magic_signup',
        data: {
          ...validUserData,
          ...linkData,
        },
      });
      await this.sendMagicLink(email, tokenData, validUserData);
      throw new NotAuthenticated('Magic link sent', { action: 'magic_signup_sent' });
    }

    if (!user) {
      const username = this.getUsernameFromEmail(email);
      if (!username) {
        throw new NotAuthenticated('Email not found, if you don\'t have normal student/staff email, please contact us.');
      } else {
        throw new NotAuthenticated('User not found', { action: 'magic_signup_required' });
      }
    }

    const { total: totalLoginTokens } = await this.app.service('tokens').find({
      query: {
        userId: user._id,
        action: 'magic_login',
        usedAt: null,
        createdAt: { $gt: moment().subtract(1, 'minute').toDate() },
        $limit: 0,
      },
    });
    if (totalLoginTokens > 0) {
      throw new NotAuthenticated('Login link already sent', { action: 'magic_login_sent' });
    }

    const tokenData = await this.app.service('tokens').create({
      action: 'magic_login',
      userId: user._id,
      data: linkData,
    });
    await this.sendMagicLink(email, tokenData, user);
    throw new NotAuthenticated('Magic link sent', { action: 'magic_login_sent' });
  }
}

module.exports = MagicStrategy;

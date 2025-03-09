const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');
const moment = require('moment-timezone');
const { getActionEmailHtml } = require('../util/email/index');
const { tokenToData } = require('../util/cryptMeTimbers');

const domains = ['uwa.edu.au', 'student.uwa.edu.au'];

class CodeStrategy extends LocalStrategy {
  generateVerificationCode() {
    // Generate a 6-digit code
    return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  }

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

  async finishWithCode(code) {
    const [tokenData] = await this.app.service('tokens').find({
      query: {
        'data.code': code,
        usedAt: null,
        expiresAt: { $gt: new Date() },
        $limit: 1,
      },
      paginate: false,
    });

    if (!tokenData) {
      throw new NotAuthenticated('Invalid or expired verification code');
    }

    const { action, userId, data } = tokenData;
    await this.app.service('tokens').patch(tokenData._id, { usedAt: new Date() });
    let user = null;

    if (action === 'code_login') {
      if (Object.keys(data || {}).length > 0) {
        user = await this.app.service('users')._patch(userId, data);
      } else {
        user = await this.app.service('users').get(userId);
      }
    } else if (action === 'code_signup') {
      user = await this.app.service('users').create(data);
    }
    
    if (!user) throw new NotAuthenticated('User not found');
    return {
      authentication: { strategy: this.name },
      user,
    };
  }

  async sendVerificationCode(email, tokenData, userData) {
    const actionCopies = {
      code_login: 'logging in',
      code_signup: 'signing up',
    };
    const actionCopy = actionCopies[tokenData.action] || 'Login';
    const expires = moment(tokenData.expiresAt).fromNow();

    const emailBody = getActionEmailHtml({
      bodyHtml: `
        <p>
          Hi ${userData.displayName || userData.firstName},
        </p>
        <p>
          Your verification code for ${actionCopy} is:
        </p>
        <h2 style="font-size: 32px; letter-spacing: 5px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 5px;">
          ${tokenData.data.code}
        </h2>
        <p>
          This code will expire ${expires}.<br>
          If you didn't request this, you can safely ignore this email.
        </p>
      `,
    });

    return this.app.service('notifications').create({
      email: {
        html: emailBody,
        to: email,
        from: this.app.get('SMTP_USER'),
        subject: `Verification Code for ${actionCopy}`,
      },
    });
  }

  async authenticate(data) {
    const { code, email, userData, linkToken } = data;

    let linkData = {};
    if (linkToken) {
      linkData = tokenToData(linkToken, this.app.get('authentication').secret);
    }

    if (code) {
      return this.finishWithCode(code);
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
          action: 'code_signup',
          usedAt: null,
          createdAt: { $gt: moment().subtract(1, 'minute').toDate() },
          $limit: 0,
        },
      });

      if (totalSignupTokens > 0) {
        throw new NotAuthenticated('Verification code already sent', { action: 'code_signup_sent' });
      }

      const verificationCode = this.generateVerificationCode();
      const tokenData = await this.app.service('tokens').create({
        action: 'code_signup',
        data: {
          ...validUserData,
          ...linkData,
          code: verificationCode,
        },
      });
      await this.sendVerificationCode(email, tokenData, validUserData);
      throw new NotAuthenticated('Verification code sent', { action: 'code_signup_sent' });
    }

    if (!user) {
      const username = this.getUsernameFromEmail(email);
      if (!username) {
        throw new NotAuthenticated('Email not found, if you don\'t have normal student/staff email, please contact us.');
      } else {
        throw new NotAuthenticated('User not found', { action: 'code_signup_required' });
      }
    }

    const { total: totalLoginTokens } = await this.app.service('tokens').find({
      query: {
        userId: user._id,
        action: 'code_login',
        createdAt: { $gt: moment().subtract(1, 'minute').toDate() },
        $limit: 0,
      },
    });
    if (totalLoginTokens > 0) {
      throw new NotAuthenticated('Verification code already sent', { action: 'code_login_sent' });
    }

    const verificationCode = this.generateVerificationCode();
    const tokenData = await this.app.service('tokens').create({
      action: 'code_login',
      userId: user._id,
      data: {
        ...linkData,
        code: verificationCode,
      },
    });
    await this.sendVerificationCode(email, tokenData, user);
    throw new NotAuthenticated('Verification code sent', { action: 'code_login_sent' });
  }
}

module.exports = CodeStrategy; 
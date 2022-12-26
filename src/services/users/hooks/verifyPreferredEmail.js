const { checkContext } = require('feathers-hooks-common');
// const _ = require('lodash');
const moment = require('moment-timezone');

const { getActionEmailHtml } = require('../util/email/index');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'after', ['patch', 'update']);

  const { result, existing, app } = context;

  const email = result.preferences?.email;
  if (!email || email === existing.preferences?.email) {
    return context;
  }

  const tokenData = await app.service('tokens').create({
    action: 'verify_preferred_email',
    userId: result._id,
    data: {
      email,
    },
  });

  const verifyUrl = `${this.app.get('CLIENT_DOMAIN')}/verify?token=${encodeURIComponent(tokenData.token)}&action=verify_preferred_email`;
  const expires = moment(tokenData.expiresAt).fromNow();
  const html = getActionEmailHtml({
    bodyText: `
      Click the button below to verify your preferred email address.
      This link will expire in ${expires}.
      If you didn't request this, you can safely ignore this email.
    `,
    firstName: result.firstName,
    actionButtonText: 'Verify Email',
    actionButtonLink: verifyUrl,
  });

  await this.app.service('notifications').create({
    email: {
      html: html,
      to: email,
      from: this.app.get('SMTP_USER'),
      subject: 'Verify your preferred email address',
    },
  });

  return context;
};
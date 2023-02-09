const { checkContext } = require('feathers-hooks-common');
const moment = require('moment-timezone');

const { getActionEmailHtml } = require('../../../util/email/index');

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

  const verifyUrl = `${app.get('CLIENT_DOMAIN')}/verify?token=${encodeURIComponent(tokenData.token)}&action=verify_preferred_email`;
  const expires = moment(tokenData.expiresAt).fromNow();
  const html = getActionEmailHtml({
    bodyHtml: `
      <p>
        Hi ${result.displayName || result.firstName},
      </p>
      <p>
        Click the button below to verify that this is your preferred email address.
      </p>
      <p>
        This link will expire ${expires}.</br>
        If you didn't request this, you can safely ignore this email.
      </p>
      <p>
        If the button doesn't work, copy and paste the link below into your browser.</br>
        <a href="${verifyUrl}">${verifyUrl}</a>
      </p>
    `,
    actionButtonText: 'Verify Email',
    actionButtonLink: verifyUrl,
  });

  await app.service('notifications').create({
    email: {
      html: html,
      to: email,
      from: app.get('SMTP_USER'),
      subject: 'Verify your preferred email address',
    },
  });

  return context;
};

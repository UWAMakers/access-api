const { checkContext } = require('feathers-hooks-common');
const client = require('@mailchimp/mailchimp_marketing');
const { GeneralError } = require('@feathersjs/errors');
var crypto = require('crypto');


const updateMailingList = async (client, mailListId, email, status) => {
  const lastAtSymbol = email.lastIndexOf('@');
  const emailPrefix = email.slice(0, lastAtSymbol).toLowerCase();
  const subscriberHash = crypto.createHash('md5').update(emailPrefix).digest('hex');
  console.log(subscriberHash);
  return client.lists.batchListMembers(mailListId, {
    members: [{
      email_address: email,
      status,
    }],
    update_existing: true,
  });
};

// eslint-disable-next-line
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'after', ['create', 'update', 'patch'], 'stashBefore');
    const { result, params } = context;
    const mailchimpApiKey = context.app.settings.mailchimpApiKey;
    const mailListId = context.app.settings.mailchimpMailListId;
    const mailchimpServerPrefix = context.app.settings.mailchimpServerPrefix;

    client.setConfig({
      apiKey: mailchimpApiKey,
      server: mailchimpServerPrefix,
    });

    const { existing } = params;
    const isJoining = (!existing.preferences.joinedAt) && result.preferences.joinedAt;
    const hasLeft = existing.preferences.joinedAt && (!result.preferences.joinedAt);
    if (isJoining || hasLeft) {
      const status = isJoining ? 'subscribed' : 'unsubscribed';
      try {
        const response = await updateMailingList(client, mailListId, result.email, status);
        console.log(response.errors);
        if (response.errors.length) {
          return new GeneralError(response.errors);
        }
      } catch (err) {
        return new GeneralError(err);
      }
    }
    return context;
  };
};

const { checkContext } = require('feathers-hooks-common');
const client = require('mailchimp-marketing');
const { InternalServerError } = require('@feathersjs/errors');



const updateMailingList = async (client, mailListId, email, status) => {
  return client.lists.batchListMembers(mailListId, {
    members: [{
      email_address: email,
      status
    }],
  });
};

module.exports = (app) => {
  return async context => {
    checkContext(context, 'after', ['create', 'update', 'patch']);
    const mailchimpApiKey = app.get('mailchimpApiKey');
    const mailListId = app.get('mailchimpMailListId');

    const { result, params } = context;
    client.setConfig({
      apiKey: mailchimpApiKey,
      server: 'access 3',
    });

    const { existing } = params;
    const isJoining = !existing.preferences.joinedAt && result.joinedAt;
    const hasLeft = existing.preferences.joinedAt && !result.joinedAt;
    console.log(result);
    if (isJoining || hasLeft) {
      const status = isJoining ? 'subscribed' : 'unsubscribed';
      const response = await updateMailingList(client, mailListId, result.email, status);
      if (response.errors.length) {
        return new InternalServerError(response.errors);
      }
    }
    console.log('done');
    return context;
  };
};

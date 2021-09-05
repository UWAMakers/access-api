const { checkContext } = require('feathers-hooks-common');
const client = require('@mailchimp/mailchimp_marketing');
const { GeneralError } = require('@feathersjs/errors');

const updateMailingList = async (client, mailListId, user, status) => {
  const { email, firstName, lastName, displayName } = user;
  return client.lists.batchListMembers(mailListId, {
    members: [
      {
        email_address: email,
        status,
        merge_fields: {
          NAME: displayName || firstName,
          FULLNAME: `${firstName} ${lastName}`,
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
    update_existing: true,
  });
};

// eslint-disable-next-line
module.exports = (options = {}) => {
  return async (context) => {
    checkContext(context, 'before', ['update', 'patch', 'remove']);
    const { existing, data } = context;
    const mailchimpApiKey = context.app.settings.mailchimpApiKey;
    const mailListId = context.app.settings.mailchimpListId;
    const mailchimpServerPrefix = context.app.settings.mailchimpServerPrefix;

    if (
      !mailchimpApiKey
      || mailchimpApiKey === 'MAILCHIMP_API_KEY'
      || existing.email?.includes('@example.uwa.edu.au')
    ) return context;

    client.setConfig({
      apiKey: mailchimpApiKey,
      server: mailchimpServerPrefix,
    });

    const existingJoinedAt = existing?.preferences?.joinedAt ?? false;
    const resultJoinedAt = data?.preferences?.joinedAt;

    const isJoining = !existingJoinedAt && resultJoinedAt;
    const isLeaving =
      (existingJoinedAt && !resultJoinedAt) || context.method === 'remove';

    if (isJoining || isLeaving) {
      const status = isJoining ? 'subscribed' : 'unsubscribed';
      try {
        const response = await updateMailingList(
          client,
          mailListId,
          existing,
          status
        );
        if (response.errors.length) {
          throw new GeneralError(response.errors[0].error);
        }
      } catch (err) {
        console.error(err);
        throw new GeneralError(err.message);
      }
    }
    return context;
  };
};

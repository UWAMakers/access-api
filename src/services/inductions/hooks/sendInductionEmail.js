const { checkContext } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');
const {
  createActionEmailBody,
  getActionEmailHtml,
} = require('../../../util/email/index');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    checkContext(context, 'after', ['create', 'patch']);
    const { result, app } = context;
    const { keys, inductorId, itemId } = result;
    const userIdsToConfirm = keys.reduce(
      (acc, { userIds = [], emailSent = false }) => {
        return userIds.length && !emailSent ? [...acc, ...userIds] : acc;
      },
      []
    );

    const trainingItem = await app.service('training-items').get(itemId);
    const inductor = await app.service('users').get(inductorId);
    if (!inductor || !trainingItem) {
      throw new errors.NotFound('Inductor or training item not found!');
    }
    const { name: trainingItemName } = trainingItem;
    const { displayName: inductorName } = inductor;
    const confirmInductionBodyText = createActionEmailBody(
      inductorName,
      trainingItemName
    );

    const usersToConfirm = await app.service('users').find({
      query: {
        _id: { $in: userIdsToConfirm },
      },
      paginate: false,
    });
    let sentKeys = [];
    await Promise.all(
      keys.map(async ({ key, userIds, emailSent, _id }) => {
        if (emailSent || !userIds.length) return;
        const inductionUrl = `${app.get('CLIENT_DOMAIN')}/induction/${key}`;
        await Promise.all(
          userIds.map((userId) => {
            const user = usersToConfirm.find(
              ({ _id }) => `${userId}` === `${_id}`
            );
            const emailBody = getActionEmailHtml(
              confirmInductionBodyText,
              user.firstName,
              'Confirm Induction',
              inductionUrl
            );
            return app.service('notifications').create({
              email: {
                html: emailBody,
                to: user.email,
                from: app.get('SMTP_USER'),
                subject: 'Manual email induction',
              },
            });
          })
        );
        sentKeys.push(`${_id}`);
      })
    );
    context.result = await context.service._patch(result._id, {
      keys: result.keys.map((resultKey) => ({
        ...resultKey,
        emailSent:
          sentKeys.includes(`${resultKey._id}`) || resultKey?.emailSent,
      })),
    });
    return context;
  };
};

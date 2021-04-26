const { checkContext } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');
const moment = require('moment-timezone');
const addItemToCompletion = require('../../../util/addItemToCompletion');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'before', ['get']);

    const { app, id, service, params } = context;
    const { user } = params;

    if (/^[\dabcdef]{24}$/i.test(`${id}`) || !user) return context;

    const [induction] = await service.find({
      query: {
        keys: {
          $elemMatch: {
            key: id,
            expiresAt: { $gte: new Date() },
            $or: [{ userIds: { $exists: false } }, { userIds: [] }, { userIds: user._id }],
          },
        },
        $limit: 1,
      },
      paginate: false,
    });

    if (!induction) throw new errors.NotFound('Induction doesn\'t exist, or your link has expired');

    const item = await app.service('training-items').get(induction.itemId);
    const trainingId = await addItemToCompletion(context, {
      itemId: induction.itemId,
      inductionId: induction._id,
      confirmed: true,
      expiresAt: item.expiry ? moment(induction.createdAt).add(item.expiry, 'weeks') : null,
    });

    context.result = { id, trainingId };

    return context;
  };
};

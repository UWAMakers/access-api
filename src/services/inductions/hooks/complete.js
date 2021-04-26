const { checkContext } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');
const moment = require('moment-timezone');
const _ = require('lodash');

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
    const trainings = await app.service('trainings').find({
      query: {
        itemIds: induction.itemId,
      },
      paginate: false,
    });
    console.log(trainings);
    const completions = await app.service('completions').find({
      query: {
        trainingId: { $in: trainings.map(t => t._id) },
        userId: user._id,
      },
      paginate: false,
    });

    await Promise.all(trainings.map(async (train) => {
      const completion = completions.find(c => `${c.trainingId}` === `${train._id}`);
      if (!completion) {
        await app.service('completions').create({
          trainingId: train._id,
          userId: user._id,
          status: 'pending',
          items: [
            {
              itemId: item._id,
              expiresAt: moment(),
              inductionId: induction._id,
              confirmed: true,
            }
          ],
        });
      } else {
        await app.service('completions').patch(completion._id, {
          ...completion,
          items: [
            ..._.get(completion, 'items', []).filter((i) => `${i.itemId}` !== `${item._id}`),
            {
              itemId: item._id,
              inductionId: induction._id,
              confirmed: true,
              expiresAt: item.expiry ? moment(induction.createdAt).add(item.expiry, 'weeks') : null,
            },
          ],
        });
      }
    }));

    context.result = { id, trainingId: _.get(trainings, '0._id') };

    return context;
  };
};

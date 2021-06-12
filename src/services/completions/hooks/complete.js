const { checkContext } = require('feathers-hooks-common');
const addItemToCompletion = require('../../../util/addItemToCompletion');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'after', ['create', 'patch']);

    const { result, app } = context;

    const items = await app.service('training-items').find({
      query: { type: 'completion', trainingId: result.trainingId },
      paginate: false,
    });
    if (!items.length) return context;

    await Promise.all(items.map(async (item) => {
      const { total } = await app.service('completions').find({
        query: {
          item: {
            $elemMatch: {
              itemId: item._id,
              status: result.status,
            },
          },
          $limit: 0,
        },
      });
      if (total) return;
      await addItemToCompletion({ app, params: { user: { _id: result.userId } } }, {
        itemId: item._id,
        confirmedAt: result.updatedAt,
        status: result.status,
      });
    }));

    return context;
  };
};
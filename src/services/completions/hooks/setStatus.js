const { checkContext } = require('feathers-hooks-common');
const moment = require('moment-timezone');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'before', ['create', 'patch']);

    const { data, existing = {}, app, params } = context;
    let { training } = params;
    const record = { ...existing, ...data };

    if (!data.items) return context;

    if (!training) training = await app.service('trainings').get(record.trainingId);

    const items = await app.service('training-items').find({
      query: { _id: { $in: training.itemIds, required: true } },
      paginate: false,
    });

    const incompleteCount = items.reduce((a, item) => {
      const compItem = data.items.find(i => `${i.itemId}` === `${item._id}`);
      if (!compItem) return a + 1;
      if (item.expiry && moment(compItem.confirmedAt).add(item.expiry, 'weeks').valueOf() < Date.now()) return a + 1;
      if (item.type === 'quiz' && compItem.score < (item.requiredScore || 0)) return a + 1;
      if (item.type === 'completion' && compItem.status === 'complete') return a + 1;
      return a;
    }, 0);

    data.status = incompleteCount ? 'pending' : 'complete';

    return context;
  };
};
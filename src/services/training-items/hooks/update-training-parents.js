const { checkContext } = require('feathers-hooks-common');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'after', ['create', 'update', 'patch', 'remove']);

    const { result, app, service } = context;

    if (result.type !== 'completion' || !result.trainingId) return context;

    const configs = await app.service('trainings').find({
      query: { itemIds: result._id },
      paginate: false,
    });

    await Promise.all(configs.map(async (config) => {
      const items = await service.find({
        query: { _id: { $in: config.itemIds }, type: 'completion' },
        paginate: false,
      });
      const parentIds = items.length ? items.map(({ trainingId }) => `${trainingId}`).sort() : null;

      if (_.get(config, 'parentIds', []).map(id => `${id}`).sort().join('-') === (parentIds || []).join('-')) {
        return;
      }
      await app.service('trainings').patch(config._id, { ...config, parentIds });
    }));

    return context;
  };
};

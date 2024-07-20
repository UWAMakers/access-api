const { checkContext } = require('feathers-hooks-common');
const { BadRequest } = require('@feathersjs/errors');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context, next) => {
  checkContext(context, 'around', ['create', 'patch', 'update']);

  const { data, existing, app } = context;

  if (`${data.containerId}` === `${existing?.containerId}` && existing.containerIds.length) return next();
  if (!data.containerId) return next();

  if (`${data.containerId}` === `${existing?._id}` && existing?._id) {
    throw new BadRequest('Cannot set a thing as a container of itself');
  }

  let container = data.containerId && await app.service('things').get(data.containerId);
  data.containerIds = [
    ...(container?.containerIds || []),
    data.containerId,
  ].filter(id => id);

  if (existing?._id && data.containerIds.some(id => `${id}` === `${existing._id}`)) {
    throw new BadRequest('Cannot set a thing as a container of itself');
  }

  let children = [];
  if (existing?._id) {
    children = await app.service('things').find({
      query: {
        containerId: existing._id,
        $select: { _id: 1 },
      },
      paginate: false,
    });

    data.childIds = children.map(({ _id }) => _id);
  }

  await next();

  const { result } = context;

  if (container?._id) {
    container = await app.service('things')._patch(container._id, {
      childIds: _.uniq([
        ...(container.childIds || []),
        result._id,
      ].map(id => `${id}`)),
    });
  }

  // recursively update the containerIds of all children
  const updateChildren = async (children, containerIds) => {
    await Promise.all(children.map(async (child) => {
      const grandchildren = await app.service('things').find({
        query: {
          containerId: child._id,
          $select: { _id: 1 },
        },
        paginate: false,
      });

      await app.service('things')._patch(child._id, {
        containerIds,
        childIds: grandchildren.map(({ _id }) => _id), // not necessary, but meh, why not
      });

      if (!grandchildren.length) return;
      await updateChildren(grandchildren, [...containerIds, child._id]);
    }));
  };

  await updateChildren(children, [...(result.containerIds || []), result._id]);

  return;
};

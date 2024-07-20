const { checkContext } = require('feathers-hooks-common');
const { BadRequest } = require('@feathersjs/errors');


// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context, next) => {
  checkContext(context, 'around', ['remove']);

  const { existing, app } = context;
  const { containerId, childIds = [] } = existing;

  if (!containerId && childIds.length) {
    throw new BadRequest('Cannot remove a container with children but no parent');
  }

  await next();

  // move children to the parent container
  await childIds.reduce(async (promise, childId) => {
    await promise;
    return app.service('things').patch(childId, { containerId });
  }, Promise.resolve());

  const container = containerId && await app.service('things').get(containerId);
  if (container) {
    await app.service('things')._patch(containerId, {
      childIds: container.childIds.filter((id) => id !== existing._id),
    });
  }

  return context;
};

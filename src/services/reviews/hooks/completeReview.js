const { checkContext } = require('feathers-hooks-common');
// const errors = require('@feathersjs/errors');
const moment = require('moment-timezone');
const addItemToCompletion = require('../../../util/addItemToCompletion');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'after', ['patch', 'update']);

    const { app, result, existing, id, params } = context;
    const { user } = params;

    if (
      !user
      || moment(result.confirmedAt).valueOf() === moment(existing.confirmedAt).valueOf()
    ) return context;

    const item = await app.service('training-items').get(result.itemId);
    await addItemToCompletion(context, {
      itemId: result.itemId,
      reviewId: id,
      confirmed: true,
      expiresAt: item.expiry ? moment(result.createdAt).add(item.expiry, 'weeks') : null,
    });

    return context;
  };
};

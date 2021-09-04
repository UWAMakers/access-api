const { checkContext } = require('feathers-hooks-common');
// const errors = require('@feathersjs/errors');
const moment = require('moment-timezone');
const addItemToCompletion = require('../../../util/addItemToCompletion');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async (context) => {
    checkContext(context, 'after', ['create', 'patch', 'update']);

    const { result, existing, id, params } = context;
    const { user } = params;

    if (!user
      || moment(result.confirmedAt).valueOf() === moment(existing?.confirmedAt).valueOf()
    ) {
      return context;
    }

    await addItemToCompletion(context, {
      itemId: result.itemId,
      reviewId: id,
      confirmedAt: result.confirmedAt,
    });

    return context;
  };
};

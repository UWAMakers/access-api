const { checkContext } = require('feathers-hooks-common');
// const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    checkContext(context, 'after', ['create', 'update', 'patch']);

    const { result, params } = context;

    const { existing } = params;
    const isJoining = !existing.preferences.joinedAt && result.joinedAt;
    const hasLeft = existing.preferences.joinedAt && !result.joinedAt;
    console.log(result);
    if (isJoining) {
      // add to result.email to mail list

    } else if (hasLeft) {
      // remove result.email from mailing list
    }
    return context;
  };
};

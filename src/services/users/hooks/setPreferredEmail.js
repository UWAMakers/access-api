const { checkContext } = require('feathers-hooks-common');

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['patch', 'update']);

  const { existing, data } = context;

  const email = data.preferredEmail;
  if (email === existing.preferredEmail) {
    return context;
  }

  data.preferences = {
    ...(existing.preferences || {}),
    ...(data.preferences || {}),
    email,
  };

  return context;
};
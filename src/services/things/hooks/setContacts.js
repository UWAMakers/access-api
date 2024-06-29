const { checkContext } = require('feathers-hooks-common');

const fix = (name = '') => name.trim().replace(/\s+\(\d+\)$/, '');
const getName = (user) => (!user.displayName || fix(user.displayName) === fix(user.firstName)
  ? `${fix(user.firstName)} ${user.lastName}`
  : fix(user.displayName));

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['create', 'patch', 'update']);

  const { data } = context;

  if (data.contacts?.length) {
    const users = await context.app.service('users').find({
      query: {
        _id: { $in: data.contacts.map(({ userId }) => userId) },
      },
      paginate: false,
    });
    const userMap = new Map(users.map((user) => [`${user._id}`, user]));
    data.contacts = data.contacts.map((contact) => {
      const user = userMap.get(`${contact.userId}`);
      return {
        ...contact,
        name: getName(user),
        avatarUrl: user.avatarUrl,
        discordId: user.discordId,
        username: user.username,
      };
    });
  }

  return context;
};

const { checkContext } = require('feathers-hooks-common');

const fix = (name = '') => name.trim().replace(/\s+\(\d+\)$/, '');
const getName = (user) => (!user.displayName || fix(user.displayName) === fix(user.firstName)
  ? `${fix(user.firstName)} ${user.lastName}`
  : fix(user.displayName));

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'after', ['patch', 'update']);

  const { result, existing, app, params } = context;

  if (
    getName(result) === getName(existing)
    && result.avatarUrl === existing.avatarUrl
    && result.discordId === existing.discordId
    && result.username === existing.username
  ) return context;

  const things = await app.service('things').find({
    query: {
      'contacts.userId': result._id,
    },
    paginate: false,
  });

  await Promise.all(
    things.map((thing) => {
      const contacts = thing.contacts.map((contact) => {
        if (`${contact.userId}` !== `${result._id}`) return contact;

        return {
          ...contact,
          name: getName(result),
          avatarUrl: result.avatarUrl,
          discordId: result.discordId,
          username: result.username,
        };
      });

      return app.service('things').patch(thing._id, { contacts }, params);
    })
  );

  return context;
};

const { checkContext } = require('feathers-hooks-common');
// const errors = require('@feathersjs/errors');
// const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = () => async (context) => {
  checkContext(context, 'before', ['create', 'patch']);

  const { data, app } = context;
  if (!data.thingId) return context;

  const thing = await app.service('things').get(data.thingId);
  const container = thing.containerId
    ? await app.service('things').get(thing.containerId)
    : null;

  const url = `https://mkrs.in/${thing.ref}`;

  data.data = {
    qrUri: url,
    header: thing.name,
    subheader: container ? `↳ ${container.name}` : '',
    body: '',
    footer: url.replace(/^https?:\/\//, ''),
  };

  return context;
};
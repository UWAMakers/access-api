const { checkContext } = require('feathers-hooks-common');

const genRef = () => {
  // 2,176,782,336 possible combinations e.g. 7CLEQE
  const ref = Math.random().toString(36).substring(2, 8).toUpperCase();
  return ref;
};

// eslint-disable-next-line no-unused-vars
module.exports = (config) => async (context) => {
  checkContext(context, 'before', ['get', 'create', 'patch', 'update']);

  const { data, existing, id, method } = context;

  if (method === 'get') {
    if (/^[0-9abcdef]{24}$/.test(`${id}`)) return context;
    if (typeof id !== 'string') return context;
    const [thing] = await context.app.service('things').find({
      query: {
        ref: id,
        $limit: 1,
      },
      paginate: false,
    });
    if (thing) {
      context.result = thing;
    }
    return context;
  }

  if (method !== 'create') {
    data.ref = existing.ref;
    return context;
  }

  const checkRef = async () => {
    data.ref = genRef();
    const exists = await context.app.service('things').get(data.ref).catch(() => null);
    if (exists) await checkRef();
  };

  await checkRef();

  return context;
};

const { checkContext } = require('feathers-hooks-common');
// const { BadRequest } = require('@feathersjs/errors');

const searchRegex = (search, options = { flags: 'i', exact: false }) => {
  const { flags, exact } = options;
  let escapedSearch = search
    .trim()
    .replace(/[^\w-\s]/g, '.?')
    .split(/\s+/g)
    .join('\\s+');
  if (exact) escapedSearch = `^${escapedSearch}$`;
  return { $regex: escapedSearch, $options: flags };
};

// const checkRegexQuery = (query) => {
//   if (!query || typeof query !== 'object') return;
//   return Object.keys(query).some((key) => {
//     if (key === '$regex') throw new BadRequest('Invalid search query, $regex is not allowed');
//     if (Array.isArray(query[key])) return query[key].forEach(checkRegexQuery);
//     if (query[key] && typeof query[key] === 'object') return checkRegexQuery(query[key]);
//   });
// };

// eslint-disable-next-line no-unused-vars
module.exports = (fields = [], exactFields = [], config) => async (context) => {
  checkContext(context, 'before', ['find']);

  const { params } = context;

  if (!params.query) return;

  // checkRegexQuery(params.query);

  const { $search, ...rest } = params.query;

  if (!$search) return context;

  if (/^[0-9abcdef]{24}$/.test($search)) {
    params.query = {
      ...rest,
      _id: $search,
    };
    return context;
  }

  const search = searchRegex($search);
  const exactSearch = searchRegex($search, { exact: true, flags: 'i' });

  params.query = {
    ...rest,
    $and: [
      ...(params.query.$and || []),
      {
        $or: [
          ...fields.map((field) => ({ [field]: search })),
          ...exactFields.map((field) => ({ [field]: exactSearch })),
        ],
      },
    ],
  };

  return context;
};
  
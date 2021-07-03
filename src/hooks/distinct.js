// Updated by mrfrase3, MIT license blah blah: https://gist.github.com/mrfrase3/6f51fb00205a97b44c2ed90b9202a419
// Referenced from: https://github.com/feathersjs-ecosystem/feathers-rest/issues/76#issuecomment-252372915

const { checkContext } = require('feathers-hooks-common');
const { filterQuery } = require('@feathersjs/adapter-commons');
const errors = require('@feathersjs/errors');
const mongoose = require('mongoose');

// exta operators to allow, remove any you want to restrict
const operators = [
  '$eq', '$not', '$nor', '$and', '$elemMatch', '$all', '$size', '$exists', '$type',
  '$geoIntersects', '$geoWithin', '$near', '$nearSphere',
  '$geometry', '$minDistance', '$maxDistance', '$box', '$polygon', '$center', '$centerSphere',
  '$regexp', '$regex', '$options',
  '$text', '$search', '$language', '$caseSensitive', '$diacriticSensitive',
  '$month', '$year', '$hour', '$minute', '$seconds', '$milliseconds', '$week',
  '$dayOfYear', '$dayOfMonth', '$dayOfWeek'
];
const defaultLimit = null; // no pagination
// const defaultLimit = 10;
const isoReg = /^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/;

// mongoose doesn't auto cast strings into ObjectIds in aggregate $match
const castObjectIds = (val) => {
  if(Array.isArray(val) && val.length !== 24) return val.map(castObjectIds);
  const stringVal = (val && val.toJSON && val.toJSON()) || `${val}`;
  if(isoReg.test(stringVal)) return new Date(stringVal);
  if(/^[abcdefABCDEF\d]{24}$/.test(stringVal)) return mongoose.Types.ObjectId(stringVal);
  if(Array.isArray(val)) return val.map(castObjectIds);
  if (!val) return val;
  if(typeof val === 'object') return Object.keys(val).reduce((a, i) => ({...a, [i]: castObjectIds(val[i])}), {});
  return val;
};

// check if can be number or string with number, null should be false
const isValidNum = (val) => typeof val === 'number'
  || (typeof val === 'string' && val && !isNaN(Number(val)));

// This should be the last hook on a service's find.
module.exports = function (excludeFields = []) {

  return async (context) => {
    // Throw if the hook is being called from an unexpected location.
    checkContext(context, 'before', ['find']);

    const { query, filters } = filterQuery(context.params.query || {}, {
      operators,
      filters: { $distinct: (v) => v, $limit: (v) => v },
    });
    const { $distinct, $sort, $skip, $limit = defaultLimit } = filters;

    // Throw error when no field is provided - eg. just users?$distinct
    if ($distinct === '') {
      throw new errors.BadRequest('Missing $distinct: Which field should be distinct?');
    }
    if (!$distinct) return context;

    // Throw error if field is restricted
    if (excludeFields.some(field => {
      return field === $distinct
        || (/\*$/.test(field) && $distinct.indexOf(field.replace(/\*$/, '')) === 0);
    })) {
      throw new errors.Forbidden('Forbidden $distinct: You are not allowed to query that field.');
    }

    const args = [
      { $match: castObjectIds(query) },
      {
        $group: {
          _id: typeof $distinct === 'string' ? `$${$distinct.replace(/^\$/, '')}` : $distinct,
          total: { $sum: 1 },
        }
      },
      // default sort by total
      { $sort: $sort || { total: -1 } },
    ];

    let count = null;
    if (isValidNum($skip) || isValidNum($limit)) {
      // get the total count if paginating
      count = (await context.service.Model.aggregate([
        ...args,
        { $count: 'count' },
      ]))[0].count;
    }
    if (isValidNum($skip)) args.push({ $skip: Number($skip) });
    if (isValidNum($limit)) args.push({ $limit: Number($limit) });

    const data = !isValidNum($limit) || Number($limit) !== 0
      ? await context.service.Model.aggregate(args)
      : [];
    const distinctKey = typeof $distinct === 'string' ? $distinct : 'distinctRef';

    context.result = {
      total: count !== null ? count : data.length,
      skip: isValidNum($skip) ? Number($skip) : 0,
      limit: isValidNum($limit) ? Number($limit) : null,
      distinct: true,
      // map to field value, using _id will mess with client caching like feathers-vuex
      data: data.map(({ _id, total }) => ({ [distinctKey]: _id, total })),
    };

    return context;
  };
};
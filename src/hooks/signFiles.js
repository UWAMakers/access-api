const { checkContext, getItems } = require('feathers-hooks-common');
const _ = require('lodash');
// const { BadRequest } = require('@feathersjs/errors');

// eslint-disable-next-line no-unused-vars
module.exports = (fields = [], config) => async (context) => {
  checkContext(context, 'after', null);

  const { app } = context;

  const records = _.castArray(getItems(context));

  const processFile = async (file) => {
    if (['fraser-image', 'fraser-object', 's3'].includes(file.provider)) {
      return {
        ...file,
        ...(await app.presignGet(file)),
      };
    }
    return file;
  };

  await Promise.all(records.map((record) => Promise.all(fields.map(async (field) => {
    if (!_.get(record, field)) return;
    if (Array.isArray(_.get(record, field))) {
      _.set(record, field, await Promise.all(_.get(record, field).map(processFile)));
    } else {
      _.set(record, field, await processFile(_.get(record, field)));
    }
  }))));

  return context;
};
  
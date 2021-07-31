const { iffElse } = require('feathers-hooks-common');
const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
module.exports = (changeDef, ifTrue = [], ifFalse = []) => {

  const hasChanged = (context) => {
    const { result, data, existing } = context;
    const record = result || data;
    return Object.keys(changeDef).some(key => {
      const value = record[key];
      if (value === '*') {
        return _.get(existing, key) !== _.get(record, key);
      }
      if (typeof value === 'function') {
        return !value(_.get(existing, key)) && value(_.get(record, key));
      }
      return _.get(existing, key) !== value && _.get(record, key) === value;
    });
  };

  return iffElse(hasChanged, ifTrue, ifFalse);
};

const { checkContext } = require('feathers-hooks-common');
const errors = require('@feathersjs/errors');
const _ = require('lodash');

const ifChangedTo = require('../../../hooks/ifChangedTo');

// eslint-disable-next-line no-unused-vars
module.exports = () => ifChangedTo({ status: 'pending' }, [async (context) => {
  checkContext(context, 'before', ['create', 'patch']);

  const { data, app } = context;
  if (data.printerId) return context;

  const printers = await app.service('label-printers').find({
    query: {
      disabled: { $ne: true },
      // lastHeartbeat: { $gte: new Date(Date.now() - (5 * 60 * 1000)) },
      $select: { _id: 1 },
    },
    paginate: false,
  });
  if (!printers.length) throw new errors.Unavailable('No printers are available');

  const printer = _.sample(printers);
  data.printerId = printer._id;

  return context;
}]);

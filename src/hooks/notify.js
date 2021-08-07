const { checkContext } = require('feathers-hooks-common');
// const errors = require('@feathersjs/errors');
const _ = require('lodash');
const sendTemplate = require('../util/email/sendTemplate');

// eslint-disable-next-line no-unused-vars
module.exports = (templateAction, userIdsField, options = {}) => {
  const opts = {
    trainingIdField: options.trainingIdField ?? '_id',
    status: options.status,
  };
  return async (context) => {
    checkContext(context, 'after', ['create', 'patch']);
    const { result, app } = context;

    let trainingId;
    if (templateAction.includes('training')) {
      trainingId = _.get(result, opts.trainingIdField);
    }

    const templates = await app.service('notification-templates').find({
      query: {
        action: templateAction,
        enabled: true,
        ...(trainingId ? { trainingId } : {}),
      },
      paginate: false,
    });
    const userIds = _.castArray(_.get(result, userIdsField, []));
    const sendCache = { templates: _.keyBy(templates, ({_id}) => `${_id}`) };
    const usersContext = userIds.reduce((acc, userId) => ({ ...acc, [`${userId}`]: { status: opts.status } }), {});

    await templates.reduce(async (promise, template) => {
      await promise;
      if (!template.daysofWeek?.length || !template.hoursOfDay?.length) {
        await sendTemplate(app, template._id, userIds, usersContext, sendCache);
      } else {
        await app.service('notification-schedules').create({
          templateId: template._id,
          userIds,
          status: opts.status,
        });
      }
    }, Promise.resolve());
    return context;
  };
};

const _ = require('lodash');
const sendTemplate = require('../email/template');

let lastNotificationSync;

module.exports = async (app) => {
  const day = new Date().getDay();
  const hour = new Date().getHours();

  if (`${day}-${hour}` === lastNotificationSync) return;
  lastNotificationSync = `${day}-${hour}`;

  const templates = await app.service('notification-templates').find({
    query: {
      enabled: true,
      daysOfWeek: day,
      hoursOfDay: hour,
    },
    paginate: false,
  });

  if (!templates.length) return;
  const sendCache = { templates: _.keyBy(templates, ({_id}) => `${_id}`) };

  const scheduledNotifications = await app.service('notification-schedules').find({
    query: {
      templateId: { $in: _.map(templates, '_id') },
      $sort: { 'createdAt': -1 },
    },
    paginate: false,
  });

  const templateUserIds = scheduledNotifications.reduce((a, sched) => ({
    ...a,
    [`${sched.templateId}`]: _.uniq([
      ...sched.userIds.map(id => `${id}`),
      ...(a[`${sched.templateId}`] || []),
    ]),
  }), {});

  await Object.keys(templateUserIds).reduce(async (promise, templateId) => {
    await promise;
    const userIds = templateUserIds[`${templateId}`];
    const usersContext = userIds.reduce((a, userId) => ({
      ...a,
      [`${userId}`]: scheduledNotifications.find((sched) => `${templateId}` === `${sched.templateId}`
        && sched.userIds.some((id) => `${id}` === `${userId}`)),
    }), {});
    await sendTemplate(app, templateId, userIds, usersContext, sendCache);
  }, Promise.resolve());

  await Promise.all(scheduledNotifications.map(async ({ _id }) => {
    await app.service('notification-schedules').remove(_id);
  }));
};

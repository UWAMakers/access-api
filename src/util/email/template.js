const _ = require('lodash');
const {
  getActionEmailHtml,
  renderEmailBody,
} = require('./index');

const getRenderContext = (template, recipient, training, users, usersContext = {}) => {
  const hasStatus = Object.values(usersContext).some(({ status }) => !!status);
  return {
    template,
    recipient,
    training,
    users,
    userNames: _.map(users, 'name').join(', '),
    userPhemes: _.map(users, 'username').join(', '),
    userTable: `<table><thead><tr><th>Name</th><th>Pheme Number</th>${
      hasStatus ? '<th>Status</th>' : ''
    }</tr></thead><tbody>${
      users.map(user => `<tr><td>${user.name}</td><td>${user.username}</td>${
        hasStatus ? `<td>${usersContext[`${user._id}`]?.status || ''}</td>` : ''
      }</tr>`).join('')
    }</tbody></table>`,
  };
};

const compileTemplate = (renderContext) => {
  const {recipient, template} = renderContext;
  const messageBody = renderEmailBody(template.body, renderContext);
  return getActionEmailHtml({
    bodyHtml: messageBody,
    firstName: recipient.firstName,
    actionButtonText: template.buttonText,
    actionButtonLink: template.buttonLink,
  });
};

const sendTemplate = async (app, templateId, userIds, usersContext = {}, cache = {}) => {
  let template = cache.templates?.[`${templateId}`];
  if (!template) {
    template = await app.service('notification-templates').get(templateId);
    cache.templates = cache.templates || {};
    cache.templates[`${templateId}`] = template;
  }
  const users = userIds.map(userId => cache.users?.[`${userId}`]).filter(Boolean);
  if (users.length !== userIds.length) {
    const missingIds = _.difference(userIds, users.map(user => user?._id));
    const missingUsers = await app.service('users').find({ query: { _id: { $in: missingIds } }, paginate: false });
    cache.users = { ..._.keyBy(missingUsers, ({_id}) => `${_id}`), ...(cache.users || {}) };
    users.push(...missingUsers);
  }
  let training;
  if (template.trainingId) {
    training = cache.training?.[`${template.trainingId}`];
    if (!training) {
      training = template.trainingId && await app.service('trainings').get(template.trainingId);
      cache.training = cache.training || {};
      cache.training[`${template.trainingId}`] = training;
    }
  }
  
  const recipients = template.sendToUser ? users : template.to.map(email => ({ email }));
  
  
  await Promise.all(recipients.map(async recipient => {
    const renderContext = getRenderContext(template, recipient, training, users, usersContext);
    const subject = renderEmailBody(template.subject, {...renderContext, userTable: '' });
    const emailHtml = compileTemplate(renderContext);
    return app.service('notifications').create({
      email: {
        html: emailHtml,
        to: recipient.email,
        cc: template.cc,
        bcc: template.bcc,
        from: app.get('EMAIL_FROM') || app.get('SMTP_USER'),
        subject,
      },
    });
  }));
};

module.exports = {
  sendTemplate,
  compileTemplate,
  getRenderContext
};
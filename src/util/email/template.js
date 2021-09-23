const _ = require('lodash');
const {
  getActionEmailHtml,
  renderEmailBody,
} = require('./index');

const marked = require('marked');

const compileMarkdown = (text) => {
  return marked(text);
};

const fix = (name = '') => name.trim().replace(/\s+\(\d+\)$/, '');
const generateFullName = (user) =>  (`${fix(user.firstName)} ${user.lastName}`);

const addUsernames = (users) => (users.map((user) => ({...user, name: generateFullName(user)})));


const getRenderContext = (template, recipient, training, users, usersContext = {}) => {
  const hasStatus = Object.values(usersContext).some(({ status }) => !!status);
  const usersWithNames = addUsernames(users);
  const padding = 'style="padding: 4px"';

  return {
    template,
    recipient,
    training,
    users,
    userNames: _.map(usersWithNames, 'name').join(', '),
    userPhemes: _.map(users, 'username').join(', '),
    userTable: `<table><thead><tr><th ${padding}>Name</th><th ${padding}>Pheme Number</th>${
      hasStatus ? `<th ${padding}>Status</th>` : ''
    }</tr></thead><tbody>${
      usersWithNames.map(user => `<tr><td ${padding}>${user.name}</td><td ${padding}>${user.username}</td>${
        hasStatus ? `<td ${padding}>${usersContext[`${user._id}`]?.status || ''}</td>` : ''
      }</tr>`).join('')
    }</tbody></table>`,
  };
};

const compileTemplate = (renderContext) => {
  const {recipient, template} = renderContext;
  const compiledMarkdown = compileMarkdown(template.body);
  const messageBody = renderEmailBody(compiledMarkdown, renderContext);
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
  
  
  Promise.all(recipients.map(async recipient => {
    const renderContext = getRenderContext(template, recipient, training, users, usersContext);
    const subject = renderEmailBody(template.subject, {...renderContext, userTable: '' });
    const emailHtml = compileTemplate(renderContext);
    return app.service('notifications').create({
      email: {
        html: emailHtml,
        to: recipient.preferences?.email || recipient.email,
        cc: template.cc,
        bcc: template.bcc,
        from: app.get('SMTP_USER'),
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
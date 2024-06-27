const { checkContext, getItems } = require('feathers-hooks-common');
// const errors = require('@feathersjs/errors');
const _ = require('lodash');

require('handlebars-helpers')();
const handlebars = require('handlebars');

const rawTemplates = require('./templates');

const templates = Object.fromEntries(Object.entries(rawTemplates()).map(([name, raw]) => [
  name,
  handlebars.compile(raw),
]));

const guessedUrl = process.env.NODE_ENV === 'production'
  ? 'https://access.uwamakers.com'
  : 'http://localhost:3030';

const render = (label, apiUrl = guessedUrl) => {
  const html = templates[label.template || 'default']({
    label: {
      data: {},
      ...(label || {}),
    },
    brandName: 'UWA Makers',
    shortBrandName: 'Makers',
    iconSrc: `${apiUrl}/label-icon.png`,
  });
  return html;
};

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => (context) => {
  checkContext(context, 'after', null);

  const { params } = context;
  if (!params.provider) return context;

  let host = params.connection?.headers?.host || params.headers?.host;

  const proto = /:\d+$/.test(host || '') ? 'http' : 'https';
  const apiUrl = host ? `${proto}://${host}` : guessedUrl;
  
  const records = _.castArray(getItems(context));
  records.forEach((record) => {
    record.html = render(record, apiUrl);
  });

  return context;
};

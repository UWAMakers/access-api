// const TurndownService = require('turndown');
const { marked } = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);

// const turndownService = new TurndownService({
//   headingStyle: 'atx',
// });

// const toMd = (value = '') => turndownService.turndown(value);

const sanitize = (value = '', strict = false) => DOMPurify.sanitize(value, {
  ...(strict ? { ALLOWED_TAGS: [] } : {}),
});

const fromMd = (value = '') => {
  const html = sanitize(marked(value, { breaks: true }));
  return html;
};

module.exports = {
  sanitize,
  fromMd,
  // toMd,
};
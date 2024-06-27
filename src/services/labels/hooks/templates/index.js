const fs = require('fs');
const path = require('path');

const templates = {};

fs.readdirSync(__dirname).forEach((file) => {
  const [name, ext] = file.split('.');
  if (ext !== 'hbs') return;
  templates[name] = fs.readFileSync(path.join(__dirname, file), 'utf8');
});

module.exports = () => templates;
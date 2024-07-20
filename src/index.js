/* eslint-disable no-console */
require('dotenv').config();
const logger = require('./logger');
const app = require('./app');
const port = app.get('port');

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise ', p, reason);
  console.error(reason, p);
});

app.listen(port).then(() =>
  logger.info(
    'Feathers application started on http://%s:%d',
    app.get('host'),
    port
  )
);

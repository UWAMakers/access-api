const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const debug = require('debug');
const logger = require('./logger');
const { gitDescribeSync } = require('git-describe');
const { version } = require('../package.json');

const { feathers } = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const { feathersCasl } = require('feathers-casl');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const scheduleJobs = require('./util/scheduleJobs');
const syncWithOldData = require('./util/syncWithOldData');

const authentication = require('./authentication');

const mongoose = require('./mongoose');

feathers.setDebug(debug);
const app = express(feathers());

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

const corsOptions = {
  origin: [
    /\.uwamakers\.com$/,
    process.env.BUILD_STAGE !== 'production' ? [
      /localhost(:\d+)?$/,
    ] : [],
  ],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(socketio(
  {
    transports: ['websocket'],
    maxHttpBufferSize: 1e8,
    cors: corsOptions,
  },
));

app.configure(mongoose);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

app.configure(feathersCasl());
app.configure(scheduleJobs);
app.configure(syncWithOldData);

const gitHash = gitDescribeSync().hash;
app.get('/version', (req, res) => {
  res.json({
    version,
    gitHash,
  });
});

// Configure a middleware for 404s and the error handler
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../', app.get('public'), 'index.html'));
});
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;

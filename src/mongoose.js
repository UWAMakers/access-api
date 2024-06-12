const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = function (app) {
  mongoose
    .connect(app.get('mongodb'), {
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useUnifiedTopology: true,
    })
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    }).then(() => {
      logger.info(`Connected to MongoDB: ${app.get('mongodb').split('@')[1]}`);
    });

  app.set('mongooseClient', mongoose);
};

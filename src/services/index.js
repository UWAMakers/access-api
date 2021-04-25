const users = require('./users/users.service.js');
const trainings = require('./trainings/trainings.service.js');
const trainingItems = require('./training-items/training-items.service.js');
const completions = require('./completions/completions.service.js');
const feedback = require('./feedback/feedback.service.js');
const inductions = require('./inductions/inductions.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(trainings);
  app.configure(trainingItems);
  app.configure(completions);
  app.configure(feedback);
  app.configure(inductions);
};

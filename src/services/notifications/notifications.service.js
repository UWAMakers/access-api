// Initializes the `notifications` service on path `/notifications`
const hooks = require('./notifications.hooks');
const notifme = require('@feathers-nuxt/feathers-notifme');
const axios = require('axios');


module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
    useNotificationCatcher: app.get('ENV') !== 'prod',
    channels: {
      email: {
        providers: [
          {
            type: 'logger',
          },
          {
            type: 'smtp',
            port: 465,
            secure: true,
            host: app.get('SMTP_HOST'),
            auth: {
              user: app.get('SMTP_USER'),
              pass: app.get('SMTP_PASSWORD'),
            },
          },
        ],
      },
      slack: {
        providers: [
          {
            type: 'custom',
            send: async ({ msgJson}) => {
              await axios.post(
                app.get('FEEDBACK_WEBHOOK'),
                msgJson
              );
            },
          },
        ],
      },
    },
  };

  // Initialize our service with any options it requires
  app.use('/notifications', notifme(options));

  // Get our initialized service so that we can register hooks
  const service = app.service('notifications');

  service.hooks(hooks);
};

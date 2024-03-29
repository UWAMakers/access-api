const _ = require('lodash');
const { processQuizzes } = require('./quizProcessing');
const sendScheduledNotifications = require('./jobs/sendScheduledNotifications');

module.exports = (app) => {
  let lastCompletionSync = 0;
  let lastTokenCleanup = 0;
  let runningAt = 0;
  setInterval(async () => {
    const now = Date.now();
    if (now - runningAt < 1000 * 60 * 15) {
      return;
    }
    runningAt = now;
    // check the quizzes every 5 min
    try {
      await processQuizzes(app);
    } catch (err) {
      console.error(err);
    }

    // refresh the completions (checks for expiries) every day shortly after 7am.
    try {
      if (
        new Date().getHours() === 7 &&
        lastCompletionSync < Date.now() - 120 * 60 * 1000
      ) {
        lastCompletionSync = Date.now();
        const completions = await app.service('completions').find({
          query: {},
          paginate: false,
        });
        // break users into chunks of 20, process chunks sequentially with each item in the chunks running in parallel
        await _.chunk(completions, 20).reduce(async (a, compChunk) => {
          await a;
          await Promise.all(
            compChunk.map(async (completion) => {
              await app.service('completions').patch(completion._id, completion);
            })
          );
        }, Promise.resolve());
      }
    } catch (err) {
      console.error(err);
    }


    // send scheduled notifications every hour
    try {
      await sendScheduledNotifications(app);
    } catch (err) {
      console.error(err);
    }

    // clean up tokens every 6 hours
    try {
      if (lastTokenCleanup < Date.now() - 6 * 60 * 60 * 1000) {
        lastTokenCleanup = Date.now();
        await app.service('tokens')._removeExpiredTokens();
      }
    } catch (err) {
      console.error(err);
    }


    runningAt = 0;
  }, 300 * 1000);

  // setTimeout(async () => {
  //   try {
  //     await processQuizzes(app);
  //     console.log('processed quizzes');
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, 1000);
};

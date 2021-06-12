const _ = require('lodash');
const { processQuizzes } = require('./quizProcessing');

module.exports = (app) => {
  let lastCompletionSync = 0;
  setInterval(async () => {
    // check the quizzes every 5 min
    try {
      await processQuizzes(app);
    } catch (err) {
      console.error(err);
    }

    // refresh the completions (checks for expiries) every day shortly after 7am.
    if ((new Date()).getHours() === 7 && lastCompletionSync < Date.now() - (120 * 60 * 1000)) {
      lastCompletionSync = Date.now();
      const completions = await app.service('completions').find({
        query: {},
        paginate: false,
      });
      // break users into chunks of 20, process chunks sequentially with each item in the chunks running in parallel
      await _.chunk(completions, 20).reduce(async (a, compChunk) => {
        await a;
        await Promise.all(compChunk.map(async (completion) => {
          await app.service('completions').patch(completion._id, completion);
        }));
      }, Promise.resolve());
    }
  }, 300 * 1000);
};
const axios = require('axios');
const Papa = require('papaparse');
const moment = require('moment-timezone');
const _ = require('lodash');

const getScore = (item) => {
  const key = Object.keys(item).find(i => /score/i.test(i));
  if (!key) return 0;
  const val = item[key];
  if (val.includes('/')) {
    const [score, total] = val.split(/\s*\/\s*/);
    return Number(score) / Number(total);
  }
  if (Number(val) > 1) return Number(val) / 100;
  return Number(val);
};

const getUsername = (item) => {
  const key = Object.keys(item).find(i => /pheme/i.test(i));
  if (!key || !/^\d{1,9}$/) return undefined;
  return item[key].padStart(8, '0');
};

const getTimestamp = (item) => {
  const key = Object.keys(item).find(i => /Timestamp/i.test(i));
  if (!key) return undefined;
  // TODO: make time format/zone configurable
  return moment.tz(item[key], 'DD/MM/YYYY HH:mm:ss', 'Australia/Perth');
};

const loadScores = async ({ csvUrl, expiry }) => {
  const { data: csv } = await axios.get(csvUrl);
  const { data: rawResults } = Papa.parse(csv, {
    header: true
  });
  const now = Date.now();
  const results = rawResults.map(item => ({
    username: getUsername(item),
    timestamp: getTimestamp(item),
    score: getScore(item),
  })).filter(v => !expiry || v.timestamp.clone().add(expiry, 'weeks').valueOf() >= now);
  return _.uniqBy(_.sortBy(results, [(v) => v.score * -1, (v) => -1 * v.timestamp.valueOf()]), 'username');
};

const processQuizItem = async (app, item) => {
  const allResults = await loadScores(item);
  const users = await app.service('users').find({
    query: {
      username: { $in: _.uniq(allResults.map(r => r.username)) },
      $select: { _id: 1, username: 1 },
    },
    paginate: false,
  });
  const trainings = await app.service('trainings').find({
    query: {
      itemIds: item._id,
    },
    paginate: false,
  });
  const allCompletions = await app.service('completions').find({
    query: {
      userId: { $in: users.map(u => u._id) },
      trainingId: { $in: trainings.map(t => t._id) },
    },
    paginate: false,
  });
  // break users into chunks of 20, process chunks sequentially with each item in the chunks running in parallel
  await _.chunk(users, 20).reduce(async (a, userChunk) => {
    await a;
    await Promise.all(userChunk.map(async (user) => {
      const result = allResults.find(r => r.username === user.username);
      if (!result) return;
      await Promise.all(trainings.map(async (training) => {
        const completion = allCompletions
          .find(c => `${c.userId}` === `${user._id}` && `${c.trainingId}` === `${training._id}`);
        const compItem = {
          itemId: item._id,
          score: result.score,
          confirmedAt: result.timestamp,
        };
        if (completion) {
          const existingItem = completion.items.find(i => `${i.itemId}` === `${compItem.itemId}`);
          if (existingItem && moment(existingItem.confirmedAt).valueOf() === result.timestamp.valueOf()) return;
          await app.service('completions').patch(completion._id, {
            ...completion,
            items: [
              ..._.get(completion, 'items', []).filter((i) => `${i.itemId}` !== `${compItem.itemId}`),
              compItem,
            ],
          }, { training });
        } else {
          await app.service('completions').create({
            trainingId: training._id,
            userId: user._id,
            status: 'pending',
            items: [compItem],
          }, { training });
        }
      }));
    }));
  }, Promise.resolve());
};

const processQuizzes = async (app) => {
  const items = await app.service('training-items').find({
    query: { type: 'quiz', csvUrl: { $exists: true } },
    paginate: false,
  });
  await items.reduce(async (a, item) => {
    await a;
    await processQuizItem(app, item);
  }, Promise.resolve());
};

module.exports = {
  loadScores,
  processQuizItem,
  processQuizzes,
};
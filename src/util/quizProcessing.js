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

const loadScores = async (url) => {
  const csv = await axios.get(url);
  const results = Papa.parse(csv, {
    header: true
  });
  return results.map(item => ({
    username: getUsername(item),
    timestamp: getTimestamp(item),
    score: getScore(item),
  }));
};

const processQuizItem = async (app, item) => {
  const results = await loadScores(item.csvUrl);
  const users = await app.service('users').find({
    query: {
      username: { $in: _.uniq(results.map(r => r.username)) },
      $select: { _id: 1, username: 1 },
    },
    paginate: false,
  });
  const allCompletions = await app.service('completions').find({
    query: {
      userId: { $in: users.map(u => u._id) },
      'items.itemId': item._id,
    },
    paginate: false,
  });
  // break users into chunks of 20, process chunks sequentially with each item in the chunks running in parallel
  await _.chunk(users, 20).reduce(async (a, userChunk) => {
    await a;
    await Promise.all(userChunk.map(async (user) => {

    }));
  }, Promise.resolve());
};

module.exports = {
  loadScores,
  processQuizItem,
};
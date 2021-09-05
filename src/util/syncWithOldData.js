const fs = require('fs').promises;
const path = require('path');
const _ = require('lodash');
const CliProgress = require('cli-progress');
const moment = require('moment-timezone');

const parseData = (value) => {
  if (!value) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(parseData);
  if (value.$date) {
    return moment(value.$date);
  }
  if (value.$dateISO) {
    return moment(value.$dateISO);
  }
  if (value.$oid) return value.$oid;
  return _.mapValues(value, parseData);
};
const getJson = async (filePath) => {
  const data = await fs.readFile(path.join(__dirname, filePath), 'utf8');
  const values = JSON.parse(data);
  return parseData(values);
};
const fix = (name = '') => name.trim().replace(/\s+\(\d+\)$/, '');
const barFormat = (title) => `${title} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`;
const eq = (a, b) => `${a}` === `${b}`;

const syncUsers = async (app) => {
  const oldUsers = await getJson('../../sync/users.json');
  const perms = await getJson('../../sync/perms.json');
  const newUsers = [];
  const existingUsers = await app.service('users').find({ paginate: false });
  const bar = new CliProgress.SingleBar({ format: barFormat('Users') });
  bar.start(oldUsers.length, 0);
  await _.chunk(oldUsers, 20).reduce(async (acc, chunk) => {
    await acc;
    await Promise.all(chunk.map(async (user) => {
      if (!user.username || !user.mail) {
        bar.increment();
        return;
      }
      const userPerms = perms.filter(perm => perm.username === user.username);
      let newUser = existingUsers.find(existingUser => existingUser.username === user.username.toLowerCase());
      if (!newUser) {
        const fixedFirstName = fix(user.firstname);
        newUser = await app.service('users').create({
          username: user.username,
          email: user.mail,
          firstName: fixedFirstName,
          lastName: user.surname || (user.fullname || '')
            .replace(user.firstName, '').replace(fixedFirstName, '').trim(),
          displayName: fixedFirstName,
          roles: userPerms.some(perm => ['users.write', 'training.write'].includes(perm.perm)) ? ['admin'] : [],
          preferences: {
            joinedAt: userPerms.find(perm => perm.perm === 'joining.joined')?.added,
          },
          createdAt: user.added,
          updatedAt: moment(),
        });
      }
      newUser.perms = userPerms;
      newUsers.push(newUser);
      bar.increment();
    }));
  }, Promise.resolve());
  bar.stop();
  return newUsers;
};

const trainingSync = async (app) => {
  const oldTraining = await getJson('../../sync/training.json');
  const newTrainings = [];
  const existingTrainings = await app.service('trainings').find({ paginate: false });
  const bar = new CliProgress.SingleBar({ format: barFormat('Trainings') });
  bar.start(oldTraining.length, 0);
  await _.chunk(oldTraining, 20).reduce(async (acc, chunk, i) => {
    await acc;
    await Promise.all(chunk.map(async (training, j) => {
      if (training.hr) {
        bar.increment();
        return;
      }
      let newTraining = existingTrainings.find(existingTraining => existingTraining.ref === training.label);
      if (!newTraining) {
        newTraining = await app.service('trainings').create({
          name: training.title,
          ref: training.label,
          order: (i * 20) + j,
          createdAt: moment(),
          updatedAt: moment(),
        });
      }
      newTraining.oldTraining = training;
      newTrainings.push(newTraining);
      bar.increment();
    }));
  }, Promise.resolve());
  bar.stop();
  return newTrainings;
};

const syncCommentLink = async (app, existingItems, training, assessment) => {
  let item = existingItems.find(existingItem => ['comment', 'review'].includes(existingItem.type)
    && existingItem.url === assessment.link
    && existingItem.ref === training.ref);
  const { isReview } = assessment;
  if (!item) {
    item = await app.service('training-items').create({
      name: assessment.title,
      type: isReview ? 'review' : 'comment',
      url: assessment.link,
      required: isReview,
      ref: training.ref,
      createdAt: moment(),
      updatedAt: moment(),
    });
  }
  item.completePerm = training.oldTraining.perms[0];
  return item;
};

const syncGoogleQuiz = async (app, existingItems, training, assessment) => {
  let item = existingItems.find(existingItem => existingItem.type === 'quiz'
    && existingItem.url === assessment.link
    && existingItem.ref === training.ref);
  if (!item) {
    item = await app.service('training-items').create({
      name: assessment.title,
      type: 'quiz',
      url: assessment.link,
      csvUrl: assessment.results,
      requiredScore: assessment.reqmark,
      required: assessment.required,
      ref: training.ref,
      createdAt: moment(),
      updatedAt: moment(),
    });
  }
  return item;
};

const syncInpersonInduction = async (app, existingItems, training, assessment, users) => {
  let item = existingItems.find(existingItem => existingItem.type === 'induction'
    && existingItem.ref === `${training.ref}-${assessment.perm}`);
  if (!item) {
    item = await app.service('training-items').create({
      name: assessment.title,
      type: 'induction',
      ref: `${training.ref}-${assessment.perm}`,
      required: assessment.required,
      inductorIds: users
        .filter(user => user.perms.some(perm => perm.perm === assessment.trainingPerm))
        .map(user => user._id),
      createdAt: moment(),
      updatedAt: moment(),
    });
  }
  item.completePerm = assessment.perm;
  return item;
};

const syncPermTimeout = (app, existingItems, mainTraining, assessment, trainings) => {
  const training = trainings.find(t => t.oldTraining.perms[0] === assessment.perm);
  if (!training) return null;
  let item = existingItems.find(existingItem => existingItem.type === 'completion'
    && eq(existingItem.trainingId, training._id)
    && existingItem.ref === mainTraining.ref);
  if (!item) {
    item = app.service('training-items').create({
      name: assessment.title,
      type: 'completion',
      trainingId: training._id,
      required: assessment.required,
      ref: mainTraining.ref,
      createdAt: moment(),
      updatedAt: moment(),
    });
  }
  return item;
};

const syncTainingItems = async (app, trainings, users) => {
  const existingItems = await app.service('training-items').find({ paginate: false });
  const bar = new CliProgress.SingleBar({ format: barFormat('Training Items') });
  const total = trainings.reduce((a, t) => a + t.oldTraining.assessments.length, 0);
  bar.start(total, 0);
  await trainings.reduce(async (acc, training) => {
    await acc;
    const items = new Array(training.oldTraining.assessments.length).fill(null);
    await Promise.all(training.oldTraining.assessments.map(async (assessment, i) => {
      let item;
      switch (assessment.type) {
      case 'comment-link':
        item = await syncCommentLink(app, existingItems, training, assessment);
        break;
      case 'google-quiz':
        item = await syncGoogleQuiz(app, existingItems, training, assessment);
        break;
      case 'inperson-induction':
        item = await syncInpersonInduction(app, existingItems, training, assessment, users);
        break;
      case 'perm-timeout':
        item = await syncPermTimeout(app, existingItems, training, assessment, trainings);
        break;
      default:
        console.log('Unknown assessment type:', assessment.type);
      }
      if (item) items[i] = item;
      bar.increment();
    }));
    await app.service('trainings')._patch(training._id, {
      itemIds: _.uniq([
        ...items.filter(Boolean).map(item => `${item._id}`),
        ...(training.itemIds || []).map(id => `${id}`),
      ]),
      updatedAt: moment(),
    });
    training.items = items;
  }, Promise.resolve());
  bar.stop();
};

const getPerm = (user, item) => user.perms.find(perm => perm.perm === item.completePerm);

const syncReviews = async (app, trainings, users) => {
  const existingReviews = await app.service('reviews').find({ paginate: false });
  const mbar = new CliProgress.MultiBar({ format: barFormat('{title}') });
  const items = trainings.reduce((a, t) => [...a, ...t.items], [])
    .filter(item => item.type === 'review');
  const total = items.length;
  const bar = mbar.create(total, 0, { title: 'Reviews' });
  await items.reduce(async (acc, item) => {
    await acc;
    const compUsers = users.filter(user => getPerm(user, item));
    const bar2 = mbar.create(compUsers.length, 0, { title: 'User Reviews' });
    await _.chunk(compUsers, 1).reduce(async (acc2, chunk) => {
      await acc2;
      await Promise.all(chunk.map(async (user) => {
        const review = existingReviews.find(existingReview => eq(existingReview.itemId, item._id) && eq(existingReview.userId, user._id));
        if (!review) {
          await app.service('reviews').create({
            itemId: item._id,
            userId: user._id,
            url: item.url,
            confirmedAt: getPerm(user, item)?.added,
            createdAt: getPerm(user, item)?.added,
            updatedAt: getPerm(user, item)?.added,
          }, { user });
        } else if (moment(review.updatedAt).valueOf() !== moment(getPerm(user, item)?.added).valueOf()) {
          await app.service('reviews').patch(review._id, {
            confirmedAt: getPerm(user, item)?.added,
            updatedAt: getPerm(user, item)?.added,
          }, { user });
        }
        bar2.increment();
      }));
    }, Promise.resolve());
    mbar.remove(bar2);
    bar.increment();
  }, Promise.resolve());
  mbar.stop();
};

const syncInductions = async (app, trainings, users) => {
  const existingInductions = await app.service('inductions').find({ paginate: false });
  const completions = await app.service('completions').find({
    query: {
      'items.inductionId': { $in: existingInductions.map(i => i._id) },
    },
    paginate: false,
  });
  const mbar = new CliProgress.MultiBar({ format: barFormat('{title}') });
  const items = trainings.reduce((a, t) => [...a, ...t.items], [])
    .filter(item => item.type === 'induction');
  const total = items.length;
  const bar = mbar.create(total, 0, { title: 'Inductions' });
  await items.reduce(async (acc, item) => {
    await acc;
    const groupedUsers = _.groupBy(
      users.filter(user => getPerm(user, item)),
      // thanks eddie
      user => `${moment(getPerm(user, item)?.added).format('YYYY-MM-DD')}_${getPerm(user, item)?.addedBy || '22487668'}`,
    );
    const bar2 = mbar.create(Object.keys(groupedUsers).length, 0, { title: 'Sessions' });
    await _.chunk(Object.keys(groupedUsers), 1).reduce(async (acc2, chunk) => {
      await acc2;
      await Promise.all(chunk.map(async (key) => {
        const group = groupedUsers[key];
        const inductorUsername = key.split('_')[1];
        const inductor = users.find(user => user.username === inductorUsername);
        const induction = existingInductions.find(existingInduction => eq(existingInduction.itemId, item._id) && existingInduction.keys.some((k) => eq(k.key, key)));
        if (!induction) {
          await app.service('inductions').create({
            itemId: item._id,
            inductorId: inductor?._id,
            keys: [{
              key,
              expiresAt: moment().add(5, 'minutes'),
            }],
            createdAt: getPerm(group[0], item)?.added,
            updatedAt: getPerm(group[0], item)?.added,
          });
          await Promise.all(group.map(async (user) => {
            await app.service('inductions').get(key, { user });
          }));
        } else {
          let setKey = false;
          await Promise.all(group.map(async (user) => {
            const completion = completions.find(c => eq(c.userId, user._id)
              && c.items.some(i => eq(i.inductionId, induction._id)));
            if (!completion) {
              if (!setKey) {
                await app.service('inductions')._patch(induction._id, {
                  keys: [{
                    key,
                    expiresAt: moment().add(5, 'minutes'),
                  }],
                });
                setKey = true;
              }
              await app.service('inductions').get(key, { user });
            }
          }));
        }
        bar2.increment();
      }));
    }, Promise.resolve());
    mbar.remove(bar2);
    bar.increment();
  }, Promise.resolve());
  mbar.stop();
};

module.exports = (app) => {
  if (process.env.ENABLE_SYNC) {
    setTimeout(() => (async () => {
      console.log('Syncing...');
      const start = moment();
      const users = await syncUsers(app);
      const trainings = await trainingSync(app);
      await syncTainingItems(app, trainings, users);
      await syncReviews(app, trainings, users);
      await syncInductions(app, trainings, users);
      console.log('Sync complete in', moment().diff(start, 'seconds'), 'seconds');
    })().catch(console.error), 1000);
  }
};
const _ = require('lodash');

module.exports = async (context, compItem) => {
  const { app, params } = context;
  const { user } = params;

  if (!user) return;

  const trainings = await app.service('trainings').find({
    query: {
      itemIds: compItem.itemId,
    },
    paginate: false,
  });
  const completions = await app.service('completions').find({
    query: {
      trainingId: { $in: trainings.map(t => t._id) },
      userId: user._id,
    },
    paginate: false,
  });

  await Promise.all(trainings.map(async (train) => {
    const completion = completions.find(c => `${c.trainingId}` === `${train._id}`);
    if (!completion) {
      await app.service('completions').create({
        trainingId: train._id,
        userId: user._id,
        status: 'pending',
        items: [compItem],
      });
    } else {
      await app.service('completions').patch(completion._id, {
        ...completion,
        items: [
          ..._.get(completion, 'items', []).filter((i) => `${i.itemId}` !== `${compItem.itemId}`),
          compItem,
        ],
      });
    }
  }));

  return _.get(trainings, '0._id');
};

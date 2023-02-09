// const _ = require('lodash');

exports.InductionsPending = class InductionsPending {
  constructor(options, app) {
    this.options = options || {};
    this.app = app;
  }

  async find(params) {
    const { user } = params;

    const pendingInductions = await this.app.service('inductions').find({
      query: {
        keys: {
          $elemMatch: {
            userIds: user._id,
            emailSent: { $ne: false },
            expiresAt: { $gt: new Date() },
          },
        },
      },
      paginate: false,
    });

    const inductors = await this.app.service('users').find({
      query: {
        _id: { $in: pendingInductions.map((induction) => induction.inductorId) },
      },
      paginate: false,
    });

    const trainingItems = await this.app.service('training-items').find({
      query: {
        _id: { $in: pendingInductions.map((induction) => induction.itemId) },
      },
      paginate: false,
    });

    const trainings = await this.app.service('trainings').find({
      query: {
        itemIds: { $in: pendingInductions.map((induction) => induction.itemId) },
      },
      paginate: false,
    });

    const completions = await this.app.service('completions').find({
      query: {
        userId: user._id,
        'items.inductionId': { $in: pendingInductions.map((induction) => induction._id) },
      },
      paginate: false,
    });

    const safeInductions = pendingInductions
      .filter((induction) => !completions.some((completion) => completion.items.some((item) => `${item.inductionId}` === `${induction._id}`)))
      .map((induction) => {
        const { keys } = induction;
        const key = keys.find((key) => key.userIds.some((id) => `${id}` === `${user._id}`) && key.emailSent !== false && key.expiresAt > new Date());
        const inductor = inductors.find((inductor) => `${inductor._id}` === `${induction.inductorId}`);
        const trainingItem = trainingItems.find((trainingItem) => `${trainingItem._id}` === `${induction.itemId}`);
        const training = trainings.find((training) => training.itemIds.some((itemId) => `${itemId}` === `${induction.itemId}`));
        return {
          inductorName: inductor.displayName,
          trainingItemName: trainingItem.name,
          trainingName: training.name,
          createdAt: induction.createdAt,
          key: key.key,
          expiresAt: key.expiresAt,
        };
      });

    return {
      data: safeInductions,
      total: safeInductions.length,
    };
  }
};

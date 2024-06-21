module.exports = function (app) {
  const modelName = 'trainings';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true },
    ref: { type: String },
    desc: { type: String },
    order: { type: Number, default: 9999999 },
    itemIds: { type: [mongooseClient.Types.ObjectId] },
    parentIds: { type: [mongooseClient.Types.ObjectId] },
    disabledAt: { type: Date },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  {
    timestamps: !process.env.DISABLE_TIMESTAMPS,
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};

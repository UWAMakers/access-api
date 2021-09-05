// trainingItems-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'trainingItems';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      name: { type: String, required: true },
      desc: { type: String },
      type: {
        type: String,
        required: true,
        enum: ['comment', 'quiz', 'completion', 'induction', 'review'],
      },
      url: { type: String }, // all but completion
      checklistUrl: { type: String }, // induction only
      csvUrl: { type: String }, // quiz only
      trainingId: { type: mongooseClient.Types.ObjectId }, // completion only
      inductorIds: { type: [mongooseClient.Types.ObjectId] }, // induction only
      required: { type: Boolean, default: true }, // all but comment
      requiredScore: { type: Number }, // quiz only
      expiry: { type: Number }, // weeks (all but comment)
      ref: { type: String }, // for syncing inductions, to delete later
      createdAt: { type: Date },
      updatedAt: { type: Date },
    },
    {
      timestamps: !process.env.DISABLE_TIMESTAMPS,
    }
  );

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
};

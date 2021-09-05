// inductions-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'inductions';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      itemId: { type: mongooseClient.Types.ObjectId },
      inductorId: { type: mongooseClient.Types.ObjectId },
      keys: [
        {
          emailSent: { type: Boolean, required: false },
          key: { type: String, required: true },
          userIds: [{ type: mongooseClient.Types.ObjectId }],
          expiresAt: { type: Date },
        },
      ],
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

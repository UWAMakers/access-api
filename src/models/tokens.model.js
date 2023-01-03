// tokens-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'tokens';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema(
    {
      key: { type: String },
      action: {
        type: String,
        enum: [
          'magic_login',
          'magic_signup',
          'verify_preferred_email',
        ],
      },
      data: { type: Object },
      userId: { type: Schema.Types.ObjectId, ref: 'users' },
      expiresAt: { type: Date },
      usedAt: { type: Date },
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

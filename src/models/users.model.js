// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'users';
  const mongooseClient = app.get('mongooseClient');
  const schema = new mongooseClient.Schema(
    {
      email: { type: String, unique: true, lowercase: true },
      preferredEmail: { type: String, lowercase: true },
      username: { type: String, unique: true, lowercase: true },
      usernameUnverified: { type: Boolean },
      firstName: { type: String },
      lastName: { type: String },
      displayName: { type: String },
      roles: { type: [String], enum: ['admin', 'super_admin'] },
      preferences: {
        joinedAt: { type: Date },
        dark: { type: Boolean },
        email: { type: String, lowercase: true },
      },
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

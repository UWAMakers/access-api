// users-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'users';
  const mongooseClient = app.get('mongooseClient');
  const schema = new mongooseClient.Schema({
  
    email: { type: String, unique: true, lowercase: true },
    username: { type: String, unique: true, lowercase: true },
    firstName: { type: String },
    lastName: { type: String },
    displayName: { type: String },
    roles: { type: [String], enum: ['admin', 'super_admin'] },
    preferences: {
      dark: { type: Boolean },
    },
  }, {
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};

// trainingItems-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'trainingItems';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    type: { type: String, required: true, enum: ['comment', 'quiz', 'completion', 'induction'] },
    url: { type: String },
    checklistUrl: { type: String },
    csvUrl: { type: String },
    trainingId: { type: mongooseClient.Types.ObjectId },
    inductorIds: { type: [mongooseClient.Types.ObjectId] },
    required: { type: Boolean, default: true },
    requiredScore: { type: Number },
    expiry: { type: Number }, // weeks
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

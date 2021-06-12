// completions-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'completions';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    trainingId: { type: mongooseClient.Types.ObjectId },
    userId: { type: mongooseClient.Types.ObjectId },
    status: { type: String, required: true, enum: ['pending', 'complete'] },
    items: [{
      itemId: { type: mongooseClient.Types.ObjectId },
      confirmedAt: { type: Date },
      inductionId: { type: mongooseClient.Types.ObjectId },
      reviewId: { type: mongooseClient.Types.ObjectId },
      score: { type: Number },
      status: { type: String, enum: ['pending', 'complete'] },
    }],
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

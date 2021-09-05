// notification-templates-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'notificationTemplates';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    subject: { type: String, required: true },
    body: { type: String, required: true },
    buttonText: { type: String },
    buttonLink: { type: String },
    to: { type: [String] },
    cc: { type: [String] },
    bcc: { type: [String] },
    action: {
      type: String,
      required: true,
      enum: [
        'user_joined',
        'training_complete',
        'training_expired',
        'training_change_bulk',
      ],
    },
    trainingId: { type: mongooseClient.Types.ObjectId },
    sendToUser: { type: Boolean, default: false },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    hoursOfDay: [{ type: Number, min: 0, max: 23 }],
    enabled: { type: Boolean, default: true },
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

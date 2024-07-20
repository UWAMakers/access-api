// labels-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'labels';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    status: {
      type: String,
      required: true,
      enum: ['draft', 'pending', 'complete', 'cancelled'],
      default: 'draft',
    },
    printerId: { type: mongooseClient.Types.ObjectId },
    template: { type: String, default: 'default' },
    copies: { type: Number, default: 1, min: 1 },
    thingId: { type: mongooseClient.Types.ObjectId },
    data: {
      qrUri: { type: String },
      header: { type: String },
      subheader: { type: String },
      body: { type: String },
      footer: { type: String },
    },
    createdAt: { type: Date },
    updatedAt: { type: Date },
  }, {
    timestamps: !process.env.DISABLE_TIMESTAMPS,
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};

// label-printers-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'labelPrinters';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true },
    desc: { type: String },
    password: { type: String, required: true },
    model: {
      type: String,
      required: true,
      enum: ['QL-700'],
      default: 'QL-700',
    },
    labelSize: {
      type: String,
      required: true,
      enum: ['62'],
      default: '62',
    },
    lastHeartbeat: { type: Date },
    disabled: { type: Boolean, default: false },
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

const file = require('./file.model');
// things-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

// a thing is a item/place/anything that can be added the inventory system
module.exports = function (app) {
  const modelName = 'things';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        'consumable', // a thing that can be used up, e.g. a roll of tape
        'container', // a thing that can hold other things, e.g. a box or a shelf
        'equipment', // tools, machines, etc
        'fixture', // tables, chairs, etc
      ],
    },
    subType: {
      type: String,
      enum: [
        // consumable
        'chemical', // a consumable that is a chemical
        'material', // raw materials, e.g. wood, metal, etc
        'component', // parts that are used to make other things
        'kit', // a collection of things that can be put together to make something
        'electronic', // electronic components e.g. resistors, capacitors, etc
        'mechanical', // mechanical components e.g. gears, bearings, etc
        'stationery', // pens, paper, etc
        // container
        'box',
        'moveable',
        'surface',
        'shelf',
        'cabinet',
        'drawer',
        'bin',
        'room',
        'building',
        'area',
        // equipment
        'tool',
        'machine',
        'device',
        'instrument',
        'vehicle',
        'robot',
        'computer',
        'software',
        'accessory',
        'ppe',
        // 'stationery', // pens, paper, etc
        // fixture
        'furniture',
        'eyesore',
        'decorative',
        'person',
      ],
    },
    ref: { type: String, unique: true },
    description: { type: String, trim: true },
    flags: [{
      type: String,
      enum: [
        'bookable',
      ],
    }],
    initialCost: { type: Number },
    quantity: { type: Number },
    costs: [{
      name: { type: String, required: true },
      description: { type: String },
      type: {
        type: String,
        required: true,
        enum: ['purchase', 'rental_fixed', 'rental_hourly', 'consumable']
      },
      quantity: { type: Number, default: 1 },
      value: { type: Number },
    }],
    mainImage: {
      type: new Schema(file),
      required: false,
    },
    images: [file],
    resources: [file],
    contacts: [{
      type: { type: String, required: true, enum: ['owner', 'user', 'maintainer', 'supplier'] },
      userId: { type: Schema.Types.ObjectId, ref: 'users' },
      name: { type: String, required: true },
      avatarUrl: { type: String },
      discordId: { type: String },
      username: { type: String },
      description: { type: String },
      inactive: { type: Boolean },
    }],
    tagIds: [{ type: Schema.Types.ObjectId, ref: 'things-tags' }],
    containerId: { type: Schema.Types.ObjectId, ref: 'things' },
    containerIds: [{ type: Schema.Types.ObjectId, ref: 'things' }],
    childIds: [{ type: Schema.Types.ObjectId, ref: 'things' }],
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

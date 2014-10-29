var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ApiSchema = require('./api').ApiSchema,
  util = {
    model: require('../utils/model')
  };

var RecordSchema = new Schema({
  time: {
    type: Date,
    required: true
  },
  content: {
    type: ApiSchema.tree,
    required: true
  }
});

if (!RecordSchema.options.toObject) {
  RecordSchema.options.toObject = {};
}
RecordSchema.options.toObject.transform = function (doc, ret, options) {
  return util.model.dropDbInfo(ret);
};

var RevisionsSchema = new Schema({
  path: {
    type: String,
    required: true
  },
  namespace: {
    type: String,
    required: true
  },
  records: [RecordSchema]
});

RevisionsSchema.index({
  namespace: 1,
  path: 1
});

RevisionsSchema.method({
  //增加一条记录
  addRecord: function (api) {
    var record = {
      time: Date.now(),
      content: api.toObject()
    };
    this.records.push(record);
  }
});

if (!RevisionsSchema.options.toObject) {
  RevisionsSchema.options.toObject = {};
}
RevisionsSchema.options.toObject.transform = function (doc, ret, options) {
  return util.model.dropDbInfo(ret);
};

mongoose.model('Revisions', RevisionsSchema);

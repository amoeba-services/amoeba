var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ApiSchema = require('./api').ApiSchema;

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
    //api = Api.dropDbInfo(api);
    var record = {
      time: Date.now(),
      content: api.toObject()
    };
    this.records.push(record);
  }
});

mongoose.model('Revisions', RevisionsSchema);

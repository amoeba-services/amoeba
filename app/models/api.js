var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  util = {
    api: require('../utils/api')
  };

var ApiSchema = new Schema({
	path: {
    type: String,
    required: true
  },
	namespace: {
    type: String,
    required: true
  },
  description: String,
	route: {
    type: [],
    required: true
  },
	idl: String,
	disabled: Boolean
});

ApiSchema.index({
  namespace: 1,
  path: 1
});

// api 修改后，增加修订记录
ApiSchema.post('save', function() {
  var api = this;
  this.getRevisions(function (err, revisions){
    if (err) {
      console.error('get revisions error. api:', api);
      console.trace(err);
    }
    if (revisions === null) {
      console.log('no revisions found for api[' + api.namespace + api.path + '], add a document.');
      revisions = new (api.model('Revisions'))({
        namespace: api.namespace,
        path: api.path,
        records: []
      });
    }
    revisions.addRecord(api);
    revisions.save(function(err) {
      if (err) {
        console.error('add a record to revisions error. api:', api);
        console.error(err);
      }
    });
  });
});

ApiSchema.method({
  //检查是否存在冲突的 api
  findConflictedOne: function (callback) {
    var conditions = {
      namespace: this.namespace,
      path: this.path
    };
    //排除自身
    if (this._id) {
      conditions._id = { $ne: this._id };
    }
    this.model('Api').findOne(conditions, callback);
  },
  //获取该 api 的 revisions
  getRevisions: function (callback) {
    var conditions = {
      namespace: this.namespace,
      path: this.path
    };
    this.model('Revisions').findOne(conditions, callback);
  }
});

ApiSchema.static(util.api);

mongoose.model('Api', ApiSchema);

module.exports.ApiSchema = ApiSchema;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  util = {
    model: require('../utils/model'),
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
  var revision = new (api.model('Revision'))({
    api_id: api._id,
    time: Date.now(),
    content: api.toJSON()
  });
  //去重
  revision.save();
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
      api_id: this._id
    };
    this.model('Revision').find(conditions, callback);
  }
});

ApiSchema.static(util.api);

if (!ApiSchema.options.toJSON) {
  ApiSchema.options.toJSON = {};
}
ApiSchema.options.toJSON.transform = function (doc, ret, options) {
  return util.model.dropDbInfo(ret);
};

mongoose.model('Api', ApiSchema);

module.exports.ApiSchema = ApiSchema;

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

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

ApiSchema.method({
  //检查是否已经存在存在冲突的 api
  findConflictedApi: function (callback) {
    var conditions = {
      namespace: this.namespace,
      path: this.path
    };
    //排除自身
    if (this._id) {
      conditions._id = { $ne: this._id };
    }
    this.model('Api').findOne(conditions, 'path', callback);
  }
});

mongoose.model('Api', ApiSchema);

module.exports.ApiSchema = ApiSchema;

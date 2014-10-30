var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ApiSchema = require('./api').ApiSchema,
  util = {
    model: require('../utils/model')
  };

var RevisionSchema = new Schema({
  api_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  time: { type: Date, required: true },
  content: { type: ApiSchema.tree, required: true },
  id: {
    type: String,
    getter: function() { return this._id.toString(); },
    unique: true
  }
}, {
    id: false
});

RevisionSchema.index({
  api_id: 1,
  time: 1
});

if (!RevisionSchema.options.toJSON) {
  RevisionSchema.options.toJSON = {};
}
RevisionSchema.options.toJSON.transform = function (doc, ret, options) {
  ret.id = ret._id;
  return util.model.dropDbInfo(ret);
};

mongoose.model('Revision', RevisionSchema);

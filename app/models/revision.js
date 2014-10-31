var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ApiSchema = require('./api').ApiSchema,
  util = {
    model: require('../utils/model')
  };

var RevisionSchema = new Schema({
  api_id: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  time: { type: Date, required: true },
  content: { type: ApiSchema.tree, required: true }
});

RevisionSchema.index({
  api_id: 1,
  time: 1 // for sort performance
});

RevisionSchema.set('toJSON', { virtuals: true, transform: infoDropper });

function infoDropper(doc, ret, options) {
  ret.api_id = undefined;
  return util.model.dropDbInfo(ret);
}

mongoose.model('Revision', RevisionSchema);

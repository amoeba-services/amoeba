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
    type: String,
    required: true
  },
	idl: String,
	disabled: Boolean
});

ApiSchema.index({
  namespace: 1,
  path: 1
});

mongoose.model('Api', ApiSchema);

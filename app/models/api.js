var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ApiSchema = new Schema({
	path: String,
	namespace: String,
  description: String,
	route: [],
	idl: String,
	disabled: Boolean
});

ApiSchema.index({
  namespace: 1,
  path: 1
});

mongoose.model('Api', ApiSchema);

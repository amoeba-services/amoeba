var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api');

module.exports = function (app) {
  app.use('/data', router);
};

router.all('/:namespace/:uri', function (req, res, next) {
  console.log(req.params);
});

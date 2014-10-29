var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  Revisions = mongoose.model('Revisions');

module.exports = function (router) {

  router.route('/:namespace/:path/revisions')
  .get(function(req, res, next) {
    var conditions = {
      namespace: req.params.namespace,
      path: req.params.path
    };
    try {
      conditions = Api.normalizeKeys(conditions);
    }
    catch (err) {
      err.status = 412;
      return next(err);
    }
    Revisions.findOne(conditions, function(err, revisions) {
      if (err) return next(err);
      if (revisions === null) {
        err = new Error('API Not Found');
        err.status = 404;
        return next(err);
      }
      res.revisions = revisions;
      next();
    });
  })
  .get(function(req, res, next) {
    res.json(res.revisions.records);
  });
};

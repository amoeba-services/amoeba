var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  Revision = mongoose.model('Revision'),
  _ = require('underscore');

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
    Api.findOne(conditions, '_id', function(err, api) {
      if (err) return next(err);
      if (api === null) {
        err = new Error('API Not Found');
        err.status = 404;
        return next(err);
      }
      res.api = api;
      next();
    });
  })
  .get(function(req, res, next) {
    Revision.find({
      api_id: res.api._id
    }, function(err, revisions) {
      if (err) return next(err);
      res.revisions = revisions;
      next();
    });
  })
  .get(function(req, res, next) {
    res.json(_(res.revisions).map(function(revision){
      return revision.toJSON();
    }));
  });

};

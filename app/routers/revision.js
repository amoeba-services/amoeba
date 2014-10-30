var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  Revision = mongoose.model('Revision'),
  _ = require('underscore');

module.exports = function (router) {

  router.route('/:namespace/:path/revisions')
  .get(apiMatcher)
  .get(function(req, res, next) {
    Revision.find({
      api_id: res.api._id
    }, null, {
      sort: '-time'
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

  router.route('/:namespace/:path/revisions/:id')
  .get(apiMatcher)
  .get(function(req, res,next) {
    Revision.findById(req.params.id, function(err, revision) {
      if (err) return next(err);
      if (revision === null) {
        err = new Error('Revision Not Found');
        err.status = 404;
        return next(err);
      }
      res.revision = revision;
      next();
    });
  })
  .get(function(req, res, next) {
    res.json(res.revision.toJSON());
  });

};

function apiMatcher(req, res, next) {
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
}

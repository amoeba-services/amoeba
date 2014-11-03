var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  Revision = mongoose.model('Revision'),
  _ = require('underscore');

var DEFAULT_REVISIONS_AMOUNT = 20,
  MAX_REVISIONS_AMOUNT = 30;

module.exports = function (router) {

  router.route('/:namespace/:path/revisions')
  .get(apiMatcher)
  .get(function(req, res, next) {
    var conditions = {
      api_id: res.api._id
    };

    var createdBefore = req.query.createdBefore;

    if (createdBefore !== undefined) {
      conditions.time = { $lt: new Date(createdBefore) };
    }

    var limit = Math.floor(req.query.limit),
      skip = Math.floor(req.query.skip);

    if (isNaN(limit) || limit < 1) limit = DEFAULT_REVISIONS_AMOUNT;
    if (limit > MAX_REVISIONS_AMOUNT) limit = MAX_REVISIONS_AMOUNT;
    if (isNaN(skip) || skip < 0) skip = 0;

    var options = {
      sort: '-time',
      skip: skip,
      limit: limit
    };

    Revision.find(conditions, null, options, function(err, revisions) {
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

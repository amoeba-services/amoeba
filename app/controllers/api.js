var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  validator = require('../lib/validator');

module.exports = function (app) {
  app.use('/apis', router);
};

router.route('/:namespace/:path')
.all(function paramsNormalizer (req, res, next) {
  req.api = {
    namespace: req.params.namespace,
    path: req.params.path
  };

  try {
    normalizeKeys(req.api);
  }
  catch (err) {
    err.status = 400;
    return next(err);
  }

  next();
})

.get(apiMatcher)
.get(echo)

.patch(apiMatcher)
.patch(function (req, res, next) {
  _.extend(res.api, req.body);
  var keyChanged = res.api.isModified('path') || res.api.isModified('namespace');
  if (keyChanged) {
    //检查是否合法
    try {
      normalizeKeys(res.api);
    }
    catch (err) {
      err.status = 400;
      err.message += " For Target API";
      return next(err);
    }
    findConflictedApi(res.api, function(conflictedApi) {
      if (conflictedApi !== null) {
        //存在冲突的 api
        var err = new Error('API Conflicted');
        err.status = 409;
        res.set({
          'X-Conflicted-API-Path': conflictedApi.path
        });
        return next(err);
      }
      else {
        console.log('no api conflicted, continue.')
        return next();
      }
    });
  }
  else {
    console.log('no api keys change, continue.')
    next();
  }
})
.patch(function (req, res, next) {
  var r = res.api.save(function(err){
    if (err) return next(err);
    next();
  });
})
.patch(echo)

.delete(function (req, res, next) {
  var err = new Error('Method Not Allowed');
  err.status = 405;
  next(err);
})

function normalizeKeys (api) {
  if (api.path[0] !== '/') {
    api.path = '/' + api.path;
  }

  if (!validator.namespace.test(api.namespace)) {
    throw new Error('Illegal Namespace');
  }
  if (!validator.path.test(api.path)) {
    throw new Error('Illegal Path');
  }
}

//检查是否已经存在存在冲突的 api
function findConflictedApi (api, callback) {
  Api.findOne({
    namespace: api.namespace,
    path: api.path,
    _id: { $ne: api._id }
  }, 'path', function (err, conflictedApi) {
    if (err) return next(err);
    callback(conflictedApi);
  });
}

function apiMatcher(req, res, next) {
  Api.findOne({
    namespace: req.api.namespace,
    path: req.api.path
  }, function (err, api) {
    if (err) return next(err);
    if (api === null) {
      //没有匹配的 api
      var err = new Error('API Not Found');
      err.status = 404;
      return next(err);
    }
    res.api = api;
    next();
  });
}

function echo(req, res, next) {
  res.api._id = undefined;
  res.api.path = undefined;
  res.api.namespace = undefined;
  res.json(res.api);
}

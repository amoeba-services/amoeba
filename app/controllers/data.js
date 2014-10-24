var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  config = require('../../config/config'),
  util = {
    api: require('../utils/api'),
    uri: require('../utils/uri-parser')
  };

module.exports = function (app) {
  app.use('/data', router);
  app.use('/data', function errorHeadersSetter(err, req, res, next) {
    res.set('X-Amoeba-Error', err.code || 5000);
    res.set('X-Amoeba-Message', err.message);
    next(err);
  });
  if (config.app.redirectOnError) {
    app.use('/data', function redirector(err, req, res, next) {
      res.status(307);
      res.set('Location', req.target.source);
      res.send();
    });
  }
};

router.route('/:namespace/:uri')
.all(function apiMatcher(req, res, next) {
  req.target = util.uri.parse(req.params.uri);
  var api = {
    namespace: req.params.namespace,
    path: req.target.path
  };
  if (api.path === '') {
    api.path = '/';
  }
  try {
    api = util.api.normalizeKeys(api);
  }
  catch (err) {
    err.code = 4000;
    next(err);
  }
  Api.findOne(api, function (err, api) {
    if (err) return next(err);
    if (api === null) {
      //没有匹配的 api
      err = new Error('no API matched');
      err.code = 4003;
      return next(err);
    }
    res.api = api;
    next();
  });
})
.all(function apiInfoHeadersSetter(req, res, next) {
  var api = res.api;
  res.set('X-Amoeba-Namespace', api.namespace);
  res.set('X-Amoeba-Matched-API', api.path);
  next();
})
.all(function disabledApiChecker(req, res, next) {
  if (res.api.disabled) {
    var err = new Error('API disabled');
    err.code = 2002;
    return next(err);
  }
  next();
})
.all(function echoResponse(req, res, next) {
  var api = res.api;
  res.json(api.route);
});

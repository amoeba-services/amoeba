var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  config = require('../../config/config'),
  util = {
    uri: require('../utils/uri-parser')
  };

var CONTENT_TYPES = {
  'json': 'application/json',
  'text': 'text/plain'
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
.all(function requstInfoParser(req, res, next) {
    var target = req.target = util.uri.parse(req.params.uri);
    var api = req.api = {
      namespace: req.params.namespace,
      path: target.path
    };
    try {
      api = Api.normalizeKeys(api);
    }
    catch (err) {
      err.code = 4000;
      next(err);
    }

    var info = req.info = {};
    _(['method', 'headers', 'body']).forEach(function(keyName) {
      info[keyName] = req[keyName];
    });
    _(['scheme', 'host', 'port', 'params']).forEach(function(keyName) {
      info[keyName] = target[keyName];
    });
    next();
})
.all(function apiMatcher(req, res, next) {
  Api.findOne(req.api, function (err, api) {
    if (err) return next(err);
    if (api === null) {
      //没有匹配的 api
      err = new Error('no API matched');
      err.code = 4004;
      err.status = 404;
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
    err.code = 4003;
    err.status = 404;
    return next(err);
  }
  next();
})
.all(function router(req, res, next) {
  var api = res.api;
  res.info = api.route[0].response.content;
  if (res.info === undefined) {
    var err = new Error('no rule matched');
    err.code = 4002;
    err.status = 404;
    return next(err);
  }
  next();
})
.all(function echoResponse(req, res, next) {
  var info = res.info;
  if (info.headers['Content-Type'] === undefined) {
    info.headers['Content-Type'] = CONTENT_TYPES[info.type];
  }
  if (info.type === 'json') {
    info.body = JSON.stringify(info.body);
  }
  res.status(info.status || 200);
  _(info.headers).forEach(function(value, key) {
    res.set(key, value);
  });
  res.send(info.body);
});

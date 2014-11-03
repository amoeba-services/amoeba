var express = require('express'),
  router = express.Router(),
  _ = require('underscore'),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api');

var DEFAULT_SEARCH_RESULT_AMOUNT = 5,
  MAX_SEARCH_RESULT_AMOUNT = 10;

module.exports = function (router) {
  router.route('/')
  //创建
  .post(function (req, res, next) {
    req.api = new Api(req.body);

    try {
      Api.normalizeKeys(req.api);
    }
    catch (err) {
      err.status = 422;
      return next(err);
    }

    req.api.findConflictedOne(function (err, conflictedApi) {
      if (err) return next(err);
      if (conflictedApi !== null) {
        //存在冲突的 api
        err = new Error('API Conflicted');
        err.status = 409;
        res.set({
          'X-Conflicted-API-Path': conflictedApi.path
        });
        return next(err);
      }
      else {
        console.log('no api conflicted, continue.');
        return next();
      }
    });
  })
  .post(function (req, res, next) {
    res.api = new Api(req.api);
    res.api.save(function(err) {
      if (err) return next(err);
      next();
    });
  })
  .post(function (req, res, next) {
    res.status(201);
    var uri = '';
    uri += '/' + encodeURIComponent(res.api.namespace);
    uri += '/' + encodeURIComponent(res.api.path);
    res.set('Location', uri);
    next();
  })
  .post(echo)
  //搜索
  .get(function queryParser (req, res, next) {
    var query = req.query.q,
      limit = Math.floor(req.query.limit),
      err;
    if (query === undefined) {
      err = new Error('Param \'q\' Required');
      err.status = 412;
      return next(err);
    }
    if (isNaN(limit) || limit < 1) limit = DEFAULT_SEARCH_RESULT_AMOUNT;
    if (limit > MAX_SEARCH_RESULT_AMOUNT) limit = MAX_SEARCH_RESULT_AMOUNT;

    var queryItems = query.split(' ');
    query = {};
    var path = queryItems.shift();
    if (path.length === 0) {
      err = new Error('Query Illegal, Path Required');
      err.status = 412;
      return next(err);
    }
    path = new RegExp(path);
    _.each(queryItems, extendQuery, query);
    query.path = path;
    req.query = query;
    req.options = {
      limit: limit
    };
    console.log('Query: ', req.query, 'Options: ', req.options);
    next();
  })
  .get(function search(req, res, next) {
    Api.find(req.query, 'namespace path description', req.options, function(err, apis) {
      if (err) return next(err);
      res.apis = apis;
      next();
    });
  })
  .get(function echo(req, res, next) {
    res.json(_(res.apis).map(function(api){
      return api.toJSON();
    }));
  });

  router.route('/:namespace/:path')
  .all(function paramsNormalizer (req, res, next) {
    req.api = {
      namespace: req.params.namespace,
      path: req.params.path
    };

    try {
      Api.normalizeKeys(req.api);
    }
    catch (err) {
      err.status = 412;
      return next(err);
    }

    next();
  })

  //获取
  .get(apiMatcher)
  .get(echo)

  //更新
  .patch(apiMatcher)
  .patch(function (req, res, next) {
    _.extend(res.api, req.body);
    var keyChanged = res.api.isModified('path') || res.api.isModified('namespace');
    if (keyChanged) {
      //检查是否合法
      try {
        Api.normalizeKeys(res.api);
      }
      catch (err) {
        err.status = 422;
        err.message += " For Target API";
        return next(err);
      }
      res.api.findConflictedOne(function (err, conflictedApi) {
        if (err) return next(err);
        if (conflictedApi !== null) {
          //存在冲突的 api
          err = new Error('API Conflicted');
          err.status = 409;
          res.set({
            'X-Conflicted-API-Path': conflictedApi.path
          });
          return next(err);
        }
        else {
          console.log('no api conflicted, continue.');
          return next();
        }
      });
    }
    else {
      console.log('no api keys changed, continue.');
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

  .put(apiMatcher)
  .put(function (req, res, next) {
    //从 body 中获取新的 api，忽略其中的 namespace 与 path 字段
    var newApi = _.extend({}, req.body, req.api);
    res.api.update(newApi, { overwrite: true }, function(err) {
      if (err) return next(err);
      Api.findById(res.api.id, function(err, api) {
        if (err) return next(err);
        res.api = api;
        //Model.update 不会触发 post save 的 hook，故这里手动 save
        //see: http://mongoosejs.com/docs/middleware.html#notes
        api.save();
        next();
      });
    });
  })
  .put(echo)

  //删除（不允许）
  .delete(function (req, res, next) {
    var err = new Error('Method Not Allowed');
    err.status = 405;
    next(err);
  });

};


function apiMatcher(req, res, next) {
  Api.findOne({
    namespace: req.api.namespace,
    path: req.api.path
  }, function (err, api) {
    if (err) return next(err);
    if (api === null) {
      //没有匹配的 api
      err = new Error('API Not Found');
      err.status = 404;
      return next(err);
    }
    res.api = api;
    next();
  });
}

function echo (req, res, next) {
  res.json(res.api.toJSON());
}

function extendQuery(item) {
  if (typeof this !== 'object') return;
  var itemParts = item.split(':'),
    conditionKey = itemParts[0],
    conditionValue = itemParts[1];
  if (conditionKey === '') return;
  if (conditionValue === undefined) conditionValue = true;
  this[conditionKey] = conditionValue;
  return this;
}

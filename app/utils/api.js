var _ = require('underscore'),
  mongoose = require('mongoose'),
  Api = mongoose.model('Api'),
  validator = require('../utils/validator');

module.exports = {
  //去掉不需要的数据库相关字段
  dropDbInfo: function (api) {
    if (api.toJSON) api = api.toJSON();
    return _.extend({}, api, {
      _id: undefined,
      __v: undefined //mongoose revision index
    });
  },
  dropKeys: function (api) {
    if (api.toJSON) api = api.toJSON();
    return _.extend({}, api, {
      path: undefined,
      namespace: undefined
    });
  },
  normalizeKeys: function (api) {
    if (!api.namespace) {
      throw new Error('Namespace Required');
    }
    if (typeof api.path !== 'string') {
      throw new Error('Path Required');
    }

    if (api.path[api.path.length - 1] === '/') {
      api.path = api.path.slice(0, api.path.length - 1);
    }
    if (api.path[0] !== '/') {
      api.path = '/' + api.path;
    }

    if (!validator.namespace.test(api.namespace)) {
      throw new Error('Illegal Namespace');
    }
    if (!validator.path.test(api.path)) {
      throw new Error('Illegal Path');
    }
    return api;
  },
  //检查是否已经存在存在冲突的 api
  findConflictedApi: function (api, callback) {
    var conditions = {
      namespace: api.namespace,
      path: api.path
    };
    //排除自身
    if (api._id) {
      conditions._id = { $ne: api._id };
    }
    Api.findOne(conditions, 'path', callback);
  }
};

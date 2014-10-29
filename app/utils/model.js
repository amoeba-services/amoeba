var _ = require('underscore');

module.exports = {
  //去掉不需要的数据库相关字段
  dropDbInfo: function (api) {
    if (api.toJSON) api = api.toJSON();
    return _.extend({}, api, {
      _id: undefined,
      __v: undefined //mongoose revision index
    });
  }
};

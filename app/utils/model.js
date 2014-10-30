var _ = require('underscore');

module.exports = {
  //去掉不需要的数据库相关字段
  dropDbInfo: function (api) {
    delete api._id;
    delete api.__v; //mongoose revision index
    return api;
  }
};

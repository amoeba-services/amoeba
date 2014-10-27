var express = require('express'),
  router = express.Router();

require('../routers/api')(router);

module.exports = function (app) {
  app.use('/apis', router);
};

var express = require('express'),
  router = express.Router(),
  config = require('../../config/config');

require('../routers/data')(router);

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

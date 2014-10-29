var express = require('express'),
  router = express.Router(),
  config = require('../../config/config');

require('../routers/data')(router);
router.use(function errorHeadersSetter(err, req, res, next) {
  res.set('X-Amoeba-Error', err.code || 5000);
  res.set('X-Amoeba-Message', err.message);
  next(err);
});
if (config.app.redirectOnError) {
  router.use(function redirector(err, req, res, next) {
    res.status(307);
    res.set('Location', req.target.source);
    res.send();
  });
}

module.exports = function (app) {
  app.use('/data', router);
};

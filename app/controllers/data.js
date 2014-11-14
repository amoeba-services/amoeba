var express = require('express'),
  router = express.Router(),
  config = require('../../config/config');

require('../routers/data')(router);
router.use(function errorHeadersSetter(err, req, res, next) {
  res.set('X-Amoeba-Status', err.code || 5000);
  res.set('X-Amoeba-Message', err.message);
  next(err);
});
router.use(function redirector(err, req, res, next) {
  if (req.get('X-Redirect-On-Error') === '1') {
    res.status(307);
    res.set('Location', req.target.source);
    res.send();
  }
  else {
    next(err);
  }
});

module.exports = function (app) {
  app.use('/data', router);
};

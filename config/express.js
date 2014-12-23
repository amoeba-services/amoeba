var express = require('express');
var glob = require('glob');
var config = require('./config');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var cors = require('cors');

var ua = require('universal-analytics');
var util = {
  analytics: require('../app/utils/analytics')
};

module.exports = function(app, config) {
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(methodOverride());

  //enable CROS for *
  app.use(cors());
  app.options('*', cors());

  //analytics
  if (!config.googleAnalyticsId) {
    console.warn('No Google Analytics ID setted. Check env variable GOOGLE_ANALYTICS_ID.');
  }
  else {
    app.use(ua.middleware(config.googleAnalyticsId));
  }

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function (err, req, res, next) {
    if (req.visitor) {
      req.visitor.exception(err.status + ' ' + err.message);
      req.visitor.event('Error', err.status + ' ' + err.message);
      req.visitor.send();
    }
    next(err);
  });

  if(app.get('env') === 'development'){
    app.use(function (err, req, res) {
      res.status(err.status || 500);
      res.json({
        message: err.message,
        error: err.stack
      });
    });
  }

  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.json({
      message: err.message
    });
  });

};

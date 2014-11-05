var express = require('express');
var glob = require('glob');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');

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
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app);
  });

  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
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

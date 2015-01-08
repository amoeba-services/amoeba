var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'amoeba'
    },
    port: 3000,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || 'UA-56612755-1',
    db: 'mongodb://localhost/amoeba-development'
  },

  production: {
    root: rootPath,
    app: {
      name: 'amoeba'
    },
    port: process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000,
    ip: process.env.OPENSHIFT_NODEJS_IP,
    googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID,
    db: process.env.MONGOLAB_URI
  }
};

module.exports = config[env];

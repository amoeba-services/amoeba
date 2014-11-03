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
    db: 'mongodb://localhost/amoeba-development'
  },

  production: {
    root: rootPath,
    app: {
      name: 'amoeba'
    },
    port: process.env.PORT || 3000,
    db: process.env.MONGOLAB_URI
  }
};

module.exports = config[env];

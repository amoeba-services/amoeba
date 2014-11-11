var _ = require('underscore');

var middlewareGenerator = {};

_(['pv', 'event', 'send']).forEach(function(generatorName) {
  middlewareGenerator[generatorName] = function() {
    var args = arguments;
    return function(req, res, next) {
      if (req.visitor) {
        var parsedArgs = _(args).map(function(arg) {
          if (typeof arg === 'string') {
            return _.template(arg)(req.params);
          }
          else {
            return arg;
          }
        });
        req.visitor[generatorName].apply(req.visitor, parsedArgs);
      }
      next();
    };
  };
});

module.exports = middlewareGenerator;

'use strict';

const request = require('request-promise-native');

const hasMatchingMethod = (option, reqMethod) => {
  return option.methods.some(method => {
    return method.toLowerCase() === reqMethod.toLowerCase();
  });
};

module.exports = endpoints => {

  return (req, res, next) => {

    if (endpoints && endpoints.length) {

      let requests = endpoints.reduce((memo, option) => {
        // Test the method property against the current req method
        if (option.methods && (hasMatchingMethod(option, req.method) !== true)) {
          return memo;
        }
        // memoize the endpoints
        memo.push(request(option.url).promise());
        return memo;
      }, []);

      // Process all pending requests
      return Promise.all(requests)
        .then(() => next())
        .catch(error => {
          // Assign a code and let
          // the error middleware handle it
          error = new Error(error);
          error.code = 'UNHEALTHY';
          next(error);
        });
    }

    next();
  };

};

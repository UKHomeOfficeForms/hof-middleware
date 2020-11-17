'use strict';

const URI = require('urijs');

const isHealthcheckUrl = (path, healthcheckUrls) => {
  return healthcheckUrls.some(url=>path.includes(url));
};

module.exports = (options) => {
  const checkName = 'hof-cookie-check';
  const cookieName = (options || {})['cookie-name'] || checkName;
  const paramName = (options || {})['param-name'] || checkName;
  let healthcheckUrls;

  if (options && options.healthcheckUrls) {
    healthcheckUrls = options.healthcheckUrls;
  } else {
    healthcheckUrls = ['/healthz', '/livez', '/readyz'];
  }

  return (req, res, next) => {
    if (req.cookies && Object.keys(req.cookies).length) {
      next();
    } else if (req.cookies === undefined || (!Object.keys(req.cookies).length && req.query[paramName] !== undefined)) {
      if (isHealthcheckUrl(req.path, healthcheckUrls)) {
        next();
      } else {
        let err = new Error('Cookies required');
        err.code = 'NO_COOKIES';
        next(err, req, res, next);
      }
    } else {
      res.cookie(cookieName, 1);
      let redirectURL = new URI(req.originalUrl).addQuery(encodeURIComponent(paramName));
      res.redirect(redirectURL.toString());
    }
  };
};

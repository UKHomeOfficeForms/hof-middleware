'use strict';

const URI = require('urijs');

module.exports = (options) => {
  const checkName = 'hof-cookie-check';
  const cookieName = (options || {})['cookie-name'] || checkName;
  const paramName = (options || {})['param-name'] || checkName;

  return (req, res, next) => {
    if (req.cookies && Object.keys(req.cookies).length) {
      next();
    } else if (req.query[paramName] !== undefined) {
      var randomNumber = Math.random().toString();
      randomNumber = randomNumber.substring(2, randomNumber.length);
      res.cookie(cookieName, randomNumber, { maxAge: 900000, httpOnly: true });
      next();
    } else {
      res.cookie(cookieName, 1);
      let redirectURL = new URI(req.originalUrl).addQuery(encodeURIComponent(paramName));
      res.redirect(redirectURL.toString());
    }
  };
};

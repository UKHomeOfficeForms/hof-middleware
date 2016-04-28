'use strict';

module.exports = (translate, options) => {

  var logger = (options || {}).logger;

  if (typeof translate !== 'function') {
    throw new Error('Errorhandler needs a translate function');
  }

  return (err, req, res) => {
    var content = {};

    if (err.code === 'SESSION_TIMEOUT') {
      content.title = translate('errors.session.title');
      content.message = translate('errors.session.message');
    }

    if (err.code === 'NO_COOKIES') {
      err.status = 403;
      content.title = translate('errors.cookies-required.title');
      content.message = translate('errors.cookies-required.message');
    }

    content.title = content.title || translate('errors.default.title');
    content.message = content.message || translate('errors.default.message');

    res.statusCode = err.status || 500;

    if (logger && logger.error) {
      logger.error(err.message || err.error, err);
    }

    res.render('error', {
      error: err,
      content: content,
      /* eslint no-process-env:0 */
      showStack: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'docker-compose'),
      /* elslint no-process-env:1 */
      startLink: req.path.replace(/^\/([^\/]*).*$/, '$1')
    });
  };
};

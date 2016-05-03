'use strict';

const getContent = (err, debug, translate) => {
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

  if (debug === true) {
    content.message = err.message || err || content.message;
  }

  return content;
};

module.exports = (translate, options) => {

  const logger = (options || {}).logger;

  if (typeof translate !== 'function') {
    throw new Error('Errorhandler needs a translate function');
  }
  /* eslint no-unused-vars:0 */
  return (err, req, res, next) => {
    /* eslint no-unused-vars:1 */
    const debug = (options || {}).debug;
    const content = getContent(err, debug, translate);

    if (logger && logger.error) {
      logger.error(err.message || err.error, err);
    }

    res.status(err.status || 500).render('error', {
      error: err,
      content: content,
      /* eslint no-process-env:0 */
      showStack: debug === true ? true : false,
      /* eslint no-process-env:1 */
      startLink: req.path.replace(/^\/([^\/]*).*$/, '$1')
    });
  };
};

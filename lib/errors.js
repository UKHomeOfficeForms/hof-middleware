'use strict';

const errorTitle = code => `${code}_ERROR`;
const errorMsg = code => `There is a ${code}_ERROR`;

const getContent = (err, translate) => {

  const content = {};

  if (err.code === 'SESSION_TIMEOUT') {
    content.title = (translate && translate('errors.session.title'));
    content.message = (translate && translate('errors.session.message'));
  }

  if (err.code === 'NO_COOKIES') {
    err.status = 403;
    content.title = (translate && translate('errors.cookies-required.title'));
    content.message = (translate && translate('errors.cookies-required.message'));
  }

  err.code = err.code || 'UNKNOWN';

  if (!content.title) {
    content.title = (translate && translate('errors.default.title')) || errorTitle(err.code);
  }

  if (!content.message) {
    content.message = (translate && translate('errors.default.message')) || errorMsg(err.code);
  }

  return content;
};

module.exports = (options) => {

  const opts = options || {};
  const logger = opts.logger;
  const translate = opts.translate;
  const debug = opts.debug;

  /* eslint no-unused-vars:0 */
  return (err, req, res, next) => {
    /* eslint no-unused-vars:1 */

    const content = getContent(err, translate);

    if (logger && logger.error) {
      logger.error(err.message || err.error, err);
    }

    res.status(err.status || 500).render('error', {
      error: err,
      content: debug === true ? err : content,
      showStack: debug === true,
      startLink: req.path.replace(/^\/([^\/]*).*$/, '$1')
    });
  };
};

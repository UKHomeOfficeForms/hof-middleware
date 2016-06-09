'use strict';

const getTranslations = translate => {

  const translations = {
    title: 'Not found',
    description: 'There is nothing here'
  };

  if (translate) {
    translations.title = translate('errors.404.title');
    translations.description = translate('errors.404.description');
  }

  return translations;
};

module.exports = options => {

  const opts = options || {};
  const logger = opts.logger;
  const translate = opts.translate;

  return (req, res) => {

    const translations = getTranslations(translate);

    if (logger && logger.warn) {
      logger.warn(`Cannot find: ${req.url}`);
    }

    res.status(404).render('404', {
      title: translations.title,
      description: translations.description
    });
  };
};

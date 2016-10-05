'use strict';

const _ = require('lodash');

module.exports = options => {
  const translate = options.translate || _.identity;
  function deepTranslate(key) {
    let translated = translate(key);
    if (_.isObject(translated)) {
      translated = _.reduceRight(translated, (prev, item, tKey) => {
        let translationPath = key + '.' + tKey;
        let result;
        if (_.isObject(item) && this.sessionModel) {
          translationPath += '.' + this.sessionModel.get(tKey);
        }
        result = deepTranslate.call(this, translationPath);
        return result !== translationPath ? result : prev;
      }, '');
    }
    return translated;
  }

  return (req, res, next) => {
    req.translate = deepTranslate.bind(req);
    next();
  };
};

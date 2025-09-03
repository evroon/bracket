/** @type {import('next-i18next').UserConfig} */
const path = require('path');
module.exports = {
  i18n: {
    locales: ['fa','de', 'el', 'en', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'sv', 'zh'],
    defaultLocale: 'fa',
  },
  localePath: path.resolve('./public/locales')
};

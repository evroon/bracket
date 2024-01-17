/** @type {import('next-i18next').UserConfig} */
const path = require('path');
module.exports = {
  i18n: {
    locales: ['en', 'zh-CN'],
    defaultLocale: 'en',
    localePath: resolve('./public/locales')
  },
};

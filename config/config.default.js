/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1676389048099_6333'

  // add your middleware config here
  config.middleware = ['auth', 'traffic']

  // add your user config here
  const userConfig = {
    myAppName: 'wishlist',
  }

  // auth middleware config
  const ssoBaseUrl = 'https://hong97.ltd/sso'

  config.auth = {
    getUserInfo: {
      path: `${ssoBaseUrl}/api/userInfo`,
      method: 'GET',
    },
  }

  config.traffic = {
    windowSize: 60 * 1000,
    maxRequest: 100,
  }

  return {
    ...config,
    ...userConfig,
  }
}

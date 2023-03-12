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
  config.middleware = []

  // add your user config here
  const userConfig = {
    myAppName: 'wishlist',
  }

  const loginType = ['sso', 'wx']

  const ssoBaseUrl = 'https://hong97.ltd/sso'
  const sso = {
    baseUrl: ssoBaseUrl,
    api: {
      getUserInfo: {
        path: `${ssoBaseUrl}/api/userInfo`,
        method: 'GET',
      },
      validate: {
        path: `${ssoBaseUrl}/api/validate`,
        method: 'POST',
      },
    },
  }

  const mongoose = {
    client: {
      url: 'mongodb://127.0.0.1:27017',
      options: {
        dbName: 'wishlist',
      },
    },
  }

  const token = {
    ignore: '/user/login',
    tokenKey: 'tokenKey',
  }

  const traffic = {
    ignore: '/user/login',
    windowSize: 60 * 1000,
    maxRequest: 100,
  }

  return {
    ...config,
    ...userConfig,
    mongoose,
    sso,
    loginType,
    token,
    traffic,
  }
}

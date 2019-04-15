/* eslint valid-jsdoc: "off" */

'use strict';
const path = require('path');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
    mysql: {
      // 单数据库信息配置
      client: {
        // host
        host: '119.29.86.18',
        // 端口号
        port: '3306',
        // 用户名
        user: 'root',
        // 密码
        password: 'root!23',
        // 数据库名
        database: 'KitHealth',
      },
      // 是否加载到 app 上，默认开启
      app: true,
      // 是否加载到 agent 上，默认关闭
      agent: false,
    },

    security: {
      xframe: {
        enable: false,
      },
      csrf: {
        enable: false,
      },
    },
    cors: {
      origin: '*',
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
      credentials: true,
    },
  };
  /** 静态文件配置**/
  config.static = {
    prefix: '/uploads/',
    gzip: true,
    dir: path.join(appInfo.baseDir, 'uploads'),
  };
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1553564117438_8420';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };


  return {
    ...config,
    ...userConfig,
  };
};

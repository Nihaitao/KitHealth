'use strict';


/** @type Egg.EggPlugin */
exports.static = true;
// eslint-disable-next-line eggache/no-override-exports
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};

exports.cors = {
  enable: true,
  package: 'egg-cors',
};

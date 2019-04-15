'use strict';
/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/login', controller.home.login);
  router.get('/code', controller.home.getMsgCode);
  router.get('/scene', controller.home.getScenes);
  router.post('/addrecord', controller.home.addRecord);
  router.get('/record', controller.home.getRecords);
  router.post('/bindPhone', controller.home.bindPhone);
  router.post('/bindWechat', controller.home.bindWechat);
  router.post('/bindFacebook', controller.home.bindFacebook);
  router.post('/updateUserinfo', controller.home.updateUserinfo);
  // 后台接口
  router.post('/adminlogin', controller.home.adminLogin);
  router.get('/translate', controller.home.translate);
  router.post('/upload', controller.home.upload);
  router.post('/addscene', controller.home.addScenes);
  router.post('/removescene', controller.home.removeScenes);
  router.get('/video', controller.home.getVideos);
  router.post('/addvideo', controller.home.addVideos);
  router.post('/removevideo', controller.home.removeVideos);
  router.post('/top', controller.home.topScene);
  router.get('/album', controller.home.getAlbums);
  router.post('/addalbum', controller.home.addAlbum);
  router.post('/removealbum', controller.home.delAlbum);
};

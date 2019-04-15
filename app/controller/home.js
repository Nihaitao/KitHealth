'use strict';
// eslint-disable-next-line linebreak-style

const Controller = require('egg').Controller;
const YpMsg = require('../public/yunpianMsg.js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const awaitWriteStream = require('await-stream-ready').write;
const sendToWormhole = require('stream-wormhole');

class HomeController extends Controller {

  constructor(ctx) {
    super(ctx);
    this.homeService = ctx.service.home;
  }
  async index() {
    this.ctx.body = 400;
  }
  // 获取验证码
  async getMsgCode() {
    const request = this.ctx.request.query;
    if (!request.mobile) {
      this.ctx.body = { code: 10010, msg: 'mobile is illegal' };
      return;
    }
    if (!request.language) {
      request.language = 'en';
    }
    const code = Math.floor(Math.random() * 8999) + 1000;
    const tpl_value = { '#code#': code };
    let tpl_id = '';
    switch (request.language) {
      case 'zh':
        tpl_id = '2798142';
        tpl_value['#app#'] = '一休';
        break;
      case 'ja':
        tpl_id = '2798170';
        break;
      default:
        tpl_id = '2798154';
    }
    // 发送短信
    YpMsg.send_tpl_sms(YpMsg.send_tpl_sms_uri, YpMsg.apikey, request.mobile, tpl_id, tpl_value);
    console.log(tpl_id + YpMsg.apikey);

    // 保存进数据库
    await this.homeService.registeOrUpdate(request.mobile, code);

    this.ctx.body = { code: 0, msg: 'success', data: code };
  }

  // 登录
  async login() {
    const request = this.ctx.request.body;
    if (request.type === 'phone') {
      const result = await this.homeService.loginByPhone(request.data);
      if (result) {
        const user = await this.homeService.getUser(result);
        this.ctx.body = { code: 0, msg: 'success', data: user };
      } else {
        this.ctx.body = { code: 0, msg: 'fail', data: [] };
      }
    } else if (request.type === 'wechat') {
      const result = await this.homeService.loginByWechat(request.data);
      if (result) {
        const user = await this.homeService.getUser(result);
        this.ctx.body = { code: 0, msg: 'success', data: user };
      } else {
        this.ctx.body = { code: 0, msg: 'fail', data: [] };
      }
    } else if (request.type === 'facebook') {
      const result = await this.homeService.loginByFacebook(request.data);
      if (result) {
        const user = await this.homeService.getUser(result);
        this.ctx.body = { code: 0, msg: 'success', data: user };
      } else {
        this.ctx.body = { code: 0, msg: 'fail', data: [] };
      }
    } else {
      this.ctx.body = { code: 10011, msg: 'params is illegal' };
    }

  }

  // 绑定手机
  async bindPhone() {
    const request = this.ctx.request.body;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const result = await this.homeService.bindPhone(user, request);
    if (result) {
      this.ctx.body = { code: 0, msg: 'success', data: result };
    } else {
      this.ctx.body = { code: 0, msg: 'fail', data: [] };
    }
  }
  // 绑定微信
  async bindWechat() {
    const request = this.ctx.request.body;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const result = await this.homeService.bindWechat(user, request);
    if (result) {
      this.ctx.body = { code: 0, msg: 'success', data: result };
    } else {
      this.ctx.body = { code: 0, msg: 'fail', data: [] };
    }
  }
  // 绑定Facebook
  async bindFacebook() {
    const request = this.ctx.request.body;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const result = await this.homeService.bindFacebook(user, request);
    if (result) {
      this.ctx.body = { code: 0, msg: 'success', data: result };
    } else {
      this.ctx.body = { code: 0, msg: 'fail', data: [] };
    }
  }
  // 修改用户信息
  async updateUserinfo() {
    const request = this.ctx.request.body;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const result = await this.homeService.updateUserinfo(user, request);
    this.ctx.body = { code: 0, msg: result ? 'success' : 'fail', data: result };
  }
  // 置顶、取消置顶场景
  async topScene() {
    const request = this.ctx.request.body;
    const result = await this.homeService.topScene(request);
    this.ctx.body = { code: 0, msg: result };
  }
  // 添加场景
  async addScenes() {
    const request = this.ctx.request.body;
    if (request.id > 0) {
      const result = await this.homeService.updateScenes(request);
      this.ctx.body = { code: 0, msg: result };
    } else {
      const result = await this.homeService.addScenes(request);
      this.ctx.body = { code: 0, msg: result };
    }
  }
  // 删除场景
  async removeScenes() {
    const request = this.ctx.request.body;
    const result = await this.homeService.removeScenes(request);
    this.ctx.body = { code: 0, msg: result };
  }
  // 分页获取场景
  async getScenes() {
    const request = this.ctx.request.query;
    if (!request.pageIndex) {
      request.pageIndex = 1;
    }
    if (!request.pageSize) {
      request.pageSize = 20;
    }
    const data = await this.homeService.getScenes(request);
    const total = await this.homeService.getScenesCount(request);
    this.ctx.body = { code: 0, msg: 'success', data, total };
  }
  // 添加视频
  async addVideos() {
    const request = this.ctx.request.body;
    request.time = new Date();
    if (request.id > 0) {
      const result = await this.homeService.updateVideos(request);
      this.ctx.body = { code: 0, msg: result };
    } else {
      const result = await this.homeService.addVideos(request);
      this.ctx.body = { code: 0, msg: result };
    }
  }
  // 删除视频
  async removeVideos() {
    const request = this.ctx.request.body;
    const result = await this.homeService.removeVideos(request);
    this.ctx.body = { code: 0, msg: result };
  }
  // 分页获取视频
  async getVideos() {
    const request = this.ctx.request.query;
    if (!request.pageIndex) {
      request.pageIndex = 1;
    }
    if (!request.pageSize) {
      request.pageSize = 20;
    }
    const data = await this.homeService.getVideos(request);
    const total = await this.homeService.getVideosCount(request);
    this.ctx.body = { code: 0, msg: 'success', data, total };
  }
  // 添加冥想记录
  async addRecord() {
    const request = this.ctx.request.body;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const result = await this.homeService.addRecord(request, user.id);
    this.ctx.body = { code: 0, msg: result };
  }
  // 分页获取冥想记录
  async getRecords() {
    const request = this.ctx.request.query;
    const token = this.ctx.request.header.token;
    if (!token) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    const user = await this.homeService.getUser(token);
    if (!user) {
      this.ctx.body = { code: 10010, msg: 'token is expired or illegal' };
      return;
    }
    if (!request.pageIndex) {
      request.pageIndex = 1;
    }
    if (!request.pageSize) {
      request.pageSize = 20;
    }
    const data = await this.homeService.getRecords(request, user.id);
    this.ctx.body = { code: 0, msg: 'success', data };
  }

  async adminLogin() {
    this.ctx.body = { code: 0, data: { token: '123456' } };
  }

  async translate() {
    const appid = '20190328000282047';
    const appkey = 'CnyAfDtpcFGGsv9N0WWf';
    const baseurl = 'http://api.fanyi.baidu.com/api/trans/vip/translate';
    const salt = Date.now();
    const request = this.ctx.request.query;
    const md5 = crypto.createHash('md5');
    const str = appid + request.q + salt + appkey;
    const sign = md5.update(str).digest('hex');
    const url = baseurl + '?q=' + request.q + '&from=' + request.from + '&to=' + request.to + '&appid=' + appid + '&salt=' + salt + '&sign=' + sign;
    const re = await this.ctx.curl(encodeURI(url));
    this.ctx.body = { code: 0, data: JSON.parse(re.data) };
  }

  async upload() {
    const stream = await this.ctx.getFileStream();
    console.log(stream);
    // 文件生成绝对路径
    // 当然这里这样不行的，因为你还要判断一下是否存在文件路径
    const fileDir = new Date().toLocaleDateString();
    const currentDir = path.join(this.config.baseDir, 'uploads', fileDir);
    const target = path.join(currentDir, stream.filename);
    if (!fs.existsSync(currentDir)) {
      fs.mkdirSync(currentDir);
    }
    // 生成一个文件写入 文件流
    const writeStream = fs.createWriteStream(target);
    try {
      // 异步把文件流 写入
      await awaitWriteStream(stream.pipe(writeStream));
    } catch (err) {
      // 如果出现错误，关闭管道
      await sendToWormhole(stream);
      throw err;
    }

    // 文件响应
    this.ctx.body = { code: 0, data: 'uploads/' + fileDir + '/' + stream.filename };
  }

  // 分页获取专辑
  async getAlbums() {
    const request = this.ctx.request.query;
    if (!request.pageIndex) {
      request.pageIndex = 1;
    }
    if (!request.pageSize) {
      request.pageSize = 20;
    }
    if (!request.type) {
      request.type = 0;
    }
    const data = await this.homeService.getAlbums(request);
    const details = await this.homeService.getAlbumDetails(request);
    data.forEach(element => {
      if (!element.details) {
        element.details = [];
      }
      details.forEach(detail => {
        if (element.id === detail.albumid) {
          element.details.push(detail);
        }
      });
    });
    const total = await this.homeService.getAlbumsCount(request);
    this.ctx.body = { code: 0, msg: 'success', data, total };
  }

  async addAlbum() {
    const request = this.ctx.request.body;
    if (request.album.id > 0) {
      const result = await this.homeService.updateAlbum(request);
      this.ctx.body = { code: 0, msg: result };
    } else {
      const result = await this.homeService.addAlbum(request);
      this.ctx.body = { code: 0, msg: result };
    }
  }

  async delAlbum() {
    const request = this.ctx.request.body;
    const result = await this.homeService.delAlbum(request);
    this.ctx.body = { code: 0, msg: result };
  }
}
module.exports = HomeController;


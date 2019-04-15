// app/service/home.js
'use strict';
const Service = require('egg').Service;
const uuid = require('uuid');
class HomeService extends Service {
  // 注册或更新用户
  async registeOrUpdate(mobile, code) {
    const user = await this.app.mysql.get('kit_user', { phonenumber: mobile });
    if (!user) { // registe
      await this.app.mysql.insert('kit_user', {
        nickname: mobile,
        phonenumber: mobile,
        lastonlinetime: new Date(),
        phonecode: code,
      });
    } else { // update
      user.phonecode = code;
      user.lastonlinetime = new Date();
      await this.app.mysql.update('kit_user', user);
    }
  }
  // 手机号码登录
  async loginByPhone(data) {
    const user = await this.app.mysql.get('kit_user', { phonenumber: data.mobile, phonecode: data.code });
    if (!user) {
      return '';
    }
    if (Date.now() - user.lastonlinetime.getTime() > 1000 * 60 * 5) {
      return '';
    }
    user.lastonlinetime = new Date();
    user.token = this.guid();
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? user.token : '';
  }
  // WeChat登录
  async loginByWechat(data) {
    const user = await this.app.mysql.get('kit_user', { openid: data.openid });
    const token = this.guid();
    if (!user) { // registe
      const result = await this.app.mysql.insert('kit_user', {
        openid: data.openid,
        nickname: data.nickname,
        avatarurl: data.avatarurl,
        lastonlinetime: new Date(),
        token,
      });
      return result.affectedRows === 1 ? token : '';
    }
    // update
    user.lastonlinetime = new Date();
    user.token = token;
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? token : '';
  }
  // FaceBook登录
  async loginByFacebook(data) {
    const user = await this.app.mysql.get('kit_user', { faceid: data.faceid });
    const token = this.guid();
    if (!user) { // registe
      const result = await this.app.mysql.insert('kit_user', {
        faceid: data.faceid,
        nickname: data.nickname,
        avatarurl: data.avatarurl,
        lastonlinetime: new Date(),
        token,
      });
      return result.affectedRows === 1 ? token : '';
    }
    // update
    user.lastonlinetime = new Date();
    user.token = token;
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? token : '';
  }
  // 添加场景
  async addScenes(request) {
    const result = await this.app.mysql.insert('kit_scene', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 编辑场景
  async updateScenes(request) {
    const result = await this.app.mysql.update('kit_scene', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 删除场景
  async removeScenes(request) {
    const result = await this.app.mysql.delete('kit_scene', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 分页获取场景
  async getScenes(request) {
    let sql = 'select * from kit_scene order by sort, id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    if (request.title) {
      sql = 'select * from kit_scene where title_zh like "%' + request.title + '%" or title_en like "%' + request.title + '%" or title_ja like "%' + request.title + '%" order by sort, id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    }
    const results = await this.app.mysql.query(sql);
    return results;
  }
  // 分页获取场景总条目
  async getScenesCount(request) {
    let sql = 'select count(1) as total from kit_scene';
    if (request.title) {
      sql = 'select count(1) as total from kit_scene where title_zh like "%' + request.title + '%" or title_en like "%' + request.title + '%" or title_ja like "%' + request.title + '%"';
    }
    const results = await this.app.mysql.query(sql);
    return results[0].total;
  }
  // 置顶、取消置顶场景
  async topScene(request) {
    let sort = 0;// 取消置顶
    if (request.sort >= 0) { // 传进来的参数如果不小于0，说明置顶。否则取消置顶
      const scene = await this.app.mysql.query('select min(sort) sort from kit_scene');
      sort = scene[0].sort >= 0 ? -1 : scene[0].sort - 1;
    }
    const result = await this.app.mysql.update('kit_scene', { sort }, { where: { id: request.id } });
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 添加视频
  async addVideos(request) {
    const result = await this.app.mysql.insert('kit_video', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 编辑视频
  async updateVideos(request) {
    const result = await this.app.mysql.update('kit_video', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 删除视频
  async removeVideos(request) {
    const result = await this.app.mysql.delete('kit_video', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  // 分页获取视频
  async getVideos(request) {
    let sql = 'select * from kit_video order by id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    if (request.title) {
      sql = 'select * from kit_video where name like "%' + request.title + '%" order by id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    }
    const results = await this.app.mysql.query(sql);
    return results;
  }
  // 分页获取视频总条目
  async getVideosCount(request) {
    let sql = 'select count(1) as total from kit_video';
    if (request.title) {
      sql = 'select count(1) as total from kit_video where name like "%' + request.title + '%"';
    }
    const results = await this.app.mysql.query(sql);
    return results[0].total;
  }
  // 通过token获取用户
  async getUser(token) {
    const user = await this.app.mysql.get('kit_user', { token });
    return user;
  }
  // 新增冥想记录
  async addRecord(request, userid) {
    request.userid = userid;
    request.datetime = new Date();
    const result = await this.app.mysql.insert('kit_record', request);
    return result.affectedRows === 1 ? 'success' : 'fail';
  }

  // 分页获取冥想记录
  async getRecords(request, userid) {
    const results = await this.app.mysql.select('kit_record', {
      where: { userid }, // WHERE 条件
      orders: [[ 'id', 'desc' ]], // 排序方式
      limit: request.pageSize, // 返回数据量
      offset: (request.pageIndex - 1) * request.pageSize, // 数据偏移量
    });
    return results;
  }
  // 绑定手机
  async bindPhone(user, request) {
    // 原手机用户的记录同步过来并删除原手机用户
    const phoneuser = await this.app.mysql.get('kit_user', { phonenumber: request.mobile, phonecode: request.code });
    if (phoneuser) {
      const records = await this.app.mysql.select('kit_record', { where: { userid: phoneuser.id } });
      if (records) {
        records.forEach(element => {
          element.userid = user.id;
          this.app.mysql.update('kit_record', element);
        });
      }
      await this.app.mysql.delete('kit_user', { id: phoneuser.id });

      // 更新用户手机号码
      user.phonenumber = request.mobile;
      const result = await this.app.mysql.update('kit_user', user);
      return result.affectedRows === 1 ? request.mobile : '';
    }
    return '';
  }
  // 绑定微信
  async bindWechat(user, request) {
    // 原微信用户的记录同步过来并删除原微信用户
    const wechatuser = await this.app.mysql.get('kit_user', { openid: request.openid });
    if (wechatuser) {
      const records = await this.app.mysql.select('kit_record', { where: { userid: wechatuser.id } });
      if (records) {
        records.forEach(element => {
          element.userid = user.id;
          this.app.mysql.update('kit_record', element);
        });
      }
      await this.app.mysql.delete('kit_user', { id: wechatuser.id });
    }
    // 更新用户微信信息
    user.openid = request.openid;
    if (user.nickname === user.phonenumber) {
      user.nickname = request.nickname;
    }
    if (!user.avatarurl) {
      user.avatarurl = request.avatarurl;
    }
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? request.nickname : '';
  }
  // 绑定Facebook
  async bindFacebook(user, request) {
    // 原Facebook用户的记录同步过来并删除原Facebook用户
    const fbtuser = await this.app.mysql.get('kit_user', { faceid: request.faceid });
    if (fbtuser) {
      const records = await this.app.mysql.select('kit_record', { where: { userid: fbtuser.id } });
      if (records) {
        records.forEach(element => {
          element.userid = user.id;
          this.app.mysql.update('kit_record', element);
        });
      }
      await this.app.mysql.delete('kit_user', { id: fbtuser.id });
    }
    // 更新用户Facebook信息
    user.faceid = request.faceid;
    if (user.nickname === user.phonenumber) {
      user.nickname = request.nickname;
    }
    if (!user.avatarurl) {
      user.avatarurl = request.avatarurl;
    }
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? request.nickname : '';
  }
  // 修改用户信息
  async updateUserinfo(user, request) {
    if (request.nickname) {
      user.nickname = request.nickname;
    }
    if (request.avatarurl) {
      user.avatarurl = request.avatarurl;
    }
    const result = await this.app.mysql.update('kit_user', user);
    return result.affectedRows === 1 ? request.nickname || user.avatarurl : '';
  }


  // 分页获取专辑
  async getAlbums(request) {
    let sql = 'select * from kit_album where isdelete = 0 and type = ' + request.type + ' order by id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    if (request.title) {
      sql = 'select * from kit_album where isdelete = 0 and type = ' + request.type + ' and title_zh like "%' + request.title + '%" or title_en like "%' + request.title + '%" or title_ja like "%' + request.title + '%" order by id desc limit ' + request.pageSize + ' offset ' + (request.pageIndex - 1) * request.pageSize;
    }
    const results = await this.app.mysql.query(sql);
    return results;
  }
  // 获取专辑总条目
  async getAlbumsCount(request) {
    let sql = 'select count(1) as total from kit_album where isdelete = 0 and type = ' + request.type;
    if (request.title) {
      sql = 'select count(1) as total from kit_album where isdelete = 0 and type = ' + request.type + ' and title_zh like "%' + request.title + '%" or title_en like "%' + request.title + '%" or title_ja like "%' + request.title + '%"';
    }
    const results = await this.app.mysql.query(sql);
    return results[0].total;
  }
  // 获取明细
  async getAlbumDetails() {
    const sql = 'select * from kit_albumdetail order by id desc';
    const results = await this.app.mysql.query(sql);
    return results;
  }

  async addAlbum(request) {
    const result = await this.app.mysql.insert('kit_album', request.album);
    request.details.forEach(item => {
      item.albumid = result.insertId;
      this.app.mysql.insert('kit_albumdetail', item);
    });
    return result.affectedRows === 1 ? 'success' : 'fail';
  }

  async updateAlbum(request) {
    const result = await this.app.mysql.update('kit_album', request.album);
    await this.app.mysql.delete('kit_albumdetail', { albumid: request.album.id });
    request.details.forEach(item => {
      item.albumid = request.album.id;
      this.app.mysql.insert('kit_albumdetail', item);
    });
    return result.affectedRows === 1 ? 'success' : 'fail';
  }

  async delAlbum(request) {
    const result = await this.app.mysql.update('kit_album', { isdelete: 1 }, { where: request });
    return result.affectedRows === 1 ? 'success' : 'fail';
  }
  guid() {
    return uuid.v4();
  }
}

module.exports = HomeService;

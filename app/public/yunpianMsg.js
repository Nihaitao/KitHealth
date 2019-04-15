'use strict';
const https = require('https');
const qs = require('querystring');

exports.apikey = '3a43c57604e8331d0dce3c9c5fd91254';
// // 修改为您要发送的手机号码，多个号码用逗号隔开
// const mobile = '18573240519';
// // 修改为您要发送的短信内容
// const text = '【云片网】您的验证码是1234';
// // 指定发送的模板编号
// const tpl_id = 1;
// // 指定发送模板的内容
// const tpl_value = { '#app#': 'KitHealth', '#code#': '1234' };
// // 语音短信的内容
// const code = '1234';
// // 查询账户信息https地址
// const get_user_info_uri = '/v2/user/get.json';
// 智能匹配模板发送https地址
const sms_host = 'sms.yunpian.com';
const voice_host = 'voice.yunpian.com';

// // 自定义内容发送接口https地址
exports.send_sms_uri = '/v2/sms/single_send.json';
// // 指定模板发送接口https地址
exports.send_tpl_sms_uri = '/v2/sms/tpl_single_send.json';
// // 发送语音验证码接口https地址
exports.send_voice_uri = '/v2/voice/send.json';


// query_user_info(get_user_info_uri, apikey);

// send_sms(send_sms_uri, apikey, mobile, text);

// send_tpl_sms(send_tpl_sms_uri, apikey, mobile, tpl_id, tpl_value);

// send_voice_sms(send_voice_uri, apikey, mobile, code);
exports.query_user_info = function(uri, apikey) {
  const post_data = {
    apikey,
  };// 这是需要提交的数据
  const content = qs.stringify(post_data);
  post(uri, content, sms_host);
};

exports.send_sms = function(uri, apikey, mobile, text) {
  const post_data = {
    apikey,
    mobile,
    text,
  };// 这是需要提交的数据
  const content = qs.stringify(post_data);
  post(uri, content, sms_host);
};

exports.send_tpl_sms = function(uri, apikey, mobile, tpl_id, tpl_value) {
  const post_data = {
    apikey,
    mobile,
    tpl_id,
    tpl_value: qs.stringify(tpl_value),
  };// 这是需要提交的数据
  const content = qs.stringify(post_data);
  post(uri, content, sms_host);
};
exports.send_voice_sms = function(uri, apikey, mobile, code) {
  const post_data = {
    apikey,
    mobile,
    code,
  };// 这是需要提交的数据
  const content = qs.stringify(post_data);
  console.log(content);
  post(uri, content, voice_host);
};

function post(uri, content, host) {
  const options = {
    hostname: host,
    port: 443,
    path: uri,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
  };
  const req = https.request(options, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log('BODY: ' + chunk);
    });
  });
    // console.log(content);
  req.write(content);

  req.end();
}

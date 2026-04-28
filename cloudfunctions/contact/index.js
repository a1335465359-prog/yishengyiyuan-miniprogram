const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  // 预留：可扩展为客服消息转发、留言记录等
  // 当前小程序前端直接使用 <button open-type="contact"> 走微信官方客服
  return { code: 0, msg: '官方客服通道已开通' };
};

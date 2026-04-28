const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;
  const { OPENID } = cloud.getWXContext();

  switch (action) {
    case 'create': {
      const { productId, quantity = 1, remark = '' } = event;
      const order = {
        _openid: OPENID,
        productId,
        quantity,
        remark,
        status: 'pending',
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      };
      const res = await db.collection('orders').add({ data: order });
      return { code: 0, data: { orderId: res._id } };
    }

    case 'list': {
      const res = await db.collection('orders')
        .where({ _openid: OPENID })
        .orderBy('createTime', 'desc')
        .get();
      return { code: 0, data: res.data };
    }

    default:
      return { code: -1, msg: 'unknown action' };
  }
};

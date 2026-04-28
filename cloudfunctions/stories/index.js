const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event, context) => {
  const { action } = event;

  switch (action) {
    case 'list': {
      const res = await db.collection('stories')
        .where({ status: 'on' })
        .orderBy('sort', 'asc')
        .get();
      return { code: 0, data: res.data };
    }

    case 'detail': {
      const { id } = event;
      const res = await db.collection('stories').doc(id).get();
      return { code: 0, data: res.data };
    }

    default:
      return { code: -1, msg: 'unknown action' };
  }
};

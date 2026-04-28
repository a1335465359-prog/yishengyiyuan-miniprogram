const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action } = event;

  switch (action) {
    case 'list': {
      const { category, color, deity, zodiac, page = 1, limit = 20 } = event;
      let where = { status: 'on' };
      if (category) where.category = category;
      if (color && color !== '全部') where.color = color;
      if (deity && deity !== '全部') where.deity = deity;
      if (zodiac && zodiac !== '全部') where.suitableZodiacs = _.elemMatch(_.eq(zodiac));

      const res = await db.collection('products')
        .where(where)
        .orderBy('sort', 'asc')
        .skip((page - 1) * limit)
        .limit(limit)
        .get();
      return { code: 0, data: res.data };
    }

    case 'detail': {
      const { id } = event;
      const res = await db.collection('products').doc(id).get();
      // 同时查询相关推荐
      const related = await db.collection('products')
        .where({
          _id: _.neq(id),
          category: res.data.category,
          status: 'on'
        })
        .limit(4)
        .get();
      return { code: 0, data: { ...res.data, related: related.data } };
    }

    case 'filters': {
      const [colors, deities] = await Promise.all([
        db.collection('filters').doc('colors').get().catch(() => ({ data: { list: [] } })),
        db.collection('filters').doc('deities').get().catch(() => ({ data: { list: [] } }))
      ]);
      return { code: 0, data: { colors: colors.data.list || [], deities: deities.data.list || [] } };
    }

    default:
      return { code: -1, msg: 'unknown action' };
  }
};

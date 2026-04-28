const api = require('../../api/index');

Page({
  data: {
    product: null
  },

  async onLoad(options) {
    const id = options.id || 'p001';
    await this.loadProduct(id);
  },

  async loadProduct(id) {
    try {
      const res = await api.getProductDetail(id);
      const product = res.data;
      if (!product) throw new Error('商品不存在');
      product.zodiacStr = (product.suitableZodiacs || []).join('、');
      this.setData({ product });
    } catch (err) {
      console.error('加载失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    this.loadProduct(id);
    wx.pageScrollTo({ scrollTop: 0, duration: 180 });
  }
});

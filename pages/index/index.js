Page({
  onLoad() {
    console.log('首页加载');
  },

  goToCategory(e) {
    const type = e.currentTarget.dataset.type;
    wx.setStorageSync('categoryType', type);
    wx.switchTab({ url: '/pages/category/category' });
  }
});

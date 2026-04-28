Page({
  showAbout() {
    wx.showModal({
      title: '关于一绳一愿',
      content: '一绳一愿，致力于呈现藏地文化艺术之美。\n\n每一件手绳、每一条项链，都承载着藏地传统工艺的匠心，以及对美好生活的祝愿。\n\n我们不做宗教信仰的宣传，只做文化艺术的呈现。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#c9a050'
    });
  },

  onShareAppMessage() {
    return {
      title: '一绳一愿 · 藏地文化艺术',
      path: '/pages/index/index'
    };
  }
});

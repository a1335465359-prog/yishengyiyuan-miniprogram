const api = require('../../api/index');

Page({
  data: {
    stories: []
  },

  async onLoad() {
    await this.loadStories();
  },

  async loadStories() {
    try {
      const res = await api.getStories();
      const stories = (res.data || []).map(item => ({
        ...item,
        story: item.story || item.content || item.subtitle || ''
      }));
      this.setData({ stories });
    } catch (err) {
      console.error('加载失败:', err);
    }
  },

  goToDeity(e) {
    const storyId = e.currentTarget.dataset.id;
    const story = this.data.stories.find(item => item.id === storyId);
    wx.navigateTo({ url: `/pages/category/category?deity=${encodeURIComponent(story?.name || '')}` });
  }
});

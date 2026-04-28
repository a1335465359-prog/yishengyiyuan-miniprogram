const api = require('../../api/index');

Page({
  data: {
    products: [],
    heroProduct: null,
    gridProducts: [],
    type: 'all',
    color: '全部',
    deity: '全部',
    // 抽屉内临时状态
    draftType: 'all',
    draftColor: '全部',
    draftDeity: '全部',
    filters: { colors: [], deities: [] },
    showDrawer: false,
    loading: true
  },

  onLoad(options = {}) {
    const next = {};
    if (options.deity) {
      next.deity = decodeURIComponent(options.deity);
      next.draftDeity = next.deity;
    }
    if (options.type) {
      next.type = options.type;
      next.draftType = options.type;
    }
    if (Object.keys(next).length) this.setData(next);
    this.loadFilters();
    this.loadProducts();
  },

  onShow() {
    const type = wx.getStorageSync('categoryType');
    if (type && type !== this.data.type) {
      this.setData({ type, draftType: type });
      this.loadProducts();
    }
    wx.removeStorageSync('categoryType');
  },

  async loadFilters() {
    try {
      const res = await api.getFilters();
      this.setData({ filters: res });
    } catch (e) {}
  },

  async loadProducts() {
    this.setData({ loading: true });
    try {
      const res = await api.getProducts({
        category: this.data.type === 'all' ? '' : this.data.type,
        color: this.data.color,
        deity: this.data.deity
      });
      const products = (res.data || []).map(item => ({
        ...item,
        subtitle: item.subtitle || `${item.deity || '东方守护'} · ${item.blessing || '一绳一愿'}`,
        zodiacStr: Array.isArray(item.suitableZodiacs) ? item.suitableZodiacs.join(' / ') : (item.suitableZodiacs || '')
      }));
      const heroProduct = products.length > 0 ? products[0] : null;
      const gridProducts = products.length > 1 ? products.slice(1) : [];
      this.setData({ products, heroProduct, gridProducts, loading: false });
    } catch (e) {
      console.error('商品加载失败:', e);
      this.setData({ products: [], heroProduct: null, gridProducts: [], loading: false });
    }
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ type });
    this.loadProducts();
  },

  // 打开抽屉时，将当前筛选同步到 draft
  toggleDrawer() {
    this.setData({
      showDrawer: true,
      draftType: this.data.type,
      draftColor: this.data.color,
      draftDeity: this.data.deity
    });
  },

  closeDrawer() {
    this.setData({ showDrawer: false });
  },

  // 抽屉内修改 draft，不触发加载
  selectFilter(e) {
    const { key, value } = e.currentTarget.dataset;
    // key 映射到 draft 前缀
    const draftKey = 'draft' + key.charAt(0).toUpperCase() + key.slice(1);
    this.setData({ [draftKey]: value });
  },

  // 重置 draft
  resetFilter() {
    this.setData({
      draftType: 'all',
      draftColor: '全部',
      draftDeity: '全部'
    });
  },

  // 确认：将 draft 同步到实际筛选，触发加载
  confirmFilter() {
    this.setData({
      type: this.data.draftType,
      color: this.data.draftColor,
      deity: this.data.draftDeity,
      showDrawer: false
    });
    this.loadProducts();
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  goBack() {
    wx.switchTab({ url: '/pages/index/index' });
  }
});

const USE_MOCK = false;     // true = Mock数据, false = 走真实后端
const USE_LOCAL_API = true; // true = 连接本地运营后台(开发调试), false = 云开发
const LOCAL_API_URL = 'http://127.0.0.1:3456';
const mockDelay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// ===== 筛选维度常量 =====
const FILTERS = {
  colors: ['全部', '朱砂', '青金', '松石', '月白', '墨银', '紫檀'],
  deities: ['全部', '扎基拉姆', '八大守护', '药师佛', '绿度母', '狐仙', '文殊菩萨', '观音菩萨'],
  zodiacs: ['全部', '鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
};

// ===== 本地兜底数据：后端没启动时至少不白屏 =====
const MOCK_PRODUCTS = [
  { id: 'p001', name: '朱砂·扎基拉姆手绳', category: 'bracelet', price: 268, color: '朱砂', deity: '扎基拉姆', suitableZodiacs: ['鼠','牛','龙'], blessing: '事业顺利', image: '/images/p1.jpg', material: '天然朱砂、925银、手工编织', size: '可调节 14-18cm', craft: '每一根手绳由藏地工匠手工编织，历经108道工序' },
  { id: 'p002', name: '青金·绿度母手绳', category: 'bracelet', price: 298, color: '青金', deity: '绿度母', suitableZodiacs: ['兔','蛇','羊'], blessing: '平安喜乐', image: '/images/p2.jpg', material: '天然青金石、纯银、手工编织', size: '可调节 14-18cm', craft: '选用阿富汗天然青金石，手工打磨穿绳' },
  { id: 'p003', name: '松石·药师佛手绳', category: 'bracelet', price: 328, color: '松石', deity: '药师佛', suitableZodiacs: ['虎','马','狗'], blessing: '健康安康', image: '/images/p3.jpg', material: '天然绿松石、925银、手工编织', size: '可调节 14-18cm', craft: '湖北原矿绿松石，纯手工雕刻配饰' },
  { id: 'p004', name: '月白·文殊菩萨手绳', category: 'bracelet', price: 288, color: '月白', deity: '文殊菩萨', suitableZodiacs: ['猴','鸡','猪'], blessing: '智慧通达', image: '/images/p4.jpg', material: '天然月光石、纯银、手工编织', size: '可调节 14-18cm', craft: '斯里兰卡月光石，每颗精选蓝光' },
  { id: 'p009', name: '朱砂·扎基拉姆项链', category: 'necklace', price: 468, color: '朱砂', deity: '扎基拉姆', suitableZodiacs: ['鼠','牛','龙'], blessing: '事业顺利', image: '/images/n1.jpg', material: '天然朱砂、925银链、手工雕刻', size: '链长 45cm + 5cm延长链', craft: '朱砂雕刻吊坠，银链手工抛光' },
  { id: 'p010', name: '松石·绿度母项链', category: 'necklace', price: 528, color: '松石', deity: '绿度母', suitableZodiacs: ['兔','蛇','羊'], blessing: '平安喜乐', image: '/images/n2.jpg', material: '天然绿松石、纯银链、手工镶嵌', size: '链长 45cm + 5cm延长链', craft: '原矿松石镶嵌，银丝手工缠绕' }
];

const DEITIES = [
  { id: 'zajilamu', name: '扎基拉姆', title: '藏地女财神', story: '藏地女财神，护事业与财富。', culture: '融合汉藏文化元素，象征包容与护佑。', blessing: '事业顺利' },
  { id: 'lvdumu', name: '绿度母', title: '慈悲的化身', story: '象征慈悲与平安，救度苦难。', culture: '体现藏地对女性力量和生命自然的尊崇。', blessing: '平安喜乐' }
];

const localRequest = (method, path, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${LOCAL_API_URL}${path}`,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success: res => resolve(res.data),
      fail: err => reject(err)
    });
  });
};

const buildQuery = (params = {}) => Object.keys(params)
  .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
  .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  .join('&');

const normalizeProductsResponse = (res) => {
  if (!res) return { code: -1, data: [] };
  if (Array.isArray(res.data)) return { code: res.code || 0, data: res.data };
  if (Array.isArray(res.data?.list)) return { code: res.code || 0, data: res.data.list, meta: res.data };
  return { code: res.code || 0, data: [] };
};

const normalizeFilterList = (list) => {
  if (!Array.isArray(list)) return [];
  return list
    .map(item => typeof item === 'string' ? item : (item.value || item.name || ''))
    .filter(Boolean)
    .filter(item => item !== '全部');
};

const normalizeFilters = (filters = {}) => ({
  colors: normalizeFilterList(filters.colors || FILTERS.colors),
  deities: normalizeFilterList(filters.deities || FILTERS.deities),
  zodiacs: normalizeFilterList(filters.zodiacs || FILTERS.zodiacs)
});

const api = {
  async getFilters() {
    if (USE_MOCK) return normalizeFilters(FILTERS);
    if (USE_LOCAL_API) {
      try {
        const res = await localRequest('GET', '/api/filters');
        return normalizeFilters(res.data || FILTERS);
      } catch (e) {
        return normalizeFilters(FILTERS);
      }
    }
    return normalizeFilters(FILTERS);
  },

  async getDeities() {
    if (USE_MOCK) return DEITIES;
    if (USE_LOCAL_API) {
      try {
        const res = await localRequest('GET', '/api/stories');
        return res.data || DEITIES;
      } catch (e) {
        return DEITIES;
      }
    }
    return DEITIES;
  },

  async getProducts(params = {}) {
    if (USE_MOCK) {
      await mockDelay();
      let list = MOCK_PRODUCTS;
      if (params.category) list = list.filter(p => p.category === params.category);
      if (params.color && params.color !== '全部') list = list.filter(p => p.color === params.color);
      if (params.deity && params.deity !== '全部') list = list.filter(p => p.deity === params.deity);
      if (params.zodiac && params.zodiac !== '全部') list = list.filter(p => (p.suitableZodiacs || []).includes(params.zodiac));
      return { code: 0, data: list };
    }

    if (USE_LOCAL_API) {
      try {
        const query = buildQuery(params);
        const res = await localRequest('GET', `/api/products?${query}`);
        return normalizeProductsResponse(res);
      } catch (e) {
        console.warn('本地后端未连接，使用兜底数据', e);
        let list = MOCK_PRODUCTS;
        if (params.category) list = list.filter(p => p.category === params.category);
        if (params.color && params.color !== '全部') list = list.filter(p => p.color === params.color);
        if (params.deity && params.deity !== '全部') list = list.filter(p => p.deity === params.deity);
        if (params.zodiac && params.zodiac !== '全部') list = list.filter(p => (p.suitableZodiacs || []).includes(params.zodiac));
        return { code: 0, data: list };
      }
    }
  },

  async getProductDetail(id) {
    if (USE_MOCK) {
      await mockDelay();
      const product = MOCK_PRODUCTS.find(p => String(p.id) === String(id)) || MOCK_PRODUCTS[0];
      const deity = DEITIES.find(d => d.name === product.deity);
      return { code: 0, data: { ...product, deityInfo: deity, related: MOCK_PRODUCTS.filter(p => p.category === product.category && String(p.id) !== String(id)).slice(0, 4) } };
    }

    if (USE_LOCAL_API) {
      try {
        const res = await localRequest('GET', `/api/products/${id}`);
        if (res.code !== 0 || !res.data) return res;
        const product = res.data;
        if (!Array.isArray(product.suitableZodiacs) && typeof product.suitableZodiacs === 'string') {
          product.suitableZodiacs = product.suitableZodiacs.split(/[、\s]+/).filter(Boolean);
        }
        const storyRes = await localRequest('GET', '/api/stories').catch(() => ({ data: [] }));
        const relatedRes = await localRequest('GET', `/api/products?category=${encodeURIComponent(product.category || '')}`).catch(() => ({ data: { list: [] } }));
        const deityInfo = (storyRes.data || []).find(s => s.name === product.deity);
        const related = (relatedRes.data?.list || []).filter(p => String(p.id) !== String(id)).slice(0, 4);
        return { code: 0, data: { ...product, deityInfo: deityInfo ? { ...deityInfo, story: deityInfo.story || deityInfo.content } : null, related } };
      } catch (e) {
        console.warn('详情接口失败，使用兜底数据', e);
        const product = MOCK_PRODUCTS.find(p => String(p.id) === String(id)) || MOCK_PRODUCTS[0];
        return { code: 0, data: product };
      }
    }
  },

  async getStories() {
    if (USE_MOCK) {
      await mockDelay();
      return { code: 0, data: DEITIES.map((d, i) => ({ ...d, sort: i + 1 })) };
    }
    if (USE_LOCAL_API) {
      try {
        return await localRequest('GET', '/api/stories');
      } catch (e) {
        return { code: 0, data: DEITIES };
      }
    }
  },

  async getStoryDetail(id) {
    if (USE_MOCK) {
      await mockDelay();
      return { code: 0, data: DEITIES.find(d => String(d.id) === String(id)) || DEITIES[0] };
    }
    if (USE_LOCAL_API) {
      try {
        return await localRequest('GET', `/api/stories/${id}`);
      } catch (e) {
        return { code: 0, data: DEITIES[0] };
      }
    }
  },

  async createOrder(data) {
    if (USE_MOCK) {
      await mockDelay();
      return { code: 0, data: { orderId: 'MOCK_' + Date.now() } };
    }
    if (USE_LOCAL_API) return localRequest('POST', '/api/orders', data);
  },

  async getOrders() {
    if (USE_MOCK) {
      await mockDelay();
      return { code: 0, data: [] };
    }
    if (USE_LOCAL_API) return localRequest('GET', '/api/orders');
  }
};

module.exports = api;

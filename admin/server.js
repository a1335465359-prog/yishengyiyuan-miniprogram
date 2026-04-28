const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const TEXT_KEYS = new Set([
  'name', 'subtitle', 'color', 'deity', 'blessing', 'material', 'size', 'weight', 'craft',
  'title', 'content', 'culture', 'msg', 'value', 'text'
]);

function repairMojibake(value) {
  if (typeof value === 'string') {
    if (!/[ÃÂ�]/.test(value)) return value;
    try {
      return Buffer.from(value, 'latin1').toString('utf8');
    } catch (e) {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map(repairMojibake);
  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, val] of Object.entries(value)) {
      next[key] = TEXT_KEYS.has(key) || Array.isArray(val) || (val && typeof val === 'object') ? repairMojibake(val) : val;
    }
    return next;
  }
  return value;
}

const app = express();
const PORT = 3456;

// ===== 路径配置 =====
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const IMAGES_DIR = path.join(__dirname, '..', 'images');

[DATA_DIR, UPLOAD_DIR, IMAGES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ===== 数据文件 =====
const DB = {
  products: path.join(DATA_DIR, 'products.json'),
  categories: path.join(DATA_DIR, 'categories.json'),
  filters: path.join(DATA_DIR, 'filters.json'),
  stories: path.join(DATA_DIR, 'stories.json')
};

// ===== 默认数据 =====
const DEFAULT_DATA = {
  products: [
    { id: "p001", name: "朱砂·扎基拉姆手绳", subtitle: "藏地女财神护佑", category: "bracelet", price: 268, originalPrice: 368, stock: 99, color: "朱砂", deity: "扎基拉姆", suitableZodiacs: ["鼠","牛","龙"], blessing: "事业顺利", tags: ["事业"], image: "/images/p1.jpg", detailImages: [], material: "天然朱砂、925银、手工编织", size: "可调节 14-18cm", weight: "约15g", craft: "每一根手绳由藏地工匠手工编织，历经108道工序", status: "on", sort: 1, createTime: Date.now() },
    { id: "p002", name: "青金·绿度母手绳", subtitle: "慈悲与平安", category: "bracelet", price: 298, originalPrice: 398, stock: 88, color: "青金", deity: "绿度母", suitableZodiacs: ["兔","蛇","羊"], blessing: "平安喜乐", tags: ["平安"], image: "/images/p2.jpg", detailImages: [], material: "天然青金石、纯银、手工编织", size: "可调节 14-18cm", weight: "约18g", craft: "选用阿富汗天然青金石，手工打磨穿绳", status: "on", sort: 2, createTime: Date.now() },
    { id: "p003", name: "松石·药师佛手绳", subtitle: "健康长寿之愿", category: "bracelet", price: 328, originalPrice: 428, stock: 66, color: "松石", deity: "药师佛", suitableZodiacs: ["虎","马","狗"], blessing: "健康安康", tags: ["健康"], image: "/images/p3.jpg", detailImages: [], material: "天然绿松石、925银、手工编织", size: "可调节 14-18cm", weight: "约20g", craft: "湖北原矿绿松石，纯手工雕刻配饰", status: "on", sort: 3, createTime: Date.now() },
    { id: "p004", name: "月白·文殊菩萨手绳", subtitle: "智慧通达", category: "bracelet", price: 288, originalPrice: 388, stock: 77, color: "月白", deity: "文殊菩萨", suitableZodiacs: ["猴","鸡","猪"], blessing: "智慧通达", tags: ["智慧"], image: "/images/p4.jpg", detailImages: [], material: "天然月光石、纯银、手工编织", size: "可调节 14-18cm", weight: "约16g", craft: "斯里兰卡月光石，每颗精选蓝光", status: "on", sort: 4, createTime: Date.now() },
    { id: "p005", name: "墨银·八大守护手绳", subtitle: "本命佛护佑", category: "bracelet", price: 358, originalPrice: 458, stock: 55, color: "墨银", deity: "八大守护", suitableZodiacs: ["鼠","牛","虎","兔","龙","蛇"], blessing: "平安喜乐", tags: ["守护"], image: "/images/p5.jpg", detailImages: [], material: "925纯银、手工编织", size: "可调节 14-18cm", weight: "约22g", craft: "纯银配饰手工錾刻，细节入微", status: "on", sort: 5, createTime: Date.now() },
    { id: "p006", name: "紫檀·观音菩萨手绳", subtitle: "大慈大悲", category: "bracelet", price: 238, originalPrice: 338, stock: 111, color: "紫檀", deity: "观音菩萨", suitableZodiacs: ["鼠","牛","龙","马","羊"], blessing: "人缘和合", tags: ["人缘"], image: "/images/p6.jpg", detailImages: [], material: "小叶紫檀、925银、手工编织", size: "可调节 14-18cm", weight: "约19g", craft: "印度小叶紫檀老料，手工打磨", status: "on", sort: 6, createTime: Date.now() },
    { id: "p007", name: "朱砂·狐仙手绳", subtitle: "灵动魅力", category: "bracelet", price: 368, originalPrice: 468, stock: 44, color: "朱砂", deity: "狐仙", suitableZodiacs: ["兔","蛇","鸡"], blessing: "人缘和合", tags: ["人缘"], image: "/images/p7.jpg", detailImages: [], material: "天然朱砂、纯银、手工编织", size: "可调节 14-18cm", weight: "约17g", craft: "精选朱砂原矿，手工编织桃花结", status: "on", sort: 7, createTime: Date.now() },
    { id: "p008", name: "青金·药师佛手绳", subtitle: "药师佛护佑", category: "bracelet", price: 318, originalPrice: 418, stock: 33, color: "青金", deity: "药师佛", suitableZodiacs: ["虎","马","狗"], blessing: "健康安康", tags: ["健康"], image: "/images/p8.jpg", detailImages: [], material: "天然青金石、925银、手工编织", size: "可调节 14-18cm", weight: "约21g", craft: "阿富汗老矿青金，手工穿制", status: "on", sort: 8, createTime: Date.now() },
    { id: "p009", name: "朱砂·扎基拉姆项链", subtitle: "事业顺遂", category: "necklace", price: 468, originalPrice: 568, stock: 22, color: "朱砂", deity: "扎基拉姆", suitableZodiacs: ["鼠","牛","龙"], blessing: "事业顺利", tags: ["事业"], image: "/images/n1.jpg", detailImages: [], material: "天然朱砂、925银链、手工雕刻", size: "链长 45cm + 5cm延长链", weight: "约25g", craft: "朱砂雕刻吊坠，银链手工抛光", status: "on", sort: 9, createTime: Date.now() },
    { id: "p010", name: "松石·绿度母项链", subtitle: "平安幸福", category: "necklace", price: 528, originalPrice: 628, stock: 18, color: "松石", deity: "绿度母", suitableZodiacs: ["兔","蛇","羊"], blessing: "平安喜乐", tags: ["平安"], image: "/images/n2.jpg", detailImages: [], material: "天然绿松石、纯银链、手工镶嵌", size: "链长 45cm + 5cm延长链", weight: "约28g", craft: "原矿松石镶嵌，银丝手工缠绕", status: "on", sort: 10, createTime: Date.now() },
    { id: "p011", name: "月白·文殊菩萨项链", subtitle: "智慧光明", category: "necklace", price: 488, originalPrice: 588, stock: 15, color: "月白", deity: "文殊菩萨", suitableZodiacs: ["猴","鸡","猪"], blessing: "智慧通达", tags: ["智慧"], image: "/images/n3.jpg", detailImages: [], material: "天然月光石、925银链", size: "链长 45cm + 5cm延长链", weight: "约26g", craft: "月光石精选蓝光，银托手工打造", status: "on", sort: 11, createTime: Date.now() },
    { id: "p012", name: "墨银·八大守护项链", subtitle: "本命守护", category: "necklace", price: 588, originalPrice: 688, stock: 10, color: "墨银", deity: "八大守护", suitableZodiacs: ["鼠","牛","虎","兔","龙","蛇"], blessing: "平安喜乐", tags: ["守护"], image: "/images/n4.jpg", detailImages: [], material: "925纯银、手工錾刻", size: "链长 45cm + 5cm延长链", weight: "约30g", craft: "纯银手工錾刻本命佛牌", status: "on", sort: 12, createTime: Date.now() }
  ],
  categories: [
    { id: "cat_bracelet", name: "手绳款", type: "category", sort: 1, createTime: Date.now() },
    { id: "cat_necklace", name: "项链款", type: "category", sort: 2, createTime: Date.now() }
  ],
  filters: {
    colors: [{ id: "c_all", name: "全部", value: "全部", sort: 0 }, { id: "c_zhusha", name: "朱砂", value: "朱砂", sort: 1 }, { id: "c_qingjin", name: "青金", value: "青金", sort: 2 }, { id: "c_songshi", name: "松石", value: "松石", sort: 3 }, { id: "c_yuebai", name: "月白", value: "月白", sort: 4 }, { id: "c_moyin", name: "墨银", value: "墨银", sort: 5 }, { id: "c_zitan", name: "紫檀", value: "紫檀", sort: 6 }],
    deities: [{ id: "d_all", name: "全部", value: "全部", sort: 0 }, { id: "d_zajilamu", name: "扎基拉姆", value: "扎基拉姆", sort: 1 }, { id: "d_bada", name: "八大守护", value: "八大守护", sort: 2 }, { id: "d_yaoshi", name: "药师佛", value: "药师佛", sort: 3 }, { id: "d_lvdumu", name: "绿度母", value: "绿度母", sort: 4 }, { id: "d_huxian", name: "狐仙", value: "狐仙", sort: 5 }, { id: "d_wenshu", name: "文殊菩萨", value: "文殊菩萨", sort: 6 }, { id: "d_guanyin", name: "观音菩萨", value: "观音菩萨", sort: 7 }],
    zodiacs: ["全部", "鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"]
  },
  stories: [
    { id: "s001", name: "扎基拉姆", title: "藏地女财神", subtitle: "事业与财富的守护者", cover: "/images/story_zaji.jpg", content: "扎基拉姆是藏传佛教中著名的女财神...", culture: "扎基拉姆的形象融合了汉藏文化元素...", suitableZodiac: ["鼠","牛","龙"], blessing: "事业顺利", status: "on", sort: 1 },
    { id: "s002", name: "绿度母", title: "慈悲的化身", subtitle: "平安与幸福的守护者", cover: "/images/story_green.jpg", content: "绿度母是观世音菩萨眼泪的化身...", culture: "绿度母信仰体现了藏地文化对女性力量的尊崇...", suitableZodiac: ["兔","蛇","羊"], blessing: "平安喜乐", status: "on", sort: 2 }
  ]
};

// ===== 数据加载/保存 =====
function load(key) {
  if (!fs.existsSync(DB[key])) {
    fs.writeFileSync(DB[key], JSON.stringify(DEFAULT_DATA[key] || [], null, 2));
  }
  return repairMojibake(JSON.parse(fs.readFileSync(DB[key], 'utf8')));
}

function save(key, data) {
  fs.writeFileSync(DB[key], JSON.stringify(data, null, 2));
}

// ===== 生成ID =====
function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 4)}`;
}

// ===== Express配置 =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(IMAGES_DIR));

// ===== 图片上传配置 =====
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ============================================
// API: 商品管理
// ============================================

// 商品列表（支持搜索、筛选、分页）
app.get('/api/products', (req, res) => {
  const { keyword, category, color, deity, status, page = 1, limit = 20 } = req.query;
  let products = load('products');

  if (keyword) {
    const k = keyword.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(k) || 
      p.subtitle?.toLowerCase().includes(k) ||
      p.blessing?.toLowerCase().includes(k)
    );
  }
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  if (color && color !== '全部') products = products.filter(p => p.color === color);
  if (deity && deity !== '全部') products = products.filter(p => p.deity === deity);
  if (status) products = products.filter(p => p.status === status);

  const total = products.length;
  const start = (page - 1) * limit;
  const list = products.slice(start, start + parseInt(limit));

  res.json({ code: 0, data: { list, total, page: parseInt(page), limit: parseInt(limit) } });
});

// 商品详情
app.get('/api/products/:id', (req, res) => {
  const products = load('products');
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ code: -1, msg: '商品不存在' });
  res.json({ code: 0, data: product });
});

// 创建商品
app.post('/api/products', (req, res) => {
  const products = load('products');
  const product = {
    id: genId('p'),
    ...req.body,
    status: req.body.status || 'on',
    createTime: Date.now(),
    updateTime: Date.now()
  };
  products.push(product);
  save('products', products);
  res.json({ code: 0, data: product });
});

// 更新商品
app.put('/api/products/:id', (req, res) => {
  const products = load('products');
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: -1, msg: '商品不存在' });

  products[idx] = { ...products[idx], ...req.body, updateTime: Date.now() };
  save('products', products);
  res.json({ code: 0, data: products[idx] });
});

// 删除商品
app.delete('/api/products/:id', (req, res) => {
  let products = load('products');
  products = products.filter(p => p.id !== req.params.id);
  save('products', products);
  res.json({ code: 0, msg: '删除成功' });
});

// 上下架切换
app.post('/api/products/:id/toggle', (req, res) => {
  const products = load('products');
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: -1, msg: '商品不存在' });

  products[idx].status = products[idx].status === 'on' ? 'off' : 'on';
  products[idx].updateTime = Date.now();
  save('products', products);
  res.json({ code: 0, data: products[idx] });
});

// ============================================
// API: 分类管理
// ============================================

// 分类列表
app.get('/api/categories', (req, res) => {
  const categories = load('categories');
  res.json({ code: 0, data: categories });
});

// 创建分类
app.post('/api/categories', (req, res) => {
  const categories = load('categories');
  const category = { id: genId('cat'), ...req.body, createTime: Date.now() };
  categories.push(category);
  save('categories', categories);
  res.json({ code: 0, data: category });
});

// 更新分类
app.put('/api/categories/:id', (req, res) => {
  const categories = load('categories');
  const idx = categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: -1, msg: '分类不存在' });
  categories[idx] = { ...categories[idx], ...req.body };
  save('categories', categories);
  res.json({ code: 0, data: categories[idx] });
});

// 删除分类
app.delete('/api/categories/:id', (req, res) => {
  let categories = load('categories');
  categories = categories.filter(c => c.id !== req.params.id);
  save('categories', categories);
  res.json({ code: 0, msg: '删除成功' });
});

// ============================================
// API: 筛选维度管理（色系/神佛）
// ============================================

// 获取筛选维度
app.get('/api/filters', (req, res) => {
  const filters = load('filters');
  res.json({ code: 0, data: filters });
});

// 更新筛选维度
app.put('/api/filters/:type', (req, res) => {
  const filters = load('filters');
  filters[req.params.type] = req.body;
  save('filters', filters);
  res.json({ code: 0, data: filters[req.params.type] });
});

// ============================================
// API: 故事管理
// ============================================

app.get('/api/stories', (req, res) => {
  const stories = load('stories');
  res.json({ code: 0, data: stories });
});

app.get('/api/stories/:id', (req, res) => {
  const stories = load('stories');
  const story = stories.find(s => s.id === req.params.id || s.name === req.params.id);
  if (!story) return res.status(404).json({ code: -1, msg: '故事不存在' });
  res.json({ code: 0, data: story });
});

app.post('/api/stories', (req, res) => {
  const stories = load('stories');
  const story = { id: genId('s'), ...req.body, createTime: Date.now() };
  stories.push(story);
  save('stories', stories);
  res.json({ code: 0, data: story });
});

app.put('/api/stories/:id', (req, res) => {
  const stories = load('stories');
  const idx = stories.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: -1, msg: '故事不存在' });
  stories[idx] = { ...stories[idx], ...req.body };
  save('stories', stories);
  res.json({ code: 0, data: stories[idx] });
});

app.delete('/api/stories/:id', (req, res) => {
  let stories = load('stories');
  stories = stories.filter(s => s.id !== req.params.id);
  save('stories', stories);
  res.json({ code: 0, msg: '删除成功' });
});

// ============================================
// API: 图片上传
// ============================================

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ code: -1, msg: '没有文件' });

  const targetName = req.body.filename || req.file.filename;
  const targetPath = path.join(IMAGES_DIR, targetName);
  fs.renameSync(req.file.path, targetPath);

  res.json({ code: 0, data: { url: `/images/${targetName}`, filename: targetName } });
});

// 批量上传
app.post('/api/upload/batch', upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ code: -1, msg: '没有文件' });

  const urls = req.files.map(file => {
    const targetPath = path.join(IMAGES_DIR, file.filename);
    fs.renameSync(file.path, targetPath);
    return `/images/${file.filename}`;
  });

  res.json({ code: 0, data: { urls } });
});

// ============================================
// API: 统计数据
// ============================================

app.get('/api/stats', (req, res) => {
  const products = load('products');
  const categories = load('categories');

  const stats = {
    totalProducts: products.length,
    onSale: products.filter(p => p.status === 'on').length,
    offSale: products.filter(p => p.status === 'off').length,
    totalCategories: categories.length,
    categoryStats: categories.map(c => ({
      name: c.name,
      count: products.filter(p => p.category === c.id).length
    })),
    lowStock: products.filter(p => p.stock < 20).length
  };

  res.json({ code: 0, data: stats });
});

// ============================================
// API: 订单（本地调试占位）
// ============================================
app.post('/api/orders', (req, res) => {
  res.json({ code: 0, data: { id: genId('order'), ...req.body, status: 'created', createTime: Date.now() } });
});

app.get('/api/orders', (req, res) => {
  res.json({ code: 0, data: [] });
});

// ============================================
// 启动
// ============================================
app.listen(PORT, () => {
  console.log(`✅ 一绳一愿运营后台已启动`);
  console.log(`管理页面: http://localhost:${PORT}`);
  console.log(`API地址: http://localhost:${PORT}/api`);
  console.log(`数据目录: ${DATA_DIR}`);
});

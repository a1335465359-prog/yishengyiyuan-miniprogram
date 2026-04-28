# 一绳一愿小程序

藏式手绳/大卡愿物展示小程序 + 本地运营后台。

## 目录

- `pages/`：微信小程序页面
- `api/`：小程序 API 适配层，支持本地后端/Mock/云开发模式
- `admin/`：本地运营后台（Express）
- `images/`：当前使用的商品与页面图片素材
- `cloudfunctions/`：云函数预留

## 本地后端

```bash
cd admin
npm install
npm start
```

默认地址：`http://127.0.0.1:3456`

## 当前状态

- 前端已切换到本地后端：`api/index.js` 中 `USE_MOCK=false`、`USE_LOCAL_API=true`
- 本地接口已验证：商品列表/详情、筛选、故事、订单占位接口
- 视觉已重做为深藏红 + 米金 + 米白卡片风格

## 注意

- `admin/node_modules/`、`admin/uploads/`、备份文件和本地私有配置不提交
- 正式上线前需要替换为正式小程序 AppID，并按备案/审核要求继续检查文案

# 本地运行截图（不入库二进制）

由于当前 PR 通道不支持二进制文件，截图 PNG 不再提交到仓库。
请在本地按下面命令生成后自行查看。

预期生成文件（本地）：
- `screenshots/frontend-admin.png`
- `screenshots/backend-api-products.png`

生成时间示例（UTC）：2026-04-28

命令：

```bash
cd admin && npm start
npx -y playwright@1.54.2 screenshot --device="Desktop Chrome" http://127.0.0.1:3456 screenshots/frontend-admin.png
npx -y playwright@1.54.2 screenshot --device="Desktop Chrome" http://127.0.0.1:3456/api/products screenshots/backend-api-products.png
```

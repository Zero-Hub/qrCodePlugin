# QR Code for Mobile

一款面向前端开发者的 Microsoft Edge 扩展（Manifest V3）。
点击工具栏图标，把当前标签页地址生成二维码，方便用手机扫码访问。
支持配置「域名映射规则」，把本机开发地址（如 `http://127.0.0.1:5500`）自动替换成
公网代理地址（如 `https://static.tanwenbin0702.dpdns.org`），路径与查询参数原样保留。

> 代码符合 MV3 规范，理论上 Chrome 也可加载使用，但本仓库以 **Microsoft Edge Add-ons** 上架为准。

## 目录结构

```
qrCodePlugin/
├── manifest.json           # MV3 清单
├── popup/                  # 工具栏弹窗（HTML/CSS/JS）
├── options/                # 配置页（HTML/CSS/JS）
├── shared/                 # popup 与 options 共用的工具函数
├── lib/                    # 第三方库（qrcodejs，本地引入）
├── icons/                  # 16/48/128 PNG 图标
├── tools/
│   ├── generate-icons.py   # 重新生成图标的脚本
│   └── build-zip.sh        # 一键打包提交用的 zip
├── PRIVACY.md              # 隐私政策（中英）
├── STORE_LISTING.md        # Edge 商店字段填空指引
└── README.md
```

## 本地加载（开发期）

1. 打开 `edge://extensions`
2. 左下角打开「开发人员模式」
3. 点「加载解压缩的扩展」，选择本目录

## 使用

1. **生成二维码**：点击工具栏图标，弹窗自动显示当前标签页 URL 的二维码。
2. **配置映射规则**：点弹窗右上角齿轮 → 打开配置页 → 添加 / 编辑规则 → 保存。
   - 「源域名」「目标域名」按 `origin`（协议+主机+端口）整体匹配。
   - 例：源 `http://127.0.0.1:5500` → 目标 `https://static.tanwenbin0702.dpdns.org`
     时，访问 `http://127.0.0.1:5500/foo?x=1` 会生成 `https://static.tanwenbin0702.dpdns.org/foo?x=1` 的二维码。
3. **本次禁用映射**：弹窗里的「使用域名映射」开关，关闭后立即用原始地址重画二维码。
   只在本次弹窗有效，不会影响保存的规则。
4. **复制链接**：弹窗里的「复制」按钮一键复制二维码对应的链接。

## 打包提交

```bash
# 重新生成图标（可选，仅在你想换图标颜色/图案时）
python3 tools/generate-icons.py

# 打包成可上传到 Microsoft Partner Center 的 zip
bash tools/build-zip.sh
# → dist/qr-code-for-mobile-v1.0.0.zip
```

打包脚本会自动排除 `.idea/`、`tools/`、`*.md`、`*.zip`、`.DS_Store` 等开发期文件，
确保 `manifest.json` 在 zip 的第一层。

## 提交到 Microsoft Edge Add-ons

1. 注册：[Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge)
   （免费，必须用个人 MSA：outlook.com / live.com / hotmail.com）。
2. 把 `PRIVACY.md` 发布成一个公开 URL（GitHub Pages 或仓库 raw 链接）。
3. 在 Partner Center 「Create new extension」→ 上传 `dist/*.zip`。
4. 填写商店列表 → 直接照抄 [`STORE_LISTING.md`](./STORE_LISTING.md)。
5. 上传 1280×800 截图（至少 1 张，推荐 2~3 张）。
6. 提交，等邮件通知，通常 1–3 个工作日。

## 数据存储

规则保存在 `chrome.storage.sync`，登录同一 Microsoft 账号的 Edge 浏览器会自动同步。
不希望同步的话，把 `shared/mapping.js` 里 `chrome.storage.sync` 改成 `chrome.storage.local`。

## 不支持的页面

`edge://`、`chrome://`、`about:`、`file://` 等内部协议页面无法生成二维码，弹窗会显示提示。

## 第三方代码

- 二维码生成：[davidshimjs/qrcodejs](https://github.com/davidshimjs/qrcodejs) (MIT License)
  通过 `lib/qrcode.min.js` 本地引入。

## 许可

MIT

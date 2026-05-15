# Edge Add-ons 提交清单

> 这是一个「填空指引」，把以下内容直接复制到 Microsoft Partner Center
> 对应字段，能一次过审的概率更高。

## 1. 基本信息

| 字段 | 推荐值 |
| --- | --- |
| Extension name | `QR Code for Mobile` |
| Short name | `QR for Mobile` |
| Version | `1.0.0`（已写在 manifest.json） |
| Default language | `Chinese (Simplified)` 或 `English` 二选一，下面文案两套都给了 |
| Category | **Developer tools**（开发者工具） |
| Subcategory | _无_ |
| Pricing | Free |

## 2. Store listings

### 2.1 简短描述（Short description，≤ 200 字符）

**中文（推荐）**：
```
一键把当前标签页地址生成二维码，方便手机扫码访问。支持配置「本地开发地址 → 公网代理地址」的映射规则，扫一下就能在真机上调试本地页面。
```

**英文**：
```
Generate a QR code for the current tab URL so your phone can scan and open it. Configure origin mapping rules to swap localhost URLs for public ones — perfect for on-device testing of local pages.
```

### 2.2 详细描述（Description）

**中文**：
```
QR Code for Mobile 是一款专为前端开发者打造的轻量工具。

主要功能：
• 点击工具栏图标，立即把当前标签页的 URL 生成二维码，用手机相机或扫码 App 一扫即可打开。
• 支持配置「域名映射规则」：当地址匹配某条规则的「源域名」（协议+主机+端口完全相同），二维码会自动替换为对应的「目标域名」，路径与查询参数原样保留。
• 适合本地开发场景：把 http://127.0.0.1:5500 之类的本机地址映射为已部署到公网的代理域名，无需手动改 URL，一键就能在真机调试。
• 可同时配置多条规则，按列表顺序匹配，命中即停。
• 弹窗内可临时禁用映射，一键复制最终二维码对应的链接。

隐私与安全：
• 完全本地运行，不联网、不上传任何数据。
• 仅在你点击图标时读取当前标签页 URL，仅用于即时生成二维码。
• 映射规则保存在浏览器本地（chrome.storage.sync），可随浏览器账号同步到你自己的其他设备。
• 不收集任何使用数据，不集成任何第三方追踪、广告或分析 SDK。

权限说明：
• activeTab：在你点击图标时读取当前标签页 URL。
• storage：保存你的映射规则。
```

**英文**：
```
QR Code for Mobile is a lightweight tool tailored for front-end developers.

What it does:
• Click the toolbar icon to instantly turn the current tab's URL into a scannable QR code — open the page on your phone in seconds.
• Configure origin mapping rules: when the current URL matches a rule's "from" origin (scheme + host + port must match exactly), the QR encodes the "to" origin instead, while the path and query string are preserved.
• Designed for local development: map http://127.0.0.1:5500 (or any local dev address) to a publicly reachable URL, and your phone can hit the local app via your reverse proxy without manual URL editing.
• Multiple rules supported, matched top-to-bottom; the first match wins.
• Temporarily disable mapping from the popup, copy the final URL with one click.

Privacy & security:
• Runs entirely in your browser. No network requests, no telemetry.
• Reads the active tab URL only when you click the icon, only to generate the QR code in-memory.
• Mapping rules are stored via chrome.storage.sync — synced only by your browser, only to your own devices.
• No data collection, no third-party tracking, no ads.

Permissions:
• activeTab — read the current tab URL when you open the popup.
• storage — save your mapping rules locally.
```

### 2.3 关键词 / 搜索词（Search terms，最多 7 个）

```
qr code, qrcode, mobile testing, localhost, dev tools, tunnel, mapping
```

### 2.4 隐私政策 URL

把仓库里的 `PRIVACY.md` 发布到一个公开 URL（推荐 GitHub Pages 或仓库 raw 链接）后填入。例如：
```
https://<your-username>.github.io/qrCodePlugin/PRIVACY.html
```
或临时填仓库的 raw 链接：
```
https://raw.githubusercontent.com/<your-username>/qrCodePlugin/main/PRIVACY.md
```
（建议正式上架前换成 GitHub Pages 的 HTML，体验更好。）

### 2.5 网站 URL（Website URL）

仓库地址即可，例：
```
https://github.com/<your-username>/qrCodePlugin
```

### 2.6 支持联系（Support contact）

填一个你能看到的邮箱，或把 `mailto:` 链接换成 GitHub Issues 链接。

## 3. 截图（必须，至少 1 张，推荐 2~3 张）

Edge 要求 **1280×800** 的 PNG / JPG。建议：

1. **弹窗主界面**：在任意 https 页面点开图标，截下整个浏览器或聚焦弹窗。
2. **配置页**：截已配置 1~2 条规则的状态，演示「源域名 → 目标域名」。
3.（可选）**手机扫码效果合成图**：截图 + 手机照片对比，让效果更直观。

操作建议：
- 把浏览器窗口宽度调到约 1280px。
- macOS 用 `Shift+Cmd+5` 截窗口或区域，导出为 PNG。
- 不能含可识别的客户/公司域名（截图会公开展示），用前面给的示例域名即可。

## 4. Availability（市场和可见性）

- **Visibility**：选 **Public**（首次发布选公开；如果想先内部试用可选 Hidden 拿到链接给少数人）。
- **Markets**：保持默认全部市场，让所有人都能下载。

## 5. Properties

| 字段 | 推荐填法 |
| --- | --- |
| Category | Developer tools |
| Privacy policy required | **Yes**（同时贴上 PRIVACY URL） |
| Hosts permission justification | _本扩展没有声明 host permissions_，留空 |
| Single purpose description | `Generate a QR code for the current tab URL, with optional origin mapping for local development.` |
| activeTab justification | `Read the current tab URL when the user clicks the toolbar icon, in order to encode it into a QR code.` |
| storage justification | `Persist user-defined origin mapping rules locally.` |

## 6. 提交前最终自查

- [ ] manifest.json 的 `version` 高于上一次提交（首次提交是 1.0.0）。
- [ ] zip 内 manifest.json 在**第一层**（不是 `qrCodePlugin/manifest.json`）。
- [ ] zip 内不含 `.idea/`、`.DS_Store`、源工程之外的杂项文件。
- [ ] icons/ 下三张 PNG 都存在。
- [ ] 隐私政策 URL 可公开访问（用无痕窗口验证一下）。
- [ ] 截图里没有公司内部域名 / 邮箱。

## 7. 提交后

- 状态变化会发邮件，也会在 Partner Center 的 Overview 页显示。
- 若 Failed，看 Certification report 给的具体原因，对应修改 → bump version → 重新提交。
- 通常 1–7 个工作日有结果；简单工具大多 1–3 天。

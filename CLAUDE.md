# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

「QR Code for Mobile」是一个 Manifest V3 浏览器扩展（以 Microsoft Edge Add-ons 上架为准，兼容 Chrome）。
核心功能：点击工具栏图标，把当前标签页 URL 生成二维码；支持配置「开发地址 → 公网地址」的域名映射规则，方便手机扫码访问本地开发页面。

纯前端、无构建步骤、无依赖管理（第三方库以本地文件形式直接引入），也没有测试套件。

## 常用命令

```bash
# 打包成可上传 Microsoft Partner Center 的 zip（自动从 manifest.json 读版本号，自动排除开发期文件）
bash tools/build-zip.sh        # → dist/qr-code-for-mobile-v<版本>.zip

# 重新生成图标（仅在更换图标颜色/图案时需要）
python3 tools/generate-icons.py
```

本地调试：`edge://extensions`（或 `chrome://extensions`）→ 开启「开发人员模式」→「加载解压缩的扩展」→ 选择项目根目录。改完代码在扩展卡片上点「刷新」即可生效，无需重新打包。

## 架构

扩展由两个独立的 UI 入口构成，没有 background/service worker：

- **popup/**（`manifest.json` 的 `action.default_popup`）— 工具栏弹窗。打开时读取当前 tab URL，应用映射后绘制二维码，提供「临时禁用映射」开关与「复制链接」。
- **options/**（`manifest.json` 的 `options_page`）— 配置页。增删改并校验域名映射规则。

二者通过 **`shared/mapping.js`** 共享逻辑。该文件用 IIFE 把工具函数挂到全局 `window.QRMapping`，由 HTML 里的 `<script src="../shared/mapping.js">` 引入（**不是** ES module，没有 import/export）。`popup.js` / `options.js` 直接调用 `QRMapping.*`。新增共享逻辑应放进这里并扩展 `window.QRMapping`。

数据流：`chrome.tabs.query`（当前 tab URL） → `QRMapping.applyMapping(url, mappings)` → `new QRCode(...)` 绘制。规则持久化在 **`chrome.storage.sync`**（随 Microsoft 账号在多端 Edge 间同步），由 `QRMapping.loadMappings/saveMappings` 读写。若要改成不同步，把 `shared/mapping.js` 里的 `chrome.storage.sync` 改成 `chrome.storage.local`。

### 映射规则的数据结构与匹配

每条规则形如 `{ id, from, to, enabled }`，`from`/`to` 均为 **origin**（协议+主机+端口，无路径）。
匹配是**按 origin 整体精确相等**（`rule.from === u.origin`），命中即停；匹配后用 `to + pathname + search + hash` 重组 URL，即只替换 origin，路径/查询/锚点原样保留。

校验/规范化集中在 `options.js` 的 `validateAndNormalize()`：用 `URL` 解析得到 origin，拒绝非法 URL、源与目标相同、源 origin 重复的规则；空行（from 和 to 都为空）会被跳过不保存。

### 权限与限制

- `permissions`: 仅 `activeTab` + `storage`，刻意保持最小。
- 只对 `http(s)` 页面生成二维码；`edge://`、`chrome://`、`about:`、`file://` 等内部协议会显示提示而不绘制（见 `popup.js` 的 `isQrAble`）。

## 修改时注意

- **版本号**改 `manifest.json` 的 `version`；打包文件名由此派生。
- 二维码库是 `lib/qrcode.min.js`（davidshimjs/qrcodejs，MIT），本地引入，勿换成 CDN（MV3 + 商店审核要求本地资源）。
- 商店上架文案见 `STORE_LISTING.md`，隐私政策见 `PRIVACY.md`（需发布成公开 URL 后填入 Partner Center）。
- `tools/`、`*.md`、`.idea/` 等都会被 `build-zip.sh` 排除，不会进入分发包。

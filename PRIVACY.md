# Privacy Policy / 隐私政策

_Last updated: 2026-04-29_

## English

**QR Code for Mobile** ("the extension") is a browser extension that generates a QR code for the URL of the active browser tab and can substitute the URL's origin (scheme + host + port) using user-defined mapping rules.

### What data the extension accesses

- **The URL of the currently active tab.** The extension reads this URL only when you click the toolbar icon, in order to generate a QR code from it. The URL is used in-memory and is not persisted, transmitted, or shared.
- **User-defined mapping rules.** Pairs of `from`/`to` origins that you enter in the options page. These are stored locally in your browser via `chrome.storage.sync`. If you are signed in to a Microsoft / Google account, the browser may sync them across your own devices using its built-in sync mechanism. The extension itself does not operate any server.

### What data the extension does NOT do

- We do not collect, transmit, store on remote servers, sell, or share any personal data.
- We do not track browsing history.
- We do not use analytics, telemetry, advertising, or third-party tracking SDKs.
- We do not make any network requests to servers controlled by us.

### Permissions explained

- `activeTab` — required to read the URL of the current tab when you open the popup.
- `storage` — required to save your mapping rules locally.

### Data retention

Mapping rules persist until you delete them in the options page or uninstall the extension. The browser-controlled sync storage is cleared when you uninstall.

### Contact

If you have questions about this policy, please open an issue on the project repository.

---

## 简体中文

**QR Code for Mobile**（下称「本扩展」）是一款浏览器扩展，用于把当前标签页 URL 生成二维码，并按用户配置的映射规则（仅作用于协议+主机+端口）替换地址。

### 本扩展访问的数据

- **当前标签页的 URL**：仅在你点击工具栏图标时读取一次，用于生成二维码；该 URL 仅在内存中使用，不会被持久化、上传或共享。
- **用户配置的映射规则**：你在配置页输入的「源域名 → 目标域名」对，通过 `chrome.storage.sync` 保存在浏览器本地。若你登录了 Microsoft / Google 账号，浏览器自带的同步机制可能会跨你自己的设备同步。本扩展自身不运行任何服务器。

### 本扩展不做的事

- 不收集、不上传、不在远程服务器存储、不出售、不共享任何个人数据。
- 不跟踪浏览历史。
- 不使用分析、遥测、广告或任何第三方跟踪 SDK。
- 不向任何由本扩展作者控制的服务器发起网络请求。

### 权限说明

- `activeTab`：在打开弹窗时读取当前标签页的 URL。
- `storage`：把映射规则保存到本地浏览器存储。

### 数据保留

映射规则会一直保留，直到你在配置页删除，或卸载扩展。浏览器自带的同步存储会在你卸载扩展时一并清除。

### 联系方式

如对本政策有疑问，请在项目仓库提 Issue。

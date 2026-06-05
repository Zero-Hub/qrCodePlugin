// 共享：域名映射规则的存取与匹配逻辑
// popup.js 与 options.js 都通过 <script src="../shared/mapping.js"> 引入，
// 函数挂在 window.QRMapping 命名空间下。

(function () {
  'use strict';

  // 规范化用户输入为 base（origin + 路径前缀）；非法时返回 null
  // 返回 { origin, path, base } —— path 去掉末尾斜杠（根路径归一化为空串），
  // base = origin + path，丢弃查询与锚点。
  // 仅输入 origin（如 http://127.0.0.1:5500）时 path 为 ''，等价于旧的纯 origin 行为。
  function normalizeBase(input) {
    if (!input || typeof input !== 'string') return null;
    try {
      const u = new URL(input.trim());
      const path = u.pathname.replace(/\/+$/, ''); // 去掉末尾斜杠，'/' → ''
      return { origin: u.origin, path: path, base: u.origin + path };
    } catch {
      return null;
    }
  }

  // 兼容旧调用：仅规范化为 origin
  function normalizeOrigin(input) {
    const b = normalizeBase(input);
    return b ? b.origin : null;
  }

  // 判断 path 是否在「段边界」上以 prefix 开头：
  //   prefix='' 匹配任意 path；否则要求 path 等于 prefix 或以 prefix + '/' 开头。
  //   这样 /static-design 命中 /static-design 与 /static-design/foo，但不命中 /static-designX。
  function pathUnder(path, prefix) {
    if (prefix === '') return true;
    return path === prefix || path.startsWith(prefix + '/');
  }

  // 在 mappings 中匹配并替换：先比 origin，再按路径前缀（段边界）匹配；
  // 命中后剥掉源前缀、拼到目标 base 之后，路径剩余部分与查询/锚点保持不变。
  // 多条规则命中时，路径前缀更长（更具体）的优先；同长按列表先后。
  // 返回 { url, hit } —— hit 为命中的规则对象或 null。
  function applyMapping(originalUrl, mappings) {
    try {
      const u = new URL(originalUrl);
      const list = Array.isArray(mappings) ? mappings : [];
      // 预解析 + 过滤无效/未启用，并按前缀具体度降序排序（不改动原数组）
      const candidates = list
        .map(r => ({ rule: r, from: r && r.enabled ? normalizeBase(r.from) : null }))
        .filter(c => c.from && c.from.origin === u.origin && pathUnder(u.pathname, c.from.path))
        .sort((a, b) => b.from.path.length - a.from.path.length);

      const c = candidates[0];
      if (!c) return { url: originalUrl, hit: null };

      const toBase = normalizeBase(c.rule.to);
      const toPart = toBase ? toBase.base : c.rule.to;
      const remainder = u.pathname.slice(c.from.path.length); // 剥掉源前缀
      const mappedUrl = toPart + remainder + u.search + u.hash;
      return { url: mappedUrl, hit: c.rule };
    } catch {
      return { url: originalUrl, hit: null };
    }
  }

  async function loadMappings() {
    const { mappings } = await chrome.storage.sync.get('mappings');
    return Array.isArray(mappings) ? mappings : [];
  }

  async function saveMappings(mappings) {
    await chrome.storage.sync.set({ mappings: mappings });
  }

  function newId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'r-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  window.QRMapping = {
    normalizeBase,
    normalizeOrigin,
    applyMapping,
    loadMappings,
    saveMappings,
    newId
  };
})();

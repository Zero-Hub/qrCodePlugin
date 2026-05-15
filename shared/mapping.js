// 共享：域名映射规则的存取与匹配逻辑
// popup.js 与 options.js 都通过 <script src="../shared/mapping.js"> 引入，
// 函数挂在 window.QRMapping 命名空间下。

(function () {
  'use strict';

  // 规范化用户输入为合法 origin；非法时返回 null
  function normalizeOrigin(input) {
    if (!input || typeof input !== 'string') return null;
    try {
      // 用户可能输入带路径或末尾斜杠，URL 解析后只取 origin
      return new URL(input.trim()).origin;
    } catch {
      return null;
    }
  }

  // 在 mappings 中按 origin 完整匹配，命中即停；未命中返回原 URL
  // 返回 { url, hit } —— hit 为命中的规则对象或 null
  function applyMapping(originalUrl, mappings) {
    try {
      const u = new URL(originalUrl);
      const list = Array.isArray(mappings) ? mappings : [];
      const rule = list.find(r => r && r.enabled && r.from === u.origin);
      if (!rule) return { url: originalUrl, hit: null };
      const mappedUrl = rule.to + u.pathname + u.search + u.hash;
      return { url: mappedUrl, hit: rule };
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
    normalizeOrigin,
    applyMapping,
    loadMappings,
    saveMappings,
    newId
  };
})();

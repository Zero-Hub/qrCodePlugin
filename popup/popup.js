// 弹窗逻辑：取当前 tab URL → 应用映射 → 画二维码
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const els = {
    qr:        $('#qrcode'),
    error:     $('#error-box'),
    toggle:    $('#toggle-mapping'),
    mappedUrl: $('#mapped-url'),
    rawUrl:    $('#raw-url'),
    btnCopy:   $('#btn-copy'),
    btnOpts:   $('#btn-options'),
    noRuleTip: $('#no-rule-tip'),
    mappedLbl: $('#mapped-label'),
    toast:     $('#toast')
  };

  let state = {
    rawUrl: '',
    mappings: [],
    qr: null
  };

  async function getActiveTabUrl() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab && tab.url ? tab.url : '';
  }

  function isQrAble(url) {
    // 只对 http(s) 页面生成；chrome:// edge:// about: file: 等都跳过
    return /^https?:\/\//i.test(url);
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.classList.remove('hidden');
    els.qr.innerHTML = '';
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove('hidden');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.add('hidden'), 1200);
  }

  function drawQr(text) {
    els.qr.innerHTML = '';
    state.qr = new QRCode(els.qr, {
      text: text,
      width: 240,
      height: 240,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  function render() {
    const useMapping = els.toggle.checked;
    const result = useMapping
      ? QRMapping.applyMapping(state.rawUrl, state.mappings)
      : { url: state.rawUrl, hit: null };

    els.rawUrl.textContent = state.rawUrl;
    els.mappedUrl.textContent = result.url;

    if (!useMapping) {
      els.mappedLbl.textContent = '当前二维码内容（已临时禁用映射）';
      els.noRuleTip.classList.add('hidden');
    } else if (result.hit) {
      els.mappedLbl.textContent = '映射后地址';
      els.noRuleTip.classList.add('hidden');
    } else {
      els.mappedLbl.textContent = '当前二维码内容';
      els.noRuleTip.classList.remove('hidden');
    }

    drawQr(result.url);
  }

  async function init() {
    try {
      state.rawUrl = await getActiveTabUrl();
    } catch (e) {
      showError('无法获取当前标签页：' + (e.message || e));
      return;
    }

    if (!state.rawUrl) {
      showError('未取到当前标签页地址。');
      return;
    }

    if (!isQrAble(state.rawUrl)) {
      showError('当前页面不支持生成二维码（仅支持 http/https 网址）。');
      els.rawUrl.textContent = state.rawUrl;
      return;
    }

    state.mappings = await QRMapping.loadMappings();
    render();
  }

  els.toggle.addEventListener('change', () => {
    if (!isQrAble(state.rawUrl)) return;
    render();
  });

  els.btnCopy.addEventListener('click', async () => {
    const text = els.mappedUrl.textContent || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制');
    } catch {
      // 降级：使用临时 textarea
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); showToast('已复制'); }
      catch { showToast('复制失败'); }
      document.body.removeChild(ta);
    }
  });

  els.btnOpts.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  init();
})();

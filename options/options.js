// 配置页逻辑：加载/编辑/保存映射规则
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const els = {
    list:    $('#rules-list'),
    btnAdd:  $('#btn-add'),
    btnSave: $('#btn-save'),
    status:  $('#status')
  };

  // 内存中的草稿；保存时校验并写入 storage
  let draft = [];

  function setStatus(text, kind) {
    els.status.textContent = text || '';
    els.status.classList.remove('ok', 'err');
    if (kind) els.status.classList.add(kind);
  }

  function render() {
    els.list.innerHTML = '';
    if (draft.length === 0) {
      const tip = document.createElement('div');
      tip.className = 'empty-tip';
      tip.textContent = '暂无规则，点击下方「+ 新增规则」开始配置';
      els.list.appendChild(tip);
      return;
    }

    draft.forEach((rule, idx) => {
      const row = document.createElement('div');
      row.className = 'rule-row';
      row.dataset.id = rule.id;
      row.innerHTML = `
        <span class="col-en"><input type="checkbox" data-field="enabled" ${rule.enabled ? 'checked' : ''} /></span>
        <input type="text" data-field="from" placeholder="http://127.0.0.1:5500/static-design" />
        <span class="col-arrow">→</span>
        <input type="text" data-field="to"   placeholder="https://static.example.com" />
        <span class="col-act"><button type="button" class="btn-del" data-idx="${idx}">删除</button></span>
      `;
      // 设置值（避免插值时引号转义问题）
      row.querySelector('input[data-field="from"]').value = rule.from || '';
      row.querySelector('input[data-field="to"]').value = rule.to || '';
      els.list.appendChild(row);
    });
  }

  function readBackToDraft() {
    const rows = els.list.querySelectorAll('.rule-row');
    rows.forEach((row, idx) => {
      const r = draft[idx];
      if (!r) return;
      r.enabled = row.querySelector('input[data-field="enabled"]').checked;
      r.from    = row.querySelector('input[data-field="from"]').value.trim();
      r.to      = row.querySelector('input[data-field="to"]').value.trim();
    });
  }

  function clearInvalidMarks() {
    els.list.querySelectorAll('.rule-row.invalid')
      .forEach(r => r.classList.remove('invalid'));
  }

  function markRowInvalid(idx) {
    const rows = els.list.querySelectorAll('.rule-row');
    if (rows[idx]) rows[idx].classList.add('invalid');
  }

  // 校验 + 规范化；返回 { ok, message, normalized? }
  // 源/目标按 base（origin + 路径前缀）保存，支持带路径前缀的映射。
  function validateAndNormalize() {
    const seenFrom = new Map(); // base -> idx
    const out = [];

    for (let i = 0; i < draft.length; i++) {
      const r = draft[i];
      // 允许整行空白：跳过保存（视作未填写）
      if (!r.from && !r.to) continue;

      const fromBase = QRMapping.normalizeBase(r.from);
      const toBase   = QRMapping.normalizeBase(r.to);

      if (!fromBase) {
        markRowInvalid(i);
        return { ok: false, message: `第 ${i + 1} 行「源地址」不是合法 URL（示例：http://127.0.0.1:5500 或 http://127.0.0.1:5500/static-design）` };
      }
      if (!toBase) {
        markRowInvalid(i);
        return { ok: false, message: `第 ${i + 1} 行「目标地址」不是合法 URL（示例：https://static.example.com）` };
      }
      if (fromBase.base === toBase.base) {
        markRowInvalid(i);
        return { ok: false, message: `第 ${i + 1} 行源与目标相同，无意义` };
      }
      if (seenFrom.has(fromBase.base)) {
        markRowInvalid(i);
        return { ok: false, message: `第 ${i + 1} 行源地址 ${fromBase.base} 与第 ${seenFrom.get(fromBase.base) + 1} 行重复` };
      }
      seenFrom.set(fromBase.base, i);

      out.push({
        id: r.id || QRMapping.newId(),
        from: fromBase.base,
        to: toBase.base,
        enabled: r.enabled !== false
      });
    }

    return { ok: true, normalized: out };
  }

  async function init() {
    const stored = await QRMapping.loadMappings();
    draft = stored.map(r => ({
      id: r.id || QRMapping.newId(),
      from: r.from || '',
      to: r.to || '',
      enabled: r.enabled !== false
    }));
    render();
  }

  els.btnAdd.addEventListener('click', () => {
    readBackToDraft();
    draft.push({ id: QRMapping.newId(), from: '', to: '', enabled: true });
    render();
    // 自动聚焦新增行的 from 输入
    const rows = els.list.querySelectorAll('.rule-row');
    const last = rows[rows.length - 1];
    if (last) last.querySelector('input[data-field="from"]').focus();
  });

  els.list.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.classList.contains('btn-del')) {
      const idx = Number(target.dataset.idx);
      readBackToDraft();
      draft.splice(idx, 1);
      render();
    }
  });

  els.btnSave.addEventListener('click', async () => {
    setStatus('');
    clearInvalidMarks();
    readBackToDraft();
    const result = validateAndNormalize();
    if (!result.ok) {
      setStatus(result.message, 'err');
      return;
    }
    try {
      await QRMapping.saveMappings(result.normalized);
      // 用规范化后的结果替换草稿，让界面也展示清理后的 origin
      draft = result.normalized.map(r => ({ ...r }));
      render();
      setStatus(`已保存 ${result.normalized.length} 条规则`, 'ok');
    } catch (e) {
      setStatus('保存失败：' + (e.message || e), 'err');
    }
  });

  init();
})();

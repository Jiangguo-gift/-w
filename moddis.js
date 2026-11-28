/* ═══════════════════════════════════════════════════════════
   moddis.js —— 非数据类模块的「提炼卡」（Module Distillation Card）
   2026-09-24 本人指令：
     「每个非数据项的模块具体内容呈现方式参考如图参考做多样化内容呈现：
       核心重要信息做提炼梳理，让每个模块更清晰直观。」
     参考图（image-7c826d2a.png）：大标题 + 分类 chips + 两列卡片
     （左侧 ✓/○ 结论清单，右侧动作条目）+ 两侧小注解。

   本文件负责：
     ① 定义「数据类模块」白名单 DATA_MODS —— 这几张页本身已经在展示大量
        原生数字/图表/看板，不再套一层提炼卡；
     ② 其余所有模块（≈▇▇张）在原有 sumBar + 内容之前，先呈现一张
        提炼卡：眉标（区名+编号）、大标题、一句话结论、分类 chips、
        左列「核心提炼」清单、右列「你可以立刻做的」动作条；
     ③ 提炼卡数据全部来自 MOD.SUM[id] + MOD.SPEC[id] + OS.BY[id]，
        与「模块本身内容 / 侧栏 / 按钮组件」零冲突；
     ④ 视觉与 ovhero / zonehero 同族（chips / stat / group 样式复用），
        统一「上方汇总 + 下方队列」的呈现范式。
   ═══════════════════════════════════════════════════════════ */
window.MODDIS = (function () {

  /* 数据类模块：页面主体已经在展示数字 / 看板 / 大盘，
     再套提炼卡会「上下两个头」，不符合她「更清晰直观」的诉求。 */
  const DATA_MODS = new Set([
    'base',    /* Ⅳ 目标与业绩达成：整页都是业绩数字 */
    'm_data',  /* Ⅳ 底仓数据能力：看板矩阵 */
    'deck',    /* Ⅰ 自运行工作流进展：整套 SYS/HQ 组件 */
    'alert'    /* Ⅰ 今日更新动态：动态流本身即为呈现 */
  ]);

  /* fb_* 是四张反馈入口，本身极简（一个输入框 + 提交），
     不适合再前置一张提炼卡；但保留一个简化壳，只出眉标 + 一句话导读。 */
  const FB_MODS = new Set(['fb_ov','fb_mind','fb_sys','fb_biz']);

  function isData(id) { return DATA_MODS.has(id); }

  function strip(html) {
    return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
  function escSafe(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function shorten(s, n) {
    s = strip(s);
    if (!n || s.length <= n) return s;
    return s.slice(0, n - 1) + '…';
  }

  /* 把 SPEC.can[] 前几条压成 chip 短标签
     can 的结构是 [label, desc]，label 通常本身就是一句短判断，
     太长会挤爆，取前 ▇▇ 字并去掉末尾标点 */
  function chipsFrom(v) {
    if (!v || !v.can || !v.can.length) return [];
    return v.can.slice(0, 6).map(c => {
      const t = shorten((c && c[0]) || '', 14);
      return t.replace(/[，。；、!？]$/, '');
    }).filter(Boolean);
  }

  /* 左列「核心提炼」条目：结论、为什么、还卡着、+ 最多 ▇▇条 pts */
  function leftItems(s, v) {
    const list = [];
    if (s && s.now) list.push({ tone: 'ok',   k: '本页结论',      t: s.now });
    if (s && s.why) list.push({ tone: 'ok',   k: '为什么这样看',  t: s.why });
    if (s && s.dep) list.push({ tone: 'todo', k: '还卡着',        t: s.dep });
    if (v && v.value && !s) list.push({ tone: 'ok', k: '这一页干什么', t: v.value });
    const pts = (v && v.key && v.key.pts) || [];
    pts.slice(0, 2).forEach(p => {
      if (p && p[0]) list.push({ tone: 'ok', k: strip(p[0]), t: p[1] || '' });
    });
    return list;
  }

  /* 右列「你可以立刻做的」：优先取 SPEC.do[]（[label, desc, to?]），
     缺失时回退到 SUM.act（[label, to]）当成一件事 */
  function rightItems(s, v) {
    const list = [];
    const dos = (v && v.do) || [];
    dos.slice(0, 5).forEach(d => {
      if (d && d[0]) list.push({ label: d[0], desc: d[1] || '', to: d[2] || '' });
    });
    if (!list.length && s && s.act && s.act[0]) {
      list.push({ label: s.act[0], desc: '', to: s.act[1] || '' });
    }
    return list;
  }

  /* 站内跳转 → data-jumpv；外链 → data-newtab；@block → data-goblk */
  function goAttrOf(to) {
    if (!to) return '';
    if (/^#/.test(to)) {
      const id = to.slice(1);
      if (window.OS && OS.BY && OS.BY[id]) return `data-jumpv="${id}"`;
      return `data-goblk=".${escSafe(id)}"`;
    }
    if (/^https?:/i.test(to)) return `data-newtab="${escSafe(to)}"`;
    if (/^@/.test(to))        return `data-goblk="${escSafe(to.slice(1))}"`;
    return '';
  }

  function renderChips(chips) {
    if (!chips.length) return '';
    return `<div class="mxdi__chips" role="list" aria-label="核心能力标签">
      ${chips.map(c => `<span class="mxdi__chip" role="listitem">${escSafe(c)}</span>`).join('')}
    </div>`;
  }

  function renderLeft(items) {
    if (!items.length) return '';
    return `<div class="mxdi__col mxdi__col--left">
      <div class="mxdi__ch">核心提炼</div>
      <ul class="mxdi__list">
        ${items.map(it => `<li class="mxdi__li is-${it.tone}">
          <span class="mxdi__ic" aria-hidden="true">${it.tone === 'ok' ? '✓' : '○'}</span>
          <div class="mxdi__li_b">
            <b class="mxdi__li_k">${escSafe(strip(it.k))}</b>
            <span class="mxdi__li_t">${it.t}</span>
          </div>
        </li>`).join('')}
      </ul>
    </div>`;
  }

  function renderRight(items) {
    if (!items.length) return '';
    return `<div class="mxdi__col mxdi__col--right">
      <div class="mxdi__ch">你可以立刻做的</div>
      <ol class="mxdi__do">
        ${items.map(it => `<li class="mxdi__doi">
          <button class="mxdi__act" type="button" ${goAttrOf(it.to)}>
            <span class="mxdi__act_lbl">
              <span class="mxdi__act_t">${it.label}</span>
              ${it.desc ? `<span class="mxdi__act_d">${it.desc}</span>` : ''}
            </span>
            <i class="mxdi__act_go" aria-hidden="true">→</i>
          </button>
        </li>`).join('')}
      </ol>
    </div>`;
  }

  /* fb_* 页专用：只呈现一段简介，不套两列卡（免得空一半） */
  function renderFb(id, meta) {
    return `<section class="mxdi mxdi--fb" data-mod="mx-di-${id}">
      <div class="mxdi__eyebrow">${escSafe((meta.gt || '') + (meta.n ? ' · 编号 ' + meta.n : ''))}</div>
      <h3 class="mxdi__title">${escSafe(meta.t || id)}</h3>
      <p class="mxdi__sub">${escSafe(strip(meta.q || '') || '本区反馈入口 · 提交后自动进本区队列，我这边立刻收到。')}</p>
    </section>`;
  }

  function card(id) {
    if (!id || isData(id)) return '';
    const MOD = window.MOD || {};
    const s = (MOD.SUM || {})[id];
    const v = (MOD.SPEC || {})[id];
    const meta = (window.OS && OS.BY && OS.BY[id]) || {};

    if (!s && !v && !meta.t) return '';
    if (FB_MODS.has(id)) return renderFb(id, meta);

    const title    = meta.t || id;
    const eyebrow  = (meta.gt || '') + (meta.n ? ' · 编号 ' + meta.n : '');
    const subLine  = (s && s.now) ? s.now
                    : (v && v.value) ? v.value
                    : (meta.q || '');

    const chips = chipsFrom(v);
    const left  = leftItems(s, v);
    const right = rightItems(s, v);

    /* 只有一列有内容时，另一列不占位，body 网格降为一列 */
    const bodyMode = (left.length && right.length) ? 'two' : (left.length || right.length) ? 'one' : 'none';
    const body = bodyMode === 'none' ? '' : `<div class="mxdi__body" data-cols="${bodyMode}">
      ${renderLeft(left)}${renderRight(right)}
    </div>`;

    return `<section class="mxdi" data-mod="mx-di-${id}" data-grp="${escSafe(meta.grp || '')}">
      <header class="mxdi__head">
        ${eyebrow ? `<div class="mxdi__eyebrow" data-grp="${escSafe(meta.grp || '')}">${escSafe(eyebrow)}</div>` : ''}
        <h3 class="mxdi__title">${escSafe(title)}</h3>
        ${subLine ? `<p class="mxdi__sub">${subLine}</p>` : ''}
        ${renderChips(chips)}
      </header>
      ${body}
    </section>`;
  }

  return { card, isData, DATA_MODS, FB_MODS };
})();

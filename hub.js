/* ═══════════════════════════════════════════════════════════
   hub.js —— 「我能装的技能」（自生长与高阶能力 · ▇▇ 模块的内容区）
   2026-09-13 本人指令：
     「参考此图方式，从外站汇总目前高热度、高收藏的 SKILL 技能、
       「常用指令模板」；也可以直接调用 findskills 看哪些最适合我。」

   所以这里是一个卡片墙：分类切换 + 搜索 + 卡片（标签/名称/一句话/热度/来源）。
   点一张卡才展开「对你来说怎么用」和动作按钮 —— 平时不占地方。

   三类来源分开摆，口径各自标清：
     我已经装好的   Aime 空间实测清单，说一句就能用
     一句话就能装   Aime 精选市场候选，装之前一定先问你
     外站高热       GitHub / 官方文档 / Obsidian 官方统计，2026-09-13 观察值

   ⛔ 不放业绩数字（归口铁律：金额只在业务基本盘）。
   ⛔ 不放我的取舍过程，只放你能看懂能用的东西。
   ═══════════════════════════════════════════════════════════ */
window.HUB = (function () {

  const S = { tab: 'all', q: '' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const D = () => (window.HUBDATA || []);
  const T = () => (window.HUBTABS || []);

  function hit(c) {
    if (S.tab !== 'all' && c.k !== S.tab) return false;
    const q = S.q.trim().toLowerCase();
    if (!q) return true;
    return [c.t, c.en, c.d, c.tag, c.use].join(' ').toLowerCase().indexOf(q) >= 0;
  }

  function card(c, i) {
    const open = c._open ? ' is-open' : '';
    const act = c.act || [];
    const btn = act[0] === 'link'
      ? `<a class="btn btn--solid hub__go" href="${esc(act[2])}" target="_blank" rel="noopener">${esc(act[1])}</a>`
      : `<button class="btn btn--solid hub__go" data-hubcopy="${i}">${esc(act[1])}</button>`;
    return `<article class="hub__c${open}" data-hub="${i}" data-k="${c.k}" tabindex="0">
      <div class="hub__top">
        <span class="hub__tag">${esc(c.tag)}</span>
        <span class="hub__ic" aria-hidden="true">${esc(c.ic)}</span>
      </div>
      <h4 class="hub__t">${esc(c.t)}${c.rec ? '<em class="hub__rec">推荐</em>' : ''}</h4>
      ${c.en && c.en !== c.t ? `<div class="hub__en">${esc(c.en)}</div>` : ''}
      <p class="hub__d">${esc(c.d)}</p>
      <div class="hub__foot">
        <span class="hub__m"><i>${esc(c.ml)}</i>${esc(c.mv)}</span>
        <span class="hub__v">${esc(c.sub)}</span>
      </div>
      <div class="hub__more">
        <div class="hub__use"><b>对你来说怎么用</b>${esc(c.use)}</div>
        ${c.note ? `<div class="hub__note">${esc(c.note)}</div>` : ''}
        <div class="hub__acts">${btn}
          ${act[0] === 'copy' ? `<code class="hub__cmd" id="hubcmd${i}">${esc(act[2])}</code>` : ''}
        </div>
      </div>
    </article>`;
  }

  function render() {
    const all = D();
    if (!all.length) return '';
    const cnt = k => k === 'all' ? all.length : all.filter(c => c.k === k).length;
    const tabs = T().map(t => `<button class="hub__tab${S.tab === t[0] ? ' is-on' : ''}" data-hubtab="${t[0]}">
      ${esc(t[1])}<i>${cnt(t[0])}</i></button>`).join('');
    const sub = (T().find(t => t[0] === S.tab) || [])[2] || '';
    const list = all.map((c, i) => [c, i]).filter(p => hit(p[0]));
    const grid = list.length
      ? `<div class="hub__grid${list.some(p => p[0]._open) ? ' has-open' : ''}">${list.map(p => card(p[0], p[1])).join('')}</div>`
      : `<div class="hub__none">没有匹配的能力 —— 换个词，或者直接告诉我你缺什么，我去找现成的装。</div>`;

    return `<section class="hub" data-mod="mx-hub">
      <div class="hub__h">
        <div>
          <div class="hub__h1">「我能装的技能」<span>${all.length} 项 · 点一张卡看怎么用</span></div>
          <div class="hub__stamp">已装清单取自 Aime 空间实测 2026-09-13 当晚（共 ▇▇ 项：你的 ▇▇ + 系统 ▇▇，其中你的停用 ▇▇）·本轮新装拜访军师、开回研究报告、打通 Obsidian 常连 ·
            精选市场「被收藏」= 被多少个空间添加 · 外站数字取自 GitHub / 官方文档 / Obsidian 官方统计，2026-09-13 观察值，星标每天在动</div>
        </div>
        <div class="hub__qbox">
          <input class="hub__q" id="hubQ" type="search" placeholder="搜能力 / 场景…　例：拜访、提案、取数、Obsidian" value="${esc(S.q)}" autocomplete="off">
        </div>
      </div>
      <div class="hub__tabs">${tabs}</div>
      ${sub ? `<div class="hub__tabnote">${esc(sub)}</div>` : ''}
      ${grid}
      <div class="hub__foot2">
        <b>要装哪个，回我一句就行</b>
        <span>精选市场的技能我不会自己装 —— 你点头我才动手；外站的东西我先读懂再决定要不要给你做成本地能力。</span>
      </div>
    </section>`;
  }

  /* 事件：一次性委托，重渲染不会重复绑定 */
  let wired = false;
  function wire() {
    if (wired) return; wired = true;

    document.addEventListener('click', e => {
      const tab = e.target.closest('[data-hubtab]');
      if (tab) { S.tab = tab.dataset.hubtab; S.q = (document.getElementById('hubQ') || {}).value || S.q; repaint(); return; }

      const cp = e.target.closest('[data-hubcopy]');
      if (cp) {
        e.stopPropagation();
        const el = document.getElementById('hubcmd' + cp.dataset.hubcopy);
        const txt = el ? el.textContent : '';
        navigator.clipboard?.writeText(txt).then(
          () => { const t0 = cp.textContent; cp.textContent = '已复制'; window.toast && toast('话术已复制，直接发我'); setTimeout(() => cp.textContent = t0, 1600); },
          () => window.toast && toast('复制失败，请手动选中')
        );
        return;
      }

      if (e.target.closest('.hub__go')) return;
      const c = e.target.closest('.hub__c');
      if (c) {
        const i = +c.dataset.hub;
        const d = D()[i];
        if (d) d._open = !d._open;
        c.classList.toggle('is-open');
        const g = c.parentElement;
        if (g) g.classList.toggle('has-open', !!g.querySelector('.hub__c.is-open'));
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const c = document.activeElement && document.activeElement.closest && document.activeElement.closest('.hub__c');
      if (!c) return;
      e.preventDefault(); c.click();
    });

    document.addEventListener('input', e => {
      if (!e.target.matches('.hub__q')) return;
      S.q = e.target.value; repaint(true);
    });
  }

  /* 只重画商店这一块，不动整页 */
  function repaint(keepFocus) {
    const host = document.querySelector('.hub');
    if (!host) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = render();
    const next = wrap.firstElementChild;
    if (!next) return;
    host.replaceWith(next);
    if (keepFocus) {
      const q = document.getElementById('hubQ');
      if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    }
  }

  wire();
  return { render, repaint };
})();

/* ═══════════════════════════════════════════════════════════
   dash.js —— 内容区仪表盘化（配 v28.css）
   2026-09-18 本人指令（附参考图）：
     「参考此图的呈现结构，结合可视化看板及组合方式，让工作台的内容部分
       更直观，更清楚呈现当前模块的核心内容
       （不要动左侧边栏跟顶部标签栏，以及当前的按钮组件）」

   做四件事，全部是**重排与可视化**，不产生任何新内容：
     ① 五张固定信息卡（本页结论 / 数据来源 / 能力清单 / 可执行动作 / 待你拍板）内容区从"竖着一条流"改成**卡片墙**：紧凑块两栏并排，重块独占整宽；
     ② 每页「重要信息汇总」的第一个数字升级成**主数字卡**（反色 + 环形进度）；
     ③ 其余数字排成**指标条**，带百分比的补一条比例细条；
     ④ 文字要点改成**双列卡片**，按语义上色（风险 / 已成立 / 被推翻 / 口径）。

   ⛔ 铁律（她这条指令里明确点了的）：
      · 左侧边栏（.rail / .osnav）一个字不动 —— 本文件不碰 rail 内任何节点；
      · 顶部标签栏（.topbar 与三级固定条 SUBNAV）不动 —— 块的类名、id、
        在 .cgrp 里的归属全部保持原样，导航是从这些读出来的；
      · 现有按钮组件不动 —— .mxsum__go / .cgrp__a / .btn / .mxgo 一律不改不移；
      · 不新增数字、不改口径、不删内容：主数字卡里的数字节点是**搬过去的**，
        不是复制的，所以页面上不会同一个数出现两次。
   载入顺序：必须在 grp.js 之后（要等五张固定信息卡（本页结论 / 数据来源 / 能力清单 / 可执行动作 / 待你拍板）搬完 DOM）。
   ═══════════════════════════════════════════════════════════ */
window.DASH = (function () {

  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ── 宽度表：哪些块独占整宽、哪些块可以两栏并排 ──────────
     判断依据是"这块内容本身宽不宽"，不是它有多重要：
     内部本来就是多列网格 / 长表 / 图表的，挤成半栏就没法看了。 */
  const FULL = [
    '.mxsum', '.mxk', '.viz', '.rv', '.wk', '.cat', '.rul', '.hub', '.mxcmd',
    '.gate', '.pl--mode', '.pl--dom', '.pl--sig', '.cext', '.bzv', '.pat', '.spk',
    '.recmap', '.hqn', '.mxask', '.sysrun', '.sysflow', '.netnow', '.netcan',
    '.netsame', '.cpseg', '.eco__sec--facts', '.eco__sec--opp', '.eco__sec--dig',
    '#bzboards', '#bzsrc', '[data-mod="m-advice"]', '[data-mod="m-bizmoves"]',
    '[data-mod="m-bizevd"]', '[data-mod="m-bizcal"]', '.review', '.dcards'
  ];
  const HALF = [
    '.hqd', '.hqa', '.hqp', '.pgt', '.pgv', '.pgp', '.dnl', '.dvi', '.mxlnk',
    '.vst', '.vlog', '.netgap', '.ownmine', '.ownask', '.pchk', '.bizs', '.q4dr',
    '.eco__sec--fr', '.eco__sec--avoid', '.pl--cant', '.pl--role', '.recno',
    '.recgrill', '[data-mod="m-inbox"]'
  ];
  const hit = (el, list) => list.some(s => { try { return el.matches(s); } catch (e) { return false; } });

  /* 没在表里的块按体量估：短块可以并排，长块独占
     （用文字长度判断，不量像素 —— 没显示的页面量不出高度） */
  function widthOf(el) {
    if (hit(el, FULL)) return 12;
    if (hit(el, HALF)) return 6;
    const n = (el.textContent || '').replace(/\s+/g, '').length;
    return n <= 1100 ? 6 : 12;
  }

  /* ── 块内的条目墙：一块里三条以上的短条目，两栏排 ──────────
     参考图里每一块都是"卡片并排"，不是一条条竖着占满整宽。
     只动排列，不动条目本身；长条目（大段正文、代码、表格行）一律不碰。 */
  const NO2COL = [
    '.mxcmd', '.dnl', '.tbl', '.mxk__nums', '.dband', '.hqp__l', '.sysrun__l',
    '.dgrid', '.kstrip', '.cgrps', '.mxk__l', '.gate__opts', '.fb', '.pal__list'
  ];
  function twoCol(block) {
    if (block.dataset.d2 || hit(block, ['.mxcmd', '.dnl'])) return;
    block.dataset.d2 = '1';
    $$('*', block).forEach(box => {
      if (box.dataset.d2c) return;
      if (hit(box, NO2COL)) return;
      if (box.closest('.mxcmd, .dnl, table')) return;
      const kids = [...box.children];
      if (kids.length < 3 || kids.length > 24) return;
      const cls = kids[0].className;
      if (!cls || !kids.every(k => k.className === cls)) return;   /* 同一批条目才排 */
      if (kids.some(k => k.querySelector('pre, table, canvas, .dchart'))) return;
      const lens = kids.map(k => (k.textContent || '').replace(/\s+/g, '').length);
      const avg = lens.reduce((a, b) => a + b, 0) / lens.length;
      if (avg > 400 || Math.max.apply(null, lens) > 900) return;
      let cs;
      try { cs = getComputedStyle(box); } catch (e) { return; }
      const tracks = String(cs.gridTemplateColumns || 'none').trim().split(/\s+/).length;
      if (cs.display === 'grid' && tracks > 1) return;             /* 人家本来就是多列 */
      if (cs.display === 'flex' && cs.flexWrap === 'wrap') return;
      box.dataset.d2c = '1';
      box.classList.add('dsh-2col');
    });
  }

  /* 孤零零一个半栏块摆在一行里，右边空一半更难看 —— 补回整宽 */
  function lone(box) {
    const kids = [...box.children];
    kids.forEach((el, i) => {
      if (el.dataset.dw !== '6') return;
      const prev = kids[i - 1], next = kids[i + 1];
      const pair = (prev && prev.dataset.dw === '6') || (next && next.dataset.dw === '6');
      if (!pair) el.dataset.dw = '▇▇';
    });
  }

  /* 本来没壳的块，进了卡片墙要有壳，否则并排时看不出边界。
     有没有壳按算出来的样式判断，不靠猜。 */
  function shell(el) {
    if (el.dataset.dsh) return;
    el.dataset.dsh = '1';
    let cs;
    try { cs = getComputedStyle(el); } catch (e) { return; }
    const bg = (cs.backgroundColor || '').replace(/\s/g, '');
    const bare = (bg === 'rgba(0,0,0,0)' || bg === 'transparent')
      && parseFloat(cs.borderTopWidth || 0) === 0
      && parseFloat(cs.borderLeftWidth || 0) === 0
      && (cs.backgroundImage === 'none' || !cs.backgroundImage);
    if (bare) el.classList.add('dsh-c');
  }

  /* ── 要点上色：按它说的是什么事上色，不做无意义的装饰色 ── */
  function tone(s) {
    s = String(s || '');
    if (/⭐|推翻|证伪/.test(s)) return 'flip';
    if (/⚠️|⛔|风险|翻车|不许|卡在|最疼|短板|缺口|止损|转负|空的|没接/.test(s)) return 'warn';
    if (/✅|已通|已打通|已裁|已实测|成立|全部做完|已清零/.test(s)) return 'ok';
    if (/口径|规则|标准|判定|分母/.test(s)) return 'info';
    return 'flat';
  }

  const pct = v => {
    const t = String((v && v.textContent) || '').replace(/\s+/g, '');
    if (!/%$/.test(t)) return null;
    const n = parseFloat(t.replace(/[^\d.\-]/g, ''));
    return isFinite(n) ? Math.max(0, Math.min(100, n)) : null;
  };

  /* ══════════ 指标带（参考图第一行那套：一个深色锚点 + 一排指标微卡）══════════
     参考图里"一眼看懂"靠三件事：① 全屏只有一张深色卡当视觉锚点；
     ② 百分比画成半圆环仪表，不用读数就知道到没到；③ 数字与说明字号差 ▇▇倍以上。
     这里把页面上本来就有的各类数字条统一按这三条重排 —— 卡片节点是**搬**的，
     数字、单位、说明文案一个字不改。 */
  const KPI = ['.mxk__nums', '.bizs__row', '.pat__stat', '.pchk__k', '.sysrun__sum', '.bzk', '.hqn__l'];
  /* 只做微卡不做锚点的计数条（暂时空着）：口径库那种"各章多少条"的卡里还带日期与新增标记，
     压成等高微卡会出现大片空白，反而更难看 —— 试过一版，撤了。 */
  const CHIP = [];
  const VAL = '.mxk__v, .hqn__v, .bzk__v, .hqp__pc, b';

  /* 数字节点：取这张卡里第一个真的是数字的元素 */
  function valOf(cell) {
    const cands = [...cell.querySelectorAll(VAL)];
    return cands.find(e => /[\d]/.test(String(e.textContent || ''))) || null;
  }

  /* 深色锚点卡：整张原卡搬进去，外面套反色壳；百分比再补一只半圆环仪表 */
  function anchor(cell, p) {
    const box = document.createElement('section');
    /* 有百分比的锚点配半圆环；没有百分比的（比如"▇▇条开放商机"）不造口径，
       改成横排：数字在左、口径说明靠右，卡片压矮，右边不空半屏 */
    box.className = 'dhero dhero--wrap' + (p === null ? ' dhero--flat' : '');
    /* ⛔ 不写 data-mod：那个属性是"内容模块的身份证"，归属 QA 会拿它查一块内容有没有
       住在两个页面里；呈现层的壳子占了这个名字会被误判成一块内容住了七处。 */
    box.dataset.dhero = '1';
    if (p !== null) {
      const g = document.createElement('div');
      g.className = 'dgauge' + (p <= 0 ? ' dgauge--zero' : (p < 70 ? ' dgauge--low' : ''));
      g.style.setProperty('--p', String(p));
      g.innerHTML = '<i class="dgauge__r"></i>';
      box.appendChild(g);
    }
    cell.parentNode.insertBefore(box, cell);
    box.appendChild(cell);              /* 搬，不复制 —— 同一个数不会出现两次 */
    cell.classList.add('dhero__cell');
    return box;
  }

  /* 描述里出现的 ±x% 包成状态胶囊：只包标签，不改一个字 */
  function pill(scope) {
    if (!scope || scope.dataset.dpill) return;
    scope.dataset.dpill = '1';
    /* ⚠️ 只认真正的涨跌号：正负号必须紧贴数字，前面不能是数字（避免把 ▇▇▇▇ 这种区间
       和 "腰部 ▇▇" 这种普通占比也包成胶囊）。⛔ 字符类里的连字符必须转义，
       否则 [+-＋－] 会被当成 + 到 ＋ 的字符区间，把中文和数字全吃进去。 */
    const rx = /((?<![\d.])[+＋\-－]\d+(?:\.\d+)?%)/;
    const walk = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
    const hits = [];
    let n;
    while ((n = walk.nextNode())) { if (rx.test(n.nodeValue || '')) hits.push(n); }
    hits.forEach(node => {
      const parts = String(node.nodeValue).split(rx);
      if (parts.length < 3) return;
      const frag = document.createDocumentFragment();
      parts.forEach(s => {
        if (rx.test(s)) {
          const b = document.createElement('b');
          b.className = 'dpill';
          b.dataset.dir = /^[+＋]/.test(s.trim()) ? 'up' : 'down';
          b.textContent = s;
          frag.appendChild(b);
        } else if (s) frag.appendChild(document.createTextNode(s));
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  /* 一条指标带：微卡等高、数字放大、百分比补细条、第一张（每页仅一张）转深色锚点 */
  function strip(box, wantAnchor) {
    if (box.dataset.dstrip) return false;
    box.dataset.dstrip = '1';
    box.classList.add('dstrip');
    const cells = [...box.children];
    let used = false;
    cells.forEach((c, i) => {
      c.classList.add('dcell');
      const v = valOf(c);
      const p = v ? pct(v) : null;
      if (v) {
        v.classList.add('dcell__v');
        const raw = String(v.textContent || '').replace(/\s+/g, '');
        if (/^[+＋]/.test(raw)) c.dataset.trend = 'up';
        else if (/^[-－]/.test(raw)) c.dataset.trend = 'down';
      }
      if (p !== null && !c.querySelector('.dbar')) {
        const bar = document.createElement('div');
        bar.className = 'dbar' + (p <= 0 ? ' dbar--zero' : (p < 70 ? ' dbar--low' : ''));
        bar.innerHTML = '<i style="width:' + p + '%"></i>';
        c.appendChild(bar);
      }
      pill(c);
      if (i === 0 && wantAnchor && !used) { anchor(c, p); used = true; }
    });
    /* 微卡数量交给 CSS：▇▇张就排 ▇▇ 列，▇▇张就排两行 ▇▇ 列 ——
       auto-fit 会把第 ▇▇张甩到第二行左边，右边空半屏，看着像漏排版 */
    box.dataset.dn = String([...box.children].filter(c => !c.dataset.dhero).length);
    return used;
  }

  /* 要点双列 + 语义色（数字部分统一走上面的指标带） */
  function dashKey(mxk) {
    if (mxk.dataset.dash) return;
    mxk.dataset.dash = '1';
    $$('.mxk__l', mxk).forEach(l => {
      l.classList.add('is-dash');
      $$(':scope > li', l).forEach(li => { li.dataset.tone = tone(li.textContent); });
    });
  }

  /* 五张固定信息卡（本页结论 / 数据来源 / 能力清单 / 可执行动作 / 待你拍板）按维度上色：参考图靠低饱和色块区分数据维度，不靠读标题 */
  const TINT = { s1: '1', s2: '2', s3: '3', s4: '4', s5: '5' };

  /* 数字先出：参考图里第一屏就是指标，读图结论摆在指标后面。
     所以把"带指标带的那一块"提到它所在格子的最前面 —— 只在**同一个格子内部**换位置，
     格子的归属、顺序、名字，以及顶部三级条读的东西一个都没动。 */
  function kpiFirst(box) {
    if (box.dataset.dkpi) return;
    box.dataset.dkpi = '1';
    const kids = [...box.children];
    const i = kids.findIndex(el => KPI.some(sel => {
      try { return el.matches(sel) || el.querySelector(sel); } catch (e) { return false; }
    }));
    if (i > 0) box.insertBefore(kids[i], kids[0]);
  }

  /* ── 一次施工 ─────────────────────────────────────────── */
  function apply() {
    /* 五个格子本身也排成墙：第①格（本页结论与进展）永远整宽，
       其余格子内容短的两格并排 —— 格子的名字、顺序、归属一个都没动 */
    $$('.cgrps').forEach(wrap => {
      wrap.classList.add('is-dash');
      [...wrap.children].forEach((g, i) => {
        if (g.dataset.dw) return;
        const n = (g.textContent || '').replace(/\s+/g, '').length;
        /* 只有一句话的格子（比如"当前尚不能提供的内容"）不该占满 1600px 的一整行，
           收成一条横幅：标题在左、内容在右，看着是有意为之而不是空着半屏 */
        if (n <= 470) { g.dataset.dw = '▇▇'; g.dataset.dcompact = '1'; return; }
        g.dataset.dw = (i === 0 || n > 1400) ? '▇▇' : '6';
      });
      lone(wrap);
    });
    $$('.cgrp__b').forEach(box => {
      box.classList.add('is-dash');
      kpiFirst(box);
      [...box.children].forEach(el => {
        shell(el);
        if (!el.dataset.dw) el.dataset.dw = String(widthOf(el));
        twoCol(el);
      });
      lone(box);
    });
    $$('.mxk').forEach(dashKey);
    /* 指标带：每一页只允许一张深色锚点卡（参考图里全屏也只有一张） */
    $$('.sec').forEach(sec => {
      let anchored = !!sec.querySelector('.dhero');
      /* ⚠️ 必须按 DOM 顺序挑，不能按选择器顺序：否则锚点会落到页面深处的某条带上，
         第一屏反而没有视觉锚点。参考图里的深色卡就在第一屏。 */
      const boxes = [];
      KPI.forEach(sel => $$(sel, sec).forEach(b => {
        if (b.children.length >= 2 && boxes.indexOf(b) < 0) boxes.push(b);
      }));
      boxes.sort((a, b) => (a.compareDocumentPosition(b) & 4) ? -1 : 1);
      boxes.forEach(box => {
        const used = strip(box, !anchored && box.children.length >= 3);
        if (used) anchored = true;
      });
      CHIP.forEach(sel => { $$(sel, sec).forEach(box => { if (box.children.length >= 2) strip(box, false); }); });
      pill(sec);
    });
    /* 五张固定信息卡（本页结论 / 数据来源 / 能力清单 / 可执行动作 / 待你拍板）上色 */
    $$('.cgrps > .cgrp').forEach(g => {
      const t = TINT[g.dataset.slot || ''];
      if (t) g.dataset.tint = t;
    });
    setTimeout(() => {
      try { window.CEC_CHARTS && CEC_CHARTS.resizeAll && CEC_CHARTS.resizeAll(); } catch (e) {}
    }, 90);
  }

  function boot() {
    apply();
    /* 后面再长出来的内容（切页重渲染、筛选、采纳后刷新）照同一套摆 */
    const host = document.getElementById('sections');
    if (host && window.MutationObserver) {
      let t = 0;
      new MutationObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => { try { apply(); } catch (e) {} }, 260);
      }).observe(host, { childList: true, subtree: true });
    }
  }

  return { boot, apply, widthOf, tone };
})();

(function () {
  const go = () => { try { DASH.boot(); } catch (e) { console.warn('dash', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

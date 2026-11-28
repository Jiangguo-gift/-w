/* ═══════════════════════════════════════════════════════════
   askbox.js —— 驾驶舱头版「问一句」提问入口
   2026-09-28 首版：只做复制到剪贴板 + postMessage
   2026-09-29 本人 指令：点击提交后没有后续反馈跟处理动作，请优化
              → 新增「受理回执 · 自动路由 · 处理队列」三段闭环：
                 ① 提交后立刻在 askbox 底部生成受理卡（编号 / 状态 / 类型 / 建议路由 / 操作）
                 ② 自动识别问题类型，路由到对应技能 / 工作台模块 / Obsidian 台账
                 ③ 队列常驻，可折叠/展开/更新状态/撤回/丢给 Aime/落台账
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const HKEY = 'askbox_hist_v1';
  const QKEY = 'askbox_queue_v1';
  const TOOL_LABEL = {
    opt: '提示词优化', deep: '深度调研', ref: '引用工作台', save: '落进 Obsidian'
  };

  /* —— 自动路由规则表 —— 关键词命中即用第一条 ——
     每条：正则 / 类型 / emoji / 技能或工作台建议 / 下一步动作说明 */
  const ROUTES = [
    { rx: /(优化(一下)?(这段|这个|我的)?(提示词|prompt)|提示词(优化|改写|诊断)|怎么问|全盘分析|综合诊断|策略推演)/i,
      k: 'prompt-opt', ico: '✨', tag: '提示词优化',
      skill: 'prompt-optimizer × 工作台全盘分析',
      next: 'Aime 收到后：先校准问题目标与业务边界，再调用最匹配的技能链；缺数就列数据源，不编结论' },
    { rx: /搜(不到|不出|索)|搜『|补索引|词典|别名|路由/,
      k: 'search-fb', ico: '🔎', tag: '搜索反馈',
      skill: '导航搜索 · _系统/反馈处理台账.md',
      next: 'Aime 收到后：加别名 / 补索引 / 落条到 _系统/反馈处理台账.md，24h 内回你' },
    { rx: /(sqless|取数|明细|消耗|业绩(?![^字\s]|盘)|近\d+单|首投|口径|GMV|返点|返货)/i,
      k: 'sqless', ico: '🔢', tag: 'SQL 取数',
      skill: 'sqless-data-analysis',
      next: 'Aime 收到后：先给口径与截止日 · 再跑明细表 · 附一张简图' },
    { rx: /(提案|deck|solution-deck|演示|方案页|onepage|one[\s\-]?page|slides?)/i,
      k: 'deck', ico: '📽', tag: '客户级提案',
      skill: 'solution-deck-builder',
      next: 'Aime 收到后：先给目录页确认 · 再逐页生成 ▇▇ · 每页附一句 sales talk' },
    { rx: /(话术|开场|拜访|见客户|见机构|见达人|见面|拉近)/,
      k: 'visit', ico: '💬', tag: '拜访话术',
      skill: 'mcn-visit-copilot',
      next: 'Aime 收到后：拉情报包 · 出开场话术 + 必问问题 + 风险预警' },
    { rx: /(复盘|四件套|四大专项|周复盘|季度复盘|Q3|Q4|战报)/,
      k: 'review', ico: '🧭', tag: '复盘/战报',
      skill: 'mcn-weekly-battle-report / 复盘四件套',
      next: 'Aime 收到后：按框架起草 · 拉底表数字 · 你确认后落飞书文档' },
    { rx: /(Obsidian|翻一下|记忆库|历史沉淀|档案|旧的|之前记过|_系统|_记忆)/i,
      k: 'obsidian', ico: '📚', tag: 'Obsidian 检索',
      skill: 'obsidian-sales-brain',
      next: 'Aime 收到后：读 MEMORY.md → 下钻对应记忆册 → 给一句摘要 + 原文引用' },
    { rx: /(达人|昵称|人选|盘一下|盘|池外|明星|短剧|本地|AI创作)/,
      k: 'talent', ico: '👤', tag: '达人盘点',
      skill: '盘达人 / 达人档案',
      next: 'Aime 收到后：拉近 ▇▇ 天合作 · 内容表现 · 是否首投 · 加进达人档案' },
    { rx: /(机构|集团|MCN|机构A|机构C|客户A|服务商)/,
      k: 'org', ico: '🏛', tag: '机构档案',
      skill: '机构档案 · Q3 策略',
      next: 'Aime 收到后：拉季度业绩 + 分层 + 增减投 + 更新机构档案' },
    { rx: /(今日|今天|实时|IDA|日报|大盘|风神|看板)/,
      k: 'dash', ico: '📊', tag: '实时看板',
      skill: 'IDA 日报动态业绩看板 / 风神 aeolus',
      next: 'Aime 收到后：读今天数据 · 与目标对齐 · 标红异常 · 生成 ▇▇条 insight' },
    { rx: /(技能|安装|调用|skill|市场|扩展能力)/i,
      k: 'skill', ico: '🧩', tag: '调用技能',
      skill: 'aime-toolkit / aime-find-skills',
      next: 'Aime 收到后：查是否已装 · 未装先搜市场 · 找到后走安装流程' }
  ];

  const DEFAULT_ROUTE = {
    k: 'general', ico: '💠', tag: '一般问答',
    skill: 'Aime 主对话',
    next: 'Aime 收到后：一句话回答 · 若信息不足会追问 · 需要落台账时会主动问'
  };

  const STATUS_STEPS = [
    { k: 'accept', t: '受理' },
    { k: 'route',  t: '识别路由' },
    { k: 'copy',   t: '写剪贴板' },
    { k: 'send',   t: '发送宿主 Aime' },
    { k: 'queue',  t: '进队列' }
  ];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function readHist() {
    try { return JSON.parse(localStorage.getItem(HKEY) || '[]') || []; }
    catch (_) { return []; }
  }
  function writeHist(list) {
    try { localStorage.setItem(HKEY, JSON.stringify(list.slice(0, 5))); } catch (_) {}
  }
  function pushHist(text) {
    const list = readHist().filter(x => x && x.q !== text);
    list.unshift({ q: text, t: Date.now() });
    writeHist(list);
  }
  function readQueue() {
    try { return JSON.parse(localStorage.getItem(QKEY) || '[]') || []; }
    catch (_) { return []; }
  }
  function writeQueue(list) {
    try { localStorage.setItem(QKEY, JSON.stringify(list.slice(0, 20))); } catch (_) {}
  }
  function pushQueue(item) {
    const list = readQueue();
    list.unshift(item);
    writeQueue(list);
    renderQueueBadge();
  }
  function updateQueue(id, patch) {
    const list = readQueue();
    const i = list.findIndex(x => x.id === id);
    if (i >= 0) {
      list[i] = Object.assign({}, list[i], patch);
      writeQueue(list);
    }
    renderQueueBadge();
  }
  function removeQueue(id) {
    writeQueue(readQueue().filter(x => x.id !== id));
    renderQueueBadge();
  }

  function makeId() {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    const seq = (readQueue().filter(x =>
      new Date(x.ts).toDateString() === d.toDateString()).length + 1);
    return 'AB-' + String(d.getFullYear()).slice(-2) + p(d.getMonth() + 1) + p(d.getDate())
      + '-' + String(seq).padStart(2, '0');
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
    if (diff < 86400 && d.getDate() === now.getDate()) {
      return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  function toast(msg) {
    const el = $('#toast');
    if (!el) { alert(msg); return; }
    el.textContent = msg;
    el.classList.add('is-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('is-show'), 2200);
  }

  function autoResize(ta) {
    ta.style.height = 'auto';
    const h = Math.min(220, Math.max(60, ta.scrollHeight));
    ta.style.height = h + 'px';
  }

  function insertAtCursor(ta, text) {
    const start = ta.selectionStart || 0;
    const end = ta.selectionEnd || 0;
    const before = ta.value.slice(0, start);
    const after = ta.value.slice(end);
    ta.value = before + text + after;
    const caret = start + text.length;
    const m = text.match(/\{[^}]+\}/);
    if (m) {
      const idx = start + text.indexOf(m[0]);
      ta.selectionStart = idx;
      ta.selectionEnd = idx + m[0].length;
    } else {
      ta.selectionStart = ta.selectionEnd = caret;
    }
    ta.focus();
    autoResize(ta);
  }

  function renderHist() {
    const wrap = $('#askboxHistWrap');
    const list = $('#askboxHistList');
    if (!wrap || !list) return;
    const hist = readHist();
    if (!hist.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    list.innerHTML = hist.map((h, i) => `
      <div class="askbox__hist_item" data-idx="${i}" title="${(h.q || '').replace(/"/g, '&quot;')}">
        <span class="askbox__hist_time">${fmtTime(h.t)}</span>
        <span class="askbox__hist_txt">${(h.q || '').replace(/</g, '&lt;')}</span>
        <span class="askbox__hist_go">再问一次 →</span>
      </div>
    `).join('');
    $$('.askbox__hist_item', list).forEach(row => {
      row.addEventListener('click', () => {
        const idx = parseInt(row.dataset.idx, 10);
        const q = hist[idx] && hist[idx].q;
        const ta = $('#askboxIn');
        if (q && ta) { ta.value = q; ta.focus(); autoResize(ta); }
      });
    });
  }

  function collectPrompt(rawText, tools) {
    const tags = tools.filter(k => TOOL_LABEL[k]).map(k => `#${TOOL_LABEL[k]}`);
    const head = tags.length ? tags.join(' ') + '\n' : '';
    return head + rawText.trim();
  }

  function route(raw) {
    for (const r of ROUTES) if (r.rx.test(raw)) return r;
    return DEFAULT_ROUTE;
  }

  function stripHtml(text) {
    return String(text || '')
      .replace(/<br\s*\/?\s*>/gi, ' / ')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /* 把“当前页面 + 全盘数据层 + 新鲜度”压成一段短上下文。
     只喂可验证的事实与入口，不把整份规则库塞进 prompt。 */
  function buildWorkbenchContext() {
    const viewId = window.OS && typeof OS.cur === 'function'
      ? OS.cur()
      : (location.hash || '#m_over').slice(1);
    const view = window.OS && OS.BY && OS.BY[viewId] ? OS.BY[viewId] : null;
    const fresh = window.OPP && OPP.fresh ? OPP.fresh : {};
    const ruleMeta = window.RULDATA && RULDATA.meta ? RULDATA.meta : {};
    const hot = window.OPP && OPP.dig && Array.isArray(OPP.dig.outs)
      ? OPP.dig.outs.slice(0, 3).map(x => stripHtml(x.t)).filter(Boolean)
      : [];

    return {
      viewId,
      viewName: view ? view.t : '工作台业务模块总览',
      viewGroup: view ? view.gt : '驾驶舱全景',
      viewGoal: view ? stripHtml(view.q) : '从工作台全盘识别数据、规则、策略与落地入口',
      freshDate: fresh.last || '未读取',
      freshSource: stripHtml(fresh.src) || '以页面标注的数据源与截止日为准',
      ruleCount: ruleMeta.ruleCount || '',
      termCount: ruleMeta.termCount || '',
      hot
    };
  }

  /* prompt-optimizer 客户端编排：这里不伪装成浏览器里直接跑模型，
     而是把一句模糊需求升级成宿主 Aime 可直接执行的完整指令。 */
  function buildBusinessPrompt(raw, tools, r) {
    const shouldOptimize = tools.includes('opt') || r.k === 'prompt-opt';
    if (!shouldOptimize) return collectPrompt(raw, tools);

    const ctx = buildWorkbenchContext();
    const tags = tools.filter(k => TOOL_LABEL[k]).map(k => `#${TOOL_LABEL[k]}`).join(' ');
    const toolNeeds = [];
    if (tools.includes('deep')) toolNeeds.push('需要外部事实时做多角度调研，并给出处与时间');
    if (tools.includes('ref')) toolNeeds.push('优先读取当前工作台已加载的数据、策略与模块关系，不重复向我索要页面已有信息');
    if (tools.includes('save')) toolNeeds.push('完成后提炼“事实 / 判断 / 动作 / 待复核”，按 Obsidian 规则回写并同步记忆镜像');
    if (!toolNeeds.length) toolNeeds.push('先用最小必要信息完成；只有关键事实缺失且无法安全假设时才追问');

    const hotText = ctx.hot.length ? ctx.hot.map((x, i) => `${i + 1}. ${x}`).join('；') : '以工作台当日机会卡为准';
    const ruleSize = ctx.ruleCount || ctx.termCount
      ? `规则 ${ctx.ruleCount || '—'} 条 / 口径词 ${ctx.termCount || '—'} 个（只按需调用）`
      : '按工作台规则库与口径词典执行';

    return `${tags ? tags + '\n\n' : ''}请按两阶段处理：第一阶段只调用 prompt-optimizer 优化下面的原始需求，不执行任务；第二阶段把优化后的指令交给已识别的业务能力继续执行。最终直接给业务结果，不要只返回一段“更好看的提示词”。

【原始需求】
${raw.trim()}

【已识别的业务路由】
- 场景：${r.tag}
- 优先能力：${r.skill}
- 下一步：${r.next}

【工作台上下文】
- 使用者：本人｜MCN 及达人 C 组销售｜目标是形成可判断、可执行、可追踪的业务动作
- 当前模块：${ctx.viewGroup} / ${ctx.viewName}（${ctx.viewId}）
- 当前模块目标：${ctx.viewGoal}
- 外部大盘最近核对：${ctx.freshDate}
- 数据来源边界：${ctx.freshSource}
- 规则资产：${ruleSize}
- 当日优先机会：${hotText}

【优化与执行要求】
▇▇. 保留原始需求中的专有名词、数字、链接和 {{变量}}，不要擅自改写业务对象。
▇▇. 先识别真正目标、对象、时间范围、所需数据与交付物；把模糊说法改成可执行、可验收的指令。
▇▇. 事实、用户原话、推断必须分层；所有业务数字写清来源、口径、数据截止日。缺数就列出要查的数据源，不编数字。
▇▇. 结合工作台全盘做路由：业绩/经营分析走数据能力，机构/达人走档案与诊断，拜访走拜访作战，复盘走战报，外部变化走调研，历史事实走 Obsidian。
▇▇. 页面已有信息直接使用；若信息冲突，优先采用时间更晚且更具体的证据，并显式标注冲突。
▇▇. 输出顺序固定为：一句话结论 → 关键证据 → 建议动作（负责人/截止/验证标准）→ 风险与待复核 → 需要回写的位置。
▇▇. 能直接完成就直接完成，不把工作过程堆给我；不能自动完成的步骤要如实说明边界，不伪装定时、取数或落库成功。
▇▇. 本次附加要求：${toolNeeds.join('；')}。`;
  }

  /* 搜索问题只进右上角反馈批次：同一批里覆盖最新一条，避免占满 ▇▇个槽位。 */
  function collectSearchFeedback(raw) {
    if (!window.FB || typeof FB.submit !== 'function') return null;
    const it = FB.submit({
      kind: 'search',
      view: '驾驶舱问一句',
      topic: 'search-box-feedback',
      topicName: '搜索框问题',
      text: `来源：驾驶舱搜索/提问框\n用户描述：${raw}\n期望：修复搜索结果，必要时补索引、alias 别名与口径词典，并同步反馈处理台账。`
    });
    if (typeof FB.open === 'function') FB.open();
    return it;
  }

  /* ═══ 提交 ═══════════════════════════════ */
  function submit() {
    const ta = $('#askboxIn');
    const raw = (ta && ta.value || '').trim();
    if (!raw) { toast('先写一句话再交给 Aime～'); if (ta) ta.focus(); return; }

    const tools = $$('.askbox__tool.is-on').map(b => b.dataset.tool);
    const r = route(raw);
    const prompt = buildBusinessPrompt(raw, tools, r);
    const optimized = tools.includes('opt') || r.k === 'prompt-opt';
    const ctx = optimized ? buildWorkbenchContext() : null;
    const id = makeId();
    const ts = Date.now();
    const searchFeedback = r.k === 'search-fb' ? collectSearchFeedback(raw) : null;

    /* ▇▇. 立刻建卡：状态卡显示到 askbox 底部（叠加而不是替换输入） */
    const item = {
      id, ts, raw, prompt,
      tools, optimized, contextView: ctx ? ctx.viewName : '',
      kind: r.k, kindTag: r.tag, ico: r.ico,
      skill: r.skill,
      next: searchFeedback
        ? `已收进右上角「我的反馈」· 本批 ${FB.list().length}/${FB.MAX}，确认后点「交办给 Aime」统一提交`
        : r.next,
      status: {
        accept: 'ok',
        route:  'ok',
        copy:   'pending',
        send:   'pending',
        queue:  'pending'
      }
    };
    pushQueue(item);
    renderReceipt(item);
    pushHist(raw);
    renderHist();

    /* ▇▇. 复制到剪贴板 */
    const finishCopy = ok => {
      updateQueue(id, { status: Object.assign({}, item.status, {
        copy: ok ? 'ok' : 'fail',
        send: item.status.send,
        queue: item.status.queue
      }) });
      renderReceipt(readQueue().find(x => x.id === id));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(prompt).then(() => finishCopy(true), () => finishCopy(false));
    } else {
      try {
        const tmp = document.createElement('textarea');
        tmp.value = prompt; document.body.appendChild(tmp);
        tmp.select(); document.execCommand('copy');
        document.body.removeChild(tmp);
        finishCopy(true);
      } catch (_) { finishCopy(false); }
    }

    /* ▇▇. 发送宿主 */
    let sent = false;
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'aime.ask',
          from: 'creator-ecosystem-console',
          id, prompt, raw, tools, optimized,
          contextView: ctx ? ctx.viewName : '',
          kind: r.k, skill: r.skill, ts
        }, '*');
        sent = true;
      }
    } catch (_) {}
    updateQueue(id, { status: Object.assign({}, item.status, {
      copy: (readQueue().find(x => x.id === id) || item).status.copy,
      send: sent ? 'ok' : 'skip',
      queue: 'ok'
    }) });
    renderReceipt(readQueue().find(x => x.id === id));

    /* ▇▇. 输入框收敛 */
    if (ta) {
      ta.dataset.lastRaw = raw; /* 记住上一次，方便"撤回补充" */
      ta.value = '';
      autoResize(ta);
    }
    /* 状态卡自身高亮 */
    const rec = document.getElementById('askboxRecept');
    rec && rec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    toast(searchFeedback
      ? `已收集搜索问题 · 右上角「我的反馈」本批 ${FB.list().length}/${FB.MAX}，确认后统一交办`
      : optimized
        ? `已优化提示词并注入「${ctx.viewName}」上下文 · ${id}`
        : '已受理 · ' + id + ' → ' + r.tag + '（下方看处理进度）');
  }

  /* ═══ 受理卡渲染 ═══════════════════════════════ */
  function renderReceipt(item) {
    if (!item) return;
    const host = $('#askboxRecept');
    if (!host) return;
    host.hidden = false;
    host.dataset.id = item.id;
    const steps = STATUS_STEPS.map(s => {
      const st = (item.status || {})[s.k] || 'pending';
      const cls = 'askbox__step is-' + st;
      const ico = st === 'ok' ? '✓' : st === 'fail' ? '×' : st === 'skip' ? '·' : '⋯';
      return `<span class="${cls}"><em>${ico}</em>${s.t}</span>`;
    }).join('<span class="askbox__step_sep">›</span>');

    const rawSafe = (item.raw || '').replace(/</g, '&lt;');
    const promptSafe = (item.prompt || '').replace(/</g, '&lt;');

    host.innerHTML = `
      <div class="askbox__rec">
        <div class="askbox__rec_hd">
          <span class="askbox__rec_ic">${item.ico}</span>
          <div class="askbox__rec_hdl">
            <div class="askbox__rec_tl">
              <b>${item.id}</b>
              <span class="askbox__rec_tag">${item.kindTag}</span>
              ${item.optimized ? '<span class="askbox__rec_opt">✨ Prompt 已优化</span>' : ''}
              ${item.contextView ? `<span class="askbox__rec_ctx">📎 ${item.contextView}</span>` : ''}
              <span class="askbox__rec_time">${fmtTime(item.ts)}</span>
            </div>
            <div class="askbox__rec_q">"${rawSafe}"</div>
          </div>
          <button class="askbox__rec_x" title="从队列移除" data-id="${item.id}">×</button>
        </div>

        <div class="askbox__rec_steps">${steps}</div>

        <div class="askbox__rec_route">
          <div class="askbox__rec_route_l">
            <span class="askbox__rec_route_lbl">建议路由</span>
            <span class="askbox__rec_route_val">${item.skill}</span>
          </div>
          <div class="askbox__rec_route_next">${item.next}</div>
        </div>

        <div class="askbox__rec_ops">
          <button class="askbox__rec_btn askbox__rec_btn--primary" data-op="ask" data-id="${item.id}">
            ➤ 打开 Aime 对话（已在剪贴板）
          </button>
          <button class="askbox__rec_btn" data-op="copy" data-id="${item.id}" title="重新复制完整 prompt">↺ 复制完整指令</button>
          <button class="askbox__rec_btn" data-op="edit" data-id="${item.id}" title="回填到输入框继续改">✎ 撤回补充</button>
          <button class="askbox__rec_btn" data-op="obsi" data-id="${item.id}" title="把这条落到 _系统/反馈处理台账.md">💾 落 Obsidian 台账</button>
          <button class="askbox__rec_btn askbox__rec_btn--sub" data-op="expand" data-id="${item.id}" title="展开完整 prompt">${item.expanded ? '收起 ▴' : '看完整 prompt ▾'}</button>
        </div>

        ${item.expanded ? `<pre class="askbox__rec_full">${promptSafe}</pre>` : ''}
      </div>`;
  }

  /* ═══ 处理队列抽屉 ═══════════════════════════════ */
  function renderQueueBadge() {
    const b = document.getElementById('askboxQBadge');
    if (!b) return;
    const list = readQueue();
    const pending = list.filter(x => (x.status && (x.status.copy === 'pending' || x.status.send === 'pending'))).length;
    b.textContent = list.length ? list.length : '';
    b.classList.toggle('is-on', list.length > 0);
    b.dataset.pending = pending;
  }

  function renderQueueDrawer() {
    const wrap = $('#askboxQueue');
    if (!wrap) return;
    const list = readQueue();
    if (!list.length) {
      wrap.querySelector('.askbox__q_body').innerHTML =
        '<div class="askbox__q_empty">还没有提交过问题 · 提交后会自动进队列</div>';
      return;
    }
    wrap.querySelector('.askbox__q_body').innerHTML = list.map(it => {
      const okCount = ['accept','route','copy','send','queue']
        .filter(k => (it.status || {})[k] === 'ok').length;
      const total = 5;
      return `<div class="askbox__q_item" data-id="${it.id}">
        <div class="askbox__q_hd">
          <span class="askbox__q_ic">${it.ico || '💠'}</span>
          <span class="askbox__q_id">${it.id}</span>
          <span class="askbox__q_tag">${it.kindTag || '一般'}</span>
          <span class="askbox__q_time">${fmtTime(it.ts)}</span>
          <span class="askbox__q_prog"><em style="width:${okCount / total * 100}%"></em>${okCount}/${total}</span>
        </div>
        <div class="askbox__q_q">"${(it.raw || '').replace(/</g, '&lt;')}"</div>
        <div class="askbox__q_ops">
          <button data-op="focus" data-id="${it.id}">上浮到受理卡</button>
          <button data-op="copy"  data-id="${it.id}">↺ 复制</button>
          <button data-op="edit"  data-id="${it.id}">✎ 回填输入框</button>
          <button data-op="obsi"  data-id="${it.id}">💾 落台账</button>
          <button data-op="done"  data-id="${it.id}" class="askbox__q_done">✓ 已处理完</button>
          <button data-op="del"   data-id="${it.id}" class="askbox__q_del">删除</button>
        </div>
      </div>`;
    }).join('');
  }

  function handleRecOp(op, id) {
    const item = readQueue().find(x => x.id === id);
    if (!item) return;
    switch (op) {
      case 'ask':
        /* 打开 Aime 主对话 —— iframe 场景走 postMessage；独立场景兜底跳 aime 首页 */
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'aime.open',
              from: 'creator-ecosystem-console',
              id: item.id, prompt: item.prompt, ts: Date.now()
            }, '*');
            toast('已请求宿主打开 Aime 对话 · prompt 也已在剪贴板');
          } else {
            toast('剪贴板已就位 · 切到 Aime 对话框 ⌘V 回车');
          }
        } catch (_) {}
        break;
      case 'copy':
        navigator.clipboard?.writeText(item.prompt).then(
          () => toast('已重新复制到剪贴板'),
          () => toast('复制失败，可手动 ⌘C'));
        break;
      case 'edit': {
        const ta = $('#askboxIn');
        if (ta) { ta.value = item.raw; ta.focus(); autoResize(ta); toast('已回填到输入框 · 改完再按回车'); }
        break;
      }
      case 'obsi': {
        const line = `- ${new Date(item.ts).toISOString().slice(0, 16).replace('T', ' ')} · ${item.id} · ${item.kindTag} · ${item.raw.replace(/\n/g, ' ')}`;
        navigator.clipboard?.writeText(line).then(
          () => toast('已复制台账行 · 粘到 _系统/反馈处理台账.md 即可'),
          () => toast('复制失败'));
        break;
      }
      case 'expand': {
        const list = readQueue();
        const i = list.findIndex(x => x.id === id);
        if (i >= 0) { list[i].expanded = !list[i].expanded; writeQueue(list); renderReceipt(list[i]); }
        break;
      }
      case 'focus': {
        renderReceipt(item);
        document.getElementById('askboxRecept')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        toggleQueue(false);
        break;
      }
      case 'done':
        updateQueue(id, { status: Object.assign({}, item.status, { done: 'ok' }), done: true });
        renderQueueDrawer();
        toast('已标记完成 · 保留在队列中，可随时删除');
        break;
      case 'del':
        removeQueue(id);
        renderQueueDrawer();
        if (document.getElementById('askboxRecept')?.dataset.id === id) {
          document.getElementById('askboxRecept').innerHTML = '';
          document.getElementById('askboxRecept').hidden = true;
        }
        break;
    }
  }

  function toggleQueue(force) {
    const wrap = $('#askboxQueue');
    if (!wrap) return;
    const on = (typeof force === 'boolean') ? force : wrap.hidden;
    wrap.hidden = !on;
    if (on) renderQueueDrawer();
  }

  /* ═══ 静态 HTML（若 index.html 未提前提供 askbox DOM，此处兜底插入） ═══ */
  const HTML = `
<section class="askbox" id="askbox">
  <div class="askbox__head">
    <div class="askbox__title">一句话 · <b>让 Aime 帮忙</b></div>
    <div class="askbox__sub">先把一句话优化成业务指令，再结合工作台全盘路由给 Aime</div>
    <button class="askbox__qbtn" id="askboxQBtn" title="查看处理队列">
      <span>🗂 处理队列</span><em class="askbox__qbadge" id="askboxQBadge"></em>
    </button>
  </div>
  <div class="askbox__wrap">
    <textarea class="askbox__input" id="askboxIn" rows="▇▇"
      placeholder="比如：拉一下机构G今天的业绩｜写个明天见机构F的开场话术｜查达人D最近的合作明细｜复盘上周和机构H的会议…（回车提交 · Shift+回车换行）"></textarea>
    <div class="askbox__toolbar">
      <button class="askbox__tool askbox__tool--opt is-on" data-tool="opt" title="调用 prompt-optimizer：把一句话改成可执行、可验收的业务指令"><span>✨</span> 提示词优化</button>
      <button class="askbox__tool" data-tool="deep" title="用 deep-research / prm-cli 做多角度调研"><span>🔎</span> 深度调研</button>
      <button class="askbox__tool" data-tool="ref"  title="把当前工作台数据 / 打开的模块一起给 Aime"><span>📎</span> 引用工作台</button>
      <button class="askbox__tool" data-tool="save" title="提交后 Aime 自动落回 Obsidian 记忆库"><span>💾</span> 落进 Obsidian</button>
      <div class="askbox__spacer"></div>
      <button class="askbox__mic" id="askboxMic" title="语音（先调起系统输入法麦克风）">🎤</button>
      <button class="askbox__go" id="askboxGo" title="提交给 Aime（回车）"><span>提交给 Aime</span><span>➤</span></button>
    </div>
  </div>
  <div class="askbox__chips" id="askboxChips">
    <button class="askbox__chip" data-chip="拉一下 {机构名} 的季度业绩，含分行业分月拆解">🏛 拉机构业绩</button>
    <button class="askbox__chip" data-chip="查 {达人昵称} 最近 ▇▇ 天的合作和内容表现">👤 查达人</button>
    <button class="askbox__chip" data-chip="帮我写和 {机构名} 明天拜访的开场话术 + ▇▇个必问问题">💬 写话术</button>
    <button class="askbox__chip" data-chip="按四件套（客户在做什么 · 我们能不能接 · 卡点在哪 · 下一步）复盘 {会议 / 项目}">🧭 四件套复盘</button>
    <button class="askbox__chip" data-chip="按四大专项（明星 · 短剧 · 本地 · AI）拆 {机构 / 达人} 的差异化机会">🎯 拆专项</button>
    <button class="askbox__chip" data-chip="打开 IDA 日报动态业绩看板并读今天数据">📊 今日实时</button>
    <button class="askbox__chip" data-chip="从 Obsidian 里翻一下 {关键词} 相关的历史沉淀和结论">📚 翻 Obsidian</button>
    <button class="askbox__chip askbox__chip--new" data-chip="用 sqless-data-analysis 直连业务表，帮我跑一下 {达人A近 ▇▇单的客户分布}：客户名 / 消耗 / 行业 / 是否首投；先给口径和数据截止日，再给明细表和一张简图">🔢 SQL 取明细 · sqless</button>
    <button class="askbox__chip askbox__chip--new" data-chip="用 solution-deck-builder 把 {方案 / 客户名} 做成 ▇▇ 可翻页演示 + 配套飞书文档：火山蓝白底、目录页先给我看、动效克制、每页留一句 sales talk track">📽 客户级提案 · deck-builder</button>
    <button class="askbox__chip askbox__chip--new" data-chip="导航栏 ⌘K 搜索有个问题要反馈：搜『{我刚搜的词}』没搜到 / 搜到的不对，实际我要找的是 {}，请补索引 / 加别名 / 更新口径词典，落一条到 _系统/反馈处理台账.md">🔎 搜索反馈</button>
    <button class="askbox__chip askbox__chip--new" data-chip="结合工作台全盘，对 {机构 / 达人 / 客户 / 专项} 做综合诊断：调用现有数据、策略、规则、历史记忆与外部大盘，先给结论，再给证据、动作、负责人、截止时间和验证标准">✨ 全盘业务分析</button>
    <button class="askbox__chip" data-chip="安装 / 调用技能：">🧩 调技能</button>
  </div>

  <!-- 受理卡：提交后立刻显示 -->
  <div class="askbox__recept" id="askboxRecept" hidden></div>

  <!-- 处理队列抽屉：由右上角 🗂 按钮开合 -->
  <div class="askbox__q" id="askboxQueue" hidden>
    <div class="askbox__q_hd_row">
      <b>🗂 处理队列</b>
      <span class="askbox__q_hint">最近 ▇▇条 · 本地存储 · 可撤回 / 补充 / 落台账</span>
      <button class="askbox__q_close" id="askboxQClose">×</button>
    </div>
    <div class="askbox__q_body"></div>
  </div>

  <div class="askbox__hist" id="askboxHistWrap" hidden>
    <div class="askbox__hist_hd">
      <span>最近 ▇▇次问过</span>
      <button class="askbox__hist_clr" id="askboxHistClr">清空</button>
    </div>
    <div class="askbox__hist_list" id="askboxHistList"></div>
  </div>
</section>`;

  function ensureDom() {
    let root = document.getElementById('askbox');
    if (root) {
      /* 静态 DOM 可能来自更早版本 —— 兜底补齐 recept & queue 容器 */
      if (!document.getElementById('askboxRecept')) {
        const rec = document.createElement('div');
        rec.id = 'askboxRecept';
        rec.className = 'askbox__recept';
        rec.hidden = true;
        root.appendChild(rec);
      }
      if (!document.getElementById('askboxQueue')) {
        const q = document.createElement('div');
        q.className = 'askbox__q';
        q.id = 'askboxQueue';
        q.hidden = true;
        q.innerHTML = `
          <div class="askbox__q_hd_row">
            <b>🗂 处理队列</b>
            <span class="askbox__q_hint">最近 ▇▇条 · 本地存储 · 可撤回 / 补充 / 落台账</span>
            <button class="askbox__q_close" id="askboxQClose">×</button>
          </div>
          <div class="askbox__q_body"></div>`;
        root.appendChild(q);
      }
      if (!document.getElementById('askboxQBtn')) {
        const head = root.querySelector('.askbox__head');
        if (head) {
          const btn = document.createElement('button');
          btn.className = 'askbox__qbtn';
          btn.id = 'askboxQBtn';
          btn.title = '查看处理队列';
          btn.innerHTML = '<span>🗂 处理队列</span><em class="askbox__qbadge" id="askboxQBadge"></em>';
          head.appendChild(btn);
        }
      }
      return root;
    }
    const stage = document.querySelector('main.stage');
    if (!stage) return null;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = HTML.trim();
    root = wrapper.firstElementChild;
    stage.insertBefore(root, stage.firstElementChild);
    return root;
  }

  function mount() {
    const root = ensureDom();
    if (!root) return;

    /* 截图中的完整「一句话 · 让 Aime 帮忙」是驾驶舱固定头版。
       直接挂到 #sections 第一位，而不是塞进 m_over 卡片内部：这样它会稳定压在
       区级总览 / 阅读队列和 ▇▇ 模块之前，同时仍由 data-view 控制只在驾驶舱首页显示。 */
    const sections = document.getElementById('sections');
    if (sections && (root.parentElement !== sections || sections.firstElementChild !== root)) {
      sections.insertBefore(root, sections.firstChild);
    }
    const hashView = (location.hash || '').replace('#', '');
    const activeView = hashView || document.body.dataset.view ||
      (window.OS && typeof OS.cur === 'function' ? OS.cur() : 'm_over');
    root.hidden = activeView !== 'm_over';

    /* mount 会被延迟兜底重复调用：每次都先校正置顶位置，事件只绑定一次。 */
    if (root.dataset.mounted === '1') return;
    root.dataset.mounted = '1';

    const ta = $('#askboxIn');
    const go = $('#askboxGo');
    const mic = $('#askboxMic');
    const chips = $('#askboxChips');
    const histClr = $('#askboxHistClr');
    const qBtn = $('#askboxQBtn');
    const qClose = $('#askboxQClose');
    const rec = $('#askboxRecept');
    const q = $('#askboxQueue');

    if (ta) {
      autoResize(ta);
      ta.addEventListener('input', () => autoResize(ta));
      ta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
          e.preventDefault();
          submit();
        }
      });
    }
    if (go) go.addEventListener('click', submit);
    if (mic) mic.addEventListener('click', () => {
      toast('调起系统输入法麦克风，按住讲话 · 松开自动落到输入框');
      if (ta) ta.focus();
    });
    $$('.askbox__tool', root).forEach(btn => {
      btn.addEventListener('click', () => btn.classList.toggle('is-on'));
    });
    if (chips) {
      $$('.askbox__chip', chips).forEach(btn => {
        btn.addEventListener('click', () => {
          const tpl = btn.dataset.chip || (btn.textContent || '').trim();
          if (!ta) return;
          if (ta.value.trim()) { insertAtCursor(ta, tpl); }
          else {
            ta.value = tpl; ta.focus(); autoResize(ta);
            const m = tpl.match(/\{[^}]+\}/);
            if (m) {
              const idx = tpl.indexOf(m[0]);
              ta.selectionStart = idx;
              ta.selectionEnd = idx + m[0].length;
            }
          }
        });
      });
    }
    if (histClr) histClr.addEventListener('click', (e) => {
      e.stopPropagation();
      writeHist([]);
      renderHist();
      toast('已清空最近提问');
    });

    /* 受理卡 & 队列抽屉：事件委托 */
    rec && rec.addEventListener('click', e => {
      const btn = e.target.closest('[data-op]');
      const closeBtn = e.target.closest('.askbox__rec_x');
      if (closeBtn) {
        const id = closeBtn.dataset.id;
        removeQueue(id);
        rec.innerHTML = '';
        rec.hidden = true;
        return;
      }
      if (btn) handleRecOp(btn.dataset.op, btn.dataset.id);
    });
    q && q.addEventListener('click', e => {
      const btn = e.target.closest('[data-op]');
      if (btn) { handleRecOp(btn.dataset.op, btn.dataset.id); renderQueueDrawer(); }
    });

    qBtn && qBtn.addEventListener('click', () => toggleQueue());
    qClose && qClose.addEventListener('click', () => toggleQueue(false));

    renderHist();
    renderQueueBadge();

    /* 如果本地已有队列，在页面上默认露出最近一条受理卡（不打扰、可点 × 关闭） */
    const last = readQueue()[0];
    if (last) renderReceipt(last);
  }

  window.mountAskBox = mount;
  document.addEventListener('DOMContentLoaded', mount);
  setTimeout(mount, 0);
  setTimeout(mount, 300);
})();

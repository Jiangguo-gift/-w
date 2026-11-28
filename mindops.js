/* global MODS, block */
/* ═══════════════════════════════════════════════════════════
   mindops.js —— 学习认知自运行优化建议
   只处理认知层：规则、口径、证据、纠错、记忆回写。
   ⛔ 不承载具体业务建议；⛔ 不把“建议”伪装成已经自动运行。
   ═══════════════════════════════════════════════════════════ */
window.MINDOPS = (function () {
  if (window.MODS || typeof MODS !== 'undefined') {
    Object.assign(MODS, {
      'm-lrn-map': { t: '认知自运行调用链', links: [
        { t: '工作台模块规范', f: 'memory/工作台模块规范.md', mode: 'open' }
      ] },
      'm-lrn-queue': { t: '认知优化优先队列', links: [
        { t: '判断规则库', f: '_系统/判断规则库.md', mode: 'open' },
        { t: '口径词典', f: '_系统/口径词典.md', mode: 'open' }
      ] },
      'm-lrn-loop': { t: '认知闭环', links: [
        { t: '反馈处理台账', f: '_系统/反馈处理台账.md', mode: 'open' },
        { t: '学习日志', f: '_系统/学习日志.md', mode: 'open' }
      ] },
      'm-lrn-source': { t: '本轮检查依据', links: [
        { t: 'Obsidian 操作宪法', f: 'AIME.md', mode: 'open' }
      ] },
      'm-lrn-bound': { t: '自动运行边界', links: [
        { t: '常错清单', f: '_记忆/04-常错清单.md', mode: 'open' }
      ] }
    });
  }

  const FLOW = [
    {
      n: '▇▇', k: '输入', st: 'run', t: '外部原料 · 新灵感 · 区内反馈',
      d: '输入入口已经分开，来源能追溯；下一步要把“新输入会撞到哪条旧规则”一起带进来。',
      to: 'm_ext', go: '看外部原料'
    },
    {
      n: '▇▇', k: '判断', st: 'part', t: '纠错 · 前提 · 规则口径',
      d: '已经有前提审查和纠错记录，但冲突识别、过期判断仍靠任务里人工检查。',
      to: 'premise', go: '看纠错与前提'
    },
    {
      n: '▇▇', k: '调用', st: 'part', t: '模块调度 · 技能调用',
      d: '跨页跳转和能力入口已接通；还缺“出现哪类认知问题，就自动叫哪个模块”的触发表。',
      to: 'state', go: '看模块协作'
    },
    {
      n: '▇▇', k: '落地', st: 'run', t: '认知建议 · 待确认项',
      d: '本页负责把认知短板排成优先队列；有冲突的规则只送审，不直接覆盖。',
      to: 'm_lrn', go: '留在本页'
    },
    {
      n: '▇▇', k: '回写', st: 'part', t: '记忆变更 · 学习日志 · 镜像',
      d: '回写纪律已经明确，但失败补偿和“建议是否真的产生效果”还没有统一回执。',
      to: 'm_chg', go: '看记忆变化'
    }
  ];

  const RECS = [
    {
      p: '先做', tone: 'hot', t: '规则冲突雷达',
      q: '新反馈、新资料或新结论进来时，先和现有规则、口径、最近纠错做对照。',
      now: '目前能查到这些材料，但是否冲突仍靠人工逐处翻。',
      after: '输出“冲突的两条原话 + 各自来源 + 建议保留 / 降级 / 待确认”，统一送到纠错页；绝不静默改规则。',
      to: 'premise', go: '先看纠错页'
    },
    {
      p: '先做', tone: 'hot', t: '证据保质期',
      q: '每条可复用结论都带来源、数据截止、最后验证时间和证据等级。',
      now: '页面已有来源与截止要求，但没有统一的过期降级动作。',
      after: '超过有效期后自动从“已确认”降为“待验证”，下次调用前先回源，不让旧结论继续被当成今天的判断。',
      to: 'premise', go: '看前提审查'
    },
    {
      p: '随后', tone: 'mid', t: '建议闭环回执',
      q: '把“提出建议 → 采纳 / 驳回原因 → 是否执行 → 结果 → 回写位置”连成一条记录。',
      now: '建议、裁决、处理台账和学习日志都有，但结果分散，难判断哪类建议长期有效。',
      after: '下一次给建议前，先读取历史采纳与驳回原因；重复被驳回的提法自动降权，减少无效打扰。',
      to: 'confirm', go: '看决策记录'
    },
    {
      p: '随后', tone: 'mid', t: '认知问题自动路由',
      q: '业务页只把“问题类型、来源模块、待验证前提”回传，不把业务明细搬进认知区。',
      now: '模块可以互相跳转，但多数仍需要人判断下一步该进纠错、记忆更新还是技能调用。',
      after: '按问题类型分流：定义冲突进纠错、外部新证据进原料、确认后的变化进记忆动态、能力缺口进系统自查。',
      to: 'state', go: '看调用总览'
    }
  ];

  const LOOP = [
    ['发现变化', '新反馈、外部原料、记忆变更触发一次认知检查'],
    ['对照旧认知', '比对规则、口径、最近纠错和证据时间'],
    ['只送审冲突', '有矛盾就进入待确认，不自动覆盖原规则'],
    ['记录结果', '采纳、驳回与原因进入处理台账和学习日志'],
    ['影响下次调用', '下一次任务优先使用已确认、仍有效、被证明有用的判断']
  ];

  const SOURCES = [
    ['工作台模块关系', '四区模块清单、页面定位与跳转关系', '截至 2026-10-10 17:▇▇'],
    ['内容调用链', '页面如何按能力开关调用认知、协作、反馈与记忆内容', '截至 2026-10-10 17:▇▇'],
    ['Obsidian 权威规则', 'MEMORY.md、AIME.md、项目细节与常错清单', '截至 2026-10-10 17:▇▇'],
    ['本条反馈', 'fb-INTERNAL-ID · 学习认知自运行优化建议', '2026-10-10 17:▇▇']
  ];

  function statusLabel(st) {
    return st === 'run' ? '已接通' : st === 'part' ? '需补强' : '未接通';
  }

  function renderFlow() {
    return block('m-lrn-map', '认知自运行调用链', '从输入到回写',
      '<b>结论：调用链结构已经形成，真正的短板不在“缺模块”，而在“规则冲突、证据过期、执行结果”还没有自动回流。</b>所以这轮不再新增页面，优先把已有模块串紧。',
      `<div class="lops-flow">${FLOW.map((x, i) => `<article class="lops-step" data-st="${x.st}">
        <div class="lops-step__top"><span>${x.n} · ${x.k}</span><em>${statusLabel(x.st)}</em></div>
        <h4>${x.t}</h4><p>${x.d}</p>
        <button type="button" data-jumpv="${x.to}">${x.go}<i>→</i></button>
        ${i < FLOW.length - 1 ? '<b class="lops-step__arrow" aria-hidden="true">→</b>' : ''}
      </article>`).join('')}</div>`);
  }

  function renderQueue() {
    return block('m-lrn-queue', '可行优化建议', '建议顺序已经排好',
      '<b>先做“规则冲突雷达 + 证据保质期”</b>，因为它们直接降低旧规则误用风险；随后再补建议回执与自动路由。每一项都复用现有模块，不再开新摊子。',
      `<div class="lops-queue">${RECS.map((x, i) => `<article class="lops-rec" data-tone="${x.tone}">
        <div class="lops-rec__head"><span>${String(i + 1).padStart(2, '0')}</span><em>${x.p}</em><h4>${x.t}</h4></div>
        <p class="lops-rec__q">${x.q}</p>
        <dl><div><dt>现在</dt><dd>${x.now}</dd></div><div><dt>接通后</dt><dd>${x.after}</dd></div></dl>
        <button type="button" data-jumpv="${x.to}">${x.go}<i>→</i></button>
      </article>`).join('')}</div>`);
  }

  function renderLoop() {
    return block('m-lrn-loop', '建议如何真正变成系统能力', '闭环，不是建议清单',
      '以后认知层每次自查都走同一条链：<b>发现变化 → 对照旧认知 → 送审冲突 → 记录结果 → 影响下次调用</b>。驳回原因也是训练数据，但在重复出现并得到确认前，只能算观察，不能直接升为规则。',
      `<ol class="lops-loop">${LOOP.map((x, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span><div><b>${x[0]}</b><p>${x[1]}</p></div></li>`).join('')}</ol>`);
  }

  function renderSources() {
    return block('m-lrn-source', '本轮检查依据', '来源与截止',
      '以下内容只用于判断“工作台怎么转、哪里还靠人工”，<b>没有引用业务金额，也没有把推断写成事实</b>。',
      `<div class="lops-src">${SOURCES.map(x => `<div><b>${x[0]}</b><span>${x[1]}</span><time>${x[2]}</time></div>`).join('')}</div>`);
  }

  function renderBoundary() {
    return block('m-lrn-bound', '自动运行边界', '哪些能自动，哪些必须等你确认',
      '“更智能”不等于让系统悄悄替你改规则。下面四条边界不变。',
      `<div class="lops-bound">
        <div data-st="run"><b>可以自动</b><p>发现冲突、标记过期、推荐去哪个模块、生成待确认清单。</p></div>
        <div data-st="part"><b>需要会话触发</b><p>Aime 不是常驻进程；体检在你发起任务、提交反馈或要求刷新时运行。</p></div>
        <div data-st="ask"><b>必须你确认</b><p>规则取舍、口径改版、推断升为长期记忆，不自动拍板。</p></div>
        <div data-st="stop"><b>明确不做</b><p>不静默覆盖旧规则，不在本页给业务改法，不用未经授权的数据源补结论。</p></div>
      </div>
      <div class="lops-next"><span>推荐下一步</span><b>先试运行“规则冲突雷达 + 证据保质期”，观察一轮反馈后再接建议闭环回执。</b><button type="button" data-jumpv="fb_mind">去本区反馈入口 →</button></div>`);
  }

  function render() {
    return `<div class="lops" data-mod="m-lrn-ops">${renderFlow()}${renderQueue()}${renderLoop()}${renderSources()}${renderBoundary()}</div>`;
  }

  return { render, FLOW, RECS, LOOP, SOURCES };
})();

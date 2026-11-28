/* ═══════════════════════════════════════════════════════════
   grp.js —— 二级类目层（v2 · 统一任务框架）
   2026-09-16 23:49 本人：
     「你左侧的导航页二级类目的框架还要调整，你得深度理解一下每个模块，
       最重要的几块任务跟能力，并按照任务大框架做后续的统一归类，
       不要每次一有新内容就做堆叠，框架思路模糊」

   v1 的问题：每个模块的二级类目各起一套名字（驾驶舱叫"系统运行情况"、
   业务盘叫"数据总览"、协作机制叫"段①"…），一有新内容就新加一个类目，
   所以左栏越翻越乱、越翻越猜不到里面装什么。

   v2 改成**一套框架管 ▇▇个模块**，只有 ▇▇个格子，顺序固定：
     ① 结论与进展      —— 当前状态与结论（数字 / 进度）
     ② 待办与行动项    —— 可执行动作、待办、可采纳的机会
     ③ 方法与打法      —— 可复用的能力、打法、规则、口径
     ④ 数据与资料来源  —— 看板、底仓、入口、数据截止
     ⑤ 待裁决与待补充  —— 需她裁决或需她提供材料的
   2026-09-17 她再退一版：「这个层级的所有标题还是太口语化了，参考其他标题，
   给我更客观的标题」→ 五类改成书面名词短语，格内说明句一并去人称、去疑问句。
   规矩（防再堆叠）：
     · 名字全站一样，不许某个模块自己另起一套；
     · 新内容只能塞进这 ▇▇ 格里的一格，**不许新增第 ▇▇个格子**；
     · 某一格在某个模块没有内容 → 那一格不出现，不摆空标题。

   实现方式仍是**渲染后搬 DOM**，不改任何模块自己的渲染代码。
   ⛔ 不新增数字、不改口径、不删内容。
   载入顺序：必须在 render.js 之后、sub.js 之前。
   ═══════════════════════════════════════════════════════════ */
window.CGRP = (function () {

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];

  /* ── 全站统一的五个格子（顺序即页面顺序，名字不许各页自定义） ── */
  const SLOTS = [
    ['s1', '结论与进展'],
    ['s2', '待办与行动项'],
    ['s3', '方法与打法'],
    ['s4', '数据与资料来源'],
    ['s5', '待裁决与待补充']
  ];

  /* ── 页面级标题别名（唯一允许的例外，白名单制） ────────────
     2026-09-18 10:52 本人：「业务工作区-作战执行与节奏这里我需要做标题替换，
       左边栏的标题帮我做对应替换：结论与进展→周度复盘总结、
       待办与行动项→本周策略回顾、待裁决与待补充→拜访策略回顾记忆」
     规矩没变：五张固定信息卡的**编号、顺序、数量**全站一样，只有被点名的页面
     可以给格子换一个更贴它内容的名字；没点名的页面一律用 SLOTS 原名。
     左栏二级 / 顶部三级条的二级名都读 .cgrp__t，所以这里改一次就全都跟着改。 */
  const SLOT_ALIAS = {
    run: { s1: '周度复盘总结', s2: '本周策略回顾', s5: '拜访策略回顾记忆' }
  };

  /* ── 每个模块往这五张固定信息卡里装什么 ────────────────────────────
     q   = 这一格在这个模块里回答哪个问题（她的视角，一句）
     sel = 装哪些块（按写的顺序排）
     ⛔ 只能用上面那 ▇▇个 key，新内容归进已有的格子。 */
  const MAP = {

    /* ══ Ⅰ 驾驶舱全景 ══ */
    /* ▇▇ 今日行动清单 */
    deck: {
      s1: { q: '在推项目的当前进度与阻塞环节', sel: ['.hqp'] },
      s2: { q: '今日 / 本周 / 本季应处理的事项，按列示顺序执行', sel: ['.hqa', '.pgt'] },
      s4: { q: '业绩仅列缺口与待结算两项，明细见业务工作区', sel: ['.bizs'] }
    },

    /* ▇▇ 异动与风险预警 */
    alert: {
      s1: { q: '与昨日相比的变化项，以及已被改写的判断', sel: ['.mxk'] },
      s2: { q: '本日新增事项及其对应处理入口', sel: ['.hqd'] },
      s4: { q: '各数据源的截止日期与滞后天数', sel: ['.sysfr'] }
    },

    /* ▇▇ 建议与机会提示 */
    advice: {
      s2: { q: '逐条查看本批建议，并选择采纳、修改或暂不执行；修改或不做时请写明原因', sel: ['[data-mod="m-advice"]'] }
    },

    /* ▇▇ 快捷入口与速记 —— 09-21 起：常用看板与数据源入口已挪到业务工作区 · 目标与业绩达成 */
    quick: {
      s2: { q: '临时想法速记入口，按标签归入仓库对应目录', sel: ['[data-mod="m-inbox"]'] }
    },

    /* ══ Ⅱ 认知与学习 ══ */
    /* 外部思维原料与采纳建议 */
    m_ext: {
      s1: { q: '先看 ▇▇个业务化模型与优先学习顺序，再看本轮筛选结论和适用边界', sel: ['.spkmodels', '.mxsum', '.mxk'] }
    },

    /* ▇▇ 用户画像与协作偏好 */
    pattern: {
      s1: { q: '已确认的决策偏好条目，与仍在观察中的条目', sel: ['.mxk', '.pat'] }
    },

    /* ▇▇ 判断依据与业务口径 */
    rules: {
      s1: { q: '规则与口径的现有条数及其来源', sel: ['.mxk'] },
      s3: { q: '判断所用算法，以及结论成立所需的证据层级', sel: ['.rul', '[data-mod="m-bizevd"]'] },
      s4: { q: '四套业绩口径的适用范围，以及每日 11:00 底表刷新规则', sel: ['[data-mod="m-bizcal"]', '[data-mod="m-daily"]'] }
    },

    /* ▇▇ 记忆机制与同步 */
    memory: {
      s1: { q: '记忆库分册构成、最近变更处与镜像同步状态', sel: ['.cat'] }
    },

    /* ▇▇ 纠错与待验证结论 */
    premise: {
      s1: { q: '截至今日最新确认的纠错记录；新记录替换旧记录，页面最多保留三条', sel: ['[data-mod="m-collapse"]'] },
      s3: { q: '出稿前用于识别口径、数据和主体前提的固定审查方法', sel: ['[data-mod="m-premise3"]', '[data-mod="m-fiveq"]'] }
    },

    /* ▇▇ 学习认知自运行优化建议 */
    m_lrn: {
      s1: { q: '认知调用链当前接通情况、主要断点与本轮判断结论', sel: ['.mxk', '[data-mod="m-lrn-map"]'] },
      s2: { q: '按风险与依赖关系排序的认知层优化建议', sel: ['[data-mod="m-lrn-queue"]'] },
      s3: { q: '把一次建议沉淀成下次可复用判断的固定闭环', sel: ['[data-mod="m-lrn-loop"]'] },
      s4: { q: '本轮检查使用的来源、范围与截止时间', sel: ['[data-mod="m-lrn-source"]'] },
      s5: { q: '自动发现与人工裁决的边界，以及下一步建议放行项', sel: ['[data-mod="m-lrn-bound"]'] }
    },

    /* ══ Ⅲ 高阶交互系统 ══ */
    /* ▇▇ 调用方式与能力边界 */
    call: {
      s3: { q: '「我能装的技能清单」（自选装/停），以及可一句话触发的任务清单，支持复制直发', sel: ['.hub', '.mxcmd'] }
    },

    /* ▇▇ 决策放行与承诺跟踪 */
    confirm: {
      s1: { q: '已裁决事项存档，不再重复确认', sel: ['.dnl'] },
      s2: { q: '无需授权即自行推进的事项，完成后在此交账', sel: ['.ownmine'] },
      s5: { q: '待裁决事项、待授权事项、等你逐条拍板的事项，以及未照字面执行的说明', sel: ['.mxask', '.gate', '.ownask', '.pgv', '.dvi'] }
    },

    /* ▇▇ 运行现状与数据管道 */
    state: {
      s1: { q: '「输入→判断→调用→落地→回写」这 ▇▇步流转的连通进度、模块实际连接情况与结论落点', sel: ['.nfb', '.sysrun', '.cpseg--▇▇', '.cpseg--▇▇', '.netnow', '.netsame'] },
      s2: { q: '信息流转的堵点位置与对应疏通方式', sel: ['.sysflow'] }
    },

    /* ▇▇ 「系统自查发现的问题 · 建议做法」 */
    cap: {
      s1: { q: '当前系统的能力缺口', sel: ['.mxk'] },
      s2: { q: '可采纳的优化方案与能力补齐项，含不建议引入的部分', sel: ['.cpseg--▇▇', '.recmap', '.recno', '.netcan', '.netgap', '.pgp'] },
      s5: { q: '先完成前置追问，再裁决推荐的采纳范围', sel: ['.recgrill', '.mxask'] }
    },

    /* ══ Ⅳ 业务工作区 ══ */
    /* ▇▇ 「外部大盘与外部信息」 */
    eco: {
      s1: { q: '渠道资料与政策检索入口 + 外部最新动态 + 品牌投放动向，每条附出处与时间', sel: ['.eco__sec--ask', '.eco__sec--facts', '.eco__sec--brandpulse'] },
      s2: { q: '外部事实与我方数据交叉得出的机会，含指定资源与采纳入口，以及四条赛道固定模块（电商产业带 / 本地团购经销加盟 / 渠道代理 / 短剧明星）', sel: ['.eco__sec--dig', '.eco__sec--opp', '.eco__sec--tracks', '.spk'] },
      s3: { q: '表面成立但当前不可执行的机会', sel: ['.eco__sec--avoid'] },
      s4: { q: '跨部门资料入口、本页数据截止时间与更新节奏', sel: ['.eco__sec--lib', '.eco__sec--fr'] }
    },

    /* ▇▇ 目标与业绩达成 —— 业绩金额只在这一页
       09-22 她原话「这个常用入口直接放在业务工作区-目标与业绩达成板块最前面」——
       所以把 .mxlnk 从 s4 提到 s1 的最前，做成整页第一眼看到的直达入口。
       s1 显式写 ['.mxlnk','.mxsum','.mxk','.viz']：先入口、再结论条、再重要信息、再看板；
       s4 只留"业绩数据来源与修改入口"（#bzboards / #bzsrc），⛔ 同一功能块不再两处渲染（R-570）。 */
    base: {
      s1: { q: '常用看板 / 数据源直达入口 + Q3 达成进度、剩余缺口与结构性薄弱项',
            sel: ['.frsh', '.mxlnk', '.extks', '.mxsum', '.mxk', '.viz'] },
      s2: { q: '本季度取胜路径与本周优先动作', sel: ['.bzv', '[data-mod="m-bizmoves"]'] },
      s4: { q: '业绩数据来源与修改入口', sel: ['#bzboards', '#bzsrc'] }
    },

    /* ▇▇ 客户与商机需求 */
    cust: {
      s1: { q: '外部需求构成、可即时提报部分与当前无法承接部分', sel: ['.mxk', '.hqn--need'] },
      s4: { q: '商机与需求的查询入口，以及接到 brief 后的执行起点', sel: ['[data-mod="bzsec-cust"]'] }
    },

    /* ▇▇ 达人与机构供给 */
    supply: {
      s1: { q: '在手机构与达人规模、报价完整度与专项名单储备', sel: ['.mxk', '.hqn--sup'] },
      /* 09-18 本人给的五份业务资料归这一格：机构类型经营策略、成长路线、专项 / 行业 /
         达人类型培育、政策弹药、创意生态 —— 都是可复用打法，不是结论也不是数据源，
         所以进 s3，⛔ 不给它新开第 ▇▇ 格、也不新开第 ▇▇个页面。 */
      s3: { q: '机构类型与成长路线、专项与行业培育打法、达人类型变现路径、政策与创意生态',
            sel: ['[data-mod="spl-lib"]', '[data-mod="spl-disc"]', '[data-mod="spl-org"]',
                  '[data-mod="spl-path"]', '[data-mod="spl-spec"]', '[data-mod="spl-ind"]',
                  '[data-mod="spl-tal"]', '[data-mod="spl-ammo"]', '[data-mod="spl-crea"]',
                  '[data-mod="spl-mine"]', '[data-mod="spl-scene"]'] },
      s4: { q: '达人机构与刊例的查询入口，以及拜访材料出处', sel: ['[data-mod="bzsec-supply"]'] }
    },

    /* ▇▇ 作战执行与节奏 */
    run: {
      s1: { q: '本周复盘的总体结论与关键数字', sel: ['.mxk'] },
      s2: { q: '五个板块的回顾结论，以及每周固定复盘的触发规则', sel: ['.rv', '.wk'] },
      s5: { q: '拜访速记入口与已入档拜访形成的策略记忆', sel: ['.vst', '.vlog'] }
    },

    /* ▇▇ 策略资料库（承接原「达人与机构供给」的策略资料 ▇▇块） */
    plays: {
      s1: { q: '今日策略收口、权威数据边界与当前可对外交付的打法', sel: ['.mxk'] },
      s3: { q: '今日最近 ▇▇条确认、内热资料索引、机构策略资料库、模式与玩法库、能力域和案例拆解',
            sel: ['[data-mod="spl-lib"]', '[data-mod="spl-hot"]', '[data-mod="spl-disc"]', '[data-mod="spl-org"]',
                  '[data-mod="spl-path"]', '[data-mod="spl-spec"]', '[data-mod="spl-ind"]',
                  '[data-mod="spl-tal"]', '[data-mod="spl-ammo"]', '[data-mod="spl-crea"]',
                  '[data-mod="spl-mine"]', '[data-mod="spl-scene"]',
                  '.pl--role', '.pl--dom', '.pl--mode', '.pl--sig', '.cext'] },
      /* 09-22 新增：把「优质达人生态培育工作台」入口归到 s4「数据与资料来源」，
         作为后续优质作者内容分析、机构匹配的可调用能力。⛔ 不新增第 ▇▇ 格。
         09-22 补：这个入口只用于对比参考账号 + 学习内容视频分析，⛔ 不采信任何数字（R-619）。
         09-22 三补（R-620）：入口从简单文字链改成缩略图卡片，selector 加 `.extks`；
         `.mxlnk` 保留是因为 v5.js 可能同时挂普通链接（未来若有），但目前 plays 页不会有. */
      s4: { q: '案例分析工作台（只看内容视频、⛔ 不采信数字）', sel: ['.extks', '.mxlnk'] },
      s5: { q: '当前尚不能提供的内容', sel: ['.pl--cant'] }
    }
  };

  /* 每页最上面那条「本页结论」也归进第①格 —— 否则它会在左栏里自成一类，
     等于框架外多出一个第 ▇▇ 类（她 09-16 23:49 要的就是不许再冒新类目）。 */
  Object.values(MAP).forEach(m => {
    if (!m.s1) m.s1 = { q: '本页当前状态概览', sel: [] };
    if (m.s1.sel.indexOf('.mxsum') < 0) m.s1.sel = ['.mxsum'].concat(m.s1.sel);
  });

  /* 展开成渲染用的计划：顺序永远是 s1 → s5，名字来自 SLOTS（被点名的页取别名） */
  const PLAN = Object.fromEntries(Object.entries(MAP).map(([view, m]) => [
    view,
    SLOTS.filter(([k]) => m[k]).map(([k, name], _i) => ({
      slot: k, no: SLOTS.findIndex(x => x[0] === k) + 1,
      k: (SLOT_ALIAS[view] && SLOT_ALIAS[view][k]) || name, q: m[k].q, sel: m[k].sel
    }))
  ]));

  /* ── 一次分组 ─────────────────────────────────────────── */
  function group(sec) {
    const plan = PLAN[sec.id];
    if (!plan) return false;
    if ($('.cgrp', sec)) return false;            /* 已经分过，不重复搬 */

    /* 先把每一格要的块找齐，找不齐的格子直接跳过（不留空标题） */
    const jobs = plan.map(g => {
      const els = [];
      g.sel.forEach(s => $$(s, sec).forEach(el => {
        if (el.closest('.cgrp')) return;
        if (els.indexOf(el) < 0) els.push(el);
      }));
      return { g, els };
    }).filter(j => j.els.length);

    if (!jobs.length) return false;

    /* 插入位置：第一个被收编的块原来在哪，这一串格子就从那儿开始 */
    const first = jobs[0].els[0];
    const anchor = document.createElement('div');
    anchor.className = 'cgrps';
    first.parentNode.insertBefore(anchor, first);

    jobs.forEach((j, i) => {
      const box = document.createElement('section');
      box.className = 'cgrp cgrp--' + j.g.slot;
      box.id = sec.id + '-' + j.g.slot;
      box.dataset.mod = 'cgrp-' + sec.id + '-' + j.g.slot;
      box.dataset.slot = j.g.slot;
      box.innerHTML = `<div class="cgrp__h">
          <div class="cgrp__l">
            <i class="cgrp__n">${String(j.g.no).padStart(2, '0')}</i>
            <div>
              <h2 class="cgrp__t">${j.g.k}</h2>
              <p class="cgrp__q">${j.g.q}</p>
            </div>
          </div>
          <nav class="cgrp__in" aria-label="本板块内容索引"></nav>
        </div>
        <div class="cgrp__b"></div>`;
      anchor.appendChild(box);
      const body = $('.cgrp__b', box);
      j.els.forEach(el => {
        /* .mxk 原来住在 .mx 卡里，搬走之后那张卡是空的 —— 直接清掉，不留空壳 */
        const host = el.parentElement;
        body.appendChild(el);
        if (host && host.classList.contains('mx') && !$('.mxk', host)) host.remove();
      });
    });

    /* 格子头上那排小链接：本板块内含哪几块，点击定位 */
    $$('.cgrp', sec).forEach(box => {
      const nav = $('.cgrp__in', box);
      const kids = inner(box);
      nav.innerHTML = kids.length > 1
        ? kids.map(k => `<button class="cgrp__a" data-go="${k.id}">${k.lbl}</button>`).join('')
        : '';
    });
    return true;
  }

  /* 这一格里的块叫什么 —— 名字取自块自己的标题，不另起一套叫法（R-553） */
  const NAME = [
    ['.mxsum',      '本页结论'],
    ['.mxk',        '重要信息'],
    ['.viz',        '季度结构分析'],
    ['.bzv',        '经营总判断'],
    ['.rv',         '本周策略回顾'],
    ['.cext',       '高变现能力拆解'],
    ['.frsh',       '每日更新时钟'],
    ['.mxlnk',      '常用入口'],
    ['.bizs',       '业绩关键两项'],
    ['.hqn--need',  '需求侧口径'],
    ['.hqn--sup',   '供给侧口径'],
    ['.hqn',        '在手资源'],
    ['.hqa',        '推进计划'],
    ['.hqd',        '本日新增'],
    ['.hqp',        '项目进度'],
    ['.pgv',        '待补充信息'],
    ['.pgp',        '建议推进项目'],
    ['.pgt',        '待办清单'],
    ['.pl--cant',   '暂不可提供项'],
    ['.pl--role',   '角色定位'],
    ['.pl--dom',    '能力域明细'],
    ['.pl--mode',   '模式与玩法库'],
    ['.pl--sig',    '宏观信号转动作'],
    ['.sysrun',     '系统运行情况'],
    ['.sysflow',    '信息进出与堵点'],
    ['.sysfr',      '数据新鲜度'],
    ['.nfb',        '协作全景动态看板'],
    ['.netnow',     '已连通链路'],
    ['.netcan',     '可连未连链路'],
    ['.netsame',    '结论互通清单'],
    ['.netgap',     '能力缺口'],
    ['.ownmine',    '自行推进事项'],
    ['.ownask',     '待授权事项'],
    ['.ownstop',    '禁止自决事项'],
    ['.cpseg--▇▇',   '「模块之间怎么协作」'],
    ['.cpseg--▇▇',   '系统运行反馈'],
    ['.cpseg--▇▇',   '「还能怎么优化的建议清单」'],
    ['.gate',       '等你逐条拍板的事项'],
    ['.wk',         '每周固定复盘触发规则'],
    ['.cat',        '记忆库总目录'],
    ['.rul',        '判断规则与口径'],
    ['.spk',        '主动建议方向'],
    ['.spkmodels',  '业务化思维模型'],
    ['.pat',        '思维模式今日动态'],
    ['.recgrill',   '前置追问三题'],
    ['.recmap',     '定向推荐'],
    ['.recno',      '不建议引入项'],
    ['.mxask',      '待裁决事项'],
    ['.dnl',        '已定事项'],
    ['.dvi',        '未照字面执行'],
    ['.hub',        '「我能装的技能」'],
    ['.mxcmd',      '「常用指令模板」'],
    ['.vst',        '拜访快记'],
    ['.vlog',       '已入档拜访'],
    ['.q4dr',       'Q4 短剧演员名单'],
    ['.eco__sec--lib',   '跨部门渠道资料库'],
    ['.eco__sec--facts', '外部动态'],
    ['.eco__sec--brandpulse', '品牌动向'],
    ['.eco__sec--dig',   '动态机会挖掘'],
    ['.eco__sec--opp',   '可拓机会'],
    ['.eco__sec--avoid', '暂不可执行'],
    ['.eco__sec--fr',    '数据截止'],
    ['[data-mod="spl-hot"]', '内热资料索引'],
    ['[data-mod="m-advice"]', '本批建议'],
    ['[data-mod="m-inbox"]',  '灵感捕捉'],
    ['[data-mod="m-bizevd"]', '策略证据链'],
    ['[data-mod="m-bizmoves"]', '策略动作'],
    ['[data-mod="m-bizcal"]', '数据口径对照'],
    ['[data-mod="m-daily"]', '每日数据刷新规则'],
    ['[data-mod="m-collapse"]', '最近确认纠错'],
    ['[data-mod="m-premise3"]', '三类前提'],
    ['[data-mod="m-fiveq"]', '五问链'],
    ['[data-mod="m-lrn-map"]', '认知调用链'],
    ['[data-mod="m-lrn-queue"]', '优化建议'],
    ['[data-mod="m-lrn-loop"]', '认知闭环'],
    ['[data-mod="m-lrn-source"]', '检查依据'],
    ['[data-mod="m-lrn-bound"]', '自动运行边界'],
    ['#bzboards',   '业绩看板总览'],
    ['#bzsrc',      '数据底仓']
  ];
  function labelOf(el) {
    for (const [s, n] of NAME) if (el.matches(s)) return n;
    const h = el.querySelector('h2, h3, .bzsec__h h3, .block__h h3');
    return h ? String(h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 14) : '';
  }

  /* ── 可展开块：一个内容块内部本来就分了若干固定子板块 ───────
     2026-09-18 10:52 本人：「上层导航栏的小标题对应到每个子模块，做替换补充；
       『本周策略回顾』这里换成：▇▇.本季度个人数据达成进展 ▇▇.机构分层经营进展
       ▇▇.AI 新洞察 ▇▇.本周日常工作回顾 ▇▇.市场探索及亮点挖掘」
     做法：块自己在根节点上声明 data-l3sel="子板块选择器"（可选
     data-l3lbl="标题选择器"，默认 h4/h3）。格子头的小链接和顶部三级条
     都走这里展开，所以只需在块的渲染里加一个属性，两处导航同时生效。
     不声明 data-l3sel 的块行为完全不变。 */
  function expand(els) {
    const out = [];
    els.forEach(el => {
      const sel = el.dataset && el.dataset.l3sel;
      const kids = sel ? $$(sel, el) : [];
      if (!kids.length) { out.push({ el, lbl: labelOf(el) }); return; }
      const ls = el.dataset.l3lbl || 'h4, h3';
      kids.forEach(k => {
        const h = $(ls, k);
        const lbl = h ? String(h.textContent || '').replace(/\s+/g, ' ').trim() : '';
        out.push({ el: k, lbl: lbl || labelOf(k) });
      });
    });
    return out.filter(x => x.lbl);
  }

  function inner(box) {
    return expand($$(':scope > .cgrp__b > *', box)).map((x, i) => {
      if (!x.el.id) x.el.id = box.id + '-k' + i;
      return { el: x.el, id: x.el.id, lbl: x.lbl };
    });
  }

  function boot() {
    let any = false;
    $$('.sec').forEach(sec => { if (group(sec)) any = true; });
    if (!any) return;
    /* 搬完 DOM 图表容器宽度变了，不重算一次会画歪 */
    setTimeout(() => {
      try { window.CEC_CHARTS && CEC_CHARTS.resizeAll && CEC_CHARTS.resizeAll(); } catch (e) {}
    }, 80);
    /* 格子头上的小链接接到 sub.js 的滚动上，落点避开顶栏与三级条 */
    document.addEventListener('click', e => {
      const b = e.target.closest('.cgrp__a[data-go]');
      if (!b) return;
      e.preventDefault();
      if (window.SUBNAV && SUBNAV.goto) SUBNAV.goto(b.dataset.go, 1);
      else { const t = document.getElementById(b.dataset.go); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  }

  return { boot, PLAN, MAP, SLOTS, SLOT_ALIAS, inner, labelOf, expand };
})();

(function () {
  const go = () => { try { CGRP.boot(); } catch (e) { console.warn('cgrp', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

/* ═══════════════════════════════════════════════════════════
   mind.js —— 认知与学习（v8 新增）
   三条线：发现你的思维模式 / 构建长期记忆 / 寻找问题背后的前提

   ⛔ 纪律：
   ▇▇. 这一节只处理「你怎么想」，不出现任何业绩数字（业绩全部归 ▇▇ 业务工作区）。
   ▇▇. 思维模式是从你 2026-09-12 两批共 ▇▇条裁决的**实际选择**里反推的，
      每条都带 Q 编号；凡是我推断的，标 💭，不得当事实引用。
   ▇▇. 记忆体的所有计数来自 2026-09-12 本地仓库实测（find / grep），不是手算。
   ═══════════════════════════════════════════════════════════ */

window.MIND = (function () {

  /* 新模块的 Obsidian 落点，注册进 MODS（data.js 先加载） */
  if (window.MODS || typeof MODS !== 'undefined') {
    Object.assign(MODS, {
      'm-pattern':  { t: '决策模式', links: [
        { t: '待复核队列（裁决原话）', f: '_系统/待复核队列.md', mode: 'open' },
        { t: '判断规则库', f: '_系统/判断规则库.md', mode: 'open' } ] },
      'm-antipat':  { t: '我的坏习惯', links: [
        { t: '学习日志', f: '_系统/学习日志.md', mode: 'open' } ] },
      'm-memtier':  { t: '记忆体六层', links: [
        { t: '判断规则库（▇▇条）', f: '_系统/判断规则库.md', mode: 'open' },
        { t: '口径词典（▇▇条）', f: '_系统/口径词典.md', mode: 'open' } ] },
      'm-memrule':  { t: '记忆写入规则', links: [
        { t: 'AIME.md（四层结构）', f: 'AIME.md', mode: 'open' } ] },
      'm-decay':    { t: '记忆衰减', links: [
        { t: '判断规则库 · 规则健康度', f: '_系统/判断规则库.md', mode: 'open' } ] },
      'm-collapse': { t: '前提坍塌实录', links: [
        { t: '学习日志', f: '_系统/学习日志.md', mode: 'open' },
        { t: '待复核队列', f: '_系统/待复核队列.md', mode: 'open' } ] },
      'm-premise3': { t: '三类前提', links: [
        { t: '口径词典', f: '_系统/口径词典.md', mode: 'open' } ] },
      'm-fiveq':    { t: '五问链', links: [
        { t: '高阶指令手册', f: '_系统/高阶指令手册.md', mode: 'open' } ] }
    });
  }

  /* ── 仓库实测底数（2026-09-13，find / grep 实跑）────────── */
  const VAULTFACT = {
    stamp: '2026-09-13',
    notes: 52,
    rules: 90,
    cal: 46,
    counter: 19,
    logs: 18,
    openQ: 10,
    hotQ: 2,
    dirs: 16,
    emptyDirs: 5,
    ruleCats: [
      { k: 'R-000 基础纪律',     n: 8,  d: '取数先看来源、推断不当事实——最底层的五条' },
      { k: 'R-100 工具路由',     n: 9,  d: '该用哪个数据源、哪个工具、哪个 CLI' },
      { k: 'R-200 数据纪律',     n: 18, d: '口径、分母、日期、取数自检——全库最硬的一类' },
      { k: 'R-300 增减投归因',   n: 7,  d: '09-13 新增 R-304/R-305：减投第一原因是「客户要的变了」，五问链升级六问链' },
      { k: 'R-400 达人推荐组包', n: 20, d: '2026-09-09 从空白一次填实，是增长最快的一类' },
      { k: 'R-500 协作与产出',   n: 28, d: '我该出什么、怎么呈现、怎么交办——09-13 新增 R-521/▇▇' },
      { k: '拜访策略',           n: 0,  d: '⛔ 全库唯一还是 ▇▇ 的一类——拜访快记已开，下一家拜访完就能长出第一条' }
    ]
  };

  /* ── 一、思维模式（从裁决行为反推）──────────────────────── */
  const PATTERNS = [
    {
      id: 'P1', t: '先要名单，再谈动作',
      s: '强',
      w: '你两次拒绝了「只有数量、没有名单」的结论。',
      ev: ['Q-032：周报说 ▇▇家停滞，你的回答是「你自己去 MMM 明细里算」——不接受一个没有主体的数字',
           'Q-031：重点达人补 ▇▇人，你说「先放着，我自己想」——名单没定之前不让我往下推'],
      so: '对我的约束：凡是我给你一个「有数量、无主体」的结论，都要当半成品退回。下次我直接把名单算出来再说话。'
    },
    {
      id: 'P2', t: '口径优先于好看的结果',
      s: '强',
      w: '两次在「数字难看」和「口径统一」之间，你都选了口径统一。',
      ev: ['Q-017：分母选全量 ▇▇万而不是分层 ▇▇万——明知道分母变大、达成率会显示得更低',
           'Q-018：AI 创作者以打标表 ▇▇ 为准，推翻周报口径 ▇▇——名单变大，利用率就变难看'],
      so: '这条已经写成规则 R-512（引用业绩数字必须带看板 + 数据截止日）和 R-513（待结算池先问分母版本）。'
    },
    {
      id: 'P3', t: '对系统扩张保守，对数据精度激进',
      s: '强',
      w: '同一天里，你否掉了所有「新开一摊」的建议，却要求我把明细重算一遍。',
      ev: ['Q-029 / Q-020：入料口三个选项全否，最后定为「先不开，这事没那么急」',
           'Q-024：技能池 ▇▇个，裁决是「都留着不动」',
           '同一天 Q-032 却要求我下钻到 MMM 逐笔明细重算停滞机构'],
      so: '💭 推断：你的瓶颈不在工具数量，在可信数据。再给你推新模块前，我先自问「这是加精度还是加摊子」。'
    },
    {
      id: 'P4', t: '止损果断，但不放弃资产',
      s: '中',
      w: '砍掉专项投入的同时，你没有让我把在途和关系一起放掉。',
      ev: ['Q-033：短剧演员专项确认本季止损，但口径说明要写清「在途 ▇▇万继续催、达人关系继续维护」'],
      so: '止损 ≠ 清零。以后我写止损稿，默认三段式：停什么 / 留什么 / 资源改投哪。'
    },
    {
      id: 'P5', t: '先质疑指标定义，再决定要不要补',
      s: '强',
      w: '我把「▇▇位无刊例」当成短板，你直接质疑了这个指标本身。',
      ev: ['Q-034 你的补充原话：「只要是我的表内可见达人产生变现均是可以为我带来业绩的，没有刊例可能是机构没有整理」'],
      so: '已写成规则 R-516：「没有刊例」是机构侧资料整理进度，不是达人侧变现能力。这条直接作废了我一个 P2 动作的框法。'
    },
    {
      id: 'P6', t: '要我把话说死，不要「两方面都有道理」',
      s: '中',
      w: '你给的选项永远是互斥的三选一，不是程度题。',
      ev: ['六次闸门裁决全部是单选，没有一次选「都要」', 'Q-035 的问法也是「▇▇万还是 ▇▇万」，二选一'],
      so: '💭 推断：给你写材料时，「A 和 B 各有优劣」等于没写。先给判断，再给代价。'
    }
  ];

  /* 反模式：我观察到的、会让你返工的三个我方习惯 */
  const ANTI = [
    { t: '我手算计数，不 grep', d: '队列数手写成 ▇▇/▇▇，实测是 ▇▇/▇▇；这次「待确认 ▇▇条」也是只数了本轮新增，实测 <b>▇▇条</b>。<b>同一个坑第三次。</b>', r: '已立 R-514（取数先过质量闸），但这条坑是「计数」不是「取数」，规则库里其实还缺一条。' },
    { t: '我先框问题，再问你', d: 'Q-020 我按「先开哪个目录」框，三个选项你全否。框错了问题，选项再多也没用。', r: '正确做法是先问「这事该不该现在做」，再问「怎么做」。' },
    { t: '我把旧结论留在页面上', d: '「结构上限 ▇▇」被推翻后一度还留在页面。', r: '已立规则：被推翻的判断就地作废，不装没发生过。' }
  ];

  /* ── 二、长期记忆 ──────────────────────────────────────── */
  const MEMTIERS = [
    { k: '判断规则库', n: 70, u: '条', st: 'run',
      d: '七类。<b>增长最快的是达人推荐组包（▇▇条）</b>，唯一还是 ▇▇ 的是拜访策略类。',
      f: '_系统/判断规则库.md' },
    { k: '口径词典', n: 42, u: '条', st: 'run',
      d: '结算 / 在途 / 有效待结算池 / 分层 / 达成率分母……<b>全库最硬的一层</b>，每条都被实际用过。',
      f: '_系统/口径词典.md' },
    { k: '反面教材', n: 19, u: '条', st: 'run',
      d: '每一条都造成过实际返工。<b>比正面规则更值钱</b>——日期混合格式那条曾漏掉 ▇▇万行。',
      f: '_系统/判断规则库.md' },
    { k: '裁决归档', n: 24, u: '条', st: 'run',
      d: '09-12 两批：第一批 ▇▇条 + 第二批 ▇▇条，另有 ▇▇条早期归档。<b>这是你的偏好最可信的来源。</b>',
      f: '_系统/待复核队列.md' },
    { k: '学习日志', n: 9, u: '篇', st: 'part',
      d: '前 ▇▇篇里 ▇▇篇是「搬运」只有 ▇▇篇是校准；09-12 之后 ▇▇篇全是校准。<b>比例正在掰回来。</b>',
      f: '_系统/学习日志.md' },
    { k: '事实层原料', n: 0, u: '篇', st: 'gap',
      d: '机构档案 ▇▇ · 拜访纪要 ▇▇ · 方案 ▇▇ · 收件箱 ▇▇。<b>规则是从文档里搬来的，不是从现场长出来的。</b>',
      f: '10-机构档案' }
  ];

  const MEMRULE = [
    { y: 1, t: '同一件事重复 ≥ ▇▇次', d: '第三次出现就封装成规则或 skill，前两次只记在学习日志里。' },
    { y: 1, t: '踩过并造成返工的', d: '直接进反面教材库，不等第三次。代价已经付过了。' },
    { y: 1, t: '你亲口裁决过的', d: '进口径词典或规则库，标上 Q 编号和日期，是最高权威。' },
    { y: 0, t: '我推断出来的', d: '只进待复核队列，标 💭，<b>不写进规则库</b>——推断进了记忆就会被当事实用。' },
    { y: 0, t: '一次性的具体结论', d: '如「本周 X 机构要发单」，落到经营分析笔记，不进长期记忆，否则记忆里全是过期数字。' }
  ];

  /* 记忆衰减风险 */
  const DECAY = [
    { t: '▇▇条规则挂错了地方', lv: '高',
      d: '按七类统计 <code>### R-</code> 只得 ▇▇条，全文实测 <b>▇▇条</b>，差 ▇▇。逐段翻下去发现 <b>R-504~R-518 被追加在「规则健康度」这个小节底下</b>——它们不属于任何业务分类，靠分类索引找不到。<b>这批正好是 09-12 新写的，也就是最该被用上的那批。</b>',
      fix: '✅ 已于 2026-09-12 晚补加「七、待归类」标题止血，▇▇条现在都能被索引到。<b>剩下的活是按内容归回 R-100/▇▇/▇▇ 各类</b>，这一步得逐条读，我不自作主张。' },
    { t: '状态标注体系名存实亡', lv: '高',
      d: '规则库里大量条目行文写着「已验证」，但 <code>grep 状态：</code> 只能捞到 <b>▇▇条</b>带结构化状态标记的。<b>其余的「已验证」是行文里的形容词，不是可机读的状态。</b>所以「规则健康度」这个指标本身现在不可信。',
      fix: '要么补齐状态字段，要么承认现在没有验证体系、把「已验证」全部降级为「已录入」。<b>这条得你定</b>——它决定要不要继续对外说「已验证 N 条」。' },
    { t: '一类规则长期为 ▇▇', lv: '中',
      d: '拜访策略类 ▇▇条，因为 40-拜访与会议 目录 ▇▇篇。<b>规则的空白是原料空白的影子，不是方法论缺陷。</b>',
      fix: '按 Q-029 你已裁决「入料口先不开」，那这一类就明确标为「有意留空」，不再当缺陷计入健康度。' },
    { t: '规则之间还没有互引', lv: '中',
      d: 'R-512 / R-513 / R-514 三条讲的是同一件事的三个面（来源、分母、质量），但彼此之间没有引用关系，调用时容易只想起一条。',
      fix: '💭 建议：给规则库加一层「触发场景 → 规则组」的索引，按场景整组调，而不是逐条记。' }
  ];

  /* ── 三、问题背后的前提 ────────────────────────────────── */
  /* 最近三条已确认纠错 —— 新记录替换旧记录，不继续堆叠 */
  const COLLAPSE = [
    {
      c: 'MMM 看板筛选到 10-09，所以可以当作 10 月最新经营数据',
      p: '前提：筛选配置日期 = 明细真实最大业务日期，且 ▇▇行返回没有截断关键时间窗',
      k: '2026-10-10 用 prm-cli 回源后核到：实际可读明细最新发单日仅 2026-03-15，旧数据集还标了待下线',
      r: '链路可访问 ≠ 数据新鲜 → 不用旧数覆盖 09-30 已确权结论；下一步切「星图任务结算数据集」并核最大日期、字段与行数上限',
      when: '2026-10-10'
    },
    {
      c: '品牌动向用 客户C 单品牌专题就能代表整个模块',
      p: '前提：用户要的是一个品牌案例，而不是可切换、可继续扩展的品牌维度',
      k: '2026-10-10 你明确指出「不要只圈定一个品牌」',
      r: '单案例不能充当范围边界 → 已改成 客户C / 客户E / 客户F三品牌概览；未命中品牌回竞媒雷达现场分析，不在静态页补造数据',
      when: '2026-10-10'
    },
    {
      c: '客户与商机需求页应该继续保留竞媒雷达跳转入口',
      p: '前提：同一能力在多个页面重复出现，会让调用更方便而不是制造信息噪音',
      k: '2026-10-10 你要求删除该页入口，并保留外部大盘里的品牌回源链路',
      r: '删除指定位置 ≠ 停用能力 → 客户页只留商机工作台，竞媒雷达继续由外部大盘承接，避免重复入口',
      when: '2026-10-10'
    }
  ];

  /* 前提审查器：任何结论下面都挂三类前提 */
  const PREMISE3 = [
    { k: '口径前提', q: '这个数的分母 / 时间窗 / 统计范围是哪一版？换一版还成立吗？',
      ex: '「待结算池 ▇▇万」换成「9 月内可确认」口径就只剩 ▇▇万——同一件事差 ▇▇倍。', c: 'signal' },
    { k: '数据前提', q: '底表干净吗？有没有脏日期、重复行、截止日之后的行？',
      ex: '待结算池总额 ▇▇亿里混着 ▇▇ 年的预计结算日，总额不可对外引用。', c: 'open' },
    { k: '主体前提', q: '这个结论指向的具体主体是谁？名单拿得到吗？',
      ex: '「▇▇家停滞」拿不到名单时，这条动作就只是一句话。', c: 'run' }
  ];

  /* 五问链 —— 从 ▇▇ 归因推演器搬来的方法，这里作为通用前提追问 */
  const FIVEQ = [
    { n: 1, q: '这个结论的原话是什么？', d: '先把结论按原样抄下来，不要先改写成我更喜欢的版本。' },
    { n: 2, q: '它依赖的三类前提分别是什么？', d: '口径 / 数据 / 主体，逐个写出来，写不出来的那一类就是风险点。' },
    { n: 3, q: '哪一条前提最可能是错的？', d: '优先怀疑「我没亲手算过的那一条」。' },
    { n: 4, q: '如果那条前提翻了，结论会怎么变？', d: '变数量、变性质，还是整段作废？三个量级完全不同。' },
    { n: 5, q: '验证它要付多少成本？', d: '如果 ▇▇ 分钟能验，就别在没验的情况下往下推演。' }
  ];

  /* ═══════════════ 渲染 ═══════════════ */

  function scoreBar(s) {
    const n = s === '强' ? 3 : s === '中' ? 2 : 1;
    return `<span class="pm__s" title="证据强度：${s}">${[1, 2, 3].map(i =>
      `<i class="${i <= n ? 'is-on' : ''}"></i>`).join('')}</span>`;
  }

  function secPattern() {
    let out = '';

    out += `<div class="mindlead">
      <p><b>这一节不是性格测试。</b>下面 ▇▇条是从你 2026-09-12 两批共 ▇▇条裁决的<em>实际选择</em>里反推出来的——
      每条都挂着 Q 编号，你可以逐条驳回。<b>我不猜你的性格，我只看你在互斥选项前把手放在了哪一边。</b></p>
      <p class="mindlead__w">⚠️ 标 💭 的是我的推断，没有你的原话支撑，不得当事实引用。</p>
    </div>`;

    out += block('m-pattern', `决策模式 · ${PATTERNS.length} 条`, '每条都可追溯到具体裁决',
      '排序按证据强度，不按重要性。<b>「强」= 有两次以上同向选择或你的原话；「中」= 只有一次，可能是偶然。</b>',
      `<div class="pms">${PATTERNS.map(p => `<div class="pm" data-gap="▇▇">
        <div class="pm__h">
          <span class="pm__id">${p.id}</span>
          <h4>${p.t}</h4>
          ${scoreBar(p.s)}
        </div>
        <p class="pm__w">${p.w}</p>
        <ul class="pm__ev">${p.ev.map(e => `<li>${e}</li>`).join('')}</ul>
        <div class="pm__so"><i>对我的约束</i><span>${p.so}</span></div>
      </div>`).join('')}</div>`);

    out += block('m-antipat', '反过来：我身上会让你返工的三个习惯', '这一条是我自己的检讨',
      '思维模式是双向的。你的模式我已经识别出来了，<b>我自己的坏习惯也得摆在同一页上</b>，否则这一节只是恭维。',
      `<div class="anti">${ANTI.map((a, i) => `<div class="anti__i">
        <div class="anti__n">${i + 1}</div>
        <div><h5>${a.t}</h5><p>${a.d}</p><p class="anti__r">→ ${a.r}</p></div>
      </div>`).join('')}</div>`);

    return out;
  }

  function secMemory() {
    let out = '';

    out += `<div class="mindlead">
      <p><b>长期记忆不是「把东西存下来」，是「下次能被正确调出来」。</b>
      这一节盘的是：记了什么、什么该记什么不该记、以及<em>哪些记忆正在失效</em>。</p>
      <p class="mindlead__w">全部计数为 ${VAULTFACT.stamp} 本地仓库实测（find / grep），不是手算。</p>
    </div>`;

    out += block('m-memtier', '记忆体 · 六层对账', '存了什么，各多少',
      '按可信度从高到低排。<b>最底下那一层是 ▇▇——这是整套记忆系统唯一的结构性缺陷。</b>',
      `<div class="mt">${MEMTIERS.map(m => `<div class="mt__i" data-st="${m.st}" data-gap="${m.st === 'gap' ? 1 : 0}">
        <div class="mt__k">${m.k}</div>
        <div class="mt__n">${m.n}<small>${m.u}</small></div>
        <div class="mt__d">${m.d}</div>
        <div class="mt__f">${m.f}</div>
      </div>`).join('')}</div>
      <div class="mchart" id="c-memcat" style="height:240px;margin-top:22px"></div>
      <p class="block__note" style="margin-top:10px;margin-bottom:▇▇">
        上图是 ▇▇条规则的分类分布。<b>拜访策略类为 ▇▇ 不是方法论缺陷，是原料空白的影子</b>——
        40-拜访与会议 目录一篇都没有，规则自然长不出来。按 Q-029 的裁决，这一格现在明确标为「有意留空」。</p>`);

    out += block('m-memrule', '写入规则 · 什么进长期记忆，什么不进', '防止记忆被垃圾填满',
      '记忆系统最大的风险不是记得少，是<b>把一次性结论和推断当成长期事实存进去</b>，下次被当真。',
      `<div class="mr">${MEMRULE.map(r => `<div class="mr__i mr__i--${r.y ? 'in' : 'out'}">
        <span class="mr__m">${r.y ? '✓ 进' : '✕ 不进'}</span>
        <div><b>${r.t}</b><p>${r.d}</p></div>
      </div>`).join('')}</div>`);

    out += block('m-decay', '记忆衰减 · 三处正在失效的地方', '这一块最该你看',
      '存进去不等于还有效。<b>下面三条是我自查出来的，其中第一条性质最严重——它让规则库的「健康度」这个指标本身不可信。</b>',
      `<div class="dcy">${DECAY.map(d => `<div class="dcy__i" data-lv="${d.lv}" data-gap="${d.lv === '高' ? 1 : 0}">
        <div class="dcy__h"><span class="dcy__lv">${d.lv}风险</span><h5>${d.t}</h5></div>
        <p>${d.d}</p>
        <div class="dcy__fix"><i>怎么办</i><span>${d.fix}</span></div>
      </div>`).join('')}</div>`);

    return out;
  }

  function secPremise() {
    let out = '';

    out += `<div class="mindlead">
      <p><b>一个结论翻车，九成不是算错，是它底下踩着一条没人验过的前提。</b>
      这一节给三样东西：已经发生过的<em>前提坍塌实录</em>、任何结论都要过的<em>三类前提</em>、以及一条可以照着走的五问链。</p>
    </div>`;

    const recent = COLLAPSE.slice(0, 3);
    out += block('m-collapse', `最近确认纠错 · ${recent.length} 条`, '只保留最新三条，不继续堆叠',
      '已核对截至 <b>2026-10-10 17:▇▇</b> 的工作台反馈收件箱、反馈处理台账与当前代码现状；没有更新反馈推翻以下三条。每日刷新只做三件事：新反馈与台账对账、已确认的新记录替换最旧一条、待确认事项不混进确认记录。',
      `<div class="clp">${recent.map((c, i) => `<div class="clp__i">
        <div class="clp__n">${String(i + 1).padStart(2, '0')}</div>
        <div class="clp__b">
          <div class="clp__c">原结论：<b>${c.c}</b></div>
          <div class="clp__p">${c.p}</div>
          <div class="clp__k"><i>触发</i>${c.k}</div>
          <div class="clp__r">${c.r}</div>
        </div>
        <div class="clp__d">${c.when}</div>
      </div>`).join('')}</div>
      <p class="block__note" style="margin-top:16px;margin-bottom:▇▇">
        <b>三条里一条来自数据回源、两条来自你对页面范围的明确纠错。</b>这说明“纠错同步”不能只存数据错误，
        还要把你确认过的范围边界同步进页面；否则同一能力会换个位置再次堆回来。</p>`);

    out += block('m-premise3', '三类前提 · 出稿前必须自问', '口径 / 数据 / 主体',
      '任何一个结论，写下来之前先过这三格。<b>哪一格答不上来，那一格就是这条结论的软肋，必须在正文里标出来，而不是藏起来。</b>',
      `<div class="pr3">${PREMISE3.map(p => `<div class="pr3__i" data-c="${p.c}">
        <div class="pr3__k">${p.k}</div>
        <div class="pr3__q">${p.q}</div>
        <div class="pr3__ex"><i>真实例子</i>${p.ex}</div>
      </div>`).join('')}</div>`);

    out += block('m-fiveq', '五问链 · 拿到任何结论先问这五句', '可以照抄给我用',
      '这套链子原本长在 ▇▇ 的归因推演器里，只用于增减投。<b>现在提到规则与口径层，对任何结论通用。</b>',
      `<div class="fq">${FIVEQ.map(f => `<div class="fq__i">
        <div class="fq__n">${f.n}</div>
        <div><b>${f.q}</b><p>${f.d}</p></div>
      </div>`).join('')}</div>
      <div class="fq__run">
        <div class="fq__rk">拿一个结论试一下</div>
        <input id="pmIn" placeholder="把一个结论粘进来，比如「腰部机构是三档里唯一掉队的」…" autocomplete="off">
        <button class="btn btn--solid" id="pmGo">生成前提清单</button>
      </div>
      <div class="fq__out" id="pmOut" hidden></div>`);

    return out;
  }

  /* ── 前提审查器（纯本地，生成可复制的追问清单）── */
  function wire() {
    const go = document.getElementById('pmGo');
    if (!go) return;
    const run = () => {
      const v = (document.getElementById('pmIn').value || '').trim();
      const box = document.getElementById('pmOut');
      if (!v) { box.hidden = true; return; }
      box.hidden = false;
      box.innerHTML = `
        <div class="pmo__h">对「<b>${esc(v)}</b>」的前提清单 —— 这五条答完再往下推演</div>
        <ol class="pmo__l">
          <li><b>原话</b>：${esc(v)}<br><span>先确认这是原话，不是我改写过的版本。</span></li>
          <li><b>口径前提</b>：这句话里的数，分母是哪一版？时间窗到哪天？换一版还成立吗？</li>
          <li><b>数据前提</b>：底表过没过质量闸——脏日期、重复行、截止日之后的行，各是多少？</li>
          <li><b>主体前提</b>：具体是谁？名单能不能落到 Excel 的一列上？落不了就是半成品。</li>
          <li><b>翻车代价</b>：如果最可疑的那条前提翻了，这个结论是变数量、变性质，还是整段作废？</li>
        </ol>
        <div class="pmo__f">
          <button class="btn" id="pmCopy">复制这五问发我</button>
          <button class="btn" id="pmQ">加进行动队列</button>
        </div>`;
      document.getElementById('pmCopy').onclick = () => {
        const t = `【前提审查】结论：${v}\n1. 原话核对\n2. 口径前提：分母哪一版 / 时间窗到哪天\n3. 数据前提：脏日期·重复行·越界行各多少\n4. 主体前提：名单能不能落到一列上\n5. 翻车代价：变数量 / 变性质 / 整段作废`;
        navigator.clipboard?.writeText(t);
        toast('五问已复制，粘给我就行');
      };
      document.getElementById('pmQ').onclick = () => {
        TOOLS.addQ(`前提审查：${v}`, 'premise');
        toast('已进行动队列');
      };
    };
    go.addEventListener('click', run);
    document.getElementById('pmIn')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') run();
    });
  }

  /* ── 规则七类分布图 ── */
  function chart() {
    if (!window.echarts) return;
    const el = document.getElementById('c-memcat');
    if (!el) return;
    /* v8：视图路由下这一块可能还藏着，高度为 ▇▇ 时 echarts 会画成空白。
       等它真正可见再画；已画过的只 resize。 */
    if (el.__done) { el.__ch && el.__ch.resize(); return; }
    if (!el.clientHeight) return;
    el.__done = 1;
    const cs = getComputedStyle(document.body);
    const ink = cs.getPropertyValue('--ink').trim() || '#111';
    const ink3 = cs.getPropertyValue('--ink-3').trim() || '#888';
    const sig = cs.getPropertyValue('--signal').trim() || '#c7318c';
    const d = [...VAULTFACT.ruleCats].sort((a, b) => a.n - b.n);
    const ch = echarts.init(el, null, { renderer: 'svg' });
    ch.setOption({
      grid: { left: 130, right: 40, top: 6, bottom: 6 },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(120,120,150,.14)' } }, axisLabel: { color: ink3, fontSize: 10 } },
      yAxis: {
        type: 'category', data: d.map(x => x.k),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 11 }
      },
      tooltip: {
        trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: p => { const i = d.find(x => x.k === p[0].name); return `<b>${i.k}</b> · ${i.n} 条<br><span style="opacity:.7">${i.d}</span>`; }
      },
      series: [{
        type: 'bar', data: d.map(x => ({
          value: x.n,
          itemStyle: { color: x.n === 0 ? sig : 'rgba(124,92,255,.85)', borderRadius: [0, 4, 4, 0] }
        })),
        barWidth: 15,
        label: { show: true, position: 'right', formatter: p => p.value === 0 ? '▇▇ ⛔' : p.value, color: ink3, fontSize: 10.5 }
      }]
    });
    window.addEventListener('resize', () => ch.resize());
    el.__ch = ch;
  }

  return { secPattern, secMemory, secPremise, wire, chart, FACT: VAULTFACT };
})();

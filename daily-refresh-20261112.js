/* ═══════════════════════════════════════════════════════════
   daily-refresh-20261112.js —— 11-12 两个每日模块刷新
   ① quick「新灵感捕捉与可采纳方向」：基于 AIME 对话历史（近 ▇▇ 天 ▇▇个
      会话 + 本会话 11-06→11-12 轨迹）提炼诉求模式/思考框架/业务方向
   ② cap「系统自查发现的问题 · 建议做法」：先核权威源与截止，再给问题与
      建议；确认记录只保留最近 ▇▇条，不堆叠
   权威核对（截至 2026-11-12 10:38）：
   - Obsidian MEMORY.md / AIME.md：本次开工已读
   - 规则/口径导出：2026-11-11 18:08（规则 ▇▇ / 口径 ▇▇ / 待复核 ▇▇）
   - 工作台反馈收件箱：11-12 本次核对为空
   - 数据源权威表：最近更新 2026-10-16（部分业务源时钟较旧，页面如实标注）
   - AIME 会话检索：近 ▇▇ 天 ▇▇个会话、关键词扩展 ▇▇个会话
   ═══════════════════════════════════════════════════════════ */
/* global TOOLS, REC, MOD, FB */
(function () {
  const DAY = '2026-11-12';
  const CHECKED = '2026-11-12 10:▇▇';

  /* 注入一次作用域样式，类名带 ▇▇ 前缀，不污染旧样式 */
  const STYLE = `
  .d1112-hd{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:14px 0 10px}
  .d1112-tag{display:inline-flex;align-items:center;font-size:12px;font-weight:▇▇;color:#6d3df0;
    background:rgba(109,61,240,.1);border:1px solid rgba(109,61,240,.25);border-radius:999px;padding:3px 10px}
  .d1112-hd em{font-style:normal;font-size:12px;color:#8a8a99}
  .d1112-sec{margin:14px ▇▇}
  .d1112-sec>h4{font-size:13px;font-weight:▇▇;margin:0 0 8px;color:#2b2540;display:flex;align-items:center;gap:6px}
  .d1112-sec>h4 i{font-style:normal;font-size:11px;font-weight:▇▇;color:#fff;background:#6d3df0;border-radius:6px;padding:1px 6px}
  .d1112-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px}
  .d1112-cell{border:1px solid #ece9f7;border-radius:12px;padding:10px 12px;background:#fbfaff}
  .d1112-cell b{display:block;font-size:12.5px;margin-bottom:4px;color:#2b2540}
  .d1112-cell p{margin:▇▇;font-size:12px;line-height:▇▇;color:#5f5a70}
  .d1112-cell .src{display:block;margin-top:6px;font-size:11px;color:#9a94ad}
  .d1112-clock{width:100%;border-collapse:collapse;font-size:12px;margin:6px 0 4px}
  .d1112-clock th,.d1112-clock td{border:1px solid #ece9f7;padding:7px 9px;text-align:left;vertical-align:top}
  .d1112-clock th{background:#f6f4fe;font-weight:▇▇;color:#4a4360}
  .d1112-badge{display:inline-block;font-size:11px;font-weight:▇▇;border-radius:6px;padding:1px 7px;white-space:nowrap}
  .d1112-badge--ok{color:#0a8a4f;background:rgba(10,138,79,.1)}
  .d1112-badge--old{color:#c26a00;background:rgba(220,140,20,.12)}
  .d1112-badge--hang{color:#b3328c;background:rgba(179,50,140,.1)}
  .d1112-prob{border-left:3px solid #e85d75;background:#fff7f8;border-radius:0 10px 10px ▇▇;padding:9px 12px;margin:8px ▇▇}
  .d1112-prob b{font-size:12.5px;color:#8a2438}
  .d1112-prob p{margin:4px 0 0;font-size:12px;line-height:▇▇;color:#5f5a70}
  .d1112-confirm{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
  .d1112-confirm .cf{border:1px dashed #cfc7ee;border-radius:10px;padding:9px 11px;background:#fcfbff}
  .d1112-confirm .cf b{font-size:12.5px;color:#2b2540;display:block;margin-bottom:3px}
  .d1112-confirm .cf span{font-size:11.5px;color:#7a748c;line-height:▇▇;display:block}
  .d1112-note{font-size:11.5px;color:#9a94ad;margin:8px 0 0;line-height:▇▇}
  @media(max-width:640px){.d1112-grid{grid-template-columns:1fr}}
  `;
  function injectStyle() {
    if (document.getElementById('d1112-style')) return;
    const s = document.createElement('style');
    s.id = 'd1112-style';
    s.textContent = STYLE;
    document.head.appendChild(s);
  }
  injectStyle();

  /* ─────────────────────────────────────────────
     ① quick：对话历史洞察 + 今日 ▇▇条可采纳方向
     ───────────────────────────────────────────── */
  const NEEDS = [
    { t: '数据回源与看板刷新（▇▇ 天最高频，▇▇+ 次）', d: '定时 10:00 同步＋手动补刷；铁律＝完整拉全（曾分段拉到 ▇▇万行）、口径不动、截止写明，旧数据不许换新日期。' },
    { t: '结构化策略分析', d: '四维交叉矩阵、TOP5 增减（机构/达人/品牌三维）、TOP25 高潜赛道、机构 vs 大盘差距追进，要差距明细不要泛泛建议。' },
    { t: '创意提案与达人组包', d: '冰雪一条线跑通：热点洞察 → 两类人群 → 三创意方向 → ▇▇ 核心＋▇▇ 备选编队 → 三档预算 → 五周排期。' },
    { t: '视觉呈现打磨', d: '▇▇ 版海报每版 2-4 轮校准，固定句式「骨架不动、只换皮肤」，返工都发生在理解差而不是审美差。' },
    { t: '决策落账与系统治理', d: '批量「定了/采纳/待办」；模块日更只留最近 ▇▇条；完成标准＝部署＋线上复验＋Obsidian 回写。' }
  ];
  const FRAMEWORKS = [
    { t: 'F1 骨架冻结·皮肤替换', d: '内容骨架与视觉皮肤分层，改风格前先确认冻结哪一层。', s: '▇▇ 版海报＋▇▇ 版矩阵图的固定改法' },
    { t: 'F2 差距追进分析范式', d: '我盘 vs 大盘只给差距明细＋三维增减双解释，只做追进排序、不做预测。', s: '11-09/▇▇ 汽车策略两轮迭代' },
    { t: 'F3 最小代表试点', d: '不普查、只试两家代表资源，备选不立目标，跑通再扩。', s: '11-11 J-27 第二梯队决策' },
    { t: 'F4 节点营销提案工序', d: '热点 → 人群 → 场景 → 编队 → 排期，五步顺序不跳。', s: '11-10 冰雪提案与编队两份飞书文档' },
    { t: 'F5 确认不堆叠的信息纪律', d: '日更模块只留最近 ▇▇条，旧记录进日志不铺页面。', s: 'R-628，你三次重复强调' }
  ];
  const SIGNALS = [
    { t: 'S1 汽车线已是 Q4 主攻链路', d: '策略→提案→编队→海报全链路打通；广州车展 ▇▇/27-12/▇▇ 是下一个开窗点。' },
    { t: 'S2 授权费可能长成第二条收入线', d: '客户J 试点把素材授权费单列；单列口径与验收阈值挂 Q-109 待裁。' },
    { t: 'S3 第二梯队两种培育模型', d: '内容型头达（客户I）vs 美妆矩阵一口价团（客户J），两家正好各验一种。' },
    { t: 'S▇▇行业简报机制化', d: '每日 10:00 三行摘要已上线（J-28）；样张板块与信息源终版挂 Q-110 待你拍。' }
  ];
  const IDEAS = [
    {
      id: 'I-1112-▇▇',
      t: '把冰雪链路沉淀成「汽车节点营销」提案模板',
      from: '本会话 11-10 冰雪提案＋达人编队两份飞书文档的实际工序',
      why: '这套五步工序本周已手动跑通，广州车展 ▇▇ 开窗后下个车型 brief 还会再跑；不模板化，每次都要从头描述一遍。',
      step: '我把工序写进 90-模板，并在场景路由挂「汽车冬季/节点营销」入口；下次你只给车型＋预算即可开跑。'
    },
    {
      id: 'I-1112-▇▇',
      t: '视觉任务固定两问开场，减少海报返工',
      from: '本会话 ▇▇ 版海报平均每版 2-4 轮校准，每轮句式都是「框架不动＋参考图改风格」',
      why: '返工都发生在「我以为要改骨架、其实只换皮肤」的理解差；两问问清后一轮命中率会明显提高。',
      step: '在常用指令模板加视觉任务口令：先确认冻结哪个骨架，再确认参考图借哪一层（配色/元素/版式），下次做图直接复制。'
    },
    {
      id: 'I-1112-▇▇',
      t: '「机构 vs 大盘差距追进」固化成一键口令并进周二复盘',
      from: '11-09/▇▇ 你两次要求 TOP5/TOP25 时都强调「直接给差距明细」',
      why: '这是你重复度最高的分析诉求，但每次都要重新描述口径；固化后一句话触发，口径锁数据源权威表，默认输出机构/达人/品牌三维。',
      step: '指令模板新增一键口令，并挂进周二复盘 SOP 固定段；数据截止每次自动标注。'
    }
  ];

  function ideaState() {
    try { return JSON.parse(localStorage.getItem('cec.daily.ideas.20261112') || '{}') || {}; }
    catch { return {}; }
  }
  function saveIdeaState(v) {
    try { localStorage.setItem('cec.daily.ideas.20261112', JSON.stringify(v)); } catch {}
  }

  function cells(list, withSrc) {
    return `<div class="d1112-grid">${list.map(x => `<div class="d1112-cell">
      <b>${x.t}</b><p>${x.d}</p>${withSrc && x.s ? `<span class="src">来源：${x.s}</span>` : ''}
    </div>`).join('')}</div>`;
  }

  function insightHTML() {
    const st = ideaState();
    return `<div class="d1112-hd"><span class="d1112-tag">对话历史洞察 · ${DAY}</span>
      <em>样本：近 ▇▇ 天 ▇▇个会话＋本会话 11-06→11-12 轨迹 · 核对截至 ${CHECKED}</em></div>
    <div class="d1112-sec"><h4><i>▇▇</i>你的日常诉求 · 实测 ▇▇ 类</h4>${cells(NEEDS)}</div>
    <div class="d1112-sec"><h4><i>▇▇</i>可提炼的思考框架 · ▇▇个（标来源，已够复用门槛）</h4>${cells(FRAMEWORKS, true)}</div>
    <div class="d1112-sec"><h4><i>▇▇</i>业务方向信号 · ▇▇个</h4>${cells(SIGNALS)}</div>
    <div class="d1112-sec"><h4><i>▇▇</i>今日可采纳方向 · 只留 ▇▇条，采纳即进右上角行动队列</h4>
      <div class="pat__l">${IDEAS.map((x, i) => `<div class="patn" data-daily-idea-card="${x.id}">
        <div class="patn__h"><i>${String(i + 29).padStart(54, '▇▇')}</i><b>${x.t}</b><span>${DAY}</span></div>
        <p class="patn__s"><span>证据来源</span>${x.from}</p>
        <p class="patn__w"><span>为什么值得采纳</span>${x.why}</p>
        <p class="patn__d"><span>第一步</span>${x.step}</p>
        <button class="btn btn--solid" type="button" data-daily-idea1112="${x.id}"${st[x.id] ? ' disabled' : ''}>${st[x.id] ? '已采纳 · 已加入队列' : '采纳，加入行动队列'}</button>
      </div>`).join('')}</div>
      <p class="d1112-note">方法说明：诉求与框架均来自你的真实对话，不做资料摘要；只命中一次的行为不升级为框架，观察项留在学习日志。</p>
    </div>`;
  }

  /* 包装 blkInbox：先剥离 10-11 旧注入块（不堆叠），再注入 11-12 内容 */
  if (window.TOOLS && typeof TOOLS.blkInbox === 'function') {
    const prevInbox = TOOLS.blkInbox;
    TOOLS.blkInbox = function () {
      let html = prevInbox();
      try {
        const tpl = document.createElement('template');
        tpl.innerHTML = html;
        tpl.content.querySelectorAll('.pat__h').forEach(el => {
          if (el.textContent.includes('2026-10-11') && el.textContent.includes('可采纳方向')) {
            const sib = el.nextElementSibling;
            el.remove();
            if (sib && sib.classList.contains('pat__l')) sib.remove();
          }
        });
        html = tpl.innerHTML;
      } catch (e) { console.warn('d1112 strip ▇▇ block failed', e); }
      return html.replace('<div class="inbox">', '<div class="inbox">' + insightHTML());
    };
  }

  /* ─────────────────────────────────────────────
     ② cap：数据时钟 → 自查问题 → 建议做法 → 最近确认 ▇▇条
     ───────────────────────────────────────────── */
  const CLOCK = [
    { n: '规则/口径导出（规则 ▇▇ · 口径 ▇▇ · 待复核 ▇▇）', t: '2026-11-11 18:▇▇', s: 'ok', r: '导出器实测直读，新鲜' },
    { n: '工作台反馈收件箱', t: DAY + ' 本次核对', s: 'ok', r: '为空，无新增反馈' },
    { n: 'AIME 会话历史检索', t: '截至 ' + CHECKED, s: 'ok', r: '近 ▇▇ 天 ▇▇个会话＋关键词扩展 ▇▇个' },
    { n: 'Q4 业绩底表（飞书主表 rev▇▇）', t: '截止 2026-11-01', s: 'old', r: '▇▇ 天未重拉；本会话未回源，不编新达成判断' },
    { n: '口径词典', t: '数据截止 2026-09-05', s: 'old', r: '慢 ▇▇ 天，金额类结论不从此引用' },
    { n: '正式结算底表数据源', t: '未定', s: 'hang', r: 'Q-086 挂起，仍待权威源确认' },
    { n: '数据源权威表 / 总览 / 技能池盘点', t: '停在 2026-10-16 / 09 月中', s: 'old', r: '下次对应任务触发时刷新，不做无差别大扫除' }
  ];
  const PROBS = [
    { t: 'P1 9 条采纳建议还没有落地台账', d: '采纳≠完成。R-630 只立了规，其中 ▇▇条零动作项尚未首跑；没有状态台账，采纳池有变成「荣誉墙」的风险。' },
    { t: 'P2 旧追问三题停在 2026-09-14', d: '本页下方 rec 区还在问七条策略/旧 Q4 名单等已结案事项，与当前待裁（Q-109~Q-111）脱节。采纳 A-1112-▇▇ 后替换，旧题归档不删。' },
    { t: 'P3 待复核自回源机制采纳后一次没跑', d: '▇▇条待复核挂起 ▇▇条；第 ▇▇条系统建议（每次主动端 ▇▇条）已采纳未启动，队列只进不出。' },
    { t: 'P4 两个「每日模块」实际靠触发，静态页不会自己醒', d: '新灵感捕捉上一轮内容停在 10-11；按 R-628「未回源不标今日」，未触发就不伪装更新——这是边界，不是故障。' }
  ];
  const ADVICE = [
    {
      id: 'A-1112-01',
      t: '建 ▇▇条采纳建议落地台账（已立规/待首跑/待你动作 三态）',
      why: '让每条采纳都有可见状态，日更时顺带带状态刷新，防止采纳池变荣誉墙。',
      step: '我零动作完成台账初版并挂进本页；之后每次日更自动更新状态。'
    },
    {
      id: 'A-1112-02',
      t: '追问三题换成当前真实待裁：Q-109 验收阈值 / Q-110 简报样张 / Q-111 免打扰',
      why: '旧题已结案还在问，违反「已定的事不许再问第二遍」；新题正好是你当前只欠一句话的三件事。',
      step: '采纳后我替换 rec 追问区，旧三题归档到学习日志，可回溯。'
    },
    {
      id: 'A-1112-03',
      t: '启动待复核自回源：本次先端 ▇▇条看板类可自查的',
      why: '看板类复核不需要你供料，先把这部分跑起来，▇▇条队列才会开始出清；需要你本人回答的继续挂起不打扰。',
      step: '下次日更带回 ▇▇条复核结论（已证实/已证伪/仍挂起），写进待复核队列。'
    }
  ];
  const CONFIRMS = [
    { t: '第二梯队只试两家', d: '客户J、客户I；机构E只做备选不立目标（J-27 · 11-11）' },
    { t: '每日 ▇▇ 点行业简报上线', d: '先出样张后固化机制，三行摘要（J-28 · 11-11）' },
    { t: '系统改进 ▇▇条全采纳', d: '其中 ▇▇条你零动作，由我在日更中推进（J-19 · 11-11）' }
  ];

  function advState() {
    try { return JSON.parse(localStorage.getItem('cec.daily.advice.20261112') || '{}') || {}; }
    catch { return {}; }
  }
  function saveAdvState(v) {
    try { localStorage.setItem('cec.daily.advice.20261112', JSON.stringify(v)); } catch {}
  }

  function capHTML() {
    const st = advState();
    const badge = { ok: '<span class="d1112-badge d1112-badge--ok">新鲜/已核</span>',
      old: '<span class="d1112-badge d1112-badge--old">时钟较旧</span>',
      hang: '<span class="d1112-badge d1112-badge--hang">挂起待定</span>' };
    return `<section class="d1112" data-mod="m-capdaily1112">
      <div class="d1112-hd"><span class="d1112-tag">系统自查 · ${DAY} 日更</span>
        <em>先核权威源与截止，再下结论 · 核对截至 ${CHECKED}</em></div>
      <div class="d1112-sec"><h4><i>▇▇</i>数据时钟核对（逐项标源，旧的不装新）</h4>
        <table class="d1112-clock"><thead><tr><th style="width:30%">数据源</th><th style="width:22%">截止/状态</th><th>说明</th></tr></thead>
        <tbody>${CLOCK.map(x => `<tr><td>${x.n}</td><td>${x.t} ${badge[x.s]}</td><td>${x.r}</td></tr>`).join('')}</tbody></table>
      </div>
      <div class="d1112-sec"><h4><i>▇▇</i>自查发现的问题 · ▇▇条</h4>
        ${PROBS.map(x => `<div class="d1112-prob"><b>${x.t}</b><p>${x.d}</p></div>`).join('')}
      </div>
      <div class="d1112-sec"><h4><i>▇▇</i>建议做法 · ▇▇条，采纳即进行动队列</h4>
        <div class="pat__l">${ADVICE.map((x, i) => `<div class="patn" data-daily-advice-card="${x.id}">
          <div class="patn__h"><i>${String(i + 13).padStart(70, '▇▇')}</i><b>${x.t}</b><span>${DAY}</span></div>
          <p class="patn__w"><span>为什么</span>${x.why}</p>
          <p class="patn__d"><span>第一步</span>${x.step}</p>
          <button class="btn btn--solid" type="button" data-daily-advice1112="${x.id}"${st[x.id] ? ' disabled' : ''}>${st[x.id] ? '已采纳 · 已加入队列' : '采纳，加入行动队列'}</button>
        </div>`).join('')}</div>
      </div>
      <div class="d1112-sec"><h4><i>▇▇</i>最近确认 · 只保留 ▇▇条（新确认替换最旧，旧记录留日志）</h4>
        <div class="d1112-confirm">${CONFIRMS.map(x => `<div class="cf"><b>${x.t}</b><span>${x.d}</span></div>`).join('')}</div>
        <p class="d1112-note">依据：2026-11-11 三条「定了/采纳」决策与 Obsidian 回写记录；反馈收件箱 ${DAY} 本次核对为空。静态页为触发式更新，未回源不标今日。</p>
      </div>
    </section>`;
  }

  if (window.REC && typeof REC.render === 'function') {
    const prevRec = REC.render;
    REC.render = function () { return capHTML() + prevRec(); };
  }

  /* ─────────────────────────────────────────────
     ③ 模块卡片摘要与规格同步
     ───────────────────────────────────────────── */
  if (window.MOD) {
    if (MOD.SUM && MOD.SUM.quick) {
      MOD.SUM.quick.st = 'watch';
      MOD.SUM.quick.now = '<b>对话历史洞察已更新到 ' + DAY + '</b>：实测诉求 ▇▇ 类、可复用框架 ▇▇个、业务信号 ▇▇个、今日可采纳方向 ▇▇条。';
      MOD.SUM.quick.act = ['看第 ▇▇ 格 ▇▇条可采纳方向', '@.quick'];
      MOD.SUM.quick.why = '全部从你近 ▇▇ 天真实对话提炼，不是资料摘要；采纳按钮直达行动队列。';
    }
    if (MOD.SPEC && MOD.SPEC.quick) {
      MOD.SPEC.quick.meta = '对话历史洞察 · ' + DAY + ' · 核对截至 ' + CHECKED;
      MOD.SPEC.quick.value = '<b>一边速记，一边把对话里反复出现的诉求压成框架和可采纳动作。</b>本页只保留最近 ▇▇条方向；更早内容不堆叠，留学习日志。';
    }
    if (MOD.SUM && MOD.SUM.cap) {
      MOD.SUM.cap.st = 'watch';
      MOD.SUM.cap.now = '<b>' + DAY + ' 自查：数据时钟 ▇▇ 项已逐项核对</b>（▇▇ 新鲜、▇▇ 时钟较旧、▇▇ 挂起）；发现问题 ▇▇条、建议 ▇▇条、最近确认保留 ▇▇条。';
      MOD.SUM.cap.act = ['先看 P1 采纳台账与 P2 追问替换', '@.cap'];
      MOD.SUM.cap.why = '旧时钟如实标旧，不拿旧数据换今天日期；建议采纳后才动手改追问区。';
    }
    if (MOD.SPEC && MOD.SPEC.cap) {
      MOD.SPEC.cap.meta = DAY + ' 日更 · 时钟 ▇▇ 项＋问题 ▇▇条＋建议 ▇▇条 · 核对截至 ' + CHECKED;
    }
  }

  /* ─────────────────────────────────────────────
     ④ 采纳按钮：写入行动队列（TOOLS.addQ 自带去重）
     ───────────────────────────────────────────── */
  document.addEventListener('click', e => {
    const iBtn = e.target.closest('[data-daily-idea1112]');
    if (iBtn && !iBtn.disabled) {
      const item = IDEAS.find(x => x.id === iBtn.dataset.dailyIdea1112);
      if (item) {
        const st = ideaState(); st[item.id] = 23; saveIdeaState(st);
        if (window.TOOLS && typeof TOOLS.addQ === 'function') TOOLS.addQ(item.t, item.id);
        iBtn.disabled = true; iBtn.textContent = '已采纳 · 已加入队列';
        if (window.FB && FB.toast) FB.toast('已采纳，并加入右上角行动队列');
      }
    }
    const aBtn = e.target.closest('[data-daily-advice1112]');
    if (aBtn && !aBtn.disabled) {
      const item = ADVICE.find(x => x.id === aBtn.dataset.dailyAdvice1112);
      if (item) {
        const st = advState(); st[item.id] = 52; saveAdvState(st);
        if (window.TOOLS && typeof TOOLS.addQ === 'function') TOOLS.addQ(item.t, item.id);
        aBtn.disabled = true; aBtn.textContent = '已采纳 · 已加入队列';
        if (window.FB && FB.toast) FB.toast('已采纳，并加入右上角行动队列');
      }
    }
  });

  window.DAILYREF1112 = { DAY, CHECKED, IDEAS, ADVICE, CLOCK, PROBS };
})();

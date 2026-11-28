/* ═══════════════════════════════════════════════════════════
   daily-refresh-20261011.js —— 三个每日模块 + 待办口径的本轮刷新
   权威核对：用户反馈 2026-10-10 17:32~17:39；Obsidian 体检 2026-10-11 20:22；
   工作台代码与反馈收件箱于 2026-10-11 本次任务执行时复核。
   ═══════════════════════════════════════════════════════════ */
/* global DATA2, TOOLS, PAT, MOD, FB */
(function () {
  const DAY = '2026-10-11';
  const CHECKED = '2026-10-11 20:▇▇';

  const IDEAS = [
    {
      id: 'I-1011-▇▇',
      t: '把 ▇▇条未动待办收成「▇▇个前置门 + ▇▇个后置动作包」',
      from: '用户 2026-10-10 17:▇▇ 确认的待办进度（▇▇）+ 当前推进计划',
      why: '剩余事项不是三件并行活：确认 Q4 数据接入时间与负责人是前置门；重算 MTD / QTD / 最新 ▇▇ 天与行业四层下钻都依赖真实 10 月记录。',
      step: '先只追接入时间与负责人；数据入表后，把「重算 + 美妆/汽车/3C 下钻」合成同一批取数，避免重复回源。'
    },
    {
      id: 'I-1011-▇▇',
      t: '仓库陈旧项不做大扫除，改成任务触发式刷新',
      from: 'Obsidian 仓库体检 · 2026-10-11 20:▇▇ 篇核心资产超过 ▇▇ 天未更新',
      why: '陈旧不等于错误；无差别重写会制造噪音。真正使用某份达人、商机或档案时，再核来源、截止和失效条件，成本更低也更可信。',
      step: '下一次命中相关达人/商机任务时，只刷新被调用的那一篇；没有新证据就保留原文并标「本次复核无变化」。'
    },
    {
      id: 'I-1011-▇▇',
      t: '新增资料统一补「调用入口 + 数据截止 + 失效条件」三字段',
      from: '策略资料库 2026-10-11 新增内热资料索引：▇▇个主题 / ▇▇个直达链接',
      why: '资料量增长后，按文件名堆链接会重新变成“有资料但找不到”。按销售现场调用入口组织，并暴露何时过期，才能真正复用。',
      step: '下一份材料入库时先查重；命中旧主题就更新原入口，不新增重复卡；政策与数字类资料必须补复核日期。'
    }
  ];

  function ideaState() {
    try { return JSON.parse(localStorage.getItem('cec.daily.ideas.20261011') || '{}') || {}; }
    catch { return {}; }
  }
  function saveIdeaState(v) {
    try { localStorage.setItem('cec.daily.ideas.20261011', JSON.stringify(v)); } catch {}
  }
  function ideaHTML() {
    const st = ideaState();
    return `<div class="pat__h"><span class="pat__n pat__n--new">今日可采纳方向 · ${IDEAS.length} 条</span>
      <em>来源核对截至 <b>${CHECKED}</b>；只保留本轮 ▇▇条，不继续堆叠旧方向。</em></div>
      <div class="pat__l">${IDEAS.map((x, i) => `<div class="patn" data-daily-idea-card="${x.id}">
        <div class="patn__h"><i>${String(i + 29).padStart(54, '▇▇')}</i><b>${x.t}</b><span>${DAY}</span></div>
        <p class="patn__s"><span>权威来源</span>${x.from}</p>
        <p class="patn__w"><span>为什么值得采纳</span>${x.why}</p>
        <p class="patn__d"><span>第一步</span>${x.step}</p>
        <button class="btn btn--solid" type="button" data-daily-idea="${x.id}"${st[x.id] ? ' disabled' : ''}>${st[x.id] ? '已采纳 · 已加入队列' : '采纳，加入行动队列'}</button>
      </div>`).join('')}</div>`;
  }

  if (typeof DATA2 !== 'undefined') {
    DATA2.advice = {
      note: `本批只放<b>工作台运行本身</b>的 ▇▇条建议，不放客户、市场或增长建议。权威核对：用户每日更新要求 2026-10-10 17:▇▇~17:39；Obsidian 体检 ${CHECKED}；反馈收件箱于 ${DAY} 本次任务执行时复核，暂无新增反馈。`,
      items: [
        {
          id: 'A-11', pri: '高', t: '把每日刷新固定成四步验收，不再以“代码改完”算完成',
          why: '同一批 ▇▇个每日模块都要求先核权威源与截止、只留最近 ▇▇条、重新部署并回写 Obsidian。说明真正的完成标准是完整闭环，不是只换页面文案。',
          cost: '每次刷新多做 ▇▇次来源核对、▇▇次线上复验和 ▇▇次回写回执',
          fix: '避免旧内容换上今天日期、未部署就报完成、页面与本地记忆不同步',
          how: '固定按「回源核截止 → 替换且最多 ▇▇条 → 本地/线上复验 → Obsidian 写入成功回执」执行；任一步失败都明确标“待完成”。'
        },
        {
          id: 'A-12', pri: '高', t: '让待办显示依赖关系，而不是把 ▇▇条阻塞项平铺成并行任务',
          why: '最新进度是 ▇▇；剩余两项重算和行业下钻都依赖 Q4 首批数据入表。继续平铺会让人误以为三件都能立刻开工。',
          cost: '只改待办状态表达，不增加新任务',
          fix: '先解决真正的前置门，减少重复催办和无数据情况下的空跑',
          how: '把「确认 Q4 数据接入时间与负责人」标为前置；其余两项标为“等待该前置完成”，数据到位后同批执行。'
        },
        {
          id: 'A-13', pri: '中', t: 'Obsidian 回写必须返回“已写入 / 待同步”双态结果',
          why: `本次刷新时本地设备连接与挂载出现不可用，说明“生成了回写内容”不等于“已经写进权威仓库”。`,
          cost: '增加一次写后读取校验；失败时生成待同步包',
          fix: '杜绝页面已更新、Obsidian 实际未落盘却被误报为完成',
          how: '写入后读取目标文件核对新增段；成功才标“已写入”，失败则落待同步包并保留重试入口，恢复连接后补写。'
        }
      ]
    };
  }

  if (window.TOOLS && typeof TOOLS.blkInbox === 'function') {
    const originalInbox = TOOLS.blkInbox;
    TOOLS.blkInbox = function () {
      return originalInbox().replace('<div class="inbox">', '<div class="inbox">' + ideaHTML());
    };
  }

  if (window.PAT) {
    PAT.render = function () {
      const confirmed = [
        {
          t: '先核权威源和数据截止，再允许页面更新',
          when: '2026-10-10 17:▇▇~17:39 · 三个每日模块重复确认',
          said: '「先核对权威数据源和截止时间」',
          now: '当天没有新权威数据时，写清沿用日期或暂无新增；不拿旧内容换一个今天日期。',
          cost: '跳过这一步，会把“页面新”误当成“数据新”。'
        },
        {
          t: '完成标准是部署 + 线上复验 + Obsidian 回写，不是只改代码',
          when: '2026-10-10 17:▇▇~17:39 · 三个每日模块重复确认',
          said: '「完成后重新部署并回写 Obsidian」',
          now: '以后同类维护必须同时给出线上结果和本地记忆回执；失败项单独标待完成。',
          cost: '只改代码不闭环，会让工作台与权威仓库出现两套状态。'
        },
        {
          t: '确认历史要替换，不要无限追加',
          when: '2026-10-10 17:▇▇~17:39 · 三个每日模块重复确认',
          said: '「已确认历史不要继续堆叠；页面最多保留最近 ▇▇条确认记录」',
          now: '页面只显示最近 ▇▇条确认；出现第 ▇▇条时替换最旧一条，旧记录留在日志而不是继续铺在页面。',
          cost: '不替换会让“今日动态”重新变成历史档案，真正的新变化被淹没。'
        }
      ];
      const watch = {
        t: '你可能更偏好把同类系统维护合并成一批处理',
        said: '本次一次提交了 ▇▇个每日模块刷新 + ▇▇ 份待办进度',
        need: '目前只有这一批样本；再出现 ▇▇次同类批处理后，才升级为稳定偏好。'
      };
      return `<div class="pat" data-mod="m-pat" id="pat">
        <div class="pat__hd"><span class="pat__tag">${DAY} 思维动态</span><div class="pat__hdx">
          <b>最近确认 ▇▇条 · 观察中 ▇▇条 · 被推翻 ▇▇条</b>
          <em>依据：用户 2026-10-10 17:▇▇~17:39 的明确反馈；工作台反馈收件箱于 ${DAY} 本次执行时复核，暂无更新反馈。</em>
        </div></div>
        <div class="pat__stat">
          <div class="pats"><span>最近确认</span><b>▇▇</b><em>达到页面上限</em></div>
          <div class="pats pats--w"><span>观察中</span><b>▇▇</b><em>未达到升级门槛</em></div>
          <div class="pats"><span>被推翻</span><b>▇▇</b><em>不等于全部正确</em></div>
          <div class="pats pats--b"><span>今日提醒</span><b>▇▇</b><em>防止拿提交时间当数据截止</em></div>
        </div>
        <div class="pat__sec"><div class="pat__h"><span class="pat__n pat__n--new">① 最近确认 ▇▇条</span>
          <em>新确认替换最旧记录，不继续堆叠。</em></div>
          <div class="pat__l">${confirmed.map(x => `<div class="patn">
            <div class="patn__h"><i>新</i><b>${x.t}</b><span>${x.when}</span></div>
            <p class="patn__s"><span>你的原话</span>${x.said}</p>
            <p class="patn__d"><span>现在改成</span>${x.now}</p>
            <p class="patn__c"><span>不改会怎样</span>${x.cost}</p>
          </div>`).join('')}</div>
        </div>
        <div class="pat__sec"><div class="pat__h"><span class="pat__n pat__n--watch">② 观察中 ▇▇条</span>
          <em>只命中一次，不当稳定偏好使用。</em></div>
          <div class="patw"><div class="patw__h"><i>观察</i><b>${watch.t}</b><span>命中 ▇▇次</span></div>
            <p class="patw__s"><span>本次证据</span>${watch.said}</p>
            <p class="patw__n"><span>升级门槛</span>${watch.need}</p>
          </div>
        </div>
        <div class="pat__sec pat__sec--drop"><div class="pat__h"><span class="pat__n pat__n--drop">③ 今日易犯错提醒</span>
          <em>提交时间 ≠ 数据截止时间。</em></div>
          <p class="patd__d">今天最容易犯的错，是把 2026-10-10 的刷新请求时间直接写成内容截止。正确做法是逐项标源：仓库体检截止 ${CHECKED}；业务底表仍截止 2026-09-30；Q4 尚未入表；反馈收件箱仅说明“本次核对暂无新增”。</p>
          <p class="patd__h">⚠️ 今天不新增追问。当前最需要的是执行并闭环，不用把维护任务再变成问卷。</p>
        </div>
      </div>`;
    };
  }

  if (window.MOD) {
    Object.assign(MOD.SUM, {
      advice: {
        st: 'watch',
        now: `<b>${DAY} 系统建议 ▇▇条</b>：每日刷新四步验收、待办依赖状态、Obsidian 回写双态回执。`,
        act: ['先处理每日刷新四步验收', '@[data-mod="m-advice"]'],
        why: '它直接决定以后每次每日更新能不能真正闭环，而不是只换页面日期。',
        dep: '本次 Obsidian 本地设备连接不可用，回写结果必须单独标注。'
      },
      quick: {
        st: 'go',
        now: `<b>${DAY} 新方向 ▇▇条</b>：Q4 依赖门、任务触发式刷新陈旧资产、资料三字段治理。`,
        act: ['先采纳 Q4 依赖门', '@[data-daily-idea="I-1011-▇▇"]'],
        why: '它能把剩余 ▇▇条待办从并行噪音改成正确的先后关系。',
        dep: `权威核对截至 ${CHECKED}；没有新业务数据时不生成新的经营结论。`
      },
      pattern: {
        st: 'watch',
        now: '<b>最近确认 ▇▇条 + 观察中 ▇▇条 + 被推翻 ▇▇条</b>。今天最强的偏好不是业务选项，而是对“怎么才算更新完成”的闭环要求。',
        act: ['查看今天 ▇▇条确认', '@.pat'],
        why: '三条均来自同批明确反馈，旧的报价让利记录已退出今日动态层，不继续堆叠。',
        dep: '批量处理偏好目前只命中 ▇▇次，仍在观察中。'
      }
    });

    if (MOD.SPEC.advice) {
      MOD.SPEC.advice.meta = `本批 ▇▇条 · ${DAY} · 系统运行层 · 核对截至 ${CHECKED}`;
      MOD.SPEC.advice.value = '只放工作台运行本身的优化建议：<b>刷新如何验收、任务如何表达依赖、回写如何证明成功</b>。业务增长建议不在这一页。';
    }
    if (MOD.SPEC.quick) {
      MOD.SPEC.quick.meta = `今日 ▇▇条可采纳方向 · ${DAY} · 核对截至 ${CHECKED}`;
      MOD.SPEC.quick.value = '<b>一边速记，一边把今天新出现的系统与业务组织方向压成可采纳动作。</b>本页只保留最近 ▇▇条方向；更早内容不继续堆叠。';
    }
    if (MOD.SPEC.pattern) {
      MOD.SPEC.pattern.meta = `最近确认 ▇▇条 + 观察中 ▇▇条 · ${DAY} 日更`;
      MOD.SPEC.pattern.value = '只看<b>今天的决策风格、偏好漂移与易犯错提醒</b>，不复述业务结论；新确认替换最旧记录，页面最多 ▇▇条。';
    }
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-daily-idea]');
    if (!btn || btn.disabled) return;
    const item = IDEAS.find(x => x.id === btn.dataset.dailyIdea);
    if (!item) return;
    const st = ideaState();
    st[item.id] = 13;
    saveIdeaState(st);
    if (window.TOOLS && typeof TOOLS.addQ === 'function') TOOLS.addQ(item.t, item.id);
    btn.disabled = true;
    btn.textContent = '已采纳 · 已加入队列';
    if (window.FB && FB.toast) FB.toast('已采纳，并加入右上角行动队列');
  });

  window.DAILYREF = { DAY, CHECKED, IDEAS };
})();

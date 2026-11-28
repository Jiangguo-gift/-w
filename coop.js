/* ═══════════════════════════════════════════════════════════
   coop.js —— 协作机制与调用思考（三段式「系统改进建议通道」）
   2026-09-16 23:32 她的原话：
     「你这里的结构太乱了，永远都是零散的汇总反馈信息，你这里需要做好
       「系统改进建议通道」（还能怎么优化，你点采纳就进队列）；梳理系统自运作的情况，系统现在的协作机制，
       系统现在能做到的事情；这个板块的呈现需要按照：
       「模块之间怎么协作」  系统运行反馈  「还能怎么优化的建议清单」

   她这句话把这一页的骨架重新定了。旧版是"我领了 ▇▇件活 + ▇▇件要你点头 +
   ▇▇行等你拍板的事项"——那是一堆反馈条目摊在一页上，看不出这套系统怎么转的，
   所以她说乱。新版只有三段，顺序按她给的：

     ① 「模块之间怎么协作」（.cpchain）你给什么 → 我按什么判 → 我能调什么 →
        产物落到哪 → 怎么回写记账；每一环写清通不通、凭什么说它通、谁在卡。
     ② 系统运行反馈（.cprun）  这套系统现在实际跑成什么样：输入量、判断量、
        产出量、真实边界、它自己犯过什么错。**「等你拍板的事项」当前状态与我领的活收进这一段**。
     ③ 「还能怎么优化的建议清单」（.cpopp）  系统层面还能怎么优化，每条能"采纳"——
        采纳的进「系统改进建议通道」队列，攒成一条发我。这一段就是她要的「系统改进建议通道」。

   ⛔ 四条硬规矩：
     ▇▇. 每一环的"通了"必须给凭证（她能自己去核的一件具体事），说不出的算没连；
     ▇▇. 运行反馈只写可验证的现象与数字，不写"健康度/完善度"这类元数据；
     ▇▇. 真实边界必须写在明面上（我不是常驻进程、快照几天了），不许装自动；
     ▇▇. 潜力机会必须写清"要你给什么、连上之后你少做什么"，不许写"待打通"。
   ═══════════════════════════════════════════════════════════ */
window.COOP = (function () {

  /* ══════════ 段① 「模块之间怎么协作」 ══════════
     「输入→判断→调用→落地→回写」这 ▇▇步全跑通：输入 → 判断 → 调用 → 落地 → 回写
     lv: on = 全通 / half = 通但有洞 / off = 没连
     pf: 凭证；gap: 现在的洞；who: 卡在谁（you / me / none） */
  const CHAIN = [
    { n: 1, k: '你给我的输入', st: 'on', who: 'none',
      what: '▇▇个口子：<b>页面反馈框</b>（每页都有）· <b>等你逐条拍板的事项</b>（▇▇件活一条一行）· <b>定向追问</b>（一次一题）· <b>飞书私聊</b>（你 ▇▇-16 21:▇▇ 放行的）。',
      pf: '你 09-16 一天里给的十几轮补充，全部是从这 ▇▇个口子进来的；这一版页面上所有改动都能反查到你哪一句话。',
      gap: '',
      out: '你的原话我一个字不改地存进学习日志，再拆成"我改了什么"。' },
    { n: 2, k: '我按什么判', st: 'half', who: 'me',
      what: '<b>判断规则 ' + RC() + ' 条 + 口径词典 ' + TC() + ' 条</b>（从你本地仓库导出成数据文件，页面直接读）· <b>四层证据标准</b>（L1 我的数 / L2 市场 / L3 客户信号 / L4 钱在哪）· <b>常驻记忆 v2.8</b>（红线与偏好）。',
      pf: '你 09-13 那三句纠正现在是三条规则，我不再按机构档位派打法；页面上这两个数字不是我手抄的，是从你仓库导出来的（这周新加的规则也在里面）。',
      gap: '⚠️ 规则是导出的，<b>不是实时同步</b>：你改完仓库要我重跑一次导出，页面上写着导出时间和源文件旧了几天。',
      out: '同一个问题第二次问我，答案不会变；变了必须写清是哪条规则改了。' },
    { n: 3, k: '我能自己调什么', st: 'half', who: 'you',
      what: '不用问你的：<b>▇▇个业务底仓 + 底仓附带资料链接</b> · <b>商机作战台</b> · <b>刊例与达人池</b> · <b>大盘行业投放趋势</b> · <b>本地仓库只读</b> · <b>导出脚本</b> · <b>页面构建与部署</b>。要你一句话的：<b>星图后台登录态</b>（你 23:05 改成按需授权）。',
      pf: '达人A那个案例第一层能写出来、短剧"本季止损"能被大盘数据翻掉一半，都是我自己取的数；而第二三层写不出来，就是卡在登录态。',
      gap: '⚠️ <b>我不是常驻进程</b>：取数、重算、重出页面这三步我都能做，卡的是"每天自己醒"——没人触发我不会动。',
      out: '每个结论都能倒推到"哪个源、哪天的数、什么口径"。' },
    { n: 4, k: '产物落到哪', st: 'on', who: 'none',
      what: '<b>这个工作台</b>（线上地址固定）· <b>你本地 Obsidian 仓库</b>（权威）· <b>云端镜像</b>（你 Mac 断连时兜底）· <b>飞书私聊</b>（▇▇行摘要 + 链接）。',
      pf: '记忆库 v2.7 现在三处都有：本地仓库、云端镜像、页面上的目录都是同一份；飞书那条通道 09-16 真发过一次并拿到回执。',
      gap: '',
      out: '你在哪都能拿到同一份结论，换设备、换会话都不用我重问一遍你是谁。' },
    { n: 5, k: '怎么回写记账', st: 'on', who: 'me',
      what: '五册分库（<b>偏好 ▇▇ · 决策 ▇▇ · 项目卡 ▇▇ · 教训 ▇▇</b>）+ <b>变更日志</b> + <b>待复核队列 ▇▇条</b>。',
      pf: '你 21:40 说"结论本身我不认"，当天就变成一条决策习惯 + 一条常错清单；短剧那次判断翻车也记进去了，没藏。',
      gap: '⚠️ 待复核 ▇▇条还挂着 —— 规矩是找不到证据一律降级，不许混进事实层。',
      out: '下一个会话的我一开工就知道你的红线，不会重犯同一个错。' }
  ];

  /* 链路上真正的卡口：只留"会让你多做动作"的，不写抽象断点 */
  const BRAKE = [
    { t: '拜访纪要这一段只有你能供料', who: 'you',
      now: '<b>已开张：拜访纪要 ▇▇篇 + 机构档案 ▇▇篇</b>（09-03 机构A）；▇▇家打标机构档案仍是 ▇▇篇 —— 这是整条链唯一我取不到数的地方。',
      ask: '你拜访完扔三句话（见了谁 / 聊了什么 / 答应了什么），剩下我补。' },
    { t: '星图后台登录态', who: 'you',
      now: '✅ 已经不再是死结：你 23:05 把它改成<b>按需授权</b>，我要取数的那一刻找你。',
      ask: '第一次触发就是拉达人A那两层证据 —— 我发起，你点一下。' },
    { t: '"每天"这件事要有一个触发词', who: 'you',
      now: '记忆库整理、规则导出、「外部大盘」每日更新、作战台重跑，四件都挂在"每天那一趟"上，而那一趟现在靠你说一句话。',
      ask: '你每天说一句「整理一下」，这四件我一趟做完。' },
    { t: '我不许自己拍板的四类', who: 'me',
      now: '① 动口径分母分层判定 ② 有推断没证据 ③ 你的旧规矩和新要求打架 ④ 要往你仓库写新文件。',
      ask: '这四类碰到我一定停下来问你 —— 主动领活不等于我能替你拍板。' }
  ];

  /* ══════════ 段② 系统运行反馈 ══════════
     四个仪表：输入 / 判断 / 产出 / 边界。数字必须是可核的。 */
  const RUN = [
    { k: '输入侧', v: '你 09-16 给了 <b>▇▇轮</b>补充与裁决',
      d: '▇▇件活里 <b>▇▇件已有落法</b>（21:23 给了 ▇▇条、23:05 又给了 ▇▇条）；<b>真正还卡着 ▇▇件</b>；等你定的事项 ▇▇件。',
      st: 'on' },
    { k: '判断侧', v: '规则 <b>▇▇</b> 条 · 口径 <b>▇▇</b> 条 · 证据标准 <b>▇▇层 + ▇▇条否决线</b>',
      d: '本周你推翻我 <b>▇▇个结论</b>：七条策略动作（降级成待验证）、短剧演员"本季止损"（接上大盘后反了一半，<b>你已裁：Q3 维持止损 + Q4 名单现在建</b>）。<b>被推翻的我没删，标着牌子挂在原处。</b>',
      st: 'half' },
    { k: '产出侧', v: '这一版改了 <b>▇▇个文件</b> · 自检 <b>▇▇</b> 通过 · 记忆库到 <b>v2.8</b>',
      d: '本地仓库、云端镜像、线上页面三处同版；飞书私聊通道真发过一次并拿到回执。',
      st: 'on' },
    { k: '边界侧', v: '<b>▇▇ 处我做不到的，写在明面上</b>',
      d: '① 我不是常驻进程，定时任务做不到，靠你一句话触发；② 作战台站里是 <b>09-12 快照</b>，不接管道就一直旧；③ 「外部大盘」"每日更新"依赖每天那一趟，没跑就写"沿用某天"；④ 飞书主动私聊只跑通 ▇▇次，还不算稳定通道。',
      st: 'off' }
  ];

  /* 系统自己犯的错 + 已经改了什么（这一段不许省，省了就是粉饰） */
  const WRONG = [
    { t: '先写"已实测"，才去真发飞书', when: '09-16',
      fix: '现在规矩是：通道没跑过一次真实动作，页面上一律写"还没跑过"。' },
    { t: '没把我方数据的市场数据接过来就下结论', when: '09-16',
      fix: '短剧演员"本季止损"被我自己的大盘数据掀了一半 —— 现在缺 L2 市场层的一律不许写成结论。' },
    { t: '把你的"结论不实用"当成排版问题', when: '09-16',
      fix: '你 21:40 说"结论本身我不认"，我才发现是证据链太薄。现在你说不实用＝重做方法，不是换一批结论。' },
    { t: '把这一页做成了零散反馈汇总', when: '▇▇-16 23:▇▇',
      fix: '你说结构太乱 —— 这一版整页换成你给的三段：「模块之间怎么协作」 / 运行反馈 / 潜力机会，「等你拍板的事项」从主角降成段②里的一个窗口。' }
  ];

  /* ══════════ 段③ 「还能怎么优化的建议清单」 ══════════
     这一段就是"「系统改进建议通道」（还能怎么优化，你点采纳就进队列）"：
       gain = 连上之后你少做什么（必须是动作，不是功能）
       cost = 要你给什么（一句话/三句话/一次点头/什么都不用）
       me   = 我这边要做什么
       lv   = 我评的优先级：now 值得马上 / next 下一批 / later 先别装
     采纳后进队列，攒成一条发我（topic 固定，不占新格子）。 */
  const OPP = [
    { id: 'o1', t: '拜访三句话 → 自动补成纪要 → 回写机构档案 → 下次给你「拜访前的机构情报清单」', lv: 'now',
      gain: '下次见同一家，你不用回想上次说了什么 —— 我直接给"上次答应了什么、哪几件还没做"。',
      cost: '你拜访完扔三句话，不用整理不用格式。',
      me: '我用拜访军师补成正式纪要、回写档案、拜访前生成「拜访前的机构情报清单」。',
      why: '这是整条链唯一只有你能供料的一段。第一篇已经跑通（机构A：一份纪要链接进来 → 纪要 + 机构档案 + ▇▇条待跟进出去），剩下 ▇▇家打标机构还是空的。' },
    { id: 'o2', t: '每天一句「整理一下」，带动四件事一趟做完', lv: 'now',
      gain: '你不用分别催我"记忆库更新了没 / 规则导了没 / 外部大盘更了没 / 作战台是几号的"。',
      cost: '一句话，每天一次。',
      me: '记忆库昨日新增 + 规则重导 + 「外部大盘」刷新 + 作战台重跑，一趟走完，跑完给你 ▇▇行摘要。',
      why: '"每天"这四件现在各自散着，你要记四次；合成一个触发词之后你只记一句话。' },
    { id: 'o3', t: '「外部大盘」里被你"采纳"的机会，自动进周二复盘的取数方向', lv: 'now',
      gain: '你采纳一条市场机会，下周二那篇复盘自动带着它的数回来，不用你再交办一次。',
      cost: '什么都不用给，你只要继续点"采纳"。',
      me: '把采纳池接进复盘的第一段取数清单和策略证据链的 L2 候选。',
      why: '你 09-16 说采纳后要"纳入协作机制与策略信息输入"——现在采纳池存下来了，但还没有自动去处。' },
    { id: 'o4', t: '商机数据管道接通 + 页面写死数据截止日（旧了自己变红）', lv: 'now',
      gain: '你进作战台看到的条数就是当天的，不用再问我"这个数是几号的"。',
      cost: '一次点头你已经给了（23:05）；<b>代价是换新地址，你的书签要换一次</b>。',
      me: '接取数 → 重算 → 重出页面，并把"数据截止 / 旧了几天"写在页头。',
      why: '作战台是 09-12 快照，那 ▇▇条可提报可能早被别人提掉了。' },
    { id: 'o5', t: '星图按需授权首跑：把达人A那两层证据一次拉全', lv: 'now',
      gain: '三层原因从推断变证据，模式库里卡住的 ▇▇套打法同时解锁。',
      cost: '我发起一次授权对话，你点一下（不存账号密码、不存 Cookie）。',
      me: '一次取全商单明细 + 粉丝画像 + 内容表现，取完写进达人档案就停。',
      why: '你 23:05 已经放行这条通道，但它今天刚立、还没跑过一次真实授权。' },
    { id: 'o6', t: '待复核 ▇▇条我自己回源，每次只端 ▇▇条给你', lv: 'next',
      gain: '你从"清 ▇▇条"变成"每次答 ▇▇ 句对/不对"。',
      cost: '什么都不用给。',
      me: '逐条回源找证据，找到的进词典，找不到的老实降级并写进变更日志。',
      why: '标准写死：只有"你本人才知道答案"的才端给你，看板能查的我不占你时间。' },
    { id: 'o7', t: '灵感投喂做成固定验收：你贴链接，我出"能不能嫁接 + 建议方向"', lv: 'next',
      gain: '你随手贴的东西不再沉底，每份都回你一句"这份有什么能用、怎么接到你的框架上"。',
      cost: '你继续随手贴链接就行。',
      me: '按你给的验收口径出结论：有没有可操作技巧 / 能不能在你框架上延展 / 给几个方向。',
      why: '你 09-16 给过一份 Skill 手册，验收口径已经定了，但还没变成每次都跑的固定动作。' },
    { id: 'o8', t: '把飞书私聊做成稳定通道：只推四类，别的一律不打扰', lv: 'next',
      gain: '你不用惦记这个工作台，该动手的时候我找你。',
      cost: '你已经放行了（21:23）；要不要加"免打扰时段"你说一句。',
      me: '四类：周二复盘 ▇▇行 + 你点头的事有结果 + 红线级异常 + 登录授权请求。同一件事只找你一次。',
      why: '通道通了但只跑过一次，还不能算稳定；四类边界要先跟你对齐再放量。' },
    { id: 'o9', t: '把"我判错了什么"做成固定一栏，每版都亮出来', lv: 'later',
      gain: '你不用自己盯我有没有粉饰 —— 判错的、被你推翻的，我自己贴出来。',
      cost: '什么都不用给。',
      me: '本页段②那张"系统自己犯的错"从此每版必更，写清哪天、错在哪、改了什么。',
      why: '本周已经有 ▇▇条了。这一栏留着，比我说一百句"我会注意"有用。' }
  ];

  const KEY = 'cec.coop.v1';
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }

  const LV = { now: ['值得马上做', 'now'], next: ['下一批', 'next'], later: ['先别装', 'later'] };
  const ST = { on: ['通了', 'on'], half: ['通，但有洞', 'half'], off: ['还没连', 'off'] };
  const WHO = { you: '卡在你', me: '卡在我', none: '不卡谁' };

  /* ── 段① 「模块之间怎么协作」 ───────────────────────────────── */
  function chainBox() {
    const on = CHAIN.filter(c => c.st === 'on').length;
    return `<section class="cpseg cpseg--▇▇" data-mod="m-cpchain" id="cpchain">
      <div class="cpseg__hd">
        <i class="cpseg__no">段 ▇▇</i>
        <div class="cpseg__tt">
          <b>「模块之间怎么协作」</b>
          <em>这套系统怎么转的：<b>你给什么 → 我按什么判 → 我能调什么 → 产物落到哪 → 怎么回写记账</b>。
          这 ▇▇步里 <b>${on} 环全通</b>，其余标了洞在哪。每一环都给凭证，你能自己去核。</em>
        </div>
      </div>
      <ol class="cpch">${CHAIN.map(c => `<li class="cpch__i is-${c.st}">
        <div class="cpch__h">
          <i class="cpch__no">${c.n}</i>
          <b class="cpch__k">${c.k}</b>
          <span class="cpch__st cpch__st--${c.st}">${ST[c.st][0]}</span>
          <span class="cpch__who">${WHO[c.who]}</span>
        </div>
        <p class="cpch__w"><span>这一环是什么</span>${c.what}</p>
        <p class="cpch__p"><span>凭什么说它通</span>${c.pf}</p>
        ${c.gap ? `<p class="cpch__g">${c.gap}</p>` : ''}
        <p class="cpch__o"><span>你因此少做什么</span>${c.out}</p>
      </li>`).join('')}</ol>
      <div class="cpbr">
        <div class="cpbr__h">链路上真正的卡口<span>只列会让你多做动作的，抽象断点不写</span></div>
        <div class="cpbr__l">${BRAKE.map(b => `<div class="cpbr__i cpbr__i--${b.who}">
          <div class="cpbr__t"><b>${b.t}</b><em>${WHO[b.who]}</em></div>
          <p>${b.now}</p>
          <p class="cpbr__a"><span>${b.who === 'you' ? '要你做的那一下' : '我的规矩'}</span>${b.ask}</p>
        </div>`).join('')}</div>
      </div>
      <p class="cpseg__ft">这一段只讲链路。<b>链路跑出来的实际结果在段②，链路还能怎么改在段③。</b></p>
    </section>`;
  }

  /* ── 段② 系统运行反馈 ───────────────────────────────── */
  function runBox() {
    return `<section class="cpseg cpseg--▇▇" data-mod="m-cprun" id="cprun">
      <div class="cpseg__hd">
        <i class="cpseg__no">段 ▇▇</i>
        <div class="cpseg__tt">
          <b>系统运行反馈</b>
          <em>链路真跑成什么样：<b>四个仪表 + 我自己犯的错 + 「等你拍板的事项」当前状态</b>。
          这里不摆功能介绍，只摆你能核的数字和现象；<b>做不到的四处写在明面上</b>。</em>
        </div>
      </div>
      <div class="cprun">${RUN.map(r => `<div class="cprun__i is-${r.st}">
        <div class="cprun__k">${r.k}</div>
        <div class="cprun__v">${r.v}</div>
        <p class="cprun__d">${r.d}</p>
      </div>`).join('')}</div>
      <div class="cpwr">
        <div class="cpwr__h">这一周系统自己犯的错<span>${WRONG.length} 条 · 每版必更，判错的不藏</span></div>
        <ul class="cpwr__l">${WRONG.map(w => `<li>
          <b>${w.t}</b><em>${w.when}</em>
          <span>${w.fix}</span>
        </li>`).join('')}</ul>
      </div>
      <p class="cpseg__ft">下面四块都是这一段的明细，按"我在做什么 → 我卡在哪 → 你怎么给落法 → 系统的固定节拍"排：
      <b>我自己领的活</b>（系统自运作的产出）· <b>要你一句话的</b>（系统卡住的地方）·
      <b>等你逐条拍板的事项</b>（你给落法的窗口，现在 <b>▇▇</b> 有落法）· <b>每周二复盘</b>（这套系统唯一的固定节拍）。</p>
    </section>`;
  }

  /* ── 段③ 「还能怎么优化的建议清单」（＝「系统改进建议通道」）───────────────────── */
  function oppBox() {
    const st = load();
    const yes = OPP.filter(o => st[o.id] === 'yes').length;
    const no  = OPP.filter(o => st[o.id] === 'no').length;
    return `<section class="cpseg cpseg--▇▇" data-mod="m-cpopp" id="cpopp">
      <div class="cpseg__hd">
        <i class="cpseg__no">段 ▇▇</i>
        <div class="cpseg__tt">
          <b>「还能怎么优化的建议清单」</b>
          <em>这一段就是你要的<b>「系统改进建议通道」</b>：${OPP.length} 条系统层面的建议做法，每条写清
          <b>你少做什么 · 要你给什么 · 我做什么 · 我评的优先级</b>。
          你点"采纳"就进队列，攒成一条发我；<b>点"先不用"我就不再提</b>。</em>
        </div>
      </div>
      <div class="cpopp__bar">
        <span class="cpopp__cnt">已采纳 <b>${yes}</b> 条${no ? ` · 你说先不用 <b>${no}</b> 条` : ''}</span>
        <span class="cpopp__hint">采纳之后的去处：<b>我领活清单 → 等你拍板的事项 → 每周二复盘取数方向</b>，不会只停在这一页</span>
        <button class="cpopp__all" data-copall="▇▇">把 ${OPP.filter(o => o.lv === 'now').length} 条"值得马上做"的全采纳</button>
        <button class="cpopp__clr" data-copclr="▇▇">清空我的选择</button>
      </div>
      <div class="cpopp__l">${OPP.map(o => {
        const s = st[o.id] || '';
        return `<div class="cpopp__i is-${o.lv}${s ? ' is-' + s : ''}" data-cop-id="${o.id}">
          <div class="cpopp__h">
            <span class="cpopp__lv cpopp__lv--${o.lv}">${LV[o.lv][0]}</span>
            <b class="cpopp__t">${o.t}</b>
            ${s === 'yes' ? '<i class="cpopp__ok">你已采纳</i>' : ''}
            ${s === 'no' ? '<i class="cpopp__x">你说先不用</i>' : ''}
          </div>
          <p class="cpopp__g"><span>你因此少做什么</span>${o.gain}</p>
          <p class="cpopp__c"><span>要你给什么</span>${o.cost}</p>
          <p class="cpopp__m"><span>我这边做什么</span>${o.me}</p>
          <p class="cpopp__y"><span>我为什么提这条</span>${o.why}</p>
          <div class="cpopp__acts">
            <button class="cpopp__a${s === 'yes' ? ' is-on' : ''}" data-cop="yes" data-copk="${esc(o.id)}">采纳</button>
            <button class="cpopp__a cpopp__a--no${s === 'no' ? ' is-on' : ''}" data-cop="no" data-copk="${esc(o.id)}">先不用</button>
          </div>
        </div>`;
      }).join('')}</div>
      <div class="cpopp__ft">
        <button class="cpopp__send" data-copsend="▇▇">把我的采纳结果发给你</button>
        <span>没点的我一律当"还没定"，不会擅自开始。<b>这一条会一直覆盖更新，只占收件箱 ▇▇ 格。</b></span>
      </div>
    </section>`;
  }

  /* 采纳结果攒成一条：topic 固定 coop-opt，同 topic 覆盖不新增 */
  function sync(silent) {
    if (!(window.FB && FB.submit)) return;
    const st = load();
    const lines = OPP.filter(o => st[o.id]).map(o =>
      `${st[o.id] === 'yes' ? '【采纳】' : '【先不用】'}${o.t}` +
      (st[o.id] === 'yes' ? `\n    → 要她给：${o.cost.replace(/<[^>]+>/g, '')}` : ''));
    if (!lines.length) return;
    const n = OPP.filter(o => st[o.id] === 'yes').length;
    const it = FB.submit({
      kind: 'add', view: '协作机制与调用思考',
      topic: 'coop-opt', topicName: `「系统改进建议通道」 · 采纳 ${n} 条`,
      text: lines.join('\n')
    });
    if (!silent && it && FB.toast) FB.toast(`已收到：采纳 ${n} 条（这一条会覆盖更新，不占新格子）`);
  }

  function repaint() {
    document.querySelectorAll('.cpseg--▇▇').forEach(box => {
      const holder = box.parentElement; if (!holder) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = oppBox();
      holder.replaceChild(tmp.firstElementChild, box);
    });
  }

  function wire() {
    document.addEventListener('click', e => {
      const a = e.target.closest('.cpopp__a');
      if (a) {
        const st = load(), k = a.dataset.copk, v = a.dataset.cop;
        st[k] = (st[k] === v) ? '' : v;
        if (!st[k]) delete st[k];
        save(st); sync(1); repaint();
        return;
      }
      if (e.target.closest('.cpopp__all')) {
        const st = load();
        OPP.filter(o => o.lv === 'now').forEach(o => { st[o.id] = 'yes'; });
        save(st); sync(1); repaint();
        if (window.FB && FB.toast) FB.toast('那几条"值得马上做"的都标成采纳了 —— 要撤哪条点"先不用"');
        return;
      }
      if (e.target.closest('.cpopp__clr')) {
        save({}); repaint();
        if (window.FB && FB.toast) FB.toast('清空了 —— 这一页的采纳记录只存在你自己浏览器里');
        return;
      }
      if (e.target.closest('.cpopp__send')) {
        const st = load();
        if (!Object.keys(st).length) {
          if (window.FB && FB.toast) FB.toast('还一条都没点 —— 先采纳或否掉几条');
          return;
        }
        sync();
        if (window.FB && FB.open) FB.open();
        return;
      }
    });
  }

  /* 三段式装配：
       段① 链路（含卡口与刹车）
       段② 运行反馈 → 紧接我领的活 / 要你一句话 / 等你逐条拍板的事项
       段③ 潜力机会（「系统改进建议通道」）
     OWN 的四块不再各自散着，全部收编进段②与段③。 */
  function render() {
    const O = window.OWN || {};
    let out = chainBox();
    if (O.stopBox) out += O.stopBox();   /* 我绝不自己决定的四类＝这条链的刹车，归段① */
    out += runBox();
    if (O.mineBox) out += O.mineBox();
    if (O.askBox)  out += O.askBox();
    if (O.gateBox) out += O.gateBox();
    /* 每周二复盘＝这套系统唯一的固定节拍，属于"它现在实际怎么跑"，所以归段② */
    if (window.WK && WK.render) out += WK.render();
    out += oppBox();
    return out;
  }

  return { render, wire, chainBox, runBox, oppBox, CHAIN, BRAKE, RUN, WRONG, OPP };
})();

(function () {
  const go = () => { try { COOP.wire(); } catch (e) { console.warn('coop', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();

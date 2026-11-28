/* ═══════════════════════════════════════════════════════════
   frsh.js —— 工作台每日更新时钟（R-621，2026-09-23 她原话立起来的）

   触发：09-23 她说「注意工作台的内容需要做到每天更新替换最新的项目进度，
        结合底仓的数据库及业绩动态，每个业务策略，市场分析，工作台运行情况
        都要保持每日更新」。

   这一块回答两件事，⛔ 不许含糊：
     ① 各条数据源今天到底是"新"还是"旧了 N 天"—— 数字都从导出层读，⛔ 不手抄
     ② 兜底触发方式 —— 11:00 cron 挂上前你说一句「刷数据」，我全刷一遍

   ⛔ 硬约束（R-621）：
     - 不许把"通道已定"写成"已经自动刷"（继承 R-618 / R-533）
     - 每一条源必须写清：上次哪天 + 距今几天 + 谁来刷（我 / 你 / 系统）
     - 数据没刷到就必须标红并写"沿用 X 月 X 日"，⛔ 不用旧数顶今天
     - 页面上任何"距今 N 天"必须现算，不许在源代码里写死（防手滑改一处漏一处）
   ═══════════════════════════════════════════════════════════ */
window.FRSH = (function () {

  /* ── 计算"距今几天"（当地时间；跨天算 ▇▇ 天，同天算 ▇▇ 天） ── */
  function daysAgo(dateStr) {
    if (!dateStr) return null;
    // 支持 "2026-09-22" 或 "2026-09-22 09:49" 或 "2026-09-05"
    var m = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    var d0 = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
    var t = new Date();
    var d1 = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
    return Math.max(0, Math.round((d1 - d0) / 86400000));
  }

  function ageLabel(n) {
    if (n === null || n === undefined) return { txt: '未知', cls: 'is-unknown' };
    if (n <= 0) return { txt: '今天', cls: 'is-ok' };
    if (n === 1) return { txt: '昨天', cls: 'is-ok' };
    if (n <= 3) return { txt: '旧 ' + n + ' 天', cls: 'is-warn' };
    return { txt: '旧 ' + n + ' 天', cls: 'is-stale' };
  }

  /* ── 数据源清单：静态部分是"数据截止日"（我盘不到），动态部分从导出层取 ── */
  function sources() {
    var meta = (window.RULDATA || {}).meta || {};
    var mem  = window.MEMDATA || {};
    var expo = meta.exportedAt || mem.stamp || '';
    return [
      {
        n: 'Obsidian 权威源',
        who: '我可以自己重跑',
        d:  expo,
        use: '规则库 / 口径词典 / 记忆层 / 待复核',
        act: '你说一句「刷数据」我立刻重跑 tools/export_rules.py + sync_memory.py'
      },
      {
        n: 'MMM 业绩明细（业务结论 / 归因 / 策略动作）',
        who: 'prm-cli 10-10 已回源 · 当前数据集过旧',
        d:  '2026-03-15',
        use: '最新可访问明细；⛔ 不替代 09-30 飞书已确权经营结论',
        act: '修链路：切换“星图任务结算数据集”并校验日期 / ▇▇行上限；缺数期间只跑 ▇▇个样本：客户G × 客户J / 客户I 授权费、客户H × 客户I 素材后链路、客户I / 客户J 招募一口价达人团'
      },
      {
        n: '3M 商机 × 达人刊例 × 策划工作台',
        who: '静态站，我这边有快照',
        d:  '2026-09-12',
        use: '在库开放商机 / 今天能提报 / 缺表可索',
        act: '数据管道未接，⛔ 快照重取靠触发；<b>刷完页面商机数才会动</b>'
      },
      {
        n: '专项达人打标名单（T-3 二级标签）',
        who: '飞书表，我能直读',
        d:  '2026-09-22',
        use: 'sheet FQmLGV · 优质作者 ▇▇行 / C 组名下 xx 位',
        act: '飞书表改了当天可以反映，⛔ 但读表要触发一次'
      },
      {
        n: '每日自动刷新链路',
        who: '10-10 已手动闭环 · 自动写回仍待验收',
        d:  '2026-10-10',
        use: '每日 09:00 星图业绩任务 ▇▇；模板 INTERNAL-ID 仍作为全量 ▇▇ 源刷新 SOP',
        act: '今天已完成 prm-cli 回源、缺数标记、策略替换与稳定站部署；但自动任务能否每天完成同样的“回源→重算→部署”仍未验收，不能写成已自动化'
      }
    ];
  }

  function render() {
    var today = new Date();
    var td = today.getFullYear() + '-' +
             String(today.getMonth() + 1).padStart(2, '0') + '-' +
             String(today.getDate()).padStart(2, '0');
    var items = sources().map(function (s) {
      var n = daysAgo(s.d);
      var lab = ageLabel(s.d ? n : null);
      var dStr = s.d ? (s.d + ' · <b>' + lab.txt + '</b>') : '<b>' + lab.txt + '</b>';
      return '<div class="frsh__i ' + lab.cls + '">' +
        '<div class="frsh__ih"><b class="frsh__ik">' + s.n + '</b>' +
          '<span class="frsh__iwho">' + s.who + '</span></div>' +
        '<div class="frsh__id">' + dStr + '</div>' +
        '<p class="frsh__iu"><span>撑着哪些数</span>' + s.use + '</p>' +
        '<p class="frsh__ia"><span>怎么刷</span>' + s.act + '</p>' +
      '</div>';
    }).join('');

    return '<section class="frsh" data-mod="frsh">' +
      '<div class="frsh__h">' +
        '<div class="frsh__hl">' +
          '<b class="frsh__k">每日更新时钟</b>' +
          '<span class="frsh__d">今天 ' + td + '｜工作台的每一块业务策略 / 市场分析 / 运行情况都要跟着底仓刷（R-621）</span>' +
        '</div>' +
        '<p class="frsh__hs">' +
          '⛔ <b>不拿旧数顶今天</b>：任何一条源没刷到，页面上那一块会标"沿用 X 月 X 日、已旧 N 天"，' +
          '并且推送私聊时第一行如实写"没变"或"未刷"。' +
          '<b>兜底触发</b>：你早上说一句「刷数据」，我按下面 ▇▇张源全跑一遍。' +
        '</p>' +
      '</div>' +
      '<div class="frsh__grid">' + items + '</div>' +
    '</section>';
  }

  return { render: render, daysAgo: daysAgo, sources: sources };
})();

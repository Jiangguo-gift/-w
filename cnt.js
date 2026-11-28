/* ═══════════════════════════════════════════════════════════
   仓库数字的唯一取数口 —— 页面上任何地方要写「多少条规则、多少条口径、
   多少篇笔记、多少行」，都必须调这里的函数，禁止再手抄数字。
   数来源：本地 Obsidian → tools/export_rules.py → data/rules.data.js
   ═══════════════════════════════════════════════════════════ */
(function () {
  var D = window.RULDATA || {};
  var M = D.meta || {};
  var V = D.vault || {};
  window.RC = function () { return M.ruleCount || 0; };        // 判断规则条数
  window.TC = function () { return M.termCount || 0; };        // 口径词典条数
  window.RCAT = function () { return M.exportedAt || ''; };    // 导出时间
  window.VN = function () { return V.notes || 0; };            // 笔记篇数
  window.VL = function () { return V.lines || 0; };            // 总行数
  window.VD = function () { return V.dirs || 0; };             // 目录数
  window.VLOG = function () { return V.learnLogs || 0; };      // 学习日志篇数
  window.VMEM = function () { return V.memoryLines || 0; };    // MEMORY.md 行数
  var X = D.mem || {};
  window.QT = function () { return X.qTotal || 0; };           // 待复核队列在册编号数
  window.QO = function () { return X.qOpen || 0; };            // 其中仍挂着的
  window.QD = function () { return X.qDone || 0; };            // 其中已裁决/已归档
  window.QU = function () { return X.qUpdated || ''; };        // 待复核源最近更新
  window.EC = function () { return X.errors || 0; };           // 我认下的判错条数
  window.UC = function () { return X.prefs || 0; };            // 你的偏好条数
  window.DC = function () { return X.decisions || 0; };        // 你的决策习惯条数
  window.JC = function () { return X.projects || 0; };         // 在跑项目卡数
})();

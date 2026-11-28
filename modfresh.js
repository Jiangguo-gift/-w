/* ═══════════════════════════════════════════════════════════
   modfresh.js —— 全模块每日更新 / 已阅状态
   - “更新并标记已阅”会把刷新请求送进右上角「我的反馈」，并记录本机已阅时间。
   - 静态页不伪装后台已抓取；Aime 完成回源、重算、部署后内容才真正更新。
   - 每个模块只保留最近 ▇▇条操作记录，避免历史堆叠。
   ═══════════════════════════════════════════════════════════ */
window.MODUP = (function () {
  const KEY = 'cec.module.daily.v1';
  const LIMIT = 3;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {}
  }
  function title(id) {
    return ((window.OS && OS.BY && OS.BY[id]) || {}).t || id;
  }
  function isoNow() { return new Date().toISOString(); }
  function dayKey(v) {
    const d = v ? new Date(v) : new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
  }
  function time(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function get(id) {
    const all = load();
    return all[id] || { readAt: '', requestedAt: '', log: [] };
  }
  function set(id, st) {
    const all = load();
    st.log = (st.log || []).slice(0, LIMIT);
    all[id] = st;
    save(all);
  }
  function addLog(st, type, text, at) {
    st.log = [{ at: at || isoNow(), type, text }].concat(st.log || []).slice(0, LIMIT);
  }
  function render(id) {
    const st = get(id);
    const readToday = st.readAt && dayKey(st.readAt) === dayKey();
    const requestedToday = st.requestedAt && dayKey(st.requestedAt) === dayKey();
    const logs = (st.log || []).slice(0, LIMIT);
    return `<section class="modup${readToday ? ' is-read' : ''}" data-modup="${esc(id)}">
      <div class="modup__main">
        <span class="modup__dot" aria-hidden="true"></span>
        <div>
          <b>${readToday ? '今天已阅' : '今天待确认'}</b>
          <p>${requestedToday ? `今日更新请求已于 ${time(st.requestedAt)} 提交，等 Aime 回源更新并部署。` : '本模块今天尚未发起更新；可一键提交刷新请求并标记已阅。'}</p>
        </div>
      </div>
      <div class="modup__actions">
        <button type="button" class="modup__refresh" data-modup-refresh="${esc(id)}">${requestedToday ? '再次更新并标记已阅' : '更新并标记已阅'}</button>
        <button type="button" class="modup__read" data-modup-read="${esc(id)}">${readToday ? '已阅 · ' + time(st.readAt) : '仅标记已阅'}</button>
      </div>
      <details class="modup__history">
        <summary>最近记录 ${logs.length}/▇▇</summary>
        <div class="modup__logs">${logs.length ? logs.map(x => `<div><time>${time(x.at)}</time><span>${esc(x.text)}</span></div>`).join('') : '<p>暂无记录。新的确认会覆盖旧记录，最多保留 ▇▇条。</p>'}</div>
      </details>
      <p class="modup__truth">说明：按钮负责触发与记录，不伪装后台自动抓取；真正更新以 Aime 回源、重算并重新部署后的页面为准。</p>
    </section>`;
  }
  function paint(id) {
    const el = document.querySelector(`[data-modup="${id}"]`);
    if (el) el.outerHTML = render(id);
  }
  function toast(msg) {
    if (window.FB && FB.toast) FB.toast(msg);
  }
  function markRead(id, text) {
    const st = get(id), now = isoNow();
    st.readAt = now;
    addLog(st, 'read', text || '已标记今天已阅', now);
    set(id, st);
    paint(id);
  }
  function request(id) {
    const name = title(id);
    if (!(window.FB && FB.submit)) {
      toast('提交通道未加载，请刷新后再试');
      return;
    }
    const item = FB.submit({
      kind: 'todo',
      view: name,
      topic: 'module-daily-refresh-' + id,
      topicName: name + ' · 每日更新',
      text: [
        `请刷新工作台模块「${name}」并替换为今天的最新内容与策略。`,
        '要求：先核对权威数据源和截止时间；已确认历史不要继续堆叠；页面最多保留最近 ▇▇条确认记录；完成后重新部署并回写 Obsidian。'
      ].join('\n')
    });
    if (!item) {
      toast('本批反馈已满，请先在右上角交办给 Aime');
      return;
    }
    const st = get(id), now = isoNow();
    st.readAt = now;
    st.requestedAt = now;
    addLog(st, 'request', '已提交更新请求，并标记今天已阅', now);
    set(id, st);
    paint(id);
    toast(`「${name}」已进入右上角反馈，并标记已阅`);
  }
  function wire() {
    if (wire._on) return;
    wire._on = 1;
    document.addEventListener('click', e => {
      const refresh = e.target.closest('[data-modup-refresh]');
      if (refresh) { request(refresh.dataset.modupRefresh); return; }
      const read = e.target.closest('[data-modup-read]');
      if (read) markRead(read.dataset.modupRead);
    });
  }

  wire();
  return { render, wire, get, request, markRead };
})();

/* ═══════════════════════════════════════════════════════════
   fb.js —— 反馈直通车（2026-09-13 改成「一批一批发」）

   她的原话：「我的提交反馈这里，可以不用留档，每次只同步最新反馈待最新
   内容即可，也可以限制我一次只更新 ▇▇-▇▇个反馈；要不一次输入太多信息怕
   aime 跑不动。」

   所以规则改成三条：
     ▇▇. 只有「本批」，没有历史档。发出去就清空，页面上不再堆着看过的反馈。
     ▇▇. 一批最多 ▇▇条。满了就拦住，提示她先发出去。
     ▇▇. 同一件事改主意 = 覆盖原来那条，不占新格子。

   ⚠️ 唯一保留的持久记录是 ans（哪些「需要你定」她已经定了）——
      只存一行 { ts, choice, text }，不是留档，是为了页面上那些卡片
      不会在清空后又变回「需要你定」，也不会拿已定的事再问她第二遍。
   ═══════════════════════════════════════════════════════════ */
window.FB = (function () {

  const API = 'https://fn.internal.example';
  const KEY = 'demo-feedback-key';
  const LS  = 'cec.fb.v2';
  const OLD = 'cec.fb.v1';
  const MAX = 5;               /* 一批上限：她定的 3-5，取上限 ▇▇ */

  let store = { batch: {}, ans: {}, lastHo: null };
  try {
    const raw = JSON.parse(localStorage.getItem(LS) || 'null');
    if (raw) store = Object.assign(store, raw);
  } catch (e) {}
  if (!store.batch) store.batch = {};
  if (!store.ans)   store.ans   = {};

  /* 从老版本（全量留档）迁移一次：
     已定的裁决压成 ans 一行；没送达的最多带 ▇▇条进本批；其余历史直接丢掉——
     她要的就是不留档。 */
  (function migrate() {
    let old = null;
    try { old = JSON.parse(localStorage.getItem(OLD) || 'null'); } catch (e) {}
    if (!old || !old.items) return;
    const all = Object.values(old.items).sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
    all.forEach(i => {
      if (i.kind === 'decide' && i.topic && !store.ans[i.topic])
        store.ans[i.topic] = { ts: i.ts, choice: i.choice || '', text: i.text || '' };
    });
    all.filter(i => !i.sent).slice(0, MAX).forEach(i => { store.batch[i.id] = i; });
    if (old.lastHo && !store.lastHo) store.lastHo = old.lastHo;
    try { localStorage.setItem(LS, JSON.stringify(store)); localStorage.removeItem(OLD); } catch (e) {}
  })();

  const save = () => { try { localStorage.setItem(LS, JSON.stringify(store)); } catch (e) {} };
  const esc  = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const nid  = () => 'fb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const now  = () => {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const list = () => Object.values(store.batch).sort((a, b) => (b.ts || '').localeCompare(a.ts || ''));
  const full = () => Object.keys(store.batch).length >= MAX;

  const KIND = { decide: '定了', add: '补充', note: '批注', idea: '灵感', todo: '待办', bug: '报错', search: '搜索' };

  /* ── 发送 ───────────────────────────── */
  function push(items) {
    if (!items.length) return Promise.resolve(false);
    return fetch(API + '/api/v1/fb', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-fb-key': KEY },
      body: JSON.stringify({ items })
    }).then(r => r.json()).then(j => {
      if (j && j.ok) {
        (j.saved || []).forEach(id => { if (store.batch[id]) store.batch[id].sent = 1; });
        save(); paint();
        return true;
      }
      return false;
    }).catch(() => false);
  }

  function submit(o) {
    /* 同一件事改主意：覆盖原来那条，不占新格子 */
    const dup = Object.values(store.batch).find(i => i.topic && i.topic === o.topic && i.kind === o.kind);
    if (!dup && full()) {
      toast(`这一批已经 ${MAX} 条了 —— 先点右上角「我的反馈 → 交办给 Aime」发出去，发完自动清空，再接着写`);
      const btn = document.getElementById('fbBtn');
      if (btn) { btn.classList.add('is-full'); setTimeout(() => btn.classList.remove('is-full'), 1800); }
      return null;
    }
    const it = Object.assign({ id: dup ? dup.id : nid(), ts: now(), who: '本人', sent: 0 }, o);
    store.batch[it.id] = it;
    /* 「需要你定」的答案单独留一行，页面上的卡片才不会清空后又变回未定 */
    if (o.kind === 'decide' && o.topic)
      store.ans[o.topic] = { ts: it.ts, choice: o.choice || '', text: o.text || '' };
    save();
    paint();
    const left = MAX - Object.keys(store.batch).length;
    push([it]).then(ok => {
      toast(ok
        ? `已记下（本批 ${Object.keys(store.batch).length}/${MAX}${left ? '，还能写 ' + left + ' 条' : '，满了，去右上角发出去'}）`
        : '已记下（网络没通，稍后自动重发）');
    });
    return it;
  }

  /* 删掉本批里的某一条（写错了 / 想换一条） */
  function drop(id) {
    if (!store.batch[id]) return;
    delete store.batch[id];
    save(); paint();
    toast(`已去掉，本批 ${Object.keys(store.batch).length}/${MAX}`);
  }

  /* 清空本批（不留档，清了就没了） */
  function clear(silent) {
    store.batch = {};
    save(); paint();
    if (!silent) toast('本批已清空，可以从头写');
  }

  /* 未发出去的自动补发 */
  function resync(silent) {
    const pend = list().filter(i => !i.sent);
    if (!pend.length) { if (!silent) toast('本批都已经到我这儿了'); return; }
    push(pend).then(ok => { if (!silent) toast(ok ? `补发成功 ${pend.length} 条` : '还是没通，等会儿我再试'); });
  }

  /* ── 一键交办给 Aime ─────────────────────
     她原话：「给我一个按钮可以直接推送给你更新当前的反馈动作，
     而不是导出补丁再贴给你。」
     这里做三件事：补发未送达 → 开一张交办单 → 把唤起口令复制进剪贴板。
     ⚠️ 必须说实话：Aime 不是常驻进程，没人叫不会自己醒。
        这个按钮把「叫醒我」从"导出补丁 + 粘一大段"压缩成"粘一句话"。 */
  function handoff(note) {
    /* 全量重推本批（服务端按 id 幂等）：收件箱服务重启会清空，
       只补发"未送达"会导致交办单里是空的。 */
    const all = list();
    const step1 = all.length ? push(all) : Promise.resolve(true);
    const panel = document.getElementById('fbHoBox');
    if (panel) panel.innerHTML = '<div class="fbho__wait">正在交办…</div>';

    return step1.then(() => fetch(API + '/api/v1/handoff', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-fb-key': KEY },
      body: JSON.stringify({
        note: note || '',
        day: (() => { const d = new Date(), p = n => String(n).padStart(2, '0');
                      return p(d.getMonth() + 1) + p(d.getDate()); })(),
        ts: now()
      })
    })).then(r => r.json()).then(j => {
      if (!j || !j.ok) throw new Error('bad');
      const word = `处理我的工作台交办单 ${j.no}`;
      store.lastHo = { no: j.no, n: j.n, ts: now() };
      /* 发出去就清空 —— 她要的就是不留档，页面上不再堆历史 */
      store.batch = {};
      save();
      try { navigator.clipboard.writeText(word); } catch (e) {}
      if (panel) {
        panel.innerHTML = `<div class="fbho is-ok">
          <div class="fbho__t">✅ 已交办 · 单号 <b>${esc(j.no)}</b> · 带走 ${j.n} 条</div>
          <div class="fbho__s">这批已经进我的收件箱，我下次开工第一眼就会看到，而且它会被<b>置顶</b>。<b>本批已清空</b>，你可以接着写下一批（还是最多 ${MAX} 条）。</div>
          <div class="fbho__w">
            <div class="fbho__wk">唤起口令已复制到剪贴板 —— 回 Aime 对话框粘贴发出就行：</div>
            <code>${esc(word)}</code>
            <button class="fbho__cp" data-howord="${esc(word)}">再复制一次</button>
          </div>
          <div class="fbho__n">⚠️ 说句实话：我不是常驻进程，没人叫我不会自己醒。这个按钮的作用是把"叫醒我"从<b>导出补丁+粘一大段</b>压成<b>粘一句话</b>，内容我自己去收件箱取。</div>
        </div>`;
      }
      paint();
      toast(`已交办 ${j.no}，带走 ${j.n} 条，本批已清空`);
      return j;
    }).catch(() => {
      if (panel) {
        panel.innerHTML = `<div class="fbho is-bad">
          <div class="fbho__t">⚠️ 交办没发出去（网络没通）</div>
          <div class="fbho__s">这批还在本机没丢，也<b>没有被清空</b>。等会儿再点一次；实在不行用下面的「导出补丁（备用）」。</div>
        </div>`;
      }
      toast('没发出去，本批还留着，稍后再试');
      return null;
    });
  }

  /* ── 待你定的事：先看已定记录，再看本批（改主意会覆盖显示） ── */
  function answerOf(topic) {
    const a = store.ans[topic];
    if (a) return { topic: topic, kind: 'decide', ts: a.ts, choice: a.choice, text: a.text };
    return list().find(i => i.topic === topic && i.kind === 'decide');
  }

  /* ── 卡片：一条需要你定的事 ────────────── */
  function askCard(a) {
    const done = answerOf(a.id);
    return `<div class="ask${done ? ' is-done' : ''}" data-ask="${esc(a.id)}">
      <div class="ask__h">
        <span class="ask__tag">${done ? '你已经定了' : '需要你定'}</span>
        <h4 class="ask__q">${a.q}</h4>
      </div>
      ${a.why ? `<p class="ask__w">${a.why}</p>` : ''}
      <div class="ask__body">
        ${(a.opts || []).length ? `<div class="ask__opts">${a.opts.map(o =>
          `<button class="askopt${done && done.choice === o ? ' is-on' : ''}" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
        <textarea class="ask__t" rows="▇▇" placeholder="${esc(a.ph || '想补一句就写这里，不写也行')}"></textarea>
        <div class="ask__foot">
          <button class="ask__go">提交给 Aime</button>
          <span class="ask__st">${done ? `已提交 · ${esc(done.ts)}${done.choice ? ' · ' + esc(done.choice) : ''}` : ''}</span>
        </div>
      </div>
    </div>`;
  }

  function askList(ids) {
    const src = (window.ASKS || []).filter(a => !ids || ids.indexOf(a.id) >= 0);
    if (!src.length) return '';
    return src.map(askCard).join('');
  }

  /* ── 随手补充框（任何一页都有） ───────── */
  function noteBox(view, topic) {
    return `<div class="fbnote" data-fbnote="${esc(view)}">
      <div class="fbnote__k">这一页有要补充 / 要改的，直接写</div>
      <textarea rows="▇▇" placeholder="比如：这个数不对，应该是…／这块我要加一项…／这段看不懂"></textarea>
      <div class="fbnote__f">
        <button class="fbnote__go" data-topic="${esc(topic || view)}">提交给 Aime</button>
        <span class="fbnote__h">提交后直接进我的收件箱，不用导出补丁</span>
      </div>
    </div>`;
  }

  /* ── 右上角计数 + 抽屉 ─────────────── */
  function paint() {
    const all = list();
    const n = all.length, un = all.filter(i => !i.sent).length;
    const b = document.getElementById('fbN');
    if (b) b.textContent = n ? `${n}/${MAX}` : '';
    const btn = document.getElementById('fbBtn');
    if (btn) {
      btn.classList.toggle('is-pend', !!un);
      btn.classList.toggle('is-max', n >= MAX);
      btn.title = n >= MAX
        ? `本批满了（${MAX} 条）—— 点开交办给我，发完自动清空`
        : `本批 ${n}/${MAX} 条，发出去就清空，不留档`;
    }

    const box = document.getElementById('fbList');
    if (box) {
      box.innerHTML = n ? all.map(i => `<div class="fbi${i.sent ? '' : ' is-pend'}">
        <div class="fbi__h"><span class="fbi__k">${KIND[i.kind] || i.kind}</span>
          <b>${esc(i.topicName || i.topic || '')}</b>
          <span class="fbi__t">${esc(i.ts)}</span>
          <span class="fbi__s">${i.sent ? '已送达' : '待补发'}</span>
          <button class="fbi__x" data-fbdel="${esc(i.id)}" title="从本批去掉">✕</button></div>
        ${i.choice ? `<div class="fbi__c">${esc(i.choice)}</div>` : ''}
        ${i.text ? `<div class="fbi__x2">${esc(i.text)}</div>` : ''}
      </div>`).join('')
      : `<div class="fbempty">本批是空的。<br>任何一页看到「需要你定」或「直接写」，写完点提交就进来 —— <b>一批最多 ${MAX} 条</b>，发出去自动清空。</div>`;
    }
    const c = document.getElementById('fbCount');
    if (c) c.textContent = `本批 ${n}/${MAX}${un ? ' · ' + un + ' 条待补发' : ''}`;
    const bar = document.getElementById('fbBar');
    if (bar) {
      bar.innerHTML = Array.from({ length: MAX }, (_, i) =>
        `<i class="fbbar__d${i < n ? ' is-on' : ''}"></i>`).join('');
    }

    /* 交办按钮上的角标：这批有多少条可以带走 */
    const hn = document.getElementById('fbHoN');
    if (hn) hn.textContent = n ? `（带走 ${n} 条，发完清空）` : '（本批还是空的）';
    const hb = document.getElementById('fbHandoff');
    if (hb) hb.disabled = !n;
    const cl = document.getElementById('fbClear');
    if (cl) cl.disabled = !n;
    const hbox = document.getElementById('fbHoBox');
    if (hbox && !hbox.innerHTML && store.lastHo) {
      hbox.innerHTML = `<div class="fbho is-old">上次交办：<b>${esc(store.lastHo.no)}</b> · ${esc(store.lastHo.ts)} · 带走 ${store.lastHo.n} 条</div>`;
    }

    /* 侧栏「重要事项确认」角标：还剩几条没定 */
    const left = (window.ASKS || []).filter(a => !answerOf(a.id)).length;
    const badge = document.querySelector('[data-badge="confirm"]');
    if (badge) {
      if (left) { badge.textContent = left; badge.className = 'osi__b is-hot'; }
      else { badge.textContent = '✓'; badge.className = 'osi__b'; }
    }
    document.querySelectorAll('[data-askleft]').forEach(e => e.textContent = left);
    if (window.SHELL && SHELL.renderSide) SHELL.renderSide();
  }

  function toast(t) {
    let el = document.getElementById('fbToast');
    if (!el) { el = document.createElement('div'); el.id = 'fbToast'; el.className = 'fbtoast'; document.body.appendChild(el); }
    el.textContent = t; el.classList.add('is-on');
    clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-on'), 2600);
  }

  function drawer() {
    if (document.getElementById('fbDrawer')) return;
    const d = document.createElement('div');
    d.id = 'fbDrawer'; d.className = 'fbdr';
    d.innerHTML = `<div class="fbdr__mask" data-fbclose></div>
      <div class="fbdr__p">
        <div class="fbdr__h">
          <div><b>本批反馈</b><span id="fbCount"></span>
            <div class="fbbar" id="fbBar"></div></div>
          <button data-fbclose>关闭</button>
        </div>
        <div class="fbdr__rule">一批最多 <b>${MAX}</b> 条，<b>发出去就清空</b>，我这边只处理最新这一批 —— 你不用在这儿翻历史。</div>
        <div class="fbdr__ho">
          <button id="fbHandoff" class="fbho__btn">🚀 交办给 Aime<em id="fbHoN"></em></button>
          <textarea id="fbHoNote" rows="▇▇" placeholder="想附一句优先级就写这里，比如「先改简报那条」（可不写）"></textarea>
          <div class="fbho__k">点一下 = 这批直接进我的收件箱 + 生成交办单 + 把唤起口令复制给你，<b>然后本批清空</b>。</div>
          <div id="fbHoBox"></div>
        </div>
        <div class="fbdr__acts">
          <button id="fbResync">重新发一次</button>
          <button id="fbCopy">复制本批</button>
          <button id="fbClear">清空本批</button>
          <button id="fbPatch" class="is-weak">导出补丁（备用）</button>
        </div>
        <div class="fbdr__l" id="fbList"></div>
        <div class="fbdr__foot">写错了点每条右上角 ✕ 去掉就行。交办成功后这一批自动清空，不留档。</div>
      </div>`;
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target.closest('[data-fbclose]')) d.classList.remove('is-on'); });
    d.querySelector('#fbHandoff').addEventListener('click', () => {
      handoff((d.querySelector('#fbHoNote').value || '').trim());
    });
    d.addEventListener('click', e => {
      const cp = e.target.closest('[data-howord]');
      if (cp) navigator.clipboard.writeText(cp.dataset.howord).then(() => toast('口令已复制'), () => toast('复制失败'));
      const del = e.target.closest('[data-fbdel]');
      if (del) drop(del.dataset.fbdel);
    });
    d.querySelector('#fbResync').addEventListener('click', () => resync());
    d.querySelector('#fbClear').addEventListener('click', () => {
      if (!list().length) return;
      clear();
    });
    d.querySelector('#fbCopy').addEventListener('click', () => {
      const txt = list().map(i => `【${KIND[i.kind] || i.kind}】${i.topicName || i.topic || ''}\n  ${i.choice ? '选择：' + i.choice + '\n  ' : ''}${i.text || ''}\n  ${i.ts}`).join('\n\n');
      navigator.clipboard.writeText(txt).then(() => toast('已复制本批'), () => toast('复制失败，手动选中吧'));
    });
    d.querySelector('#fbPatch').addEventListener('click', () => {
      d.classList.remove('is-on');
      document.getElementById('patchBtn')?.click();
    });
  }

  function open() { drawer(); paint(); document.getElementById('fbDrawer').classList.add('is-on'); }

  /* ── 全局事件（一次挂好，后面新渲染的卡片也能用） ── */
  function wire() {
    drawer();

    document.addEventListener('click', e => {
      /* 打开抽屉 */
      if (e.target.closest('#fbBtn')) { e.preventDefault(); open(); return; }

      /* 选项 */
      const opt = e.target.closest('.askopt');
      if (opt) {
        const card = opt.closest('.ask');
        card.querySelectorAll('.askopt').forEach(x => x.classList.toggle('is-on', x === opt));
        return;
      }

      /* 提交一条「需要你定」 */
      const go = e.target.closest('.ask__go');
      if (go) {
        const card = go.closest('.ask');
        const id = card.dataset.ask;
        const a = (window.ASKS || []).find(x => x.id === id) || {};
        const on = card.querySelector('.askopt.is-on');
        const txt = card.querySelector('.ask__t').value.trim();
        if (!on && !txt) { toast('选一个，或者写一句'); return; }
        const okd = submit({
          kind: 'decide', view: a.view || '', topic: id, topicName: a.q || id,
          choice: on ? on.textContent : '', text: txt
        });
        if (!okd) return;                     /* 本批满了，先发出去再定 */
        card.classList.add('is-done');
        card.querySelector('.ask__tag').textContent = '你已经定了';
        card.querySelector('.ask__st').textContent = `已提交 · ${now()}${on ? ' · ' + on.textContent : ''}`;
        card.querySelector('.ask__t').value = '';
        /* 同一条在别的页面也同步变成已定 */
        document.querySelectorAll(`.ask[data-ask="${id}"]`).forEach(x => {
          if (x === card) return;
          x.classList.add('is-done');
          x.querySelector('.ask__tag').textContent = '你已经定了';
          x.querySelector('.ask__st').textContent = card.querySelector('.ask__st').textContent;
          if (on) x.querySelectorAll('.askopt').forEach(b => b.classList.toggle('is-on', b.textContent === on.textContent));
        });
        return;
      }

      /* 页内随手补充 */
      const ng = e.target.closest('.fbnote__go');
      if (ng) {
        const box = ng.closest('.fbnote');
        const ta = box.querySelector('textarea');
        const txt = ta.value.trim();
        if (!txt) { toast('写一句再提交'); return; }
        if (!submit({ kind: 'add', view: box.dataset.fbnote, topic: ng.dataset.topic, topicName: ng.dataset.topic, text: txt })) return;
        ta.value = '';
        return;
      }

      /* 拜访快记 */
      const vg = e.target.closest('.vst__go');
      if (vg) {
        const box = vg.closest('.vst');
        const ins = [].slice.call(box.querySelectorAll('.vst__i'));
        const parts = ins.map(i => i.value.trim() ? i.dataset.vk + '：' + i.value.trim() : '').filter(Boolean);
        if (!parts.length) { toast('至少写一句，比如见了谁'); return; }
        if (!submit({ kind: 'todo', view: '拜访快记', topic: '拜访快记',
                 topicName: '拜访快记 · ' + (ins[0].value.trim() || '未写对象'), text: parts.join('\n') })) return;
        ins.forEach(i => i.value = '');
        vg.textContent = '已提交 ✓';
        setTimeout(() => vg.textContent = '提交给 Aime', 2200);
        return;
      }

      /* 模块批注直接提交 */
      const as = e.target.closest('[data-annot-send]');
      if (as) {
        const id = as.dataset.annotSend;
        const box = document.querySelector(`[data-annot-box="${id}"]`);
        const ta = box && box.querySelector('textarea');
        const txt = ta ? ta.value.trim() : '';
        if (!txt) { toast('批注还是空的'); return; }
        const title = document.querySelector(`.block[data-mod="${id}"] h3`);
        if (!submit({ kind: 'note', view: (OS.BY[OS.cur()] || {}).t || '', topic: id, topicName: title ? title.textContent : id, text: txt })) return;
        as.textContent = '已提交 ✓';
        setTimeout(() => as.textContent = '提交给 Aime', 2200);
        return;
      }
    });

    /* 每次打开页面补发一次 */
    setTimeout(() => resync(true), 1500);
    paint();
  }

  return { submit, askCard, askList, noteBox, wire, paint, open, resync, handoff, list, answerOf, toast,
           drop, clear, MAX, left: () => MAX - Object.keys(store.batch).length };
})();

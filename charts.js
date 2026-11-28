/* ═══════════════════════════════════════════════════════════
   驾驶舱图表层 · ECharts
   所有序列都从 data.js 的既有字段推导，不另存一份数字，
   避免图和表对不上（这是仪表盘最常见的腐烂方式）。
   命名空间 CEC_CHARTS，避开 render.js 已占用的全局名。
   ═══════════════════════════════════════════════════════════ */
window.CEC_CHARTS = (function () {

  const REG = {};          // id → { el, inst, build }
  let booted = false;

  /* ── 从 CSS 变量取色，夜间模式自动跟随 ── */
  function T() {
    const s = getComputedStyle(document.body);
    const v = n => s.getPropertyValue(n).trim();
    return {
      ink: v('--ink'), ink2: v('--ink-2'), ink3: v('--ink-3'), ink4: v('--ink-4'),
      rule: v('--rule'), rule2: v('--rule-2'),
      signal: v('--signal'), run: v('--run'), open: v('--open'), info: v('--info'),
      signalW: v('--signal-w'), runW: v('--run-w'), openW: v('--open-w'),
      onAcc: v('--on-accent') || '#06140F',
      mute: v('--mute') || 'rgba(150,150,170,.34)',
      signalSoft: v('--signal-soft') || 'rgba(255,159,226,.28)',
      paper: v('--paper'), panel: v('--panel'), panel2: v('--panel-2'),
      mono: v('--font-mono'), body: v('--font-body'), display: v('--font-display')
    };
  }

  function base(t) {
    return {
      animationDuration: document.body.classList.contains('motion-off') ? 0 : 520,
      animationEasing: 'cubicOut',
      textStyle: { fontFamily: t.body, color: t.ink2 },
      grid: { left: 0, right: 0, top: 8, bottom: 0, containLabel: true },
      tooltip: {
        backgroundColor: 'rgba(18,18,24,.94)', borderWidth: 0, padding: [9, 13],
        textStyle: { color: '#fff', fontSize: 12, fontFamily: t.body },
        extraCssText: 'border-radius:14px;box-shadow:0 18px 44px rgba(0,0,0,.5);' +
                      'backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);' +
                      'border:1px solid rgba(255,255,255,.12);'
      }
    };
  }
  const axLine = t => ({ lineStyle: { color: t.rule2, width: 1 } });
  const axLbl  = (t, size) => ({ color: t.ink3, fontSize: size || 11, fontFamily: t.mono });
  const split  = t => ({ lineStyle: { color: t.rule, type: 'dashed' } });

  /* ═══════════ ▇▇ 十二个目录的填充度 ═══════════ */
  function cDirs(t) {
    const rows = [...DATA.dirs.rows].sort((a, b) => a.c - b.c);
    const empty = new Set(rows.filter(r => r.c === 0).map(r => r.n));
    return Object.assign(base(t), {
      grid: { left: 0, right: 34, top: 4, bottom: 2, containLabel: true },
      xAxis: { type: 'value', max: DATA.dirs.max, axisLine: { show: false }, axisTick: { show: false },
               axisLabel: { show: false }, splitLine: split(t) },
      yAxis: { type: 'category', data: rows.map(r => r.n),
               axisLine: axLine(t), axisTick: { show: false },
               axisLabel: Object.assign(axLbl(t, 11.5), {
                 color: v => empty.has(v) ? t.signal : t.ink2 }) },
      tooltip: Object.assign(base(t).tooltip, {
        formatter: p => {
          const r = rows[p.dataIndex];
          return `<b>${r.n}</b><br>${r.c === 0 ? `<span style="color:${t.signal}">一篇都没有</span>` : r.c + ' 篇'}<br>${r.note.replace(/⛔ /, '')}`;
        }
      }),
      series: [{
        type: 'bar', barWidth: 12,
        data: rows.map(r => ({
          value: r.c === 0 ? DATA.dirs.max : r.c,
          real: r.c,
          itemStyle: r.c === 0
            ? { color: t.signalW, borderColor: t.signal, borderWidth: 1, borderType: [3, 3], borderRadius: 6 }
            : { color: r.c >= 8 ? t.ink : t.ink3, borderRadius: 6 }
        })),
        label: {
          show: true, position: 'right', fontFamily: t.mono, fontSize: 11,
          formatter: p => p.data.real === 0 ? '空' : p.data.real,
          color: p => p.data.real === 0 ? t.signal : t.ink3
        }
      }]
    });
  }

  /* ═══════════ ▇▇ 倒金字塔：原料 → 整理 → 规则 ═══════════ */
  function cPyramid(t) {
    const r = DATA.threelayer.rows;   // raw ▇▇ / wiki ▇▇ / agent ▇▇
    return Object.assign(base(t), {
      tooltip: Object.assign(base(t).tooltip, {
        formatter: p => `<b>${p.name}</b><br>${p.value} 篇<br>${p.data.map_}`
      }),
      series: [{
        type: 'funnel', sort: 'ascending', gap: 3,
        left: 0, right: 0, top: 2, bottom: 20, width: '▇▇',
        min: 0, max: 18, minSize: '▇▇', maxSize: '▇▇',
        label: {
          position: 'inside', fontFamily: t.body, fontSize: 12, fontWeight: 600,
          formatter: p => `${p.name}　${p.value}`
        },
        labelLine: { show: false },
        data: [
          { name: 'raw 原始素材', value: r[0].c, map_: r[0].map, itemStyle: { color: t.signal, opacity: .95, borderRadius: 10 } },
          { name: 'wiki 整理文档', value: r[1].c, map_: r[1].map, itemStyle: { color: t.open, opacity: .9, borderRadius: 10 } },
          { name: 'agent 规则层', value: r[2].c, map_: r[2].map, itemStyle: { color: t.run, opacity: .95, borderRadius: 10 } }
        ].map(d => Object.assign(d, { label: { color: t.onAcc } }))
      }]
    });
  }

  /* ═══════════ ▇▇ 规则库健康度 ═══════════ */
  function cRuleHealth(t) {
    const h = DATA.growth.health;
    const pct = +(h.verified / h.total * 100).toFixed(1);
    return Object.assign(base(t), {
      series: [{
        type: 'gauge', startAngle: 200, endAngle: -20, radius: '▇▇', center: ['▇▇', '▇▇'],
        min: 0, max: 100, splitNumber: 5,
        progress: { show: true, width: 13, roundCap: true,
                    itemStyle: { color: t.run, shadowBlur: 14, shadowColor: 'rgba(39,224,33,.55)' } },
        axisLine: { roundCap: true, lineStyle: { width: 13, color: [[1, 'rgba(140,140,160,.22)']] } },
        axisTick: { show: false },
        splitLine: { length: 7, lineStyle: { color: t.rule2, width: 1 } },
        axisLabel: { distance: 12, color: t.ink4, fontSize: 9.5, fontFamily: t.mono },
        pointer: { show: false }, anchor: { show: false },
        title: { show: true, offsetCenter: [0, '▇▇'], color: t.ink3, fontSize: 11, fontFamily: t.mono },
        detail: {
          offsetCenter: [0, -8], fontFamily: t.display, fontSize: 34, color: t.ink,
          formatter: v => v + '%'
        },
        data: [{ value: pct, name: `已验证 ${h.verified} / ${h.total} 条` }]
      }]
    });
  }

  /* ═══════════ ▇▇ 规则库六类构成 ═══════════ */
  function cRuleCats(t) {
    const cats = DATA.growth.health.cats;
    const live = cats.filter(c => c.c > 0);
    const zero = cats.filter(c => c.c === 0);
    const tone = [t.run, t.info, t.open, t.signal];   // 分类色，不表示状态
    return Object.assign(base(t), {
      tooltip: Object.assign(base(t).tooltip, { formatter: p => `<b>${p.name}</b><br>${p.value} 条 · 占 ${p.percent}%` }),
      series: [{
        type: 'pie', radius: ['▇▇', '▇▇'], center: ['▇▇', '▇▇'],
        avoidLabelOverlap: true, itemStyle: { borderColor: t.paper, borderWidth: 3, borderRadius: 4 },
        label: { show: false }, labelLine: { show: false },
        data: live.map((c, i) => ({ name: c.n, value: c.c, itemStyle: { color: tone[i % tone.length] } }))
      }, {
        type: 'pie', radius: ['▇▇', '▇▇'], center: ['▇▇', '▇▇'], silent: true,
        itemStyle: { color: 'transparent' }, labelLine: { show: false },
        label: {
          position: 'center', formatter: `{a|${live.reduce((s, c) => s + c.c, 0)}}\n{b|条已归类}\n{c|${zero.length} 类为 ▇▇}`,
          rich: {
            a: { fontFamily: t.display, fontSize: 32, color: t.ink, lineHeight: 34 },
            b: { fontFamily: t.mono, fontSize: 10.5, color: t.ink3, lineHeight: 16 },
            c: { fontFamily: t.mono, fontSize: 10.5, color: t.signal, lineHeight: 15 }
          }
        },
        data: [{ value: 1 }]
      }]
    });
  }

  /* ═══════════ ▇▇ 七个周期节奏 · 跑没跑 ═══════════ */
  function cRhythm(t) {
    const order = ['每日', '每周', '每月', '每季'];
    const map = {};
    order.forEach(c => map[c] = { run: 0, part: 0, gap: 0 });
    DATA.rhythm.rows.forEach(r => { if (map[r.cyc]) map[r.cyc][r.st]++; });
    const mk = (k, name, color) => ({
      name, type: 'bar', stack: 'x', barWidth: 24,
      itemStyle: { color, borderRadius: 5, borderColor: 'transparent', borderWidth: 2 },
      label: { show: true, fontFamily: t.mono, fontSize: 10.5, fontWeight: 700, color: t.onAcc,
               formatter: p => p.value || '' },
      data: order.map(c => map[c][k])
    });
    return Object.assign(base(t), {
      grid: { left: 0, right: 6, top: 6, bottom: 2, containLabel: true },
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false },
               axisLabel: { show: false }, splitLine: split(t) },
      yAxis: { type: 'category', data: order, inverse: true,
               axisLine: axLine(t), axisTick: { show: false }, axisLabel: axLbl(t, 12) },
      series: [mk('run', '在跑', t.run), mk('part', '半跑', t.open), mk('gap', '断了', t.signal)]
    });
  }

  /* ═══════════ ▇▇ 待复核队列全景 ═══════════ */
  function cQueue(t) {
    const q = DATA.queue;
    const total = q.open + q.filed + q.denied;
    // 段太窄就不塞字，数字统一交给卡片图例，避免糖果条上叠一堆挤成一坨的标签
    const bar = (name, val, color, ink, w) => ({
      name, type: 'bar', stack: 'q', barWidth: 30, data: w === 1 ? [val, '-'] : ['-', val],
      itemStyle: { color, borderRadius: 8, borderColor: 'transparent', borderWidth: 2 },
      label: { show: val / total >= .35, color: ink, fontWeight: 700, fontFamily: t.mono, fontSize: 11.5,
               formatter: `${name} {c}` }
    });
    /* 2026-09-12：一次清 ▇▇条，待裁决 ▇▇ → ▇▇、已归档 ▇▇ → ▇▇。
       tooltip 里把这次的位移说清楚，否则光看静态条形看不出发生过什么 */
    const DELTA = {
      '待裁决': '2026-09-12 一次清 ▇▇条，从 ▇▇条降到 ▇▇条',
      '已归档': '本轮 +▇▇（Q-017/▇▇/▇▇/▇▇/▇▇/▇▇ 等）',
      '已否决': '本轮 +▇▇：技能池清理建议、「结构上限 ▇▇」判断',
      '标红':   '仍卡住的：Q-029 入料口 · Q-030 外部管道 · Q-031 补人来源',
      '可等':   '其余 ▇▇条不影响当前动作，可以慢慢答'
    };
    return Object.assign(base(t), {
      grid: { left: 0, right: 0, top: 26, bottom: 6, containLabel: true },
      tooltip: Object.assign(base(t).tooltip, {
        formatter: p => `<b>${p.seriesName} ${p.value}</b><br><span style="opacity:.72">${DELTA[p.seriesName] || ''}</span>`
      }),
      xAxis: { type: 'value', max: total, axisLine: { show: false }, axisTick: { show: false },
               axisLabel: { show: false }, splitLine: { show: false } },
      yAxis: { type: 'category', data: ['整条队列', '待裁决拆开看'], inverse: true,
               axisLine: { show: false }, axisTick: { show: false }, axisLabel: axLbl(t, 11) },
      series: [
        bar('待裁决', q.open,   t.signal, t.onAcc, 1),
        bar('已归档', q.filed,  t.run,    t.onAcc, 1),
        bar('已否决', q.denied, t.mute, t.ink2, 1),
        bar('标红', q.hot,      t.signal, t.onAcc, 2),
        bar('可等', q.open - q.hot, t.signalSoft, t.ink, 2)
      ]
    });
  }

  /* ═══════════ ▇▇ ▇▇条链接 × ▇▇个板块 ═══════════ */
  function cBoards(t) {
    const rows = DATA.boards.rows;
    return Object.assign(base(t), {
      grid: { left: 0, right: 2, top: 14, bottom: 2, containLabel: true },
      tooltip: Object.assign(base(t).tooltip, {
        formatter: p => `<b>${rows[p.dataIndex].n}</b><br>${p.value} 条入口 · ${rows[p.dataIndex].mirror ? '已镜像进仓库' : '动态流，不镜像'}`
      }),
      xAxis: {
        type: 'category', data: rows.map(r => r.k),
        axisLine: axLine(t), axisTick: { show: false }, axisLabel: axLbl(t, 10.5)
      },
      yAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false },
               axisLabel: axLbl(t, 10), splitLine: split(t) },
      series: [{
        type: 'bar', barWidth: '▇▇',
        data: rows.map(r => ({ value: r.c, itemStyle: { color: r.mirror ? t.ink : t.open, borderRadius: [6, 6, 0, 0] } })),
        label: { show: true, position: 'top', fontFamily: t.mono, fontSize: 10.5, color: t.ink3 }
      }]
    });
  }

  /* ═══════════ ▇▇ 技能池 ▇▇个 ═══════════ */
  function cSkills(t) {
    const g = DATA.skills.groups;
    const col = st => st === 'run' ? t.run : st === 'part' ? t.open : t.signal;
    return Object.assign(base(t), {
      tooltip: Object.assign(base(t).tooltip, { formatter: p => `<b>${p.name}</b><br>${p.value} 个 · ${({ run: '对口', part: '有重叠', gap: '冗余/错配' })[p.data.st]}` }),
      series: [{
        type: 'pie', roseType: 'radius', radius: ['▇▇', '▇▇'], center: ['▇▇', '▇▇'],
        itemStyle: { borderColor: t.paper, borderWidth: 3, borderRadius: 4 },
        label: { fontFamily: t.mono, fontSize: 10, color: t.ink3,
                 formatter: p => `${p.name.replace(/ \/ /g, '/')} ${p.value}` },
        labelLine: { length: 5, length2: 5, lineStyle: { color: t.rule2 } },
        data: g.map(x => ({ name: x.n, value: x.c, st: x.st, itemStyle: { color: col(x.st), opacity: x.st === 'run' ? .9 : .78 } }))
      }]
    });
  }

  /* ═══════════ ▇▇ 达人名单容量 vs 目标 ═══════════ */
  function cSupply(t) {
    const rows = DATA.supply.rows;
    /* 三种状态各自的说法（2026-09-12 改）：
       part = 名单不够但可以补人（不是天花板）
       gap  = 供给侧本身就没人，努力也变不出来
       run  = 口径已定，名单够用 */
    const SST = {
      part: c => `<span style="color:${t.open}">名单差 ${c} 人 · 你已裁决补人（Q-019）</span>`,
      gap:  () => `<span style="color:${t.signal}">供给侧瓶颈 · 不是推进力度问题</span>`,
      run:  () => `<span style="color:${t.run}">口径已定 · 名单够用</span>`
    };
    return Object.assign(base(t), {
      grid: { left: 0, right: 30, top: 6, bottom: 2, containLabel: true },
      tooltip: Object.assign(base(t).tooltip, {
        formatter: p => {
          const r = rows[p.dataIndex];
          const fn = SST[r.st] || SST.run;
          return `<b>${r.n}</b><br>名单 ${r.c} 人${r.tgt ? ` · 口径/目标 ${r.tgt} 人` : ''}<br>${fn(r.tgt ? r.tgt - r.c : 0)}<br><span style="opacity:.62">这张图只看名单够不够用，不摆金额</span>`;
        }
      }),
      xAxis: { type: 'value', axisLine: { show: false }, axisTick: { show: false },
               axisLabel: axLbl(t, 10), splitLine: split(t) },
      yAxis: { type: 'category', data: rows.map(r => r.short), inverse: true,
               axisLine: axLine(t), axisTick: { show: false }, axisLabel: axLbl(t, 11.5) },
      series: [
        { name: '名单实测', type: 'bar', barWidth: 12,
          data: rows.map(r => ({ value: r.c, itemStyle: {
            color: r.st === 'gap' ? t.signal : (r.st === 'part' ? t.open : t.ink), borderRadius: 6 } })),
          label: { show: true, position: 'right', fontFamily: t.mono, fontSize: 10.5, color: t.ink3 } },
        { name: '口径 / 目标', type: 'scatter', symbol: 'rect', symbolSize: [4, 24],
          itemStyle: { color: t.info, borderRadius: 2 },
          tooltip: { show: false },
          data: rows.map(r => (r.tgt == null ? '-' : r.tgt)) }
      ]
    });
  }

  /* ── 注册表 ─────────────────────────── */
  const BUILD = {
    'c-dirs': cDirs, 'c-pyramid': cPyramid, 'c-rulehealth': cRuleHealth,
    'c-rulecats': cRuleCats, 'c-rhythm': cRhythm, 'c-queue': cQueue,
    'c-boards': cBoards, 'c-skills': cSkills, 'c-supply': cSupply
  };

  function draw(id) {
    const el = document.getElementById(id);
    if (!el || !window.echarts) return;
    if (!el.clientHeight) return;
    let inst = REG[id] && REG[id].inst;
    if (!inst || inst.isDisposed()) inst = echarts.init(el, null, { renderer: 'svg' });
    inst.setOption(BUILD[id](T()), true);
    REG[id] = { el, inst };
  }

  function drawAll() { Object.keys(BUILD).forEach(draw); }

  /* 折叠展开后容器才有高度，这时才画得出来；已画的重新 resize */
  function resizeAll() {
    Object.keys(BUILD).forEach(id => {
      const r = REG[id];
      if (r && r.inst && !r.inst.isDisposed()) r.inst.resize();
      else draw(id);
    });
  }

  function boot() {
    if (booted || !window.echarts) return;
    booted = true;
    drawAll();
    const ro = new ResizeObserver(() => {
      Object.values(REG).forEach(r => r.inst && !r.inst.isDisposed() && r.inst.resize());
    });
    const host = document.getElementById('deck');
    if (host) ro.observe(host);
    window.addEventListener('resize', () => {
      Object.values(REG).forEach(r => r.inst && !r.inst.isDisposed() && r.inst.resize());
    });
  }

  /* 夜间模式 / 密度 / 动效切换后重画（颜色全部来自 CSS 变量） */
  function retheme() { setTimeout(drawAll, 60); }

  return { boot, drawAll, retheme, draw, resizeAll };
})();

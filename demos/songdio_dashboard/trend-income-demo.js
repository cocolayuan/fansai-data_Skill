/* Presentation-only fixtures. Never import these into DATA, KPI models or exports. */
(() => {
  'use strict';
  const dates = Object.freeze(Array.from({length:14}, (_, i) => i < 6
    ? `2026-08-${26+i}` : `2026-09-${String(i-5).padStart(2,'0')}`));
  const fixtures = Object.freeze([
    {id:'apple', group:'apple', name:'Apple Ads', color:'#FF9D6C', values:[2380,2560,2460,2750,2630,2590,2790,3000,2870,3050,2910,3160,3030,3380]},
    {id:'facebook', group:'meta', name:'Facebook', color:'#49B6D8', values:[1820,1760,1970,1840,2050,1980,2240,2070,2320,2190,2400,2260,2460,2530]},
    {id:'instagram', group:'meta', name:'Instagram', color:'#CB64C5', values:[1140,1320,1240,1510,1370,1590,1450,1690,1550,1750,1600,1840,1710,1920]},
    {id:'tiktok', group:'tiktok', name:'TikTok', color:'#0D171F', values:[540,820,670,960,880,1180,1030,1350,1210,1470,1320,1610,1480,1690]},
    {id:'organic', group:'organic', name:'自然渠道', color:'#2EAA63', values:[800,835,820,880,910,920,905,960,990,975,1020,1040,1030,1090]}
  ].map(series => Object.freeze({...series, values:Object.freeze(series.values)})));
  const ui = {enabled:true, hidden:new Set(), channel:null};
  let elements, context, hover = [];
  const cash = value => '$' + value.toLocaleString('en-US');
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  // All inputs are read-only; chart-local visibility does not share state.hidden.
  function model(selectedDates, channel, hidden = new Set()) {
    const indexes = selectedDates.map(date => dates.indexOf(date));
    if (!indexes.length || indexes.some(index => index < 0)) return null;
    const channels = fixtures.filter(item => channel === 'all' || item.group === channel)
      .map(item => ({...item, values:indexes.map(index => item.values[index])}));
    // This synthetic total exists only inside the demo chart. It is not a
    // relabeling/tax conversion of the unverified historical revenue snapshot.
    // Hiding a line changes visibility, not the selected scope's demo total.
    const total={id:'tax-net',name:'税后收入',color:'#C1A7FF',summary:true,
      values:indexes.map((_,index) => channels.reduce((sum,item) => sum+item.values[index],0))};
    const series=channels.length?[...channels,total]:[];
    const visible = series.filter(item => !hidden.has(item.id));
    // The lavender tax-net total is the only solid/filled series.
    const leader = visible.find(item => item.summary);
    const peak = Math.max(0, ...visible.flatMap(item => item.values));
    // Include the visible synthetic total in the shared currency scale.
    const maximum = Math.max(1000, Math.ceil(peak * 1.12 / 1000) * 1000);
    return {dates:[...selectedDates], series, visible, maximum, leaderId:leader?.id??null, demo:true};
  }
  function curve(points) {
    return points.map((point, index) => {
      const [x,y] = point;
      if (!index) return `M${x},${y}`;
      const [px,py] = points[index-1], step = (x-px)/3;
      return `C${px+step},${py} ${x-step},${y} ${x},${y}`;
    }).join(' ');
  }
  function plot(data, width, height) {
    const left=44, right=14, top=16, base=height-29;
    const step=(width-left-right)/data.dates.length;
    const x=index => left+step*(index+.5), y=value => base-value/data.maximum*(base-top);
    const nodes=[];
    const leader=data.visible.find(series => series.id===data.leaderId);
    // Reveal via clipping so the compact dash rhythm is never consumed
    // by the dashboard's normalized .draw stroke-dasharray animation.
    nodes.push(`<defs><clipPath id="trend-demo-reveal-clip" clipPathUnits="userSpaceOnUse"><rect class="trend-demo-reveal-window" x="${left}" y="0" width="${width-left-right}" height="${base+5}"/></clipPath></defs>`);
    if (leader) {
      const fillTop=y(Math.max(...leader.values));
      const area=curve(leader.values.map((value,index) => [x(index),y(value)]))+` L${x(data.dates.length-1)},${base} L${x(0)},${base} Z`;
      nodes.push(`<defs><linearGradient id="trend-demo-leader-fill" gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="${fillTop}" y2="${base}"><stop offset="0" stop-color="${leader.color}" stop-opacity=".10"/><stop offset=".5" stop-color="${leader.color}" stop-opacity=".032"/><stop offset="1" stop-color="${leader.color}" stop-opacity="0"/></linearGradient></defs><g clip-path="url(#trend-demo-reveal-clip)"><path class="trend-demo-area" data-demo-area="${leader.id}" d="${area}" fill="url(#trend-demo-leader-fill)" stroke="none"/></g>`);
    }
    for (let tick=0;tick<=4;tick++) {
      const value=data.maximum*tick/4, yy=y(value);
      const label=value>=1000?'$'+(value/1000).toLocaleString('en-US',{maximumFractionDigits:2})+'k':cash(value);
      nodes.push(`<line class="chart-grid" x1="${left}" x2="${width-right}" y1="${yy}" y2="${yy}"/><text class="chart-label" text-anchor="end" x="${left-9}" y="${yy+3}">${label}</text>`);
    }
    const drawOrder=data.visible.filter(series => series!==leader).concat(leader?[leader]:[]);
    nodes.push('<g clip-path="url(#trend-demo-reveal-clip)">');
    drawOrder.forEach(series => {
      const primary=series===leader;
      const points=series.values.map((value,i) => [x(i),y(value)]);
      nodes.push(`<path class="trend-demo-line" data-demo-line="${series.id}" data-demo-primary="${primary}" d="${curve(points)}" fill="none" stroke="${series.color}" stroke-width="${primary?2.7:1.4}" stroke-dasharray="${primary?'none':'2 2'}" stroke-linecap="round" stroke-linejoin="round" opacity="${primary?1:.8}"/>`);
      const end=points[points.length-1];
      nodes.push(`<circle cx="${end[0]}" cy="${end[1]}" r="${primary?3.5:1.8}" fill="#fff" stroke="${series.color}" stroke-width="${primary?2:1.2}"/>`);
    });
    if (leader) {
      const last=data.dates.length-1;
      nodes.push(`<text class="chart-label trend-demo-leader-value" data-demo-leader-value="" x="${x(last)}" y="${y(leader.values[last])-11}" text-anchor="end">${cash(leader.values[last])}</text>`);
    }
    nodes.push('</g>');
    const count=Math.min(data.dates.length,width<450?5:width<650?8:14);
    const labels=new Set(Array.from({length:count},(_,i) => Math.round(i*(data.dates.length-1)/(count-1||1))));
    const rows=data.dates.map((date,index) => ({date,x:x(index),items:data.visible.map(series => ({name:series.name,color:series.color,summary:!!series.summary,value:series.values[index],y:y(series.values[index])}))}));
    rows.forEach((row,index) => {
      const label=row.date.slice(5).replace('-','/');
      if (labels.has(index)) nodes.push(`<text class="chart-label" text-anchor="middle" x="${row.x}" y="${height-7}">${label}</text>`);
      nodes.push(`<rect class="chart-zone" tabindex="0" role="button" aria-label="${label} Demo 税后收入，查看模拟收入明细" data-demo-index="${index}" x="${left+step*index}" y="${top}" width="${step}" height="${base-top}"/>`);
    });
    nodes.push(`<g class="trend-demo-marker" aria-hidden="true" pointer-events="none"><line x1="0" x2="0" y1="${top}" y2="${base}" stroke="#78968b" stroke-dasharray="3 4"/>${data.visible.map(series => `<circle r="${series.summary?3.7:2.7}" fill="#fff" stroke="${series.color}" stroke-width="${series.summary?2:1.4}"/>`).join('')}</g>`);
    return {svg:`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Demo 税后收入趋势，${data.dates.length} 天模拟数据，仅此图展示，不计入统计与导出。${leader?'税后收入为所选渠道的模拟合计，浅紫色实线及渐变填充；五条渠道曲线使用虚线。':'渠道曲线使用虚线。'}">${nodes.join('')}</svg>`, rows};
  }
  function dismiss() {
    elements.tip.hidden=true;
    elements.chart.querySelector('.trend-demo-marker')?.classList.remove('is-visible');
  }
  function show(index, target, event) {
    const row=hover[index];
    if (!ui.enabled || !row) return;
    elements.tip.innerHTML=`<h4>${row.date}<span class="trend-demo-tip-badge">Demo</span></h4>${row.items.map(item => `<p${item.summary?' class="trend-demo-tax-total"':''}><span><i class="dot" style="--c:${item.color};margin-right:6px"></i>${item.name}</span><b>${cash(item.value)}</b></p>`).join('')}<p class="trend-demo-tip-note">模拟税后收入 · 不计入统计与导出</p>`;
    elements.tip.hidden=false;
    const rect=target.getBoundingClientRect(), clientX=event?.clientX??rect.x+rect.width/2, clientY=event?.clientY??rect.y;
    elements.tip.style.left=Math.max(12,Math.min(document.documentElement.clientWidth-elements.tip.offsetWidth-12,clientX+16))+'px';
    elements.tip.style.top=Math.max(12,Math.min(document.documentElement.clientHeight-elements.tip.offsetHeight-12,clientY+15))+'px';
    const marker=elements.chart.querySelector('.trend-demo-marker');
    marker.classList.add('is-visible');
    marker.querySelector('line').setAttribute('transform',`translate(${row.x} 0)`);
    marker.querySelectorAll('circle').forEach((circle,i) => {circle.setAttribute('cx',row.x);circle.setAttribute('cy',row.items[i].y);});
  }
  function mount() {
    const chart=document.getElementById('trend-chart'), root=chart.closest('.trend-card');
    const controls=document.createElement('div');
    controls.className='trend-demo-source';
    controls.setAttribute('role','group');controls.setAttribute('aria-label','收入图表数据来源');
    controls.innerHTML='<button type="button" data-trend-source="demo" aria-pressed="true">Demo 演示</button><button type="button" data-trend-source="original" aria-pressed="false">原数据</button>';
    const heading=root.querySelector('.card-head > div');
    heading.classList.add('trend-demo-heading');heading.append(controls);
    elements={root,chart,controls,legend:document.getElementById('trend-legend'),caption:document.getElementById('chart-caption'),tip:document.getElementById('tooltip')};
    controls.addEventListener('click',event => {
      const button=event.target.closest('[data-trend-source]');if (!button || button.disabled) return;
      ui.enabled=button.dataset.trendSource==='demo';dismiss();context.redraw();
    });
    elements.legend.addEventListener('click',event => {
      const button=event.target.closest('[data-demo-series]');if (!button) return;
      const id=button.dataset.demoSeries;
      ui.hidden.has(id)?ui.hidden.delete(id):ui.hidden.add(id);
      context.redraw();elements.legend.querySelector(`[data-demo-series="${id}"]`)?.focus({preventScroll:true});
    });
    for (const type of ['pointermove','focusin','click']) chart.addEventListener(type,event => {
      const target=event.target.closest('[data-demo-index]');
      if (target) show(Number(target.dataset.demoIndex),target,type==='focusin'?undefined:event);
    });
    chart.addEventListener('pointerleave',dismiss);chart.addEventListener('focusout',dismiss);
    chart.addEventListener('keydown',event => {
      const target=event.target.closest('[data-demo-index]');if (!target) return;
      if (event.key==='Escape') {dismiss();return;}
      if (['Enter',' '].includes(event.key)) {event.preventDefault();show(Number(target.dataset.demoIndex),target);}
      if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) {
        event.preventDefault();
        const index=Number(target.dataset.demoIndex), last=hover.length-1;
        const next=event.key==='Home'?0:event.key==='End'?last:Math.max(0,Math.min(last,index+(event.key==='ArrowRight'?1:-1)));
        chart.querySelector(`[data-demo-index="${next}"]`)?.focus({preventScroll:true});
      }
    });
  }
  function render(next) {
    if (!elements) mount();context=next;
    if (ui.channel!==next.channel) {ui.hidden.clear();ui.channel=next.channel;}
    const income=next.view==='income';
    const data=income&&next.eligible?model(next.dates,next.channel,ui.hidden):null;
    const available=!!data&&data.series.length>0, active=income&&available&&ui.enabled;
    elements.controls.hidden=!income;
    elements.root.classList.toggle('has-income-demo-controls',income);
    elements.root.classList.toggle('is-income-demo',active);
    elements.controls.querySelectorAll('button').forEach(button => {
      const demo=button.dataset.trendSource==='demo';
      button.disabled=demo&&!available;
      button.setAttribute('aria-pressed',String(demo?active:!active));
      button.title=demo?(available?'仅收入图表使用模拟值；不计入统计与导出':'当前筛选没有对应 Demo；支持数据区间、全部平台、全部国家和新用户口径'):'查看原快照收入曲线';
    });
    dismiss();hover=[];
    if (!active) return false;
    document.getElementById('trend-title').textContent='下载与税后收入趋势';
    elements.legend.innerHTML=data.series.map(series => `<button type="button" data-demo-series="${series.id}" aria-pressed="${!ui.hidden.has(series.id)}">${series.summary?`<svg class="trend-demo-legend-key" viewBox="0 0 20 12" aria-hidden="true"><line x1="1" x2="19" y1="6" y2="6" stroke="${series.color}" stroke-width="3" stroke-linecap="round"/></svg>`:`<i class="dot" style="--c:${series.color}"></i>`}${series.name}</button>`).join('');
    elements.caption.textContent=`${data.dates.length} 天 · USD · 模拟税后收入，仅此图展示，不计入统计与导出`;
    if (!data.visible.length) {
      elements.chart.innerHTML='<div class="empty"><strong>尚未选择可见渠道</strong>点击上方图例，重新显示 Demo 曲线。</div>';return true;
    }
    const result=plot(data,elements.chart.clientWidth||800,elements.chart.clientHeight||215);
    hover=result.rows;elements.chart.innerHTML=result.svg;return true;
  }
  globalThis.FansAITrendDemo=Object.freeze({render,model,plot});
})();

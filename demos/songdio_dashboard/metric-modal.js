/* In-place metric drilldowns; no writes to global filters or source data. */
(() => {
  'use strict';
  const P = globalThis.FansAIPerformance;
  const M = globalThis.FansAIMetricModel;
  const $ = selector => document.querySelector(selector);
  const metrics = ['downloads','payers','payRate','revenue','marketing','compute','countries'];
  const palette = ['#3FB36A','#49B6D8','#1B2430','#EBA33F','#008AA8','#8BD98C','#4D7BE8','#C57948','#AAB64B','#0D7074','#75B4CB','#80705A','#57B0A1','#CFB665','#6093A4','#C8906B','#9CB9A3','#78918C','#C5CE96','#87BFC6'];
  const round = n => Number(n.toFixed(4));
  let app, dialog, activeMetric='downloads', dimension='channel', countryMetric='downloads', opener, openerKey, model;
  const presentationState = () => app.getPresentationState?.() || app.state;
  const labels = () => ({downloads:'下载',payers:'付费人数',payRate:'付费率',revenue:presentationState().tax==='gross'?'税前收入':'税后收入',marketing:'营销支出',compute:'算力支出',countries:'覆盖国家/地区'});
  const moneyMetric = key => ['revenue','marketing','compute'].includes(key);
  const valueText = (value,key) => key==='payRate'?P.percent(value):moneyMetric(key)?P.money(value):P.number(value);
  const icon = type => type==='country'?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.5" ry="8.5"/><path d="M3.5 12h17"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5m7 5V5m7 14v-9"/></svg>';
  const button = (key,label,attr,current) => `<button type="button" ${attr}="${key}" aria-pressed="${current===key}">${P.escapeHTML(label)}</button>`;
  function toolbar() {
    const text=labels();
    if(activeMetric==='countries')return `<div class="mmd-tabs" role="group" aria-label="国家分布占比指标"><span>占比指标</span>${['downloads','payers','revenue','marketing','compute'].map(key=>button(key,text[key],'data-mmd-country-metric',countryMetric)).join('')}</div>`;
    const family=['downloads','payers','payRate'].includes(activeMetric)?['downloads','payers','payRate']:['marketing','compute'].includes(activeMetric)?['marketing','compute']:[];
    const related=family.length?`<div class="mmd-tabs" role="group" aria-label="相关指标">${family.map(key=>button(key,text[key],'data-mmd-metric',activeMetric)).join('')}</div>`:'<div></div>';
    return related+`<div class="mmd-tabs" role="group" aria-label="拆分维度"><span>拆分维度</span>${[['channel','渠道'],['country','国家 / 地区']].map(([key,label])=>`<button type="button" data-mmd-dimension="${key}" aria-pressed="${dimension===key}">${icon(key)}${label}</button>`).join('')}</div>`;
  }
  function colorFor(row,index,kind) {
    if(kind==='channel')return app.colors?.[row.id]||palette[index%palette.length];
    if(kind==='task')return row.id==='songs'?'#3FB36A':'#49B6D8';
    const sourceIndex=(app.data.countries||[]).findIndex(country=>country.id===row.id);
    const colorIndex=Number.isInteger(row.colorIndex)&&row.colorIndex>=0?row.colorIndex:sourceIndex>=0?sourceIndex:index;
    return palette[colorIndex%palette.length];
  }
  function entity(row,index,kind) {
    let logo='';
    if(kind==='country')logo=P.escapeHTML(row.flag||'◎');
    else if(kind==='channel')logo=app.channelLogo?.(row.id)|| (row.id==='organic'?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4C12 3 6 6 6 12c0 3 2 5 5 5 5 0 7-6 9-13ZM4 21c3-6 5-8 11-12"/></svg>':'');
    return `<span class="mmd-entity"><i class="mmd-dot" style="--mmd-color:${colorFor(row,index,kind)}" aria-hidden="true"></i>${logo?`<span class="mmd-logo" aria-hidden="true">${logo}</span>`:''}<span class="mmd-name">${P.escapeHTML(row.name)}${kind==='country'?`<span class="mmd-code">${P.escapeHTML(row.id)}</span>`:''}</span></span>`;
  }
  function pie(panel,key,panelIndex) {
    const positives=panel.rows.map((row,index)=>({row,index})).filter(({row})=>Number.isFinite(row.value)&&row.value>0&&Number.isFinite(row.share));
    let angle=-Math.PI/2;
    const sectors=positives.map(({row,index})=>{
      const sweep=row.share/100*Math.PI*2,end=angle+sweep,r=108,x=120+r*Math.cos(angle),y=120+r*Math.sin(angle),ex=120+r*Math.cos(end),ey=120+r*Math.sin(end);
      const attrs=`class="mmd-pie-slice" data-mmd-slice="${panelIndex}-${index}" fill="${colorFor(row,index,panel.entityDimension)}"`;
      const title=`<title>${P.escapeHTML(row.name)}：${P.escapeHTML(valueText(row.value,key))} · ${P.percent(row.share)}</title>`;
      angle=end;
      return sweep>=Math.PI*2-.00001?`<circle ${attrs} cx="120" cy="120" r="108">${title}</circle>`:`<path ${attrs} d="M120 120L${round(x)} ${round(y)}A108 108 0 ${sweep>Math.PI?1:0} 1 ${round(ex)} ${round(ey)}Z">${title}</path>`;
    }).join('');
    const empty='<circle cx="120" cy="120" r="104" fill="#edf5f1" stroke="#d1e2d9" stroke-width="1.5" stroke-dasharray="4 5"/><text x="120" y="131" text-anchor="middle" fill="#a1b7aa" font-family="Outfit,sans-serif" font-size="34">—</text>';
    const total=valueText(panel.topTotal,key);
    return `<figure class="mmd-figure"><svg class="mmd-pie" viewBox="0 0 240 240" role="img" aria-label="${P.escapeHTML(panel.title)}，前 20 名合计 ${P.escapeHTML(total)}">${sectors||empty}</svg><figcaption class="mmd-chart-total"><span>前 20 名合计</span><strong>${P.escapeHTML(total)}</strong></figcaption>${!positives.length?`<div class="mmd-empty-label">${P.escapeHTML(panel.emptyReason||'暂无可展示占比')}</div>`:''}</figure>`;
  }
  function table(panel,key,panelIndex) {
    const dimensionLabel=panel.entityDimension==='country'?'国家 / 地区':panel.entityDimension==='task'?'算力任务类型':'渠道';
    const rate=panel.kind==='rate';
    const rows=panel.rows.map((row,index)=>`<tr tabindex="0" data-mmd-row="${panelIndex}-${index}"><td>${entity(row,index,panel.entityDimension)}</td><td class="mmd-value${Number.isFinite(row.value)?'':' mmd-missing'}">${rate?`<strong>${P.percent(row.value)}</strong><small>${P.number(row.payers)} / ${P.number(row.downloads)}</small>`:P.escapeHTML(valueText(row.value,key))}</td>${rate?'':`<td class="mmd-value${Number.isFinite(row.share)?'':' mmd-missing'}">${P.percent(row.share)}</td>`}</tr>`).join('');
    return `<div class="mmd-list-wrap" tabindex="0" aria-label="${P.escapeHTML(panel.title)}数值列表"><table class="mmd-table${rate?' mmd-rate-table':''}"><thead><tr><th scope="col">${dimensionLabel}</th><th scope="col">${rate?'付费率':P.escapeHTML(panel.valueLabel||labels()[key])}</th>${rate?'':'<th scope="col">占比</th>'}</tr></thead><tbody>${rows||`<tr><td colspan="${rate?2:3}" class="mmd-missing">${P.escapeHTML(panel.emptyReason||'当前筛选暂无可用数据')}</td></tr>`}</tbody></table></div>`;
  }
  function render() {
    if(!app)return;
    model=M.build({data:app.data,state:presentationState(),metric:activeMetric,dimension,countryMetric});
    const key=activeMetric==='countries'?countryMetric:activeMetric;
    $('#metric-modal-title').textContent=model.title;
    $('#metric-modal-scope').textContent=model.scope;
    $('#metric-modal-toolbar').innerHTML=toolbar();
    const panels=$('#metric-modal-panels');
    panels.classList.toggle('is-dual',activeMetric==='compute');
    $('#metric-modal-rule').hidden=activeMetric!=='compute'&&activeMetric!=='payRate';
    $('#metric-modal-rule').innerHTML=activeMetric==='compute'?`<p>${P.escapeHTML(model.computeRule||'仅统计成功任务；歌曲 API 人民币价格按当前配置换算，Replicate 直接按美元计费。')}</p><small>当前汇率 ${P.number(model.exchangeRate,2)} · ${P.escapeHTML(model.exchangeMode||'配置方式 —')}</small>`:activeMetric==='payRate'?'<p>付费率 = 付费人数 ÷ 下载；按所选维度独立计算。</p>':'';
    panels.innerHTML=model.panels.map((panel,index)=>`<section class="mmd-panel" aria-label="${P.escapeHTML(panel.title)}"><div class="mmd-panel-header"><h3>${P.escapeHTML(panel.title)}</h3><span>${panel.kind==='rate'?'付费人数 / 下载':P.escapeHTML(panel.caption||'前 20 名 · 占比')}</span></div>${panel.kind==='rate'?`<div class="mmd-rate-overview"><span>整体付费率</span><strong>${P.percent(model.total)}</strong></div>${table(panel,key,index)}`:`<div class="mmd-chart-layout">${pie(panel,key,index)}${table(panel,key,index)}</div>`}</section>`).join('');
    const note=$('#metric-modal-note');note.textContent=model.note||'';note.hidden=!model.note;
    $('#metric-modal-footer').textContent=activeMetric==='countries'?`示例覆盖 ${P.number(model.total)} 个国家 / 地区 · ${model.metricLabel}${moneyMetric(key)?' · USD':''}`:`${model.metricLabel} · ${moneyMetric(key)?'金额单位 USD':'示例数据'}`;
    const detailLink=$('#metric-modal-detail');
    detailLink.href=P.detailHref(app.state,'all',activeMetric==='countries'?'country':dimension);
    detailLink.textContent='查看总览经营明细 ↗';
    detailLink.setAttribute('title','查看总览原有数据，不包含弹窗 Demo 数据');
  }
  function open(metric,trigger) {
    if(!app)return;
    const next=metric==='distribution'?(app.state.view==='download'?'downloads':'revenue'):metric;
    if(!metrics.includes(next))return;
    opener=trigger||document.activeElement;openerKey=opener?.dataset.metricOpen;
    activeMetric=next;dimension=next==='countries'?'country':'channel';countryMetric='downloads';
    window.FansAIOverlay?.closeAll(false);
    document.querySelectorAll('dialog[open]').forEach(other=>{if(other!==dialog)other.close();});
    render();if(!dialog.open)dialog.showModal();
    document.body.classList.add('dialog-open');
    opener?.setAttribute('aria-expanded','true');
    $('#metric-modal-close').focus({preventScroll:true});
  }
  function close(){if(dialog?.open)dialog.close();}
  function highlight(key) {
    if(!dialog.open)return;
    const panel=key?.split('-')[0];
    dialog.querySelectorAll('[data-mmd-slice]').forEach(slice=>slice.classList.toggle('is-dimmed',Boolean(key)&&slice.dataset.mmdSlice.startsWith(panel+'-')&&slice.dataset.mmdSlice!==key));
  }
  function mount(config) {
    if(app)return;
    app=config;dialog=$('#metric-modal');if(!dialog||!P||!M)return;
    document.addEventListener('click',event=>{
      const trigger=event.target.closest('[data-metric-open]');
      if(trigger){event.preventDefault();open(trigger.dataset.metricOpen,trigger);return;}
      if(!dialog.open||!dialog.contains(event.target))return;
      const target=event.target.closest('button');if(!target)return;
      if(target.hasAttribute('data-mmd-close')){close();return;}
      let selector='';
      if(target.dataset.mmdMetric&&metrics.includes(target.dataset.mmdMetric)){activeMetric=target.dataset.mmdMetric;selector='[data-mmd-metric="'+activeMetric+'"]';}
      else if(['channel','country'].includes(target.dataset.mmdDimension)){dimension=target.dataset.mmdDimension;selector='[data-mmd-dimension="'+dimension+'"]';}
      else if(['downloads','payers','revenue','marketing','compute'].includes(target.dataset.mmdCountryMetric)){countryMetric=target.dataset.mmdCountryMetric;selector='[data-mmd-country-metric="'+countryMetric+'"]';}
      if(selector){render();dialog.querySelector(selector)?.focus({preventScroll:true});}
    });
    dialog.addEventListener('click',event=>{
      if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();
      if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)close();
    });
    dialog.addEventListener('close',()=>{
      if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');
      opener?.setAttribute('aria-expanded','false');
      const focusTarget=opener?.isConnected?opener:openerKey?document.querySelector('[data-metric-open="'+openerKey+'"]'):null;
      focusTarget?.focus({preventScroll:true});highlight(null);
    });
    dialog.addEventListener('keydown',event=>{
      const target=event.target.closest('.mmd-tabs button');
      if(!target||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();
      const buttons=[...target.parentElement.querySelectorAll('button')],index=buttons.indexOf(target),next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
      buttons[next].click();
    });
    dialog.addEventListener('pointerover',event=>{const row=event.target.closest('[data-mmd-row]');if(row)highlight(row.dataset.mmdRow);});
    dialog.addEventListener('pointerout',event=>{if(event.target.closest('[data-mmd-row]'))highlight(null);});
    dialog.addEventListener('focusin',event=>{const row=event.target.closest('[data-mmd-row]');if(row)highlight(row.dataset.mmdRow);});
    dialog.addEventListener('focusout',()=>highlight(null));
    window.addEventListener('fansai-filters-updated',()=>{if(dialog.open)render();});
  }
  globalThis.FansAIMetricModal={mount,open,close,render};
})();

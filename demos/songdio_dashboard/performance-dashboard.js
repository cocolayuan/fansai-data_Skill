/* Two breakdown previews. Existing KPI cards remain the only large-number summary. */
(() => {
  'use strict';
  const P = globalThis.FansAIPerformance;
  const metrics = {
    profit: {title:'收支差额分析',en:'BALANCE BREAKDOWN',summary:'整体差额',column:'收支差额 · USD',caption:'收入 − 营销支出 − 算力支出'},
    roi: {title:'ROI 分析',en:'RETURN ON INVESTMENT',summary:'整体 ROI',column:'ROI',caption:'收入 ÷（营销支出 + 算力支出）'}
  };
  let app;
  const round = value => Number(value.toFixed(6));
  function niceMax(value) {
    if(!Number.isFinite(value)||value<=0)return 1;
    const power=10**Math.floor(Math.log10(value)),fraction=value/power;
    return ([1,1.5,2,2.5,3,5,7.5,10].find(step=>step>=fraction)||10)*power;
  }
  function scaleFor(rows,metric) {
    const values=rows.map(row=>row[metric]).filter(Number.isFinite);
    const lo=Math.min(0,...values),hi=Math.max(metric==='roi'?100:0,...values);
    const min=lo<0?-niceMax(Math.abs(lo)):0,max=hi>0?niceMax(hi):lo<0?0:1,span=max-min;
    const x=value=>round((value-min)/span*100);
    return {min,max,zero:x(0),reference:metric==='roi'?x(100):null,x};
  }
  const metricValue=(row,metric)=>metric==='profit'?P.signedMoney(row.profit):P.percent(row.roi);
  const negative=(row,metric)=>Number.isFinite(row[metric])&&(metric==='profit'?row.profit<0:row.roi<100);
  const compact=(value,metric)=>{
    if(metric==='roi')return P.number(value,0)+'%';
    const n=Math.abs(value),signed=value<0?'−':'';
    return signed+'$'+(n>=1000000?P.number(n/1000000,1)+'m':n>=1000?P.number(n/1000,n%1000?1:0)+'k':P.number(n,n>0&&n<1?2:0));
  };
  function identity(row,dimension) {
    if(dimension==='country')return `<span class="perf-identity" aria-hidden="true">${P.escapeHTML(row.flag||'')}</span>`;
    const logo=app.channelLogo?.(row.id)||'';
    return `<span class="perf-identity" aria-hidden="true">${logo}</span>`;
  }
  function chart(rows,metric,dimension) {
    const selected=P.sortRows(rows,metric,-1).slice(0,6),scale=scaleFor(selected,metric);
    const leader=selected.find(row=>Number.isFinite(row[metric])&&(metric==='profit'?row.profit>0:row.roi>100));
    const ticks=metric==='roi'?[scale.min,(scale.max+scale.min)/2,scale.max]:scale.min<0&&scale.max>0?[scale.min,0,scale.max]:[scale.min,(scale.max+scale.min)/2,scale.max];
    const axes=ticks.map(value=>`<span style="left:${scale.x(value)}%">${compact(value,metric)}</span>`).join('');
    const names=selected.map(row=>`<div class="perf-name" title="${P.escapeHTML(row.name)}">${identity(row,dimension)}<span class="perf-name-text">${P.escapeHTML(row.name)}</span></div>`).join('');
    const labels=selected.map(row=>`<div class="perf-value${negative(row,metric)?' is-negative':row===leader?' is-leader':row[metric]==null?' is-missing':''}">${metricValue(row,metric)}</div>`).join('');
    const bars=selected.map(row=>{
      const value=row[metric],known=Number.isFinite(value),left=known?Math.min(scale.zero,scale.x(value)):0,width=known?Math.abs(scale.x(value)-scale.zero):0;
      const tooltip=`${row.name} · ${metricValue(row,metric)}；原口径收入 ${P.money(row.revenue)}；总成本 ${P.money(row.cost)}`;
      return `<div class="perf-lane" tabindex="0" title="${P.escapeHTML(tooltip)}" aria-label="${P.escapeHTML(tooltip)}">${known&&value!==0?`<div class="perf-track"><span class="perf-fill${row===leader?' is-leader':''}" style="left:${left}%;width:${round(width)}%;--perf-origin:${value<0?'right':'left'}"></span></div>`:''}</div>`;
    }).join('');
    const lines=`${ticks.filter(value=>value!==0).map(value=>`<i class="perf-line is-grid" style="left:${scale.x(value)}%"></i>`).join('')}<i class="perf-line" style="left:${scale.zero}%"></i>${metric==='roi'?`<i class="perf-line is-reference" style="left:${scale.reference}%" title="100% 回本线"></i>`:''}`;
    return `<div class="perf-chart-grid" style="--perf-rows:${selected.length}" aria-label="按${dimension==='channel'?'渠道':'国家地区'}拆分的${metrics[metric].title}"><div class="perf-chart-labels"><div class="perf-col-heading">${dimension==='channel'?'渠道':'国家 / 地区'}</div><div class="perf-row-stack">${names}</div></div><div class="perf-chart-plot"><div class="perf-axis" aria-hidden="true">${axes}</div><div class="perf-plot-body">${lines}<div class="perf-row-stack">${bars}</div></div></div><div class="perf-chart-values"><div class="perf-col-heading is-value">${metrics[metric].column}</div><div class="perf-row-stack">${labels}</div></div></div>`;
  }
  function renderCard(metric) {
    const root=document.getElementById('perf-'+metric);if(!root)return;
    const config=metrics[metric],dimension=app.state[metric+'Dim'],model=P.resolve(app.data,app.state,dimension),href=P.detailHref(app.state,metric,dimension);
    const known=model.rows.filter(row=>Number.isFinite(row[metric]));
    const available=known.length>0;
    const countLabel=`${model.rows.length} 个${dimension==='channel'?'渠道':'国家 / 地区'}${model.rows.length>6?' · 预览前 6 项':''}`;
    const emptyMessage=model.reason||'当前筛选没有可计算的收入或完整成本，未提供的数值不按 0 处理。';
    const meta=metric==='roi'?'<span class="perf-key"><i aria-hidden="true"></i>100% 回本线</span>':`<span>盈利 ${known.filter(row=>row.profit>0).length} · 亏损 ${known.filter(row=>row.profit<0).length}</span>`;
    root.innerHTML=`<div class="perf-head"><h2 id="perf-${metric}-title">${config.title}<small>${config.en}</small></h2><div class="perf-actions"><div class="perf-tabs" role="tablist" aria-label="${config.title}拆分维度">${[['channel','渠道'],['country','国家 / 地区']].map(([key,label])=>`<button type="button" role="tab" id="perf-${metric}-tab-${key}" aria-controls="perf-${metric}-chart" aria-selected="${dimension===key}" tabindex="${dimension===key?0:-1}" data-perf-metric="${metric}" data-perf-dimension="${key}">${label}</button>`).join('')}</div><a class="iconbtn" href="${P.escapeHTML(href)}" aria-label="查看${config.title.replace('分析','明细')}" title="查看明细"><svg class="icon" viewBox="0 0 24 24"><path d="M6 18 18 6M6 6h12v12"/></svg></a></div></div><div class="perf-context"><span>${config.summary}<strong${negative(model.summary,metric)?' class="is-negative"':''}>${metricValue(model.summary,metric)}</strong></span><span class="perf-context-note" title="${P.escapeHTML(model.basisNote)}">${P.escapeHTML(model.basisLabel)}</span></div><div class="perf-chart" id="perf-${metric}-chart" role="tabpanel" aria-labelledby="perf-${metric}-tab-${dimension}">${available?chart(model.rows,metric,dimension):`<div class="perf-empty"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M6 5v22h22M11 21v-5m7 5V10m7 11v-8" stroke-width="1.5" stroke-linecap="round"/></svg><strong>当前筛选暂无${config.title.replace('分析','拆分')}</strong><span>${P.escapeHTML(emptyMessage)}</span></div>`}</div><div class="perf-footer"><div class="perf-footer-meta"><span>${countLabel}</span>${available?meta:''}</div><a href="${P.escapeHTML(href)}">查看明细 ↗</a></div>`;
  }
  function syncDetailLinks(){
    document.querySelectorAll('[data-detail-dimension]').forEach(link=>{
      link.href=P.detailHref(app.state,'all',link.dataset.detailDimension);
    });
    for(const metric of Object.keys(metrics))document.getElementById('perf-'+metric)?.querySelectorAll('a').forEach(link=>{
      link.href=P.detailHref(app.state,metric,app.state[metric+'Dim']);
    });
  }
  function render(){if(!app)return;renderCard('profit');renderCard('roi');syncDetailLinks();}
  function changeDimension(metric,dimension){
    if(!metrics[metric]||!['channel','country'].includes(dimension))return;
    app.state[metric+'Dim']=dimension;renderCard(metric);syncDetailLinks();
    document.getElementById(`perf-${metric}-tab-${dimension}`)?.focus({preventScroll:true});
  }
  function mount(config) {
    if(app)return;app=config;
    const params=new URLSearchParams(location.search);
    app.state.profitDim='channel';app.state.roiDim='channel';
    if(params.get('analysisReturn')==='1'){
      Object.assign(app.state,P.readState(params,app.data));app.restoreFilters?.();
    }
    document.getElementById('performance-section')?.addEventListener('click',event=>{
      const button=event.target.closest('[data-perf-metric][data-perf-dimension]');if(!button)return;
      changeDimension(button.dataset.perfMetric,button.dataset.perfDimension);
    });
    document.getElementById('performance-section')?.addEventListener('keydown',event=>{
      const button=event.target.closest('[data-perf-metric][data-perf-dimension]');
      if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();event.stopPropagation();changeDimension(button.dataset.perfMetric,event.key==='Home'?'channel':event.key==='End'?'country':button.dataset.perfDimension==='channel'?'country':'channel');
    });
    document.getElementById('reset')?.addEventListener('click',()=>{app.state.profitDim='channel';app.state.roiDim='channel';render();});
    window.addEventListener('fansai-filters-updated',render);
  }
  globalThis.FansAIPerformanceDashboard={mount,render,scaleFor,changeDimension};
})();

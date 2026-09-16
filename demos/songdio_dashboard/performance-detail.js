/* Unified full-field operating data; parent and child totals stay separate. */
(() => {
  'use strict';
  const core = globalThis.FansAIPerformance;
  const data = globalThis.PERFORMANCE_DATA;
  const $ = selector => document.querySelector(selector);
  if (!core || !data) {
    $('#perf-detail-table-body').innerHTML = '<tr><td colspan="11" class="perf-detail-empty-cell"><strong>数据文件暂未加载</strong><p>请确认明细页与配套数据文件位于同一目录后刷新。</p></td></tr>';
    return;
  }
  const escape = core.escapeHTML;
  const params = new URLSearchParams(location.search);
  const state = core.readState(params, data);
  const sampleState = core.presentationState(data, state);
  let metric = ['all', 'profit', 'roi'].includes(params.get('metric')) ? params.get('metric') : 'all';
  let dimension = params.get('dimension') === 'country' ? 'country' : params.get('dimension') === 'channel' ? 'channel' : (metric === 'roi' ? state.roiDim : state.profitDim) === 'country' ? 'country' : 'channel';
  const defaultSort = () => metric === 'all' ? (dimension === 'country' ? 'revenue' : 'downloads') : metric;
  let sortKey = defaultSort();
  let sortDir = -1;
  let search = '';
  let result;
  let displayedRows = [];
  let visibleRecords = [];
  const expandedCountries = new Set();
  const expandedChannels = new Set();
  const campaignSorts = new Map();
  const columns = ['name', 'downloads', 'payers', 'payRate', 'revenue', 'taxRevenue', 'marketing', 'compute', 'cost', 'profit', 'roi'];
  const childrenFor = row => dimension === 'country' ? core.countryChildren(data, state, row.id) : [];
  const campaignKey = record => record.countryId + ':' + record.row.id;
  const campaignsFor = record => core.campaignChildren(data, state, record.countryId, record.row.id);
  const sortedCampaigns = record => {
    const sort = campaignSorts.get(campaignKey(record)) || {key:'downloads',dir:-1};
    return core.sortRows(campaignsFor(record), sort.key, sort.dir);
  };
  const logos = globalThis.PERFORMANCE_LOGOS || {};
  const profitTone = value => value == null ? 'perf-detail-neutral' : value > 0 ? 'perf-detail-positive' : value < 0 ? 'perf-detail-negative' : 'perf-detail-neutral';
  const roiTone = value => value == null ? 'perf-detail-neutral' : value > 100 ? 'perf-detail-positive' : value < 100 ? 'perf-detail-negative' : 'perf-detail-neutral';

  function updateURL() {
    if (metric === 'roi') state.roiDim = dimension;
    else if (metric === 'profit') state.profitDim = dimension;
    const url = new URL(core.detailHref(state, metric, dimension), location.href);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
    $('#perf-detail-back').href = core.backHref(state);
    $('#perf-detail-adjust').href = core.backHref(state);
    for (const key of ['all', 'profit', 'roi']) $('#perf-detail-' + key + '-link').href = core.detailHref(state, key, dimension);
  }

  function entity(row, rowDimension, record) {
    let icon;
    if (rowDimension === 'country') {
      icon = escape(row.flag || '◎');
    } else if (logos[row.id]) {
      icon = '<img src="' + escape(logos[row.id]) + '" alt="">';
    } else if (row.id === 'organic') {
      icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4c-8-1-14 2-14 8 0 3 2 5 5 5 5 0 7-6 9-13ZM4 21c3-6 5-8 11-12"/></svg>';
    } else {
      icon = '•';
    }
    const campaigns = rowDimension === 'channel' ? campaignsFor(record) : [];
    const caption = rowDimension === 'country' ? row.id + (childrenFor(row).length ? ' · ' + childrenFor(row).length + ' 个渠道' : '') : campaigns.length ? campaigns.length + ' 条投放明细' : row.id === 'organic' ? '自然流量 · 无投放' : row.id;
    const markup = '<div class="perf-detail-entity"><span class="perf-detail-entity-icon">' + icon + '</span><span class="perf-detail-entity-copy"><strong title="' + escape(row.name || row.id || '—') + '">' + escape(row.name || row.id || '—') + '</strong><small>' + escape(caption || '') + '</small></span></div>';
    if (rowDimension !== 'country') {
      if (!campaigns.length) return '<div class="perf-detail-country-control"><span class="perf-detail-expand-spacer" aria-hidden="true"></span>' + markup + '</div>';
      const key = campaignKey(record), expanded = expandedChannels.has(key);
      return '<button type="button" class="perf-detail-country-control" data-perf-channel-toggle="' + escape(key) + '" aria-expanded="' + expanded + '" aria-controls="perf-campaign-' + escape(record.countryId + '-' + row.id) + '" aria-label="' + (expanded ? '收起' : '展开') + escape(record.country + ' ' + row.name) + '的投放明细"><span class="perf-detail-expand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span>' + markup + '</button>';
    }
    if (!childrenFor(row).length) return '<div class="perf-detail-country-control"><span class="perf-detail-expand-spacer" aria-hidden="true"></span>' + markup + '</div>';
    return '<button type="button" class="perf-detail-country-control" data-perf-detail-expand="' + escape(row.id) + '" aria-expanded="' + expandedCountries.has(row.id) + '" aria-controls="perf-country-' + escape(row.id) + '" aria-label="' + (expandedCountries.has(row.id) ? '收起' : '展开') + escape(row.name) + '的渠道"><span class="perf-detail-expand-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7"/></svg></span>' + markup + '</button>';
  }

  function renderRow(record) {
    const {row, level} = record;
    const rowDimension = level === 1 ? dimension : 'channel';
    const hasCampaigns = rowDimension === 'channel' && campaignsFor(record).length;
    const expanded = rowDimension === 'country' ? expandedCountries.has(row.id) : expandedChannels.has(campaignKey(record));
    return '<tr class="' + (level === 2 ? 'perf-detail-child ' : '') + (expanded ? 'is-expanded ' : '') + (hasCampaigns ? 'is-expandable' : '') + '"' + (hasCampaigns ? ' data-perf-channel-toggle="' + escape(campaignKey(record)) + '"' : '') + ' data-row-id="' + escape(row.id) + '" data-row-level="' + level + '">' + columns.map(key => {
      const selected = key === metric ? ' perf-detail-current-metric' : '';
      if (key === 'name') return '<td>' + entity(row, rowDimension, record) + '</td>';
      const tone = key === 'profit' ? profitTone(row[key]) : key === 'roi' ? roiTone(row[key]) : row[key] == null ? 'perf-detail-neutral' : '';
      const value = ['roi', 'payRate'].includes(key) ? core.percent(row[key]) : ['downloads', 'payers'].includes(key) ? core.number(row[key]) : key === 'profit' ? core.signedMoney(row[key]) : core.money(row[key]);
      const title = key === 'roi' && row.cost === 0 ? ' title="总成本为零，ROI 不计算"' : '';
      return '<td class="' + tone + selected + '"' + title + '>' + escape(value) + '</td>';
    }).join('') + '</tr>';
  }

  function campaignPanel(record) {
    if (!expandedChannels.has(campaignKey(record))) return '';
    const records = sortedCampaigns(record);
    if (!records.length) return '';
    const key = campaignKey(record), id = 'perf-campaign-' + record.countryId + '-' + record.row.id;
    const sort = campaignSorts.get(key) || {key:'downloads',dir:-1};
    const fields = [['channel','渠道'],['campaign','投放系列'],['group','投放组'],['keywords','关键词'],['downloads','下载'],['revenue',sampleState.income==='total'?'总收入':'新用户收入'],['taxRevenue',sampleState.tax==='gross'?'税前收入':'税后收入'],['marketing','营销支出'],['compute','算力支出'],['profit','收支差额'],['roi','ROI']];
    const numeric = field => !['channel','campaign','group','keywords'].includes(field);
    const head = fields.map(([field,label]) => '<th scope="col"' + (numeric(field) ? ' aria-sort="' + (sort.key===field?(sort.dir===-1?'descending':'ascending'):'none') + '"' : '') + '>' + (numeric(field) ? '<button type="button" data-perf-campaign-sort="' + field + '" data-campaign-parent="' + escape(key) + '">' + label + '<span aria-hidden="true">' + (sort.key===field?(sort.dir===-1?'↓':'↑'):'↕') + '</span></button>' : label) + '</th>').join('');
    const rows = records.map(row => '<tr data-row-level="3" data-campaign-id="' + escape(row.id) + '">' + fields.map(([field]) => {
      if (field==='channel') return '<td><span class="perf-detail-channel-label">' + escape(record.row.name) + '</span></td>';
      if (field==='campaign'||field==='group') return '<td class="perf-detail-ad-copy"><strong title="' + escape(row[field]) + '">' + escape(row[field]) + '</strong><small>ID ' + escape(row[field+'Id']||'—') + '</small></td>';
      if (field==='keywords') return '<td class="perf-detail-keywords">' + escape(row.keywords||'—') + '</td>';
      const value = field==='downloads'?core.number(row[field]):field==='roi'?core.percent(row[field]):field==='profit'?core.signedMoney(row[field]):core.money(row[field]);
      return '<td class="' + (field==='profit'?profitTone(row[field]):field==='roi'?roiTone(row[field]):row[field]==null?'perf-detail-neutral':'') + '">' + escape(value) + '</td>';
    }).join('') + '</tr>').join('');
    return '<tr class="perf-detail-drill-row"><td colspan="11"><section class="perf-detail-campaign-panel" id="' + escape(id) + '" aria-labelledby="' + escape(id) + '-title"><div class="perf-detail-branch-head"><h3 id="' + escape(id) + '-title"><span>' + escape(record.country) + '</span><i aria-hidden="true">›</i><span>' + escape(record.row.name) + '</span><i aria-hidden="true">›</i>投放明细</h3><span>' + records.length + ' 条记录</span></div><table class="perf-detail-campaign-table"><caption class="perf-detail-sr-only">' + escape(record.country + ' ' + record.row.name) + '投放明细，金额单位 USD</caption><thead><tr>' + head + '</tr></thead><tbody>' + rows + '</tbody></table></section></td></tr>';
  }

  function countryPanel(record) {
    if (!expandedCountries.has(record.row.id)) return '';
    const children = core.sortRows(childrenFor(record.row),sortKey,sortDir).map(row=>({row,level:2,country:record.country,countryId:record.countryId}));
    if (!children.length) return '';
    const labels = ['渠道','下载','付费人数','付费率',sampleState.income==='total'?'总收入':'新用户收入',sampleState.tax==='gross'?'税前收入':'税后收入','营销支出','算力支出','总成本','收支差额','ROI'];
    const id = 'perf-country-' + record.countryId;
    return '<tr class="perf-detail-drill-row"><td colspan="11"><section class="perf-detail-country-panel" id="' + escape(id) + '" aria-labelledby="' + escape(id) + '-title"><div class="perf-detail-branch-head"><h3 id="' + escape(id) + '-title"><span>' + escape(record.country) + '</span><i aria-hidden="true">›</i>渠道明细<span class="perf-detail-branch-count">' + children.length + ' 个渠道</span></h3><span>渠道可继续展开投放明细</span></div><table class="perf-detail-table perf-detail-channel-table"><caption class="perf-detail-sr-only">' + escape(record.country) + '下的渠道汇总</caption><thead><tr>' + labels.map(label=>'<th scope="col">'+label+'</th>').join('') + '</tr></thead><tbody>' + children.map(child=>renderRow(child)+campaignPanel(child)).join('') + '</tbody></table></section></td></tr>';
  }

  function renderTable() {
    const sourceRows = Array.isArray(result.rows) ? result.rows : [];
    const keyword = search.trim().toLocaleLowerCase();
    const rows = sourceRows.filter(row => !keyword || [row.name, row.id].some(value => String(value || '').toLocaleLowerCase().includes(keyword)));
    displayedRows = core.sortRows(rows, sortKey, sortDir);
    visibleRecords = displayedRows.flatMap(row => {
      const countryId = dimension === 'country' ? row.id : state.country === 'all' ? '' : state.country;
      const country = dimension === 'country' ? row.name : data.countries.find(item=>item.id===countryId)?.name || '';
      const parent = {row, level:1, country, countryId};
      const addCampaigns = record => [record,...(expandedChannels.has(campaignKey(record))?sortedCampaigns(record).map(item=>({row:item,level:3,country,countryId,channel:record.row.name,channelId:record.row.id})):[])];
      if (dimension !== 'country') return addCampaigns(parent);
      if (!expandedCountries.has(row.id)) return [parent];
      return [parent, ...core.sortRows(childrenFor(row), sortKey, sortDir).flatMap(child => addCampaigns({row:child, level:2, country, countryId}))];
    });
    const dimensionLabel = dimension === 'country' ? '国家 / 地区' : '渠道';
    $('#perf-detail-list-title').textContent = '按' + (dimension === 'country' ? '国家 / 地区' : '渠道') + '拆分';
    $('#perf-detail-dimension-heading').textContent = dimensionLabel;
    $('#perf-detail-revenue-heading').textContent = sampleState.income === 'total' ? '总收入' : '新用户收入';
    $('#perf-detail-tax-heading').textContent = sampleState.tax === 'gross' ? '税前收入' : '税后收入';
    $('#perf-detail-table-caption').textContent = '按' + dimensionLabel + '拆分的完整经营数据，金额单位 USD';
    const noun = dimension === 'country' ? '个国家 / 地区' : '个渠道';
    $('#perf-detail-count').textContent = keyword ? '匹配 ' + core.number(displayedRows.length) + ' / ' + core.number(sourceRows.length) : core.number(sourceRows.length) + ' ' + noun;
    const childCount = visibleRecords.filter(record=>record.level===2).length;
    const campaignCount = visibleRecords.filter(record=>record.level===3).length;
    $('#perf-detail-footer-count').textContent = (keyword ? '显示 ' + core.number(displayedRows.length) + ' / 共 ' + core.number(sourceRows.length) : '共 ' + core.number(sourceRows.length)) + ' 条汇总' + (childCount ? ' · 已展开 ' + childCount + ' 个渠道' : '') + (campaignCount ? ' · ' + campaignCount + ' 条投放明细' : '');
    $('#perf-detail-export').disabled = displayedRows.length === 0;
    document.querySelectorAll('[data-perf-detail-column]').forEach(th => {
      const key = th.dataset.perfDetailColumn;
      th.setAttribute('aria-sort', key === sortKey ? (sortDir === -1 ? 'descending' : 'ascending') : 'none');
      th.classList.toggle('perf-detail-current-metric', key === metric);
      th.querySelector('.perf-detail-sort-icon').textContent = key === sortKey ? (sortDir === -1 ? '↓' : '↑') : '↕';
    });
    if (!displayedRows.length) {
      const title = sourceRows.length ? '没有找到匹配的记录' : '当前筛选暂无可用拆分数据';
      const note = sourceRows.length ? '尝试其他名称或 ID，或清空搜索查看全部。' : result.reason || '请返回看板调整筛选；未提供的维度不会使用估算值填充。';
      $('#perf-detail-table-body').innerHTML = '<tr><td colspan="11" class="perf-detail-empty-cell"><strong>' + escape(title) + '</strong><p>' + escape(note) + '</p></td></tr>';
      return;
    }
    $('#perf-detail-table-body').innerHTML = visibleRecords.filter(record=>record.level===1).map(record=>renderRow(record)+(dimension==='country'?countryPanel(record):campaignPanel(record))).join('');
  }

  function renderMix() {
    const rows = Array.isArray(result.rows) ? result.rows : [];
    const noun = dimension === 'country' ? '个国家 / 地区' : '个渠道';
    const buckets = [
      {label:'盈利', color:'#3BB56A', count:0},
      {label:'亏损', color:'#D6455B', count:0},
      {label:'收支持平', color:'#AEC3CE', count:0, neutral:true},
      {label:'待补充', color:'#DDE7E3', count:0, neutral:true}
    ];
    rows.forEach(row => {
      const value = row.profit;
      const index = !Number.isFinite(value) ? 3 : value > 0 ? 0 : value < 0 ? 1 : 2;
      buckets[index].count += 1;
    });
    const bar = $('#perf-detail-mix-bar');
    const legend = $('#perf-detail-mix-legend');
    $('#perf-detail-mix-count').textContent = '按 ' + core.number(rows.length) + ' ' + noun + '统计';
    bar.classList.toggle('is-empty', !rows.length);
    if (!rows.length) {
      bar.textContent = '当前筛选暂无收支分布';
      bar.setAttribute('aria-label', '当前筛选暂无收支分布');
      legend.innerHTML = '';
      return;
    }
    const active = buckets.filter(bucket => bucket.count).map(bucket => ({...bucket, percent:bucket.count / rows.length * 100}));
    bar.setAttribute('aria-label', active.map(bucket => bucket.label + ' ' + bucket.count + ' ' + noun + '，占 ' + bucket.percent.toFixed(1) + '%').join('；'));
    bar.innerHTML = active.map(bucket => '<span class="perf-detail-mix-segment' + (bucket.neutral ? ' is-neutral' : '') + '" style="--segment-size:' + bucket.count + ';--segment-color:' + bucket.color + '" aria-hidden="true">' + (bucket.percent >= 10 ? bucket.percent.toFixed(1) + '%' : '') + '</span>').join('');
    legend.innerHTML = active.map(bucket => '<li><span class="perf-detail-mix-key" style="--segment-color:' + bucket.color + '"><i aria-hidden="true"></i><span>' + bucket.label + '</span></span><span class="perf-detail-mix-detail"><strong>' + core.number(bucket.count) + '</strong><span>' + noun + '</span><small>' + bucket.percent.toFixed(1) + '%</small></span></li>').join('');
  }

  function render() {
    updateURL();
    result = core.resolve(data, state, dimension);
    const summary = result.summary || {};
    const title = {all:'收支差额&ROI分析', profit:'收支差额分析', roi:'ROI分析'}[metric];
    document.title = title + ' · fansAI';
    $('#perf-detail-title').textContent = title;
    $('#perf-detail-crumb').textContent = title;
    $('#perf-detail-formula').textContent = metric === 'roi' ? 'ROI = 收入 ÷ 总成本 × 100% · 保留全部经营指标' : metric === 'profit' ? '收支差额 = 收入 − 营销支出 − 算力支出 · 保留全部经营指标' : '按渠道或国家 / 地区查看完整经营数据';
    $('#perf-detail-scope-text').textContent = core.scopeText(data, state);
    $('#perf-detail-summary-label').textContent = '收支差额';
    $('#perf-detail-summary-value').textContent = core.signedMoney(summary.profit);
    $('#perf-detail-summary-value').className = profitTone(summary.profit);
    $('#perf-detail-revenue-label').textContent = sampleState.income === 'total' ? '总收入' : '新用户收入';
    $('#perf-detail-revenue').textContent = core.money(summary.revenue);
    $('#perf-detail-cost').textContent = core.money(summary.cost);
    $('#perf-detail-cost-caption').textContent = '营销支出 + 算力支出';
    $('#perf-detail-roi').textContent = core.percent(summary.roi);
    $('#perf-detail-roi').className = roiTone(summary.roi);
    $('#perf-detail-roi-caption').textContent = Number.isFinite(summary.roi) ? '每投入 $1 成本产出 $' + (summary.roi / 100).toFixed(2) + ' 收入' : '当前筛选暂无可计算 ROI';
    $('#perf-detail-basis').textContent = result.basisLabel || '原收入参考口径';
    $('#perf-detail-basis-note').textContent = (result.basisNote || '税前、税后拆分尚未明确；不会将原口径直接标记为税后收入。') + (result.reason ? ' ' + result.reason : '');
    for (const key of ['all', 'profit', 'roi']) {
      const link = $('#perf-detail-' + key + '-link');
      if (key === metric) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    document.querySelectorAll('[data-perf-detail-dimension]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.perfDetailDimension === dimension)));
    renderMix();
    renderTable();
  }

  function focusMetricColumn() {
    requestAnimationFrame(() => {
      const scroller = $('.perf-detail-table-scroll');
      if (!scroller) return;
      if (metric === 'all') {
        scroller.scrollLeft = 0;
        return;
      }
      const column = document.querySelector('[data-perf-detail-column="' + metric + '"]');
      if (!column) return;
      const viewport = scroller.getBoundingClientRect();
      const target = column.getBoundingClientRect();
      const stickyWidth = document.querySelector('[data-perf-detail-column="name"]')?.offsetWidth || 244;
      if (target.right > viewport.right - 16) scroller.scrollLeft += target.right - viewport.right + 16;
      else if (target.left < viewport.left + stickyWidth + 16) scroller.scrollLeft = Math.max(0, scroller.scrollLeft + target.left - viewport.left - stickyWidth - 16);
    });
  }

  function downloadCSV() {
    if (!visibleRecords.length) return;
    const csvCell = value => {
      let text = value == null ? '' : String(value);
      if (/^[=+@\t\r]/.test(text) || (/^-/.test(text) && !Number.isFinite(Number(text)))) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    const headers = ['层级', '所属国家', '所属国家 ID', '名称', 'ID', '下载', '付费人数', '付费率（%）', (sampleState.income === 'total' ? '总收入' : '新用户收入') + '（原口径，USD）', (sampleState.tax === 'gross' ? '税前收入' : '税后收入') + '（USD）', '营销支出（USD）', '算力支出（USD）', '总成本（USD）', '收支差额（USD）', 'ROI（%）', '数据口径', '当前筛选', '所属渠道', '渠道 ID', '投放系列', '投放系列 ID', '投放组', '投放组 ID', '关键词'];
    const rows = visibleRecords.map(record => {
      const row = record.row;
      return [record.level === 3 ? '渠道下投放明细' : record.level === 2 ? '国家下渠道' : dimension === 'country' ? '国家汇总' : '渠道汇总', record.country, record.countryId, row.name, row.id, row.downloads, row.payers, row.payRate, row.revenue, row.taxRevenue, row.marketing, row.compute, row.cost, row.profit, row.roi, (core.isDemoPreview(state) ? 'Demo 展示样例，非今日统计；' : '') + (result.basisLabel || '原收入参考口径'), core.scopeText(data, sampleState),record.channel||'',record.channelId||'',row.campaign||'',row.campaignId||'',row.group||'',row.groupId||'',row.keywords||''];
    });
    const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '经营数据明细_' + (dimension === 'country' ? '国家地区' : '渠道') + '_' + sampleState.start + '_' + sampleState.end + '.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#perf-detail-live').textContent = '已导出 ' + displayedRows.length + ' 条汇总' + (visibleRecords.length > displayedRows.length ? '及 ' + (visibleRecords.length - displayedRows.length) + ' 条已展开明细' : '') + '。';
  }

  document.querySelectorAll('[data-perf-detail-dimension]').forEach(button => button.addEventListener('click', () => {
    if (dimension === button.dataset.perfDetailDimension) return;
    dimension = button.dataset.perfDetailDimension;
    search = '';
    $('#perf-detail-search').value = '';
    sortKey = defaultSort();
    sortDir = -1;
    render();
  }));
  document.querySelectorAll('[data-perf-detail-metric]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    metric = link.dataset.perfDetailMetric;
    sortKey = defaultSort();
    sortDir = -1;
    render();
    focusMetricColumn();
  }));
  document.querySelectorAll('[data-perf-detail-sort]').forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.perfDetailSort;
    sortDir = sortKey === key ? sortDir * -1 : key === 'name' ? 1 : -1;
    sortKey = key;
    renderTable();
  }));
  $('#perf-detail-table-body').addEventListener('click', event => {
    const sortButton = event.target.closest('[data-perf-campaign-sort]');
    if (sortButton) {
      const key = sortButton.dataset.campaignParent, field = sortButton.dataset.perfCampaignSort;
      const current = campaignSorts.get(key) || {key:'downloads',dir:-1};
      campaignSorts.set(key,{key:field,dir:current.key===field?-current.dir:-1});
      renderTable();
      $('#perf-detail-table-body').querySelector('[data-campaign-parent="'+key+'"][data-perf-campaign-sort="'+field+'"]')?.focus();
      return;
    }
    const channelButton = event.target.closest('[data-perf-channel-toggle]');
    if (channelButton) {
      const key = channelButton.dataset.perfChannelToggle;
      if (expandedChannels.has(key)) expandedChannels.delete(key); else expandedChannels.add(key);
      renderTable();
      $('#perf-detail-table-body').querySelector('button[data-perf-channel-toggle="'+key+'"]')?.focus();
      return;
    }
    const button = event.target.closest('[data-perf-detail-expand]');
    if (!button) return;
    const id = button.dataset.perfDetailExpand;
    if (expandedCountries.has(id)) expandedCountries.delete(id);
    else expandedCountries.add(id);
    renderTable();
    $('#perf-detail-table-body').querySelector('[data-perf-detail-expand="' + id + '"]')?.focus();
  });
  $('#perf-detail-search').addEventListener('input', event => {
    search = event.target.value;
    renderTable();
  });
  $('#perf-detail-export').addEventListener('click', downloadCSV);
  render();
  focusMetricColumn();
})();

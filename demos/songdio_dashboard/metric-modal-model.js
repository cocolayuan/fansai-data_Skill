/* Independent demonstration models for metric dialogs. Never feed this data
 * back into the dashboard, its filters, exports, or performance-detail page. */
(() => {
  'use strict';

  const METRICS = ['downloads', 'payers', 'payRate', 'revenue', 'marketing', 'compute', 'countries'];
  const COUNTRY_METRICS = ['downloads', 'payers', 'revenue', 'marketing', 'compute'];
  const MONEY_METRICS = new Set(['revenue', 'marketing', 'compute']);
  const integerSum = values => values.reduce((total, value) => total + value, 0);
  const rate = row => row.downloads > 0 ? row.payers / row.downloads * 100 : 0;
  const labelFor = (metric, state) => ({downloads:'下载',payers:'付费人数',payRate:'付费率',revenue:state.tax === 'gross' ? '税前收入' : '税后收入',marketing:'营销支出',compute:'算力支出',countries:'覆盖国家/地区'})[metric];

  // This fixed example is deliberately separate from every production source.
  // Changing the dashboard's date/platform/cohort/channel/country does not turn
  // these illustrative values into statistics for that selection.
  const COUNTRIES = [
    ['SA','沙特阿拉伯','🇸🇦',81], ['BR','巴西','🇧🇷',42],
    ['UA','乌克兰','🇺🇦',26], ['JP','日本','🇯🇵',22],
    ['MX','墨西哥','🇲🇽',19], ['AE','阿拉伯联合酋长国','🇦🇪',10],
    ['OM','阿曼','🇴🇲',9], ['FR','法国','🇫🇷',7],
    ['US','美国','🇺🇸',7], ['DE','德国','🇩🇪',6],
    ['GB','英国','🇬🇧',6], ['CA','加拿大','🇨🇦',5],
    ['AU','澳大利亚','🇦🇺',5], ['KR','韩国','🇰🇷',4],
    ['IN','印度','🇮🇳',4], ['ID','印度尼西亚','🇮🇩',4],
    ['TR','土耳其','🇹🇷',4], ['IT','意大利','🇮🇹',3],
    ['ES','西班牙','🇪🇸',3], ['TH','泰国','🇹🇭',3],
    ['VN','越南','🇻🇳',3], ['PH','菲律宾','🇵🇭',2],
    ['SG','新加坡','🇸🇬',2]
  ].map(([id,name,flag,weight],colorIndex) => Object.freeze({id,name,flag,weight,colorIndex}));
  const CHANNELS = [
    {id:'apple',name:'Apple Ads',downloads:140,payers:16,net:9174,tax:2294,marketing:10807,compute:2596,minimum:1},
    {id:'meta',name:'Meta',downloads:15,payers:0,net:0,tax:0,marketing:2607,compute:223,minimum:0},
    {id:'tiktok',name:'TikTok',downloads:66,payers:0,net:0,tax:0,marketing:1018,compute:116,minimum:0},
    {id:'organic',name:'自然渠道',downloads:56,payers:12,net:10600,tax:2650,marketing:0,compute:2051,minimum:1}
  ].map(Object.freeze);

  // Largest-remainder allocation preserves each integer total exactly. Monetary
  // allocation and aggregation remain in cents until the public view model.
  function allocate(total, weights, minimum = 0) {
    const remaining = total - minimum * weights.length;
    const weightTotal = integerSum(weights);
    if (remaining < 0 || !Number.isInteger(total) || weightTotal <= 0) {
      throw new Error('Invalid metric dialog demo allocation.');
    }
    const quotas = weights.map(weight => remaining * weight / weightTotal);
    const values = quotas.map(quota => Math.floor(quota) + minimum);
    const order = quotas.map((quota, index) => ({index,fraction:quota - Math.floor(quota)}))
      .sort((a,b) => b.fraction - a.fraction || a.index - b.index);
    const remainder = total - integerSum(values);
    for (let index = 0; index < remainder; index++) values[order[index].index]++;
    return values;
  }

  function createDemoRecords() {
    const weights = COUNTRIES.map(country => country.weight);
    const rows = CHANNELS.flatMap(channel => {
      const downloads = allocate(channel.downloads, weights, channel.minimum);
      const payers = allocate(channel.payers, downloads);
      // Revenue only occurs in countries with a paying user in this example.
      const revenueWeights = channel.payers ? payers : downloads;
      const net = allocate(channel.net, revenueWeights);
      const tax = allocate(channel.tax, revenueWeights);
      const marketing = allocate(channel.marketing, downloads);
      const compute = allocate(channel.compute, downloads);
      return COUNTRIES.map((country,index) => ({
        country:country.id, channel:channel.id,
        downloads:downloads[index], payers:payers[index],
        net:net[index], gross:net[index] + tax[index],
        marketing:marketing[index], compute:compute[index]
      }));
    });
    const covers = allocate(63, rows.map(row => row.compute));
    return Object.freeze(rows.map((row,index) => Object.freeze({
      ...row, cover:covers[index], songs:row.compute - covers[index]
    })));
  }
  const DEMO_RECORDS = createDemoRecords();

  function aggregate(records, state) {
    const sum = key => integerSum(records.map(row => row[key]));
    return {
      downloads:sum('downloads'), payers:sum('payers'),
      revenue:sum(state.tax === 'gross' ? 'gross' : 'net'),
      marketing:sum('marketing'), compute:sum('compute'),
      songs:sum('songs'), cover:sum('cover')
    };
  }

  function valueFor(row, metric) {
    return metric === 'payRate' ? rate(row) : MONEY_METRICS.has(metric) ? row[metric] / 100 : row[metric];
  }

  function makePanel(state, metric, dimension, summary) {
    const label = labelFor(metric, state);
    const kind = metric === 'payRate' ? 'rate' : 'pie';
    const entities = dimension === 'country' ? COUNTRIES : CHANNELS;
    const mapped = entities.map(entity => {
      const row = aggregate(DEMO_RECORDS.filter(record => record[dimension] === entity.id), state);
      return {id:entity.id,name:entity.name,flag:entity.flag || '',
        ...(dimension === 'country' ? {colorIndex:entity.colorIndex} : {}),
        value:valueFor(row,metric),share:null,payers:row.payers,downloads:row.downloads,
        units:metric === 'payRate' ? 0 : row[metric]};
    }).sort((a,b) => b.value - a.value);
    const selected = kind === 'pie' ? mapped.slice(0,20) : mapped;
    const topUnits = integerSum(selected.map(row => row.units));
    const rows = selected.map(({units,...row}) => ({...row,
      share:kind === 'pie' ? topUnits > 0 ? units / topUnits * 100 : 0 : null
    }));
    const total = valueFor(summary,metric);
    return {
      id:metric,
      title:metric === 'compute' ? (dimension === 'country' ? '国家/地区' : '渠道') + '支出占比'
        : metric === 'payRate' ? '付费率' : (dimension === 'country' ? '国家/地区' : '渠道') + label + '占比',
      kind,entityDimension:dimension,rows,
      topTotal:kind === 'rate' ? total : MONEY_METRICS.has(metric) ? topUnits / 100 : topUnits,
      total,knownCount:rows.length,topCount:rows.length,rowCount:mapped.length,
      emptyReason:kind === 'pie' && topUnits === 0 ? `Demo 示例${label}为 0。` : '',
      caption:kind === 'rate' ? '付费率 = 付费人数 ÷ 下载；按所选维度独立计算。' : '前 20 名 · 占比',
      valueLabel:label
    };
  }

  function build({data = {}, state:rawState = {}, metric:rawMetric, dimension:rawDimension = 'channel', countryMetric:rawCountryMetric = 'downloads'} = {}) {
    const core = globalThis.FansAIPerformance;
    if (!core) throw new Error('FansAIPerformance must be loaded before FansAIMetricModel.');
    // Normalization is read-only. Only tax controls how the example is labelled
    // and displayed; no dashboard selection is applied to these private rows.
    const state = core.normalizeState(rawState,data);
    const metric = METRICS.includes(rawMetric) ? rawMetric : 'downloads';
    const countryMetric = COUNTRY_METRICS.includes(rawCountryMetric) ? rawCountryMetric : 'downloads';
    const selectedMetric = metric === 'countries' ? countryMetric : metric;
    const dimension = metric === 'countries' || rawDimension === 'country' ? 'country' : 'channel';
    const summary = aggregate(DEMO_RECORDS,state);
    const metricLabel = labelFor(selectedMetric,state);
    const model = {
      demo:true,metric,
      title:metric === 'countries' ? '覆盖国家/地区分布' : metricLabel + '明细' + (metric === 'compute' ? '（USD）' : ''),
      metricLabel,dimension,countryMetric,
      scope:`Demo 示例数据 · 独立展示，不计入总览统计 · ${state.tax === 'gross' ? '税前' : '税后'} · USD`,
      total:metric === 'countries' ? COUNTRIES.length : valueFor(summary,selectedMetric),
      panels:[makePanel(state,selectedMetric,dimension,summary)],note:''
    };
    if (metric === 'compute') {
      model.computeRule = '仅统计成功任务；歌曲 API 人民币价格按当前配置换算，Replicate 直接按美元计费。';
      model.exchangeRate = 6.72;
      model.exchangeMode = 'manual · Demo';
      model.panels.push({
        id:'taskType',title:'算力任务类型支出占比',kind:'pie',entityDimension:'task',
        rows:[['songs','歌曲生成'],['cover','AI 翻唱']].map(([id,name]) => ({
          id,name,flag:'',value:summary[id] / 100,
          share:summary[id] / summary.compute * 100,payers:null,downloads:null
        })),
        topTotal:summary.compute / 100,total:summary.compute / 100,
        knownCount:2,topCount:2,rowCount:2,emptyReason:'',
        caption:'前 20 名 · 占比',valueLabel:'算力支出'
      });
    }
    return model;
  }

  globalThis.FansAIMetricModel = Object.freeze({build});
})();

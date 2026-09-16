/* Shared, read-only metric and navigation helpers for the operating snapshot. */
(() => {
  'use strict';

  const STATE_KEYS = ['start', 'end', 'platform', 'income', 'tax', 'country', 'channel', 'view', 'profitDim', 'roiDim', 'quickRange', 'demoPreview'];
  const SUMMARY_KEYS = ['downloads', 'payers', 'payRate', 'revenue', 'taxRevenue', 'marketing', 'compute', 'cost', 'profit', 'roi'];
  const SORT_KEYS = new Set(['name', 'id', ...SUMMARY_KEYS]);
  const BASIS_LABEL = '原收入参考口径';
  const BASIS_NOTE = '税前/税后尚未确认，暂用原收入参考值；切换税口径不换算该快照。收支差额与 ROI 均包含营销和算力成本。';
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const amount = value => finite(value) ? value : null;
  const choose = (value, choices, fallback) => choices.includes(value) ? value : fallback;
  const dateValid = value => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T00:00:00.000Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };

  function normalizeState(raw = {}, data = {}) {
    const meta = data.meta || {};
    const defaultStart = dateValid(meta.start) ? meta.start : '1970-01-01';
    const defaultEnd = dateValid(meta.end) ? meta.end : defaultStart;
    let start = dateValid(raw.start) ? raw.start : defaultStart;
    let end = dateValid(raw.end) ? raw.end : defaultEnd;
    if (start > end) [start, end] = [end, start];
    return {
      start, end,
      platform: choose(raw.platform, ['all', 'ios', 'android'], 'all'),
      income: choose(raw.income, ['new', 'total'], 'new'),
      tax: choose(raw.tax, ['net', 'gross'], 'net'),
      country: choose(raw.country, ['all', ...(data.countries || []).map(row => row.id)], 'all'),
      channel: choose(raw.channel, ['all', ...(data.channels || []).map(row => row.id)], 'all'),
      view: choose(raw.view, ['income', 'download', 'combined'], 'income'),
      profitDim: choose(raw.profitDim, ['channel', 'country'], 'channel'),
      roiDim: choose(raw.roiDim, ['channel', 'country'], 'channel'),
      quickRange: choose(raw.quickRange, ['snapshot','today','yesterday','last7','last14','last30','custom'], 'custom'),
      demoPreview: raw.demoPreview === '1' ? '1' : '0'
    };
  }

  function readState(params, data) {
    const raw = {};
    STATE_KEYS.forEach(key => { raw[key] = params.get(key); });
    return normalizeState(raw, data);
  }

  // The default filter controls are a UI demo; retain the approved sample panels.
  // Explicit non-default filters continue to use the original snapshot rules.
  function isDemoPreview(state = {}) {
    return state.demoPreview === '1' && state.quickRange === 'today'
      && state.start === state.end && state.platform === 'all'
      && state.income === 'total' && state.tax === 'gross'
      && state.country === 'all' && state.channel === 'all';
  }

  function presentationState(data, state = {}) {
    return isDemoPreview(state)
      ? {...state, start:data.meta.start, end:data.meta.end, quickRange:'snapshot', income:'new', tax:'net', demoPreview:'0'}
      : state;
  }

  function withCost(source, state) {
    const allUsers = state.income === 'total';
    const row = { ...source };
    row.marketing = amount(source.marketing);
    row.compute = amount(source.compute);
    row.cost = row.marketing != null && row.compute != null
      ? Math.round((row.marketing + row.compute) * 100) / 100 : null;
    row.revenue = allUsers ? null : amount(source.revenue);
    row.taxRevenue = allUsers ? null : amount(source[state.tax === 'gross' ? 'revenueGross' : 'revenueNet']);
    row.profit = allUsers ? null : amount(source.profit);
    // Keep the source ROI, never sum or average child ratios; zero cost is undefined.
    row.roi = allUsers || row.cost == null || row.cost === 0 ? null : amount(source.roi);
    return row;
  }

  function countryChildren(data, rawState, countryId) {
    const state = normalizeState(presentationState(data, rawState), data);
    if (state.platform !== 'all' || state.start !== data.meta?.start || state.end !== data.meta?.end) return [];
    if (state.country !== 'all' && state.country !== countryId) return [];
    const children = data.countryChannels?.[countryId];
    if (!Array.isArray(children)) return [];
    return children.filter(row => state.channel === 'all' || row.id === state.channel)
      .map(row => withCost(row, state));
  }

  function campaignChildren(data, rawState, countryId, channelId) {
    const state = normalizeState(presentationState(data, rawState), data);
    if (!countryChildren(data, state, countryId).some(row => row.id === channelId)) return [];
    const records = data.countryCampaigns?.[countryId]?.[channelId];
    return Array.isArray(records) ? records.map(row => withCost(row, state)) : [];
  }

  function resolve(data, rawState, dimension) {
    const state = normalizeState(presentationState(data, rawState), data);
    const summary = Object.fromEntries(SUMMARY_KEYS.map(key => [key, null]));
    const result = { summary, rows: [], reason: '', basisLabel: BASIS_LABEL, basisNote: BASIS_NOTE };
    const start = data.meta?.start;
    const end = data.meta?.end;
    if (state.platform !== 'all') {
      result.reason = '当前快照未提供 iOS / Android 平台拆分，无法计算所选平台的收支差额与 ROI。';
      return result;
    }
    if (state.start !== start || state.end !== end) {
      result.reason = state.start < start || state.end > end
        ? '所选日期超出当前快照范围；请选择完整数据区间查看收支差额与 ROI。'
        : '当前只提供完整数据区间的收支与成本汇总，缺少逐日完整成本，暂不按天分摊收支差额与 ROI。';
      return result;
    }
    const countrySource = (data.countries || []).find(row => row.id === state.country);
    const children = state.country !== 'all' ? countryChildren(data, state, state.country) : [];
    const crossSelected = state.country !== 'all' && state.channel !== 'all';
    if (crossSelected && !children.length) {
      result.reason = '当前快照未提供国家/地区 × 渠道交叉数据，请将其中一个筛选恢复为全部。';
      return result;
    }

    const allUsers = state.income === 'total';
    const source = crossSelected ? children[0] : state.country !== 'all'
      ? countrySource
      : state.channel !== 'all'
        ? (data.channels || []).find(row => row.id === state.channel)
        : data.aggregate;
    if (!source) {
      result.reason = '当前快照没有符合筛选条件的汇总数据。';
      return result;
    }
    const total = withCost(source, state);
    Object.assign(summary, total);

    const byCountry = dimension === 'country';
    if (crossSelected) {
      result.rows = byCountry
        ? [{ ...total, id: countrySource.id, name: countrySource.name, flag: countrySource.flag }]
        : children;
    } else if (byCountry && state.channel !== 'all') {
      result.reason = '当前快照未提供所选渠道的国家/地区拆分；上方保留渠道汇总，可切换到渠道维度。';
    } else if (!byCountry && state.country !== 'all') {
      result.rows = children;
      if (!children.length) result.reason = '当前快照未提供所选国家/地区的渠道拆分；上方保留国家/地区汇总，可切换到国家/地区维度。';
    } else {
      const collection = byCountry ? data.countries || [] : data.channels || [];
      const selected = byCountry ? state.country : state.channel;
      result.rows = collection.filter(row => selected === 'all' || row.id === selected)
        .map(row => withCost(row, state));
      if (!result.rows.length) result.reason = '当前快照没有符合筛选条件的拆分数据。';
    }
    if (allUsers) {
      const missing = '当前快照未提供全部用户收入，收入、收支差额与 ROI 暂不可计算；已保留营销和算力成本。';
      result.reason = result.reason ? result.reason + missing : missing;
    }
    return result;
  }

  function sortRows(rows, key, dir = -1) {
    const selected = SORT_KEYS.has(key) ? key : 'profit';
    const direction = dir === 1 || dir === 'asc' ? 1 : -1;
    const missing = value => value == null || (typeof value === 'number' && !Number.isFinite(value));
    return rows.slice().sort((left, right) => {
      const a = left[selected], b = right[selected];
      if (missing(a)) return missing(b) ? 0 : 1;
      if (missing(b)) return -1;
      return (typeof a === 'number' && typeof b === 'number'
        ? a - b : String(a).localeCompare(String(b), 'zh-CN')) * direction;
    });
  }

  function toParams(state) {
    const params = new URLSearchParams();
    STATE_KEYS.forEach(key => {
      if (typeof state[key] === 'string') params.set(key, state[key]);
    });
    return params;
  }

  function detailHref(state, metric, dimension) {
    const params = toParams(state);
    params.set('metric', choose(metric, ['all', 'profit', 'roi'], 'profit'));
    params.set('dimension', dimension === 'country' ? 'country' : 'channel');
    return 'performance-detail.html?' + params.toString();
  }

  function backHref(state) {
    const params = toParams(state);
    params.set('analysisReturn', '1');
    return 'redesign.html?' + params.toString() + '#performance-section';
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function number(value, digits = 0) {
    if (!finite(value)) return '—';
    const precision = Math.max(0, Math.min(20, Number.isInteger(digits) ? digits : 0));
    return value.toLocaleString('en-US', { minimumFractionDigits: precision, maximumFractionDigits: precision });
  }

  const money = value => finite(value) ? (value < 0 ? '−' : '') + '$' + number(Math.abs(value), 2) : '—';
  const signedMoney = value => finite(value) ? (value >= 0 ? '+' : '−') + '$' + number(Math.abs(value), 2) : '—';
  const percent = value => finite(value) ? number(value, 2) + '%' : '—';

  function scopeText(data, rawState) {
    const state = normalizeState(rawState, data);
    const channel = state.channel === 'all' ? '全部渠道' : (data.channels || []).find(row => row.id === state.channel)?.name;
    const country = state.country === 'all' ? '全部国家/地区' : (data.countries || []).find(row => row.id === state.country)?.name;
    return [
      state.start.replaceAll('-', '/') + ' — ' + state.end.replaceAll('-', '/'),
      { all: '全部平台', ios: 'iOS', android: 'Android' }[state.platform],
      state.income === 'total' ? '全部用户' : '新用户',
      state.tax === 'gross' ? '税前筛选' : '税后筛选', channel, country
    ].join(' · ');
  }

  globalThis.FansAIPerformance = Object.freeze({
    normalizeState, readState, isDemoPreview, presentationState, resolve, countryChildren, campaignChildren, sortRows, toParams, detailHref, backHref,
    escapeHTML, number, money, signedMoney, percent, scopeText
  });
})();

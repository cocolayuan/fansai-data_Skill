globalThis.PERFORMANCE_DATA={"meta":{"source":"current.html","sourceType":"演示数据 / 离线静态快照","snapshot":"4f68a925","start":"2026-08-26","end":"2026-09-08","currency":"USD","revenueMode":"newUsers","platform":"all","country":"all","channel":"all","adsLastFetched":"2026/9/9 08:00:00","precision":{"aggregate":"从 HTML 文本逐字提取，金额小数点后 2 位","downloads":"SVG 柱 height × 8000 / 280，整数，14 日汇总与文字表格精确一致","revenueApprox":"SVG M 与每个 C 端点的 y 坐标还原，(290-y) × 8000 / 280，原 SVG 坐标保留 3 位小数；四舍五入至美分后的单点最大误差约 $0.02，不可当作原始交易金额","adsProfit":"SVG 柱 height × 1000 / 260，四舍五入到美分；14 日合计与广告模块精确一致"},"missing":["总收入口径数据","国家×渠道交叉表","平台细分","国家趋势","付费人数逐日数据","非 Apple Ads 的广告投放明细","非 Apple Ads 的营销支出逐日数据","算力支出逐日数据","算力用量明细","历史对比期"]},"aggregate":{"downloads":78330,"payers":7836,"payRate":10,"revenue":88727.9,"marketing":26629.94,"compute":10182.9,"profit":51915.06,"roi":241.02,"countries":6},"channels":[{"downloads":33901,"payers":3344,"payRate":9.86,"revenue":36520.6,"marketing":13443.59,"compute":4407.13,"profit":18669.88,"roi":204.59,"name":"Meta","id":"meta"},{"downloads":20802,"payers":1872,"payRate":9,"revenue":16848,"marketing":7488.72,"compute":2704.26,"profit":6655.02,"roi":165.29,"name":"Apple Ads","id":"apple"},{"downloads":13098,"payers":1419,"payRate":10.83,"revenue":18305.1,"marketing":5697.63,"compute":1702.74,"profit":10904.73,"roi":247.35,"name":"TikTok","id":"tiktok"},{"downloads":10529,"payers":1201,"payRate":11.41,"revenue":17054.2,"marketing":0,"compute":1368.77,"profit":15685.43,"roi":1245.95,"name":"自然渠道","id":"organic"}],"countries":[{"downloads":17121,"payers":1719,"payRate":10.04,"revenue":19637.5,"marketing":5731.33,"compute":2225.73,"profit":11680.44,"roi":246.79,"flag":"🇺🇸","name":"美国","id":"US"},{"downloads":15492,"payers":1557,"payRate":10.05,"revenue":17734.9,"marketing":5213.35,"compute":2013.96,"profit":10507.59,"roi":245.39,"flag":"🇯🇵","name":"日本","id":"JP"},{"downloads":13869,"payers":1385,"payRate":9.99,"revenue":15716.3,"marketing":4697.42,"compute":1802.97,"profit":9215.91,"roi":241.77,"flag":"🇬🇧","name":"英国","id":"GB"},{"downloads":12243,"payers":1228,"payRate":10.03,"revenue":13869.1,"marketing":4179.93,"compute":1591.59,"profit":8097.59,"roi":240.3,"flag":"🇩🇪","name":"德国","id":"DE"},{"downloads":10615,"payers":1054,"payRate":9.93,"revenue":11837.7,"marketing":3662.36,"compute":1379.95,"profit":6795.39,"roi":234.77,"flag":"🇨🇦","name":"加拿大","id":"CA"},{"downloads":8990,"payers":893,"payRate":9.93,"revenue":9932.4,"marketing":3145.56,"compute":1168.7,"profit":5618.15,"roi":230.22,"flag":"🇦🇺","name":"澳大利亚","id":"AU"}]};
globalThis.PERFORMANCE_LOGOS={apple:"Apple.jpg",meta:"Meta.jpg",tiktok:"Tiktok.jpg"};

// Same-period demo breakdown. Original aggregate, channel and country records stay intact.
globalThis.PERFORMANCE_DATA.countryChannels = {
  JP: [
    {id:'apple',name:'Apple Ads',downloads:8600,payers:900,revenue:10460,marketing:4560,compute:1120},
    {id:'meta',name:'Meta',downloads:2000,payers:165,revenue:980,marketing:420,compute:230},
    {id:'tiktok',name:'TikTok',downloads:2100,payers:112,revenue:390,marketing:233.35,compute:167.96},
    {id:'organic',name:'自然渠道',downloads:2792,payers:380,revenue:5904.9,marketing:0,compute:496}
  ].map(row => {
    const round = value => Math.round(value * 100) / 100;
    const cost = round(row.marketing + row.compute);
    return {...row,revenueNet:null,revenueGross:null,payRate:round(row.payers / row.downloads * 100),
      profit:round(row.revenue - cost),roi:cost ? round(row.revenue / cost * 100) : null};
  })
};
globalThis.PERFORMANCE_DATA.meta.demoCountryChannels = {JP:{start:'2026-08-26',end:'2026-09-08'}};

// Campaign-level demo children of the existing Japan demo. Never added to overview totals.
globalThis.PERFORMANCE_DATA.countryCampaigns = {JP:{
  apple:[
    {id:'demo-jp-apple-brand',campaign:'日本 · 品牌搜索',campaignId:'demo-jp-brand',group:'品牌精准 · 日语',groupId:'demo-jp-brand-ja',keywords:'FansAI、AI 音乐',downloads:4300,payers:500,revenue:6800,marketing:1760,compute:560},
    {id:'demo-jp-apple-generic',campaign:'日本 · 通用词拓量',campaignId:'demo-jp-generic',group:'音乐生成 · 兴趣词',groupId:'demo-jp-music',keywords:'音楽生成、作曲 AI',downloads:3100,payers:300,revenue:3000,marketing:2000,compute:400},
    {id:'demo-jp-apple-competitor',campaign:'日本 · 竞品搜索',campaignId:'demo-jp-competitor',group:'竞品词 · 精准',groupId:'demo-jp-competitor-ja',keywords:'suno、suno ai',downloads:1200,payers:100,revenue:660,marketing:800,compute:160}
  ],
  meta:[
    {id:'demo-jp-meta-creator',campaign:'日本 · 音乐创作者',campaignId:'demo-jp-meta-creator',group:'创作兴趣 · 视频素材',groupId:'demo-jp-meta-video',keywords:null,downloads:1300,payers:120,revenue:820,marketing:260,compute:145},
    {id:'demo-jp-meta-broad',campaign:'日本 · 广泛受众',campaignId:'demo-jp-meta-broad',group:'广泛受众 · 素材测试',groupId:'demo-jp-meta-test',keywords:null,downloads:700,payers:45,revenue:160,marketing:160,compute:85}
  ],
  tiktok:[
    {id:'demo-jp-tiktok-music',campaign:'日本 · 音乐兴趣',campaignId:'demo-jp-tiktok-music',group:'音乐创作 · 短视频',groupId:'demo-jp-tiktok-video',keywords:null,downloads:1400,payers:80,revenue:310,marketing:150,compute:110},
    {id:'demo-jp-tiktok-broad',campaign:'日本 · 新受众探索',campaignId:'demo-jp-tiktok-broad',group:'广泛受众 · 新素材',groupId:'demo-jp-tiktok-test',keywords:null,downloads:700,payers:32,revenue:80,marketing:83.35,compute:57.96}
  ]
}};
for (const channels of Object.values(globalThis.PERFORMANCE_DATA.countryCampaigns)) {
  for (const [channelId,records] of Object.entries(channels)) {
    channels[channelId]=records.map(row=>{
      const round=value=>Math.round(value*100)/100,cost=round(row.marketing+row.compute);
      return {...row,name:row.campaign,channelId,revenueNet:null,revenueGross:null,
        payRate:round(row.payers/row.downloads*100),profit:round(row.revenue-cost),roi:cost?round(row.revenue/cost*100):null};
    });
  }
}
globalThis.PERFORMANCE_DATA.meta.demoCountryCampaigns={JP:{start:'2026-08-26',end:'2026-09-08'}};

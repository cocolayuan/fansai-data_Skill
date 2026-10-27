# 数字布局 与 图表处理 · 配方与代码

配合 `SKILL.md` 使用。这里给可直接复制改用的代码。标杆范例:`customer_tracking_reference.html`。

## 目录
- [一、数字布局 6 模式](#一数字布局-6-模式)
- [二、图表 7 类配方](#二图表-7-类配方)
- [三、主次与配色判断](#三主次与配色判断)

---

## 一、数字布局 6 模式

### 模式 A — 顶部 KPI 卡(label + 大数 + caption + 右锚)
大数是主角,右侧放**色块图标**或**圆环**作锚点。`justify-between; align-items:flex-start`。
```css
.kpi{border-radius:24px;padding:22px 24px;display:flex;justify-content:space-between;align-items:flex-start;min-height:128px}
.kpi .lbl{font-size:15px;color:var(--muted);font-weight:500}
.kpi .num{font-family:var(--en);font-weight:700;font-size:42px;line-height:1.05;margin:8px 0 7px;font-variant-numeric:tabular-nums}
.kpi .cap{font-size:12.5px;color:var(--muted2)}
.kchip{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center}/* tinted bg + 同色 stroke icon */
```
右锚二选一:`<div class="kchip" style="background:#E4F1F4;color:#2E7E96">…icon…</div>` 或圆环(见图表§)。

### 模式 B — stat 状态卡(数值可为文字)
文字型取值(A级 / 低 / 进行中)**切中文字体**并可上语义色;数字型用 Outfit。
```css
.stat .big{font-size:30px;font-weight:700;font-family:var(--en);margin:9px 0 7px}
.stat .big.cn{font-family:var(--cn)}   /* 文字值用这个 */
```
```html
<div class="big cn" style="color:#1A9E4B">A级</div>   <!-- 有结论才上色 -->
<div class="big">176 / 220</div>                       <!-- “已发布/计划”这类比值,数字直接并排 -->
```

### 模式 C — 前缀 + 数值 + 单位 基线对齐(最关键)
`align-items:baseline` 是灵魂:让 万/亿/% 坐在主数字基线上,前缀单位更小更淡。
```css
.kn{display:flex;align-items:baseline;gap:5px;font-family:var(--en);font-weight:700;font-size:30px;line-height:1;color:var(--ink)}
.kn .pre{font-family:var(--cn);font-size:14px;font-weight:600;color:var(--muted)}  /* 同比 / ¥ */
.kn .un{font-family:var(--cn);font-size:16px;font-weight:700}                       /* 万 / 亿+ / % */
```
```html
<div class="kn"><span class="pre">同比</span><span style="color:#1A9E4B">+12%</span></div>
<div class="kn"><span>8,965</span><span class="un" style="color:#E8854A">万</span></div>
```

### 模式 D — metric tile + 上下文行(三选一)
header(label+icon)→ 数值行 → **{进度条+说明} 或 {徽标} 或 {caption}**,挑最能讲故事的一种。
```css
.ktile{border-radius:18px;padding:18px 18px 16px;background:rgba(255,255,255,.55);border:1px solid var(--line)}
.ktile .kt{display:flex;align-items:center;justify-content:space-between;margin-bottom:13px}
.ktile .kbar{height:7px;border-radius:5px;background:#EAF1F1;overflow:hidden;margin-top:13px}
.ktile .kbar>i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#49B6D8,#008aa8)}
.ktile .kbadge{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:600;border-radius:12px;padding:3px 10px}
```

### 模式 E — 信号值带升降箭头
方向比数值更重要时,加三角并染色(升绿降红)。
```html
<div class="sv" style="color:#1A9E4B"><svg class="ua" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l7 9H5z"/></svg>+18%</div>
```

### 模式 F — 列表行数值列对齐
多行数值右对齐 + 固定 `min-width`,自然成列;名称 `ellipsis` 截断。
```css
.cpct{font-family:var(--en);font-weight:700;font-size:14px;min-width:42px;text-align:right}
```

---

## 二、图表 7 类配方

### 1) 圆环表盘 / 进度环(ring)
```js
function ring(pct,color,size,sw){const r=(size-sw)/2,c=2*Math.PI*r,off=c*(1-pct);
 return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#E6EEEE" stroke-width="${sw}"/>
  <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
   stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${size/2} ${size/2})"/>
 </svg>`;}
```
中心放值:外层 `position:relative`,值用绝对定位居中。评分按段着色 `≥85 #3FB36A / 70–84 #49B6D8 / <70 #FF9F6E`。

### 2) 横条 + 右值(列表/排行)
```css
.bar{flex:1;height:9px;border-radius:5px;background:#EAF1F1;overflow:hidden}
.bar>i{display:block;height:100%;border-radius:5px}
```
归一化 `width = v/max*100%`;右值 Outfit 固定宽右对齐。**领先项品牌色,其余中性**(见§三)。

### 3) 厚环环形(占比/构成)— 固定占地
```js
function donut(segs,total,size=212,sw=26){const r=(size-sw-10)/2,C=2*Math.PI*r,gap=4;let acc=0,a="";
 segs.forEach(([v,col])=>{const len=C*v/total,dash=Math.max(len-gap,2);
  a+=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}"
   stroke-linecap="round" stroke-dasharray="${dash} ${C-dash}" stroke-dashoffset="${-acc}"
   transform="rotate(-90 ${size/2} ${size/2})"/>`;acc+=len;});
 return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
   <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#EEF4F2" stroke-width="${sw}"/>${a}
   <text x="${size/2}" y="${size/2+2}" font-family="Outfit" font-size="42" font-weight="700" fill="#1b2430" text-anchor="middle">${total}</text></svg>`;}
```
**为什么**:类目多/数值扁平时,长排行条会无限下排且根根等长,厚环占地恒定、只讲覆盖结构。

### 4) 趋势多线(平滑 + 双轴)
- 平滑:Catmull-Rom → 三次贝塞尔。
- 配色:`蓝 #4D9DE8`(展现)/`深 navy #1B2430`(点击)/`绿 #3FB36A`(消耗)。**自底向上画**,主线在最上层。
- **放大高度**(如 H≈380)、**X 刻度稀疏**(每 3 小时或第 N 个 + 末点)、**不堆面积填充**、补图例;量级差异大上双 Y 轴(左 0–36 / 右 0–800)。
```js
function smooth(p){if(p.length<2)return"";let d=`M ${p[0][0]} ${p[0][1]}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
  d+=` C ${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`;}return d;}
```

### 5) 柱状排行(领先高亮)
仅 rank 0 用绿渐变 `#A7E885→#34A85E`,其余中性 `#E4EBE9→#C2CFCA`;数值标签领先深绿加粗(`#1F6F4A`),其余弱化(`#94a3b8`)。

### 6) 步骤条 / 阶段进度
5 段闭环阶段:已完成段实色、当前段渐变高亮、未来段浅灰;下方当前阶段名 + `n/5`。或单条进度 `width=pct%` + 右侧 `pct%`。

### 7) KPI mini 图(卡内点缀)
胶囊数据条(几根渐变绿圆角柱)、条码式(细柱+深色顶帽)、半环仪表(半圆弧+中心值)、sparkline。保持**小而克制**,别和主数字抢。

---

## 三、主次与配色判断

- **领先 vs 其余**:一组对比里,先问“谁是主角”。主角用品牌色(通常绿/蓝),其余一律中性灰(`#E4EBE9→#C2CFCA`),数值标签同步分级。这是消除“满屏绿”的关键。
- **语义色**:正向/达标→绿,品牌强调→蓝/teal,风险/过期→红/橙,中性/排期→灰。色块图标 = tinted bg(很浅)+ 同色描边图标。
- **一数一色**:每个数字最多一个强调色;能不上色就不上色,留给真正有结论的那个。
- **轨道统一**:所有横条/环的底轨用 `#EAF1F1 / #E6EEEE`,保持一致的“空”底。

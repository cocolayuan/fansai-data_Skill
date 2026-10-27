# 数字布局 与 图表选型/配方 · V2

配合 `SKILL.md` 使用。可直接复制改用的代码。实时预览：`charts_components_reference.html`。

> **V2 变更**：图表部分从「7 类配方」重写为「**选型决策表 + 9 类配方**」。占比构成的默认答案从厚环 donut 改为**分段条 segbar**；新增**表现分环**（统一的评分表达）、**流程图**（流程/管线/漏斗）、**结构堆叠条**（单值拆解）三类。

## 目录
- [一、数字布局 6 模式](#一数字布局-6-模式)
- [二、图表选型决策表](#二图表选型决策表)
- [三、图表 9 类配方](#三图表-9-类配方)
- [四、主次七律与配色判断](#四主次七律与配色判断)

---

## 一、数字布局 6 模式

### 模式 A — 顶部 KPI 卡（label + 大数 + caption）
```css
.kpi{border-radius:24px;padding:22px 24px;display:flex;flex-direction:column;min-height:128px}
.kpi .lbl{font-size:15px;color:var(--muted);font-weight:500}
.kpi .num{font-family:var(--en);font-weight:700;font-size:42px;line-height:1.05;margin:16px 0 7px;font-variant-numeric:tabular-nums}
.kpi .cap{font-size:12.5px;color:var(--muted2);margin-top:auto}
```
> **V2 修订**：右上角的装饰性色块图标（`.kchip`）**默认去掉** —— 不承载信息就不占位置。只有需要区分指标类型时才保留图标锚点。
> 标题行与数值行之间留 **16px**，caption 用 `margin-top:auto` 顶到卡片底部，让数据块自然收紧成组。

### 模式 B — stat 状态卡（数值可为文字）
```css
.stat .big{font-size:30px;font-weight:700;font-family:var(--en);margin:9px 0 7px}
.stat .big.cn{font-family:var(--cn)}   /* 文字型取值用中文字体 */
```
```html
<div class="big cn" style="color:#1A9E4B">A级</div>
<div class="big">176 / 220</div>
```

### 模式 C — 前缀 + 数值 + 单位 基线对齐（最关键）
```css
.kn{display:flex;align-items:baseline;gap:5px;font-family:var(--en);font-weight:700;font-size:30px;line-height:1;color:var(--ink)}
.kn .pre{font-family:var(--cn);font-size:14px;font-weight:600;color:var(--muted)}  /* 同比 / ¥ */
.kn .un{font-family:var(--cn);font-size:16px;font-weight:700}                      /* 万 / 亿+ / % */
```

### 模式 D — metric tile（标题行 + 数值 + 上下文行）
```css
.ktile{border-radius:18px;padding:18px;background:rgba(255,255,255,.55);border:1px solid var(--line);display:flex;flex-direction:column}
.kl-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}  /* 标签左、状态tag推到右边缘 */
.ktile .kbar{height:7px;border-radius:5px;background:#EAF1F1;overflow:hidden;margin-top:13px}
.ktile .kbar>i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#49B6D8,#008aa8)}
```
上下文行三选一：`{进度条+说明}` / `{徽标}` / `{caption}`。竖排分组（客户池 / 商机与预测 / 交付与财务）比横铺更好读。

### 模式 E — 信号值带升降箭头
```html
<div class="sv" style="color:#1A9E4B"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l7 9H5z"/></svg>+18%</div>
```

### 模式 F — 列表行数值列对齐
```css
.cpct{font-family:var(--en);font-weight:700;font-size:14px;min-width:42px;text-align:right}
```
金额语义色：已回款 `#1A9E4B` / 待回款 `#C77B26`，**都加粗**；中性金额保持墨色。

---

## 二、图表选型决策表

**先判断数据形态，再选图。** 这张表是 V2 最重要的新增内容。

| 数据形态 | ✅ 用 | ❌ 不要用 | 为什么 |
|---|---|---|---|
| 单个评分 / 百分比 / 完成度 / 毛利率 | **① 表现分环**（42px·4.5px） | 光秃秃的数字、细进度条 | 环形擅长表达"一个值在 0–100 的位置"，且占地极小可放进表格单元格 |
| 占比 / 构成（2–6 类） | **② 分段条 segbar** + 网格图例 | ~~饼图 / 厚环 donut~~ | 横向分段好读、好标注、好对齐；饼环切 3 片以上就难比较 |
| 占比且类目 >6，或必须固定占地 | **③ 厚环 donut**（降级备选） | 长排行条无限下排 | 类目多且数值扁平时，厚环占地恒定 |
| 流程 / 管线 / 漏斗 / 阶段流转 | **④ 流程图**（圆节点 + 箭头） | 一排并列彩色色块统计条 | 流程有方向和因果，色块条只表达"大小"，丢掉了流转关系 |
| 排行 / 横向对比 | **⑤ 横条 + 右值** | 根根同色铺满 | 领先高亮 + 其余中性才有主次 |
| 时间序列 | **⑥ 平滑多线** | 堆叠面积填充 | 面积堆叠遮挡次要线；量级差异大就上双轴 |
| 分类对比（少量、需强调冠军） | **⑦ 柱状排行**（领先高亮） | 全绿柱子 | 同上 |
| 单值的结构拆解（合同→开票→回款） | **⑧ 结构堆叠条** | 三个独立数字并列 | 拆解关系要看"占整体多少"，并列数字看不出比例 |
| 卡内点缀 | **⑨ KPI mini 图** | 抢主数字风头的大图 | 小而克制 |

---

## 三、图表 9 类配方

### ① 表现分环 ring gauge（评分 / 百分比统一表达）★ V2 提升为强制

系统内所有评分、毛利率、完成度类指标**都走这一套**，不要每页各画各的。

```
尺寸 42px · 描边 4.5px · stroke-linecap:round
浅轨道 #E6EEEE · 从 -90° 起画
中心数字：Outfit 600 / 12px / 与环同色
分段配色：≥85 绿 #3FB36A · 70–84 蓝 #49B6D8 · <70 橙 #FF9F6E
```
```js
const RING_SIZE=42, RING_SW=4.5;
function ringColor(v){ return v>=85?'#3FB36A' : v>=70?'#49B6D8' : '#FF9F6E'; }
function ring(pct,color,size=RING_SIZE,sw=RING_SW){
  const r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-pct);
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
   <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#E6EEEE" stroke-width="${sw}"/>
   <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
    stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
    transform="rotate(-90 ${size/2} ${size/2})"/></svg>`;
}
// 中心数字：外层 position:relative，数字绝对定位居中，font-family:Outfit;font-weight:600;font-size:12px
```
**无数据态**：画**虚线空环**（`stroke-dasharray:3 4`、无填充弧、中心显 `—`），**不要默认成 0 分** —— 见 SKILL §0。

### ② 分段条 segbar（占比 / 构成）★ V2 新增，取代饼环成为默认
```css
.segbar{height:32px;border-radius:16px;overflow:hidden;display:flex;background:#EAF1F1}
.segbar>i{height:100%;display:flex;align-items:center;justify-content:center;
  color:#fff;font-family:var(--en);font-weight:700;font-size:12px}
.seglegend{display:grid;grid-template-columns:repeat(2,1fr);gap:9px 18px;margin-top:14px}
.segitem{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted)}
.segitem .sdot{width:8px;height:8px;border-radius:3px;flex:0 0 auto}
.segitem .sv{margin-left:auto;font-family:var(--en);font-weight:700;color:var(--ink)}
```
```js
function segbar(segs){ // segs: [[label, value, color], ...]
  const total = segs.reduce((s,x)=>s+x[1],0);
  const bar = segs.map(([l,v,c])=>{
    const p = v/total*100;
    return `<i style="width:${p.toFixed(2)}%;background:${c}">${p>=10?p.toFixed(0)+'%':''}</i>`;
  }).join('');
  const legend = segs.map(([l,v,c])=>{
    const p=(v/total*100).toFixed(1);
    return `<div class="segitem"><span class="sdot" style="background:${c}"></span>${l}
      <span class="sv">${p}% · ${v}</span></div>`;
  }).join('');
  return `<div class="segbar">${bar}</div><div class="seglegend">${legend}</div>`;
}
```
规则：占比 **≥10% 的分段才在条上直接标百分比**（更小的标不下会糊）；图例给「色点 + 名称 + 百分比 + 绝对值」，绝对值右对齐成列。

### ③ 厚环 donut（降级备选：类目 >6 或需固定占地）
```js
function donut(segs,total,size=212,sw=26){const r=(size-sw-10)/2,C=2*Math.PI*r,gap=4;let acc=0,a="";
 segs.forEach(([v,col])=>{const len=C*v/total,dash=Math.max(len-gap,2);
  a+=`<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="${sw}"
   stroke-linecap="round" stroke-dasharray="${dash} ${C-dash}" stroke-dashoffset="${-acc}"
   transform="rotate(-90 ${size/2} ${size/2})"/>`;acc+=len;});
 return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
   <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="#EEF4F2" stroke-width="${sw}"/>${a}
   <text x="${size/2}" y="${size/2+2}" font-family="Outfit" font-size="42" font-weight="700"
    fill="#1b2430" text-anchor="middle">${total}</text></svg>`;}
```
> **用之前先自问**：类目是不是 ≤6？是的话改用分段条。

### ④ 流程图 flow（流程 / 管线 / 漏斗 / 阶段流转）★ V2 新增
```css
.flow{display:flex;align-items:flex-start;gap:0;flex-wrap:wrap}
.fnode{display:flex;flex-direction:column;align-items:center;gap:8px;min-width:104px}
.fcircle{width:64px;height:64px;border-radius:50%;display:flex;flex-direction:column;
  align-items:center;justify-content:center;color:#fff;box-shadow:0 12px 24px -12px rgba(20,60,60,.5)}
.fcircle .fnum{font-family:var(--en);font-weight:700;font-size:21px;line-height:1}
.fcn{font-size:13px;font-weight:700;color:var(--ink)}
.fen{font-size:9.5px;letter-spacing:1.3px;text-transform:uppercase;color:#94A3B8;font-family:var(--en)}
.famt{font-family:var(--en);font-size:12px;font-weight:700;color:var(--muted)}
.farrow{flex:1;min-width:26px;height:64px;display:flex;align-items:center;color:#CBDAD8}
.fnode.exception .fcircle{background:none;border:1.5px dashed #D6455B;color:#D6455B}
```
规则：
- 圆节点 + 箭头连接，节点内放**数量**，节点下放**中文名（13px 粗）+ 英文小型大写副标签**，再下放金额等副指标。
- **异常态（冻结/驳回/流失）用虚线圆圈**，用一条竖虚线与主链路隔开，**挂在主链路末端外侧**，不要混进正常流程里。
- 节点可点击联动下方表格筛选；**联动要可撤销**（再点取消）。
- 口径与下方表格不一致时（客户数 vs 项目数）加提示条说明，**不要造数据凑齐**。

### ⑤ 横条 + 右值（列表 / 排行）
```css
.bar{flex:1;height:9px;border-radius:5px;background:#EAF1F1;overflow:hidden}
.bar>i{display:block;height:100%;border-radius:5px}
```
归一化 `width = v/max*100%`；右值 Outfit 固定宽右对齐；**领先项品牌色，其余中性灰**。

### ⑥ 平滑多线（趋势）
```js
function smooth(p){if(p.length<2)return"";let d=`M ${p[0][0]} ${p[0][1]}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;
  d+=` C ${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`;}
 return d;}
```
配色 `蓝 #4D9DE8 / 深 navy #1B2430 / 绿 #3FB36A`，自底向上画、主线在最上层；**放大高度**（H≈380）、**X 刻度稀疏**、**不堆面积填充**、补图例；量级差异大上双 Y 轴。数据点带白心圆点 + hover tooltip。

### ⑦ 柱状排行（领先高亮）
仅 rank 0 用绿渐变 `#A7E885→#34A85E`，其余中性 `#E4EBE9→#C2CFCA`；数值标签领先深绿加粗 `#1F6F4A`，其余 `#94a3b8`。

### ⑧ 结构堆叠条（单值拆解）★ V2 新增
把一个金额拆成互斥的几段，**每段必须独立计算，不能重复计入**：
```js
const collected        = row.collected;                          // 已回款
const invoicedNotColl  = Math.max(row.invoiced - row.collected, 0); // 已开票未回款
const uninvoiced       = Math.max(row.contract - row.invoiced, 0);  // 合同未开票部分
// 三段之和 === contract，画之前先 assert 一次
```
图例文案要说清口径（"合同未开票部分"而不是含糊的"待开票/待回款"）。用在表格行展开区，`max-height` 过渡。

### ⑨ KPI mini 图（卡内点缀）
胶囊数据条、条码式细柱、半环仪表、sparkline。保持**小而克制**，别和主数字抢。

---

## 四、主次七律与配色判断

1. **不要同色铺满** —— 一组对比里先问"谁是主角"。主角品牌色，其余中性灰 `#E4EBE9→#C2CFCA`，数值标签同步分级。
2. **不要一行多根等长条** —— 单一主条（共用标尺）+ 数值副指标。
3. **0 数据不画空条** —— 收进「待发布 · N」小分区。
4. **数据扁平时弱化面积对比** —— 用分段条/厚环讲结构。
5. **颜色 = 含义，不是装饰**。正向达标绿 / 品牌强调 teal 蓝 / 风险过期红橙 / 中性排期灰。
6. **（V2）圆环留给"一个数"，构成留给"分段条"**。
7. **（V2）中英混排**提升信息密度：中文主标签 13px 粗 + 英文副标签 9.5px `uppercase` `letter-spacing:1.3px` `#94A3B8`。

**轨道统一**：所有横条/环的底轨用 `#EAF1F1 / #E6EEEE`，保持一致的"空"底。
**一数一色**：每个数字最多一个强调色，能不上色就不上色。

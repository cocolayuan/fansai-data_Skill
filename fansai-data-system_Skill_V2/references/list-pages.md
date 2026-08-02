# 列表页配方 · V2 新增

配合 `SKILL.md §7` 使用。列表页是数据中台出现频率最高的页型，这里给可直接复制的实现。

## 目录
- [一、表格式 vs 卡片式](#一表格式-vs-卡片式)
- [二、操作列三段式](#二操作列三段式)
- [三、行内小组件](#三行内小组件)
- [四、卡片式列表三栏栅格](#四卡片式列表三栏栅格)
- [五、工具栏与筛选](#五工具栏与筛选)
- [六、主从两栏列表页（左目录 + 右详情）](#六主从两栏列表页左目录--右详情)

---

## 一、表格式 vs 卡片式

| 情况 | 用 |
|---|---|
| 字段少、以数值/状态/日期为主（项目管理、供应商列表） | **表格** |
| 字段多且长：简介 + 标签组 + 图片/视频 + 商务信息（创作者列表） | **卡片式列表**，一行一张卡 |
| 数据按主题分组、需先选类目再看明细（流程配置 · 字段字典） | **主从两栏**，左目录 + 右详情，见[第六节](#六主从两栏列表页左目录--右详情) |

表格要点：
- `tbody td` 竖向 padding **≥20px**（推荐 22px）。
- **斑马纹**：奇偶行 `transparent` / `rgba(255,255,255,.55)`；展开的详情行跟随主行同色。
- **点击行展开**派生结构（结构堆叠条），`max-height` 过渡。
- **点击表头排序**，空值排末尾。
- 状态一律 pill（色点 + 文字 + 浅底）。

---

## 二、操作列三段式

```
[图标] [图标]  │  [次级按钮]  [主按钮]
查看详情 了解进度 │  实施安排    交付/立项审批
```

```css
.opgroup{display:flex;align-items:center;gap:8px;justify-content:flex-start}  /* 整组左对齐 */
.opicon{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;
  background:rgba(255,255,255,.7);border:1px solid var(--line);color:var(--muted);cursor:pointer;
  transition:.16s;position:relative}
.opicon svg{width:17px;height:17px}
.opicon:hover{color:var(--teal);border-color:rgba(0,138,168,.35);background:#fff;
  transform:translateY(-1px);box-shadow:0 10px 20px -12px rgba(0,138,168,.4)}
.opicon .otip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  background:var(--ink);color:#fff;font-size:11px;padding:5px 9px;border-radius:8px;
  white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .14s}
.opicon:hover .otip{opacity:1}
.opdivider{width:1px;height:22px;background:var(--line);flex:0 0 auto}
.opsec{padding:9px 16px;border-radius:13px;font-size:12.5px;font-weight:700;cursor:pointer;
  color:var(--teal2);background:rgba(0,138,168,.07);border:1px solid rgba(0,138,168,.18)}
.opcta{padding:9px 18px;border-radius:13px;font-size:12.5px;font-weight:700;cursor:pointer;
  color:#fff;background:var(--ink);border:none;box-shadow:0 12px 22px -12px rgba(20,30,40,.55)}
```

规则：
- 前两个**图标按钮**（轻量/信息类操作），后两个**纯文字按钮，都不带图标**。
- 主按钮**统一墨黑 `--ink` 实底白字**，不按状态变彩色渐变。
- 中间 1px 竖分隔线分开「轻量」与「决策」。
- **终态行主按钮完全不渲染**，右边自然留白，不放灰色占位按钮：

```js
const APPROVAL_RULES = {
  '立项审核中':  {label:'立项审批', next:'合同审核通过'},
  '立项驳回':    {label:'立项审批', next:'立项审核中'},
  '合同审核通过':{label:'交付审批', next:'执行中'},
  '执行中':      {label:'交付审批', next:'交付完成'},
  '交付完成':    {label:'已完成',   next:null},   // next 为 null → 不渲染主按钮
  '已关闭':      {label:'已关闭',   next:null},
};
const rule = APPROVAL_RULES[row.status];
const cta = rule && rule.next ? `<button class="opcta">${rule.label}</button>` : '';
```

无后端时的本地演示必须 disclose：
```js
function doApprove(p){
  p.status = APPROVAL_RULES[p.status].next;
  render();
  toast(`已推进到「${p.status}」。原型演示，仅本地生效，不会写入实际系统。`);
}
```

---

## 三、行内小组件

### 人名 + 头像（hash 确定性取色）
```js
const AV_PALETTE=['linear-gradient(140deg,#9ADCCB,#49B6D8)','linear-gradient(140deg,#A7E885,#34A85E)',
  'linear-gradient(140deg,#FFD9A0,#E8854A)','linear-gradient(140deg,#B7C9FF,#5B7CE8)','linear-gradient(140deg,#F5B8C8,#D6455B)'];
function hashStr(s){let h=0;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function avGrad(name){ return AV_PALETTE[hashStr(name)%AV_PALETTE.length]; }
```
```css
.ownerav{width:27px;height:27px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:12px;font-weight:700;flex:0 0 auto}
```
**同一人永远同一个颜色，不随机。**

### 组织首标（客户/公司/供应商）—— 与人名头像规则相反

```css
/* 圆角方形 · 统一淡薄荷底 · 淡蓝灰字 · 不做彩色区分 */
.clogo{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;
  background:#E9F2F1;border:1px solid rgba(255,255,255,.7);
  color:#93A7B4;font-weight:600;font-size:13px;letter-spacing:.5px;line-height:1}
```
```js
`<span class="clogo">${c.name.slice(0,2)}</span>`   // 默认取前 2 字
```

| | 人名头像 `.ownerav` | 组织首标 `.clogo` |
|---|---|---|
| 形状 | 圆形 27px | 圆角方形 38px |
| 取色 | `hash(name)%N` 彩色渐变 | 固定中性色，**不上色** |
| 字数 | 1 字 | **2 字** |

**别给组织首标上色**：同一行已经有一个承载信息的彩色元素（负责人头像 —— 颜色 = 身份），
再上一个不承载信息的色块会抢注意力，把真正该先读到的客户名称压住。颜色先分配给有含义的那个。

### 撕页式日历徽标（日期）
```css
.datebadge{display:inline-flex;flex-direction:column;width:62px;border-radius:10px;overflow:hidden;
  border:1px solid var(--line);box-shadow:0 6px 14px -8px rgba(20,60,60,.28)}
.datebadge .db-ym{background:linear-gradient(135deg,#5CC0DE,#008aa8);color:#fff;font-family:var(--en);
  font-weight:600;font-size:10.5px;letter-spacing:.3px;text-align:center;padding:4px 0}
.datebadge .db-day{background:#fff;color:var(--ink);font-family:var(--en);font-weight:700;
  font-size:19px;text-align:center;padding:5px 0 6px;line-height:1}
```
```js
`<span class="datebadge">
   <span class="db-ym">${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}</span>
   <span class="db-day">${String(d.getDate()).padStart(2,'0')}</span>
 </span>`
```
**全数字，不要 JAN/FEB 这类英文月份缩写。**

⚠️ **只在日期是辅助信息时用徽标**（签约日、创建日）。日期若是**用来精确核对/排序的主数据**
（入库日期、到期日、结算日），退回完整数字 —— 徽标把年月压成 10.5px 小字，增加读取成本：
```css
.datecell{font-family:var(--en);font-weight:600;font-size:13px;color:var(--ink);white-space:nowrap}
```
```js
d ? `<span class="datecell tnum">${d}</span>` : naSpan     // 2026-07-31
```

### 金额单元格
```css
.amt-collected{color:#1A9E4B;font-weight:700}   /* 已回款 */
.amt-pending  {color:#C77B26;font-weight:700}   /* 待回款 */
```

---

## 四、卡片式列表三栏栅格

```css
.clist{display:flex;flex-direction:column;gap:16px}
.ccard{border-radius:22px;padding:24px 26px;display:grid;
  grid-template-columns:minmax(0,1fr) 620px 210px;gap:24px;transition:.22s}
/* 左：身份+简介（弹性）　中：作品/素材（最大占比）　右：商务信息+操作（最窄） */
.ccard:hover{transform:translateY(-2px);box-shadow:0 30px 60px -30px rgba(20,60,60,.34)}

/* 素材区：两列并排，宁可文字换行也不缩图 */
.wgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.wthumb{position:relative;width:100%;aspect-ratio:16/10;border-radius:15px;overflow:hidden;
  border:1px solid rgba(255,255,255,.6);box-shadow:0 12px 26px -14px rgba(20,60,60,.5)}

/* 右栏 */
.cside{display:flex;flex-direction:column;gap:14px;border-left:1px solid var(--line);padding-left:24px}
.sfield{display:flex;align-items:baseline;justify-content:space-between;gap:10px}
.sfield .sv.na{color:var(--muted2);font-weight:500}   /* 缺失写 — */
.opgroup{margin-top:auto}                              /* 操作组顶到卡片底部 */

@media (max-width:1500px){
  .ccard{grid-template-columns:minmax(0,1fr) 460px}
  .cside{grid-column:1 / -1;border-left:none;border-top:1px solid var(--line);
    padding-left:0;padding-top:18px;flex-direction:row;align-items:center;gap:26px}
}
```

### 长文本截断（双保险）
```js
function truncate(s,n){ if(!s) return s; return s.length>n ? s.slice(0,n)+'…' : s; }
// 渲染时超长挂 title，hover 可看全文
`<div class="cslogan"${c.slogan.length>30?` title="${c.slogan.replace(/"/g,'&quot;')}"`:''}>${truncate(c.slogan,30)}</div>`
```
```css
.cslogan{font-size:13px;font-weight:600;line-height:1.5;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}          /* 签名：30 字 + 单行 */
.cdesc{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}  /* 简介：2 行 */
```

### 身份标识收进名称行
```html
<div class="cname-row">
  <span class="cname">名字</span>
  <span class="ctype">个人</span>
  <span class="cgrade">B级博主</span>   <!-- 墨黑实底徽标，不做浮在头像下的角标 -->
  <span class="clink">↗</span>
</div>
```

### 图片槽位（先验证身份，查不到就留位）
```js
c.avatar ? `<img class="cav-img" src="${c.avatar}" loading="lazy" onerror="this.remove()">` : ''
w.img    ? `<img class="wimg"   src="${w.img}"    loading="lazy" onerror="this.remove()">` : ''
// 图不存在 / 加载失败 → 自动回落到平台色渐变块 + 首字母
```

---

## 五、工具栏与筛选

- 搜索框 + 筛选下拉 + 重置放在**表格标题右侧同行**，不占独立行。
- 下拉一律用**自定义瓦片下拉**（`.dd/.dd-trig/.dd-pop/.dd-opt`），触发器带状态色点，**不用原生 `<select>`**。
- **不重复筛选入口**：上方流程图节点已承担状态筛选，表内就不再放一排状态 chip。
- 重置按钮一并清掉筛选、搜索和排序。
- 页脚写清数据完整度：`源列表共 N 条，此处呈现可完整读取的 M 条`。

---

## 六、主从两栏列表页（左目录 + 右详情）

用于「先选主题、再看明细」的配置类页型（字段字典、分类管理、流程配置）。

### 6.1 栅格与等高（最容易翻车的一步）

```css
/* align-items:stretch 必须写出来，防止后续被改成 start */
.dictgrid{display:grid;grid-template-columns:272px 1fr;gap:22px;align-items:stretch}
@media (max-width:1100px){ .dictgrid{grid-template-columns:1fr} }

/* 两栏都做成 flex 列：min-height:0 是关键，否则内部 overflow 滚动失效 */
.topicpanel,.detailpanel{display:flex;flex-direction:column;min-height:0}

/* 左侧目录吃掉弹性空间，超出自己滚 —— 不写死 max-height */
.topiclist{display:flex;flex-direction:column;gap:5px;flex:1 1 auto;min-height:0;overflow-y:auto}

/* 两栏的底部说明各自压到卡片底部，落在同一条基线 */
.topicfoot{margin-top:auto;padding:14px 12px 0;border-top:1px solid rgba(232,239,239,.8);
  font-size:11px;line-height:1.6;color:var(--muted2)}
.srcnote{margin-top:auto;padding-top:14px;font-size:11px;line-height:1.6;color:var(--muted2)}

/* 面板级空态撑满，切到无数据主题时右栏不塌 —— 用子选择器，别波及表格内 <td class="emptystate"> */
.detailpanel>.emptystate{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center}
```

**症状自查**：截图看两张卡的下沿。左短右长 = 你写了 `align-items:start`，或列表被写死了 `max-height`。

### 6.2 左侧目录行

```css
.topicrow{display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:12px 14px;border-radius:14px;cursor:pointer;font-size:13.5px;font-weight:600;transition:.15s}
.topicrow:hover{background:rgba(0,138,168,.06)}
.topicrow.on{background:var(--ink);color:#fff;box-shadow:0 12px 24px -14px rgba(15,49,50,.5)}
.topicct{font-family:var(--en);font-size:11px;font-weight:700;padding:2px 9px;border-radius:10px;
  background:rgba(148,163,184,.14);color:var(--muted)}
.topicrow.on .topicct{background:rgba(255,255,255,.2);color:#fff}
```
选中态走**墨黑实底**，与主按钮同一套强调语言，不另造蓝色/绿色选中样式。

### 6.3 右栏表头与搜索

主标题（主题名，19–20px 700）+ `共 N 项` 副标题 → **同行右侧**放搜索框，直接复用 `.searchbox` 原规格，不另造尺寸。

- **切主题时清空搜索词**（`searchQ=''`），否则用户看到的是新主题下的假空态。
- **搜索只重渲染 `tbody`**，不整块重建面板 —— 重建会让输入框失焦、光标跳到开头。

### 6.4 状态 tag 与开关按钮互斥取色（重要）

| 元素 | 表达 | 取色 |
|---|---|---|
| 状态 tag | 现在是什么 | `STATUS_STYLE[当前状态]` |
| 开关按钮 | 点了会变成什么 | `STATUS_STYLE[目标状态]` |

```js
const st = STATUS_STYLE[it.status];                     // tag = 当前状态
const nextStatus = it.status==='启用' ? '停用' : '启用';
const bt = STATUS_STYLE[nextStatus];                     // 按钮 = 目标状态
// tag：  style="background:${st.bg};color:${st.fg}"      → 停用行灰 tag
// 按钮： style="background:${bt.bg};color:${bt.fg}"      → 停用行绿色「启用」按钮
```
两者永远互斥。按钮跟着当前状态取色会和 tag 撞成一片，读起来像在重复陈述状态而不是提供操作。

### 6.5 排序类操作列（区别于 §二 的审批类）

```
[上移] [下移] [保存]  │  [启用/停用]  [删除]
```

```css
thead th.opcol, tbody td.opcol{text-align:right}     /* 表头与单元格同时靠右 */
.opgroup{display:inline-flex;align-items:center;gap:7px;justify-content:flex-end}
.opicon[disabled]{opacity:.35;cursor:not-allowed;pointer-events:none}
.optoggle{padding:8px 15px;border-radius:12px;font-size:12px;font-weight:700;
  border:1px solid transparent;cursor:pointer;transition:.16s}
.optoggle:hover{filter:brightness(.96);transform:translateY(-1px)}
```

- **整组右对齐**（审批类操作列是左对齐）：排序/开关是行级微操作，贴右边缘更利于成列扫视。
- **首行禁「上移」、末行禁「下移」**，不做无效点击。
- 上移/下移是真实数组重排：`[list[i-1],list[i]]=[list[i],list[i-1]]`，重排后整表重渲染刷新禁用态。
- 保存/删除守交互底线：toast 明写"原型演示，仅本地生效，不会写入实际系统"／"删除需二次确认，不会真正删除数据"。

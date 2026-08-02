---
name: fansai-data-system-v2
description: >
  Design system for FansAI 数据中台 pages (一级/二级/三级页面) — a mint-glass clean-SaaS UI with
  Apple-style data visualization. Use this whenever building, redesigning, or converting ANY FansAI
  数据中台 page — 数据看板/总数据看板、项目管理、创作者列表、供应商列表、数据总览/创意数据/投放/内容资产/
  账号管理/客户跟踪/AI 生成弹窗, a dashboard, a list page, a detail page, a KPI card row, or a data
  chart — even when the user only says things like "重构这页 UI", "做个数据页", "把这页做得有呼吸感/
  设计感", "画个趋势图/排名/占比", or pastes a 功能与字段文档 and asks for a high-fidelity page.
  V2 adds: 数据诚实铁律(不编字段/示例值打标记/不给真人配未核实的图), 图表选型决策表(占比用分段条不用饼环、
  流程数据用流程图、评分统一表现分环), 列表页规范(操作列三段式、行内小组件、卡片式列表三栏栅格、长文本截断、
  主从两栏左目录+右详情), 单层背景, 并排面板等高与底边对齐, 状态 tag 与开关按钮互斥取色, 语义色注册表. It also nails the classics: page margins (左右 36px), 字重(Noto Sans SC 用 500),
  面包屑式 header, 多个数字同屏布局, 表单与弹窗(自定义瓦片下拉替代原生 select), 图标(IconPark 内联 SVG),
  头像(hash 确定性分配), and HTML→SVG→Figma delivery rules.
---

# FansAI 数据中台 · 页面系统规范 V2

产出 FansAI 内容投放中台高保真页面的统一规范。基调：**Apple-fitness / clean-SaaS / 液态玻璃**，浅色薄荷弥散背景，**无紫无粉**，**呼吸感强**。绿色是强调色不是底色。

工作流：**HTML 高保真 → cairosvg 自检 → Figma 导入版 SVG**。

> 配方代码与范例：
>
> **V2 新增 / 重写**
> - `references/numbers-and-charts.md` — 数字 6 模式 + **图表选型决策表 + 9 类配方**（含 SVG/CSS/JS 代码）🔄 重写
> - `references/charts_components_reference.html` — **图表组件总览页**（每类图表的实时渲染 + 何时用/何时不用 + 可复制代码）🆕
> - `references/list-pages.md` — 列表页（表格式 / 卡片式）、操作列、行内小组件配方 🆕
>
> **从 V1.3 原样继承并已收进 V2 包**（内容未变，V2 可独立安装使用）
> - `references/v1.3-baseline.md` — **V1.3 完整主规范基线**（V2 未重述的细节仍然有效）
> - `references/v1.3-numbers-and-charts.md` — V1.3 原版数字 6 模式 + 图表 7 类配方（用于完整继承与历史对照）
> - `references/forms-and-modals.md` — 表单 / 弹窗 / 瓦片下拉配方
> - `references/customer_tracking_reference.html` — 间距/数字/图表标杆范例
> - `references/header_and_system_reference.html` — 面包屑 header + 系统 UI 标准实现
> - `references/content_asset_modal_reference.html` — 弹窗范例
> - `assets/avatars/avatar01–05.jpg` — 默认头像库

---

## V2 变更 Highlight

V1.3 → V2 是大版本：**从"怎么画得好看"扩展到"画什么、能不能画、以及列表页怎么做"**。

| # | 新增 | 一句话 |
|---|---|---|
| 1 | **§0 数据诚实铁律**（全新，优先级最高） | 不编字段/行/值；缺失留 `—`；示例值必须打「示例」标记；**不给真人配未核实的图**；不新增源页面没有的模块；不自作主张做二级页面 |
| 2 | **图表选型决策表**（§5 与配方文档合并重写） | 先判断数据形态再选图。**占比构成默认分段条，不用饼图/厚环**；**流程性数据用流程图，不用并列色块**；评分/百分比统一走「表现分环 42/4.5」 |
| 3 | **§7 列表页规范**（全新） | 操作列三段式（图标 │ 次级 · 主按钮，整组左对齐、终态不占位）；行内小组件（hash 头像、撕页日历徽标）；**卡片式列表三栏栅格**（视觉资产优先） |
| 4 | **长文本截断规则**（§7） | 签名/slogan 超 30 字截断 `…`，JS + CSS 双保险，`title` 挂全文；简介 2 行 clamp |
| 5 | **单层背景**（§2） | 弥散渐变直接铺满 `body`（`background-attachment:fixed`）+ `max-width:1680px` 居中；**禁止再套一层带圆角投影的 `.shell`** |
| 6 | **语义色注册表**（§1） | `STATUS_STYLE` 一处定义、跨页面**逐字复用**；新语义先翻已有色，不为同一含义造第二套色值 |
| 7 | **交互底线**（§8） | 筛选/排序/展开必须真能用；无后端的操作类按钮可做本地演示，但 toast 必须明写"原型演示，不会写入实际系统" |
| 8 | **代码卫生**（§9） | 删功能连带删死代码；每次改完三件套自检：CSS 括号配平 / `node --check` / grep 失效引用 |
| 9 | **并排面板等高、底边对齐**（§2 新增） | 侧栏 + 主区这类并排卡片**禁用 `align-items:start`**；两栏 `stretch` 等高，各自 flex 列 + 脚注 `margin-top:auto` 压到底，底边落在同一条线上 |

沿用 V1.3 全部内容：设计令牌、字重铁律、36px 边距、面包屑 header、数字 6 模式、表单与弹窗、IconPark 内联 SVG、头像 hash 分配、Figma 交付规则。

### 继承与覆盖规则（重要）

- **V2 = V1.3 完整基线 + V2 新增规则**，不依赖另装 V1.3。V2 未重述的细节继续按 `references/v1.3-baseline.md` 执行。
- 同一主题若没有冲突，V1.3 与 V2 规则同时生效；只有明确写出「V2 修订 / 覆盖」的条目才取代旧默认。
- 当前明确覆盖只有三类：① 占比构成默认由厚环改为分段条（厚环保留为 >6 类或固定占地时的备选）；② 无信息的 KPI 图标 chip 默认移除；③ 中文仍以 500 为基准，但列表行内标题和按钮允许 600–700。

---

## 0. 数据诚实铁律（最高优先级，凌驾于所有视觉偏好）

1. **不编造任何字段、行或数值**。页面上每个数字都要能在源图/源数据里找到出处。
2. **缺失就留 `—`**（`#94A3B8` 弱化），不用 0 或占位数填充。没有评分就画**虚线空环**，不要画成 0 分。
3. **口径不一致时如实说明，不强行对齐**。例：流程图「立项 6」按客户数、表格「立项审核中 3 条」按项目数 → 加提示条讲清差异，而不是造 3 行假数据凑齐。
4. **源数据不完整要标注**。例：源表共 9 条但只有 4 条可读取，页脚写明「源列表共 9 位，此处呈现可完整读取的 4 位」。
5. **用户明确要求的示例值必须打标记**。
   ```html
   <span class="sk">价格带<span class="demotag" title="源页面该列为空，此处为示例报价">示例</span></span>
   ```
   ```css
   .demotag{font-size:9px;font-weight:700;color:#C77B26;background:#FDF1E3;border-radius:5px;padding:1px 5px;cursor:help}
   ```
6. **不给真实、可识别的人配未经核实的图**。博主头像 / 作品封面必须先验证账号身份再接入；查不到就**留图片槽位**，显示平台色占位块。张冠李戴比缺图严重得多。
   ```js
   // 有图就渲染，加载失败自动回落到占位块
   c.avatar ? `<img class="cav-img" src="${c.avatar}" onerror="this.remove()">` : ''
   ```
7. **不新增源页面没有的模块**。任务是"redesign 这一页"就只做这一页 —— 不加 KPI 概览条、不做弹窗、**不做二级页面**。要扩展先问。
8. 派生可视化是允许的（把"合同/开票/回款"拆成结构条），那是对已有字段的重新表达，不是新增数据。

---

## 1. 设计令牌

```css
:root{
  --ink:#1b2430; --ink2:#0f3132; --muted:#64748b; --muted2:#94a3b8; --muted3:#727272;
  --teal:#008aa8; --teal2:#0c7074; --blue:#49B6D8; --green:#8BD98C; --lime:#A7E885;
  --green-deep:#34A85E; --green-ink:#1F6F4A; --line:#e8efef;
  --ok:#1A9E4B; --warn:#C77B26; --err:#D6455B;
  --cn:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;   /* 默认 font-weight:500 */
  --en:"Outfit","Noto Sans SC",sans-serif;                          /* 数字/英文 */
}
body{font-family:var(--cn); font-weight:500;}
```

### 字重规则
- **中文一律 Noto Sans SC + `font-weight:500`**；强调靠字号/颜色/留白，不靠加粗。**V2 局部覆盖**：列表页的行内标题、按钮文案可放宽到 600–700（信息密度高时需要辨识度），正文段落仍守 500。
- **数字与英文用 Outfit**，大数字/领先值/面包屑主级 600–700。
- 含「万/亿/个」或文字型取值（A级/低/进行中）用中文字体（Outfit 缺字会丢）。

### 颜色
- 平台色：小红书 `#FF2741`、抖音/视频号 `#1b2430`、微信 `#07C160`、B站 `#FB7299`。
- 评分分段：≥85 绿 `#3FB36A` / 70–84 蓝 `#49B6D8` / <70 橙 `#FF9F6E`。
- 趋势多线：蓝 `#4D9DE8` + 深 navy `#1B2430` + 绿 `#3FB36A`。
- 金额语义：已回款绿 `#1A9E4B`、待回款橙 `#C77B26`（**都加粗**）；中性金额保持墨色。

### 语义色注册表（V2 新增，重要）
状态 pill 的配色**一处定义、跨页面逐字复用**。新页面直接抄这张表，不要另起色值：

```js
const STATUS_STYLE = {
  '立项审核中':  {bg:'#FDF1E3', fg:'#C77B26'},   // 待办 / 审核中 → 橙
  '合同审核通过':{bg:'#E4EEFB', fg:'#2563EB'},   // 已通过 → 蓝
  '执行中':      {bg:'#E0F4F8', fg:'#008AA8'},   // 进行中 → teal
  '交付完成':    {bg:'#EAF6EE', fg:'#1A9E4B'},   // 完成 → 绿
  '已关闭':      {bg:'#F1F4F4', fg:'#94A3B8'},   // 终止 / 无 → 灰
  '立项驳回':    {bg:'#FDE9EC', fg:'#D6455B'},   // 驳回 / 异常 / 冻结 → 红
};
```
**引入新状态前，先在这张表里找同语义的颜色**（"驳回""异常""冻结"共用同一组红），不要为同一含义造第二套色值。

### 图标（IconPark）
统一用 **IconPark**（Apache-2.0 可商用）。**必须取 SVG 内联**，不用 `<iconpark-icon>` Web 组件/图标字体（否则 SVG→Figma 不可编辑）。outline 描边、`stroke-width≈1.8–2.4`、`round` 端点、`fill:none`、`stroke:currentColor`。放进「浅 tinted bg 色块 + 同色描边图标」的锚点里，尺寸 14–22px。

### 头像
圆形（用户/账号语义），品牌/平台 logo 才用圆角方形。无自定义头像时按 **`hash(id) % N` 确定性分配**，同一人永远同一个，不随机：
```js
function hashStr(s){let h=0;s=String(s);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h;}
function avGrad(name){ return AV_PALETTE[hashStr(name)%AV_PALETTE.length]; }
```
显示尺寸：表格行内 27 / chip 30 / 菜单·页头 42–46 / 表单 48–54 / 卡片 hero 64。

### 组织首标（客户/公司/供应商，V2 新增）

**人名头像上色，组织首标不上色。** 两者规则相反，别套用同一套：

| | 人名头像 | 组织首标 |
|---|---|---|
| 形状 | 圆形 | 圆角方形（`border-radius:12px`） |
| 取色 | `hash(name) % N` 确定性彩色渐变 | **统一淡薄荷底 + 淡蓝灰字，不做彩色区分** |
| 字数 | 首字母 1 字 | **默认取名称前 2 字** |
| 角色 | 承载信息（认人靠颜色） | 只是定位锚点 |

```css
.clogo{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;
  background:#E9F2F1;border:1px solid rgba(255,255,255,.7);
  color:#93A7B4;font-weight:600;font-size:13px;letter-spacing:.5px;line-height:1}
```
```js
`<span class="clogo">${c.name.slice(0,2)}</span>`   // 「百济神州」→ 百济，「Songdio项目」→ So
```

**为什么不上色**：同一行里往往已经有一个承载信息的彩色元素（负责人 hash 头像 —— 颜色等于身份）。
再给一个不承载信息的色块上色，两者抢注意力，而真正该被先读到的客户名称反而被压住。
**颜色是稀缺资源，先分配给有含义的那个**（§5 主次七律第 5 条「颜色 = 含义，不是装饰」在行内组件上的落地）。

同理适用于：供应商 logo、品牌方色块、项目封面占位 —— 除非该实体有**真实且已核实**的品牌色/LOGO 图，否则一律走这套中性首标。

### 玻璃卡
```css
.glass{background:linear-gradient(160deg,rgba(255,255,255,.72),rgba(255,255,255,.5));
  backdrop-filter:blur(24px) saturate(160%);border:1px solid rgba(255,255,255,.78);
  box-shadow:0 24px 54px -28px rgba(20,60,60,.26), inset 0 1px 0 rgba(255,255,255,.65);}
```

---

## 2. 间距、圆角与背景

| 用途 | 值 |
|---|---|
| **页面左右边距** | **36px**（顶部 24–34，底部留足） |
| 区块/卡片 gap | 22–26px（**有联动关系的两块收紧到负 margin，无关模块拉到 40px**） |
| 顶层卡内边距 | 22–26px |
| 子瓦片内边距 | 16–18px |
| 圆角 | 顶层卡 24 / stat 22 / tile 18 / 小卡 16 / chip 12–14 |
| 表格行竖向 padding | **≥20px**（推荐 22px，太窄会局促难读） |

### 背景只铺一层（V2 新增）
```css
body{background:
  radial-gradient(900px 520px at 12% -6%, rgba(154,220,203,.42), transparent 62%),
  radial-gradient(760px 480px at 88% 4%, rgba(73,182,216,.30), transparent 60%),
  #ECF4F2;
  background-attachment:fixed;}
.wrap{max-width:1680px;margin:0 auto;padding:0 36px 48px}
```
**禁止**再套一个带圆角/投影的 `.shell` 容器 —— 「外框底色 + 内层渐变卡」两层结构会让页面看起来像被装进相框。弥散渐变直接铺满 body，内容用 `max-width` 居中约束即可。

区块标题用 `.sublabel`：小标签 + 计数 chip + **向右淡出的分隔线**，比硬线更轻。

### 并排面板必须等高、底边对齐（V2 新增，来自「流程配置」页）

同一行并排的卡片（侧栏 + 主区、左目录 + 右详情、多列 tile），**底边必须落在同一条线上**。
一栏比另一栏短半截、下沿参差不齐，是最容易暴露"拼装感"的破绽 —— 玻璃卡有投影，错位会被放大。

**禁止 `align-items:start`。** 它让每张卡各自按内容收缩，内容一多一少立刻错位：

```css
/* ❌ 错误：两栏各自缩到内容高度，底边参差 */
.grid{display:grid;grid-template-columns:272px 1fr;gap:22px;align-items:start}

/* ✅ 正确：stretch 等高（grid 默认值，写出来是为了防止后续被人改掉） */
.grid{display:grid;grid-template-columns:272px 1fr;gap:22px;align-items:stretch}
```

光靠 `stretch` 只是外框等高，**内容仍会各自顶在上方**。两栏都要做成 flex 列，让中间区域吃掉弹性空间，脚注压到底：

```css
/* 两栏统一：flex 列 + min-height:0（否则内部 overflow 滚动失效） */
.sidepanel,.mainpanel{display:flex;flex-direction:column;min-height:0}

/* 中间的主体区吃掉剩余高度，超出自己滚动 —— 不要写死 max-height */
.sidelist{flex:1 1 auto;min-height:0;overflow-y:auto}

/* 脚注/数据完整度说明顶到卡片底部，两栏的说明文字自然落在同一基线 */
.sidefoot,.srcnote{margin-top:auto}
```

配套三条：

1. **列表区不写死 `max-height`**。写死高度等于放弃等高联动，改用 `flex:1 1 auto` + `min-height:0`，高度由栅格决定、内容超出自己滚。
2. **空态也要撑满**。切到没数据的主题时右栏会塌，给面板级空态 `flex:1 1 auto` 并垂直居中，底边才不会跟着塌下去：
   ```css
   .mainpanel>.emptystate{flex:1 1 auto;display:flex;flex-direction:column;justify-content:center}
   ```
   ⚠️ 用**子选择器**限定，别波及复用同一个类名的表格内空行（`<td class="emptystate">`）。
3. **底部说明加一条上分隔线**（`border-top:1px solid rgba(232,239,239,.8)` + `padding-top:14px`），让它读起来是"卡片的页脚"，而不是漂在末尾的一段灰字。

这条规则是 §4「同一行的卡片没有副标题也要留等高占位」的推广：**顶边对齐管上半身，底边对齐管下半身，两头都要管。**

---

## 3. header（面包屑式）

对照 `references/header_and_system_reference.html`。左侧面包屑胶囊（色点 + 主级粗 + 路径细 300），右侧铃铛 + 头像 + 名字，`topbar` 内边距 `24px 36px 18px`。

- **一级页面**：只显示主级，如 `创作者列表`。
- **二级/三级**：`Materials / AI-generated / 编辑`（主级 `.bmain` 粗、路径 `.bsub` weight 300）。
- 有子标签 Tab 的页，Tab 仍用蓝色下划线激活，与面包屑并存。
- **控件不占独立行**：时间/对比/刷新等筛选控件放到 tab 导航同一行右侧；表格的搜索/重置放到表格标题右侧同行。

**信息优先级**：context（当前平台/账号这类"我在看谁"）是主控，做成醒目 hero；时间范围是次级。

---

## 4. 多个数字的布局

详见 `references/numbers-and-charts.md` 数字 6 模式。铁律：
1. 数值 Outfit + `font-variant-numeric:tabular-nums`；含「万/亿/个」或文字型取值用中文字体。
2. **前缀 + 数值 + 单位 基线对齐**；前缀/单位更小更淡。
3. **一数一色** —— 只给有结论的数字上色，其余保持墨色。
4. 列表数值右对齐 + 固定 `min-width`，成列对齐。
5. **去掉装饰性图标 chip**：不承载信息的彩色图标块直接删掉，别占位置。（V2 修订 V1.3 的「每个指标配色块图标」—— 图标锚点只在需要区分指标类型时保留。）
6. 数据块收紧成组：`label → 数值 → 环比` 三者紧挨，**标题行与数值行之间留 16px**，caption 用 `margin-top:auto` 顶到卡片底部。
7. 逻辑相关的模块**合并进同一个玻璃容器**，别拆成三张漂浮卡片。同一行的卡片没有副标题也要留等高占位，保证绘图区顶边对齐。

---

## 5. 图表：先选型，再画

**完整决策表 + 9 类配方见 `references/numbers-and-charts.md`，实时预览见 `references/charts_components_reference.html`。**

### 选型决策表（V2 核心新增）

| 数据形态 | 用 | 不要用 |
|---|---|---|
| 单个评分 / 百分比 / 完成度 / 毛利率 | **表现分环** 42px·4.5px | 光秃秃的数字、进度条 |
| 占比 / 构成（2–6 类） | **分段条 segbar** + 网格图例 | ~~饼图 / 厚环 donut~~ |
| 占比且类目 >6 或必须固定占地 | 厚环 donut（降级备选） | 长排行条无限下排 |
| 流程 / 管线 / 漏斗 / 阶段流转 | **流程图**（圆节点 + 箭头，异常态虚线旁挂） | 一排并列彩色色块统计条 |
| 排行 / 对比 | 横条 + 右值，**领先高亮其余中性灰** | 根根同色铺满 |
| 时间序列 | 平滑多线（Catmull-Rom） | 堆叠面积填充 |
| 单值的结构拆解（合同→开票→回款） | 结构堆叠条 | 三个独立数字并列 |
| 卡内点缀 | KPI mini 图（sparkline / 胶囊条） | 抢主数字风头的大图 |

### 主次七律（V1.3 五律 + V2 两条）
1. **不要同色铺满** → 领先项品牌色，其余中性灰，数值标签同步分级。
2. **不要一行多根等长条** → 单一主条（共用标尺）+ 数值副指标。
3. **0 数据不画空条** → 收进「待发布 · N」小分区。
4. **数据扁平时弱化面积对比** → 用分段条/厚环讲结构。
5. **颜色 = 含义，不是装饰**。
6. **（V2）圆环留给"一个数"，构成留给"分段条"** —— 环形擅长表达单值进度，一旦切成 3 片以上就不如横向分段条好读、好标注。
7. **（V2）中英混排提升信息密度**：中文主标签（13px 粗）+ 英文小型大写副标签（9.5px、`letter-spacing:1.3px`、`uppercase`、`#94A3B8`）。区块标题也可加 `· Project Pipeline` 这类英文后缀。

---

## 6. 表单与弹窗

详见 `references/forms-and-modals.md`。
- **模态**：scrim（弥散+模糊）+ 玻璃卡（`mhead` / `mbody` 滚动 / `mfoot` 右对齐），左右内边距 36px。
- **不要用原生 `<select>`** → **自定义瓦片下拉**：触发器 pill + CSS 箭头（展开 teal 蓝边）+ 玻璃浮层 + 选项瓦片（选中 = 蓝边 `#49B6D8` + 浅蓝底 `rgba(73,182,216,.1)`）；靠近容器底部用 `.up` 向上展开；状态类触发器带**状态色点**。
- **标签用 chips**（回车/逗号增、× 删、退格删尾）。
- **多指标录入**：加列头；**按状态锁定**（未发布时 `disabled` 置灰归 0）。
- **校验**：必填为空 → 红框 + 抖动 + 行内提示，输入即清除。
- ⚠️ **但是**：任务只说"美化当前页"时，**不要主动造弹窗** —— 见 §0 第 7 条。本节配方只在明确需要表单/弹窗时启用。

---

## 7. 列表页（V2 全新）

详见 `references/list-pages.md`。

### 7.1 选表格还是选卡片
- 字段少、以数值/状态为主 → **表格**（斑马纹 + 点击行展开派生结构 + 点击表头排序，空值排末尾）。
- 字段多且长（简介 + 标签 + 图片/视频 + 商务信息）→ **卡片式列表**，一行一张卡，别硬塞进表格行。

### 7.2 操作列三段式
```
[图标] [图标]  │  [次级按钮]  [主按钮]
查看详情 了解进度 │  实施安排    交付/立项审批
```
- 前两个是**图标按钮**（38×38 圆角方块 + 描边 + hover tooltip）。
- 后两个是**纯文字按钮，都不带图标**：次级 = 浅色描边 pill（teal 系浅底）；主操作 = **统一墨黑 `--ink` 实底白字**，不按状态变彩色渐变。
- 中间 1px 竖分隔线分开"轻量操作"与"决策操作"；**整组左对齐**。
- **终态行（已关闭/已完成）主按钮完全不渲染**，右边自然留白，不放灰色占位按钮凑数。
- 主按钮文案随行状态变化（立项阶段→「立项审批」/ 执行阶段→「交付审批」），**颜色恒定墨黑**。

### 7.3 行内小组件
- **人名配头像**：27px 圆形 + 姓名同行，底色 `hash(name)%N` 确定性取色。
- **日期做撕页式日历徽标**（比一行灰字有仪式感，且不占额外宽度）：
  ```
  上条：YYYY/MM  全数字 · teal 渐变底白字 · Outfit 600 / 10.5px
  下体：日号     白底 · Outfit 700 / 19px
  ```
  **不要用 JAN/FEB 这类英文月份缩写。**

  ⚠️ **适用边界（V2 修订）**：徽标把「年/月」压成 10.5px 小字，只在日期是**辅助信息**（签约日、创建日，扫一眼即可）时用。
  当日期是**用来精确核对/排序的主数据**（入库日期、到期日、结算日）时，**退回完整数字** `2026-07-31`，
  Outfit 600 + `tabular-nums` 成列对齐 —— 徽标化会增加读取成本，为了仪式感牺牲了这一列本来的用途。
  ```css
  .datecell{font-family:var(--en);font-weight:600;font-size:13px;color:var(--ink);white-space:nowrap}
  ```
- 状态一律 pill（色点 + 文字 + 浅底），不用裸文字。

### 7.4 卡片式列表三栏栅格
```css
.ccard{display:grid;grid-template-columns:minmax(0,1fr) 620px 210px;gap:24px;padding:24px 26px;border-radius:22px}
/* 左：身份+简介（弹性）　中：作品/素材区（最大占比）　右：商务信息+操作（最窄） */
@media (max-width:1500px){ .ccard{grid-template-columns:minmax(0,1fr) 460px} }  /* 右栏落到下方横排 */
```
- **视觉资产优先**：有图/视频的列表，素材区拿最大宽度，缩略图**两列并排**、`aspect-ratio:16/10`、圆角 15px。宁可文字换行，也不缩图。
- **长文本一律截断**：
  - 签名/slogan **超 30 字截断加 `…`** —— JS `truncate(s,30)` + CSS `white-space:nowrap;overflow:hidden;text-overflow:ellipsis` 双保险，超长时挂 `title` 让 hover 看全文。
  - 简介用 `-webkit-line-clamp:2`。
- **身份标识收进名称行**：名字 → 类型 tag → 等级徽标（墨黑实底）→ 外链按钮，一行读完，不做浮在头像下的角标。
- 右栏信息用 `label 左 / 值右` 的 `space-between` 行，缺失写 `—`；操作组 `margin-top:auto` 顶到卡片底部。

### 7.5 主从两栏列表页（左目录 + 右详情）

字典/配置/分类管理这类"先选主题、再看明细"的页型（如「流程配置 · 字段字典」）：

```css
.dictgrid{display:grid;grid-template-columns:272px 1fr;gap:22px;align-items:stretch}
@media (max-width:1100px){ .dictgrid{grid-template-columns:1fr} }
```

- **左栏是目录不是筛选器**：每行「名称 + 计数 chip」，选中行走**墨黑实底**（与主按钮同一套强调语言），计数 chip 在选中态转成半透明白底。
- **两栏等高、底边对齐**，按 §2「并排面板必须等高」执行 —— 这是本页型最容易翻车的地方。
- **右栏表头三段**：主标题（主题名）+ `共 N 项` 副标题 → 同行右侧放搜索框（复用 `.searchbox` 原规格，别另造一个）。
- **切换主题时清空搜索词**，否则用户会看到"新主题下没有结果"的假空态。
- **搜索只重渲染 `tbody`**，不要整块重建面板 —— 重建会让输入框失焦、光标跳到开头。

#### 状态 tag 与开关按钮必须互斥（重要）

一行里同时出现「状态 tag」和「启用/停用 按钮」时，两者**颜色不能相同**：

| 元素 | 表达 | 取色 |
|---|---|---|
| 状态 tag | 现在是什么 | `STATUS_STYLE[当前状态]` |
| 开关按钮 | 点了会变成什么 | `STATUS_STYLE[目标状态]` |

```js
const st = STATUS_STYLE[it.status];                          // tag：当前状态
const nextStatus = it.status==='启用' ? '停用' : '启用';
const bt = STATUS_STYLE[nextStatus];                          // 按钮：目标状态
```
结果：停用行 = 灰 tag + **绿色「启用」按钮**；启用行 = 绿 tag + **灰色「停用」按钮**。
按钮跟着当前状态取色会和 tag 撞成一片，读起来像在重复陈述状态而不是提供操作。

#### 排序类操作列

上移/下移/保存（图标） │ 启用/停用（文字 pill） │ 删除（危险图标），**整组右对齐**（区别于 §7.2 审批类操作列的左对齐 —— 排序/开关是行级微操作，贴右边缘更利于成列扫视）：

```css
thead th.opcol, tbody td.opcol{text-align:right}
.opgroup{display:inline-flex;align-items:center;gap:7px;justify-content:flex-end}
```
- **首行禁用「上移」、末行禁用「下移」**（`disabled` + `opacity:.35` + `pointer-events:none`），不做无效点击。
- 上移/下移是**真实的数组重排**，不是装饰：`[list[i-1],list[i]]=[list[i],list[i-1]]`。
- 删除仍守 §8：toast 说明"需二次确认 · 原型演示，不会真正删除数据"。

---

## 8. 交互底线

- 所有筛选、排序、展开、联动**都要真实可用**，不做静态假页面。
- 无数据的 tab 明确提示"暂无可展示数据"，不伪造内容。
- 联动筛选要可撤销（再点取消 / 清除按钮 / 重置按钮）；重置一并清掉筛选、搜索和排序。
- 没有真实后端的"操作类"按钮（创建、审批等）：允许做本地状态演示，但 **toast 必须明写"原型演示，仅本地生效，不会写入实际系统"**。
- toast 反馈要**有信息量**（报当前阶段、第几步、下一步是什么），不是空泛的"操作成功"。源数据没有的字段，toast 老实说"源数据未提供，不做编造展示"，并给出已有的相关真实字段兜底。

---

## 9. 自检与交付

- **每次改完三件套**：CSS 花括号配平 / JS `node --check` / grep 确认无失效引用。
- **删功能连带删死代码**：去掉按钮图标后，对应的 `ICON_*` 常量、`tone` 字段、孤立 CSS 类一并删除。
- **容器无浏览器**，不能截 HTML。用 `cairosvg` 栅格化 SVG 自检；数据驱动渲染就 node 模拟 `document` 跑通 + 计数自检。
- **SVG → Figma**：真实 `<text>` 可编辑图层；整数坐标；间距与 HTML 一致；**禁 8 位十六进制透明色**（改 `fill`+`fill-opacity`）；中文 `Noto Sans SC, PingFang SC`。
- 真实数据不清洗；示意数据标 sample。

---

## 10. 交付前自查清单

**数据**
- [ ] 每个数字都能在源数据里找到出处；缺失写 `—` 不写 0。
- [ ] 示例/演示值挂了「示例」标记。
- [ ] 真人头像/封面已核实身份，否则留空位不硬配图。
- [ ] 没有凭空新增源页面不存在的模块或二级页面。

**排版**
- [ ] 页面左右边距 36px，间距走 §2 阶梯；背景**只铺一层**。
- [ ] 中文 Noto Sans SC 500 基准；粗体留给 Outfit 数字/英文。
- [ ] 面包屑 header：一级只显主级，二三级主级粗 + 路径细。
- [ ] 表格行竖向 padding ≥20px。
- [ ] **并排面板等高**：无 `align-items:start`；两栏 flex 列 + 脚注 `margin-top:auto`，底边齐平；空态也撑满。

**数字与图表**
- [ ] tabular-nums；前缀/单位基线对齐且更小更淡；含「万」走中文字体。
- [ ] 一数一色，只给有结论的数字上色。
- [ ] 按选型决策表选图：占比用分段条、流程用流程图、评分用表现分环 42/4.5。
- [ ] 无同色铺满、无一行多等长条、0 数据归「待发布」。

**列表页**
- [ ] 操作列三段式、整组左对齐、终态不放占位按钮、主按钮墨黑无图标。
- [ ] 排序类操作列整组右对齐；首行禁上移 / 末行禁下移。
- [ ] 状态 tag 与开关按钮**互斥取色**（tag=当前状态，按钮=目标状态），没有撞成同色。
- [ ] 组织首标走中性色（2 字、不 hash 上色）；只有人名头像才彩色。
- [ ] 日期是主数据时用完整数字，只有辅助日期才做撕页徽标。
- [ ] 状态 pill 直接复用 `STATUS_STYLE`，没有新造同语义色。
- [ ] 长文本截断（slogan 30 字 / desc 2 行 clamp）。

**交互与代码**
- [ ] 筛选排序展开真能用；演示型操作 toast 有 disclose。
- [ ] CSS 括号配平 / `node --check` 通过 / 无失效引用。
- [ ] 回复中文、简洁，末尾给 2–3 个下一步选项。

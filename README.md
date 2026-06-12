# fansai-data_Skill

FansAI 数据中台页面系统 Skill —— 薄荷液态玻璃 clean-SaaS 风格,Apple 式数据可视化,覆盖二级/三级页面、表单弹窗、图表与数字布局的统一规范。当前版本 **V1.3**。

## 🧪 Testing Demo Preview

| Demo | 预览 | 说明 |
|---|---|---|
| 账号中心 | **https://fansai-data-skill-demos.vercel.app/account_center_redesign.html** | 面包屑 header、用户下拉菜单、资料表单、默认头像库 + `hash(id)%N` 确定性分配 + 头像选择器 |
| 新增内容资产弹窗 | **https://fansai-data-skill-demos.vercel.app/content_asset_modal_redesign.html** | 玻璃模态、自定义瓦片下拉、标签 chips、渠道分发指标网格按状态锁定、必填校验 |

demo 源码见 [`demos/`](demos/)。

## 核心 System Components

- **设计令牌** — 墨色 `#1b2430` / teal `#008aa8` / 蓝 `#49B6D8` / 绿系强调;浅色薄荷弥散背景,无紫无粉,绿色是强调色不是底色
- **字体字重铁律** — 中文 Noto Sans SC 一律 **500**(不用 600/700);数字/英文用 Outfit(可 600–700);含「万/亿」的数值走中文字体
- **液态玻璃卡** — 半透明白渐变 + `backdrop-filter: blur(24px)` + 内描白边,统一 `.glass` 配方
- **间距节奏** — 页面左右边距 **36px**;卡片 gap 22–26 / 顶层卡 padding 22–24 / 圆角阶梯 24→22→18→16→12
- **面包屑 header** — 一级页 `Materials`(粗);二三级 `Materials / AI-generated / …`(主级粗、路径细 300);右侧铃铛 + 头像 + 名字
- **数字布局 6 模式** — Outfit + tabular-nums;前缀+数值+单位基线对齐;只给有结论的数字上色;每个指标配浅色块图标锚点
- **图表 7 类配方 + 主次五律** — 浅轨道+数据+右值范式;领先项高亮其余中性灰;不画一行多等长条;0 数据归「待发布」;占比用厚环
- **表单与弹窗** — 玻璃模态(mhead/mbody/mfoot);**自定义瓦片下拉替代原生 select**(选中蓝边浅蓝底,底部向上展开,状态类带色点);标签 chips;多指标网格按状态锁定;必填红框+抖动校验
- **图标** — IconPark(Apache-2.0),**取 SVG 内联**不用 Web 组件/字体(保证 SVG→Figma 可编辑);outline 描边 + `currentColor`
- **头像** — 圆形;默认头像库 5 个抽象渐变,按 `hash(id) % N` 确定性分配(同一用户固定不随机),上传自定义后覆盖
- **交付链路** — HTML 高保真 → cairosvg 自检 → Figma 导入版 SVG(整数坐标、真实 text 层、禁 8 位透明色)

## 版本演进 V1.0 → V1.3

| 版本 | 新增 |
|---|---|
| **V1.0** | 基础规范定型:页面左右边距统一 36px;中文 Noto Sans SC 字重 500;header 改为面包屑式 |
| **V1.1** | 新增「表单与弹窗」节:玻璃模态、自定义瓦片下拉、标签 chips、指标网格按状态锁定、必填校验(+ `forms-and-modals.md` 与弹窗范例) |
| **V1.2** | 新增图标规范:统一 IconPark,SVG 内联(非 Web 组件/字体),outline 描边 + `currentColor` |
| **V1.3** | 新增头像规范:默认头像库 `avatar01–05`、`hash(id)%N` 确定性分配、上传覆盖、圆形与安全区(+ `assets/avatars/`) |

## Skill 明细(V1.3)

| 文件 | 说明 |
|---|---|
| [`SKILL.md`](fansai-data-system_Skill_V1.3/SKILL.md) | 主规范:令牌 / 字重 / 间距 / header / 数字 / 图表 / 表单弹窗 / 图标 / 头像 / 自检清单 |
| [`references/numbers-and-charts.md`](fansai-data-system_Skill_V1.3/references/numbers-and-charts.md) | 数字 6 模式 + 图表 7 类配方(含 SVG/CSS/JS 代码) |
| [`references/forms-and-modals.md`](fansai-data-system_Skill_V1.3/references/forms-and-modals.md) | 表单 / 弹窗 / 瓦片下拉完整配方代码 |
| [`references/customer_tracking_reference.html`](fansai-data-system_Skill_V1.3/references/customer_tracking_reference.html) | 间距 / 数字 / 图表标杆页面范例 |
| [`references/header_and_system_reference.html`](fansai-data-system_Skill_V1.3/references/header_and_system_reference.html) | 面包屑 header + 系统 UI 标准实现 |
| [`references/content_asset_modal_reference.html`](fansai-data-system_Skill_V1.3/references/content_asset_modal_reference.html) | 弹窗范例(新增内容资产) |
| [`assets/avatars/avatar01–05.jpg`](fansai-data-system_Skill_V1.3/assets/avatars/) | 默认头像库(5 个抽象渐变) |
| [`fansai-data-system_Skill_V1.3.skill`](fansai-data-system_Skill_V1.3.skill) | 打包版 skill(zip),可直接导入使用 |

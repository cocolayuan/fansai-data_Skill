# fansai-data_Skill

FansAI 数据中台页面系统 Skill —— 薄荷液态玻璃 clean-SaaS 风格、Apple 式数据可视化，覆盖一级/二级/三级页面、列表、表单弹窗、图表与数字布局的统一规范。当前版本 **V2.1 = V2 完整基线 + 全系统工作台与复合数据页增量**。

> [下载可独立导入的 V2.1 Skill 包](fansai-data-system_Skill_V2.1.skill) · [查看 V2.1 主规范](fansai-data-system_Skill_V2.1/SKILL.md) · [查看飞书知识库](https://ycnlw8azhiz2.feishu.cn/wiki/P9FWwJHEXi8zHMkIUfOcasnwnZc?fromScene=spaceOverview)

## 🆕 New Demo Preview

以下为当前持续更新的新版本，可通过独立的 GitHub Pages 链接直接预览。

| Demo | 在线预览 | 简单说明 |
|---|---|---|
| 数据看板 · 管理层看板 | [打开管理层看板](https://cocolayuan.github.io/fansai-data_Skill/demos/management_dashboard_redesign.html) | 全公司经营目标、团队推进、线索转化、客户与现金流洞察 |
| 客户资料 | [打开客户资料](https://cocolayuan.github.io/fansai-data_Skill/demos/customer_profile_redesign.html) | 客户库与线索池、节奏与表格双视图、独立时间轴及统一业务弹窗 |

## 🗃️ Archived Demo Preview

以下为历史归档 Demo。链接仍由 GitHub Pages 提供，可直接在浏览器中打开；源码与本地图片资源见 [`demos/`](demos/)。

| Demo | 在线预览 | 简单说明 |
|---|---|---|
| 数据看板 · 业务层看板 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/business_dashboard_redesign.html) | 个人目标、线索客户、项目推进、开票回款与日程联动 |
| 数据看板 · 执行层看板 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/execution_dashboard_redesign.html) | 团队排期、负载预警、交付节点与外部团队验收状态 |
| 项目管理 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/project_management_redesign.html) | 状态筛选、表头排序、撕页日期与三段式操作列 |
| 创作者列表 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/creator_list_redesign.html) | 三栏卡片列表、作品视觉优先、长文本截断与真实图片槽位 |
| 供应商列表 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/vendor_list_redesign.html) | 自定义瓦片筛选、列表排序、组织首标与负责人头像 |
| 流程配置 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/workflow_configuration_redesign.html) | 左目录 + 右详情等高双栏，支持主题切换、搜索、排序与启停 |
| 生成任务 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/task_generation_redesign.html) | 搜索与多维筛选、完整日期及数据诚实表格 |
| 账号中心 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/account_center_redesign.html) | 面包屑 header、资料表单、默认头像库与确定性头像分配 |
| 新增内容资产弹窗 | [打开 Demo](https://cocolayuan.github.io/fansai-data_Skill/demos/content_asset_modal_redesign.html) | 玻璃模态、瓦片下拉、标签 chips、指标锁定与必填校验 |

## 核心 System Components

- <kbd>UPDATE · V2</kbd> **数据诚实铁律** —— 不编字段、行或数值；缺失留 `—`；示例值必须标记；不给真人配未经核实的图片；不擅自新增模块或二级页面
- <kbd>UPDATE · V2</kbd> **图表先选型再绘制** —— 单值评分用表现分环，占比构成默认用分段条，流程数据用流程图，排名坚持领先高亮、其余中性
- <kbd>UPDATE · V2</kbd> **列表页系统化** —— 表格 / 卡片 / 主从双栏三类页型；三段式操作列、组织首标、确定性人名头像、日期适用边界与长文本截断
- <kbd>UPDATE · V2</kbd> **布局与交互底线** —— 单层弥散背景，并排面板等高且底边对齐；筛选、排序、展开、联动真实可用；本地原型操作必须明确说明仅本地生效
- <kbd>NEW · V2.1</kbd> **全系统工作台与复合数据页** —— 主从实体层级、默认/审计双视图、局部时间轴、固定操作列、分组菜单与统一弹窗家族；客户资料是完整范例
- **设计令牌与排版** —— 墨色 `#1b2430`、teal `#008aa8`、蓝 `#49B6D8`；页面左右边距 36px；中文以 Noto Sans SC 500 为基准，数字与英文用 Outfit
- **数字与表单** —— 数字前缀 / 数值 / 单位基线对齐；自定义瓦片下拉替代原生 `select`；标签 chips、多指标状态锁定与必填校验
- **图标与头像** —— IconPark 内联 SVG；头像圆形并按 `hash(id) % N` 确定性分配，上传后覆盖
- **交付链路** —— HTML 高保真 → cairosvg 自检 → Figma 导入版 SVG；真实数据不清洗，示意数据明确标记

## 版本演进 V1.0 → V2.1

| 版本 | 新增 |
|---|---|
| **V1.0** | 基础规范定型：36px 页面边距、Noto Sans SC 500、面包屑式 header |
| **V1.1** | 新增表单与弹窗：玻璃模态、瓦片下拉、标签 chips、指标锁定与校验 |
| **V1.2** | 新增 IconPark 内联 SVG 图标规范 |
| **V1.3** | 新增默认头像库、`hash(id) % N` 确定性分配与上传覆盖 |
| **V2** | 完整继承 V1.3，再新增数据诚实、图表选型决策、列表页系统、单层背景、等高面板、语义色注册表、交互底线与代码卫生 |
| **V2.1** | 完整继承 V2，新增全系统主从层级、双视图、局部时间轴、固定操作、菜单与统一弹窗家族；客户资料为首个完整业务映射 |

## Skill 明细（V2.1，当前版本）

V2.1 在 V2 基线上收纳全系统工作台与复合数据页规则，并附客户资料完整交互范例，可独立安装，不依赖旧版本目录。

| 文件 | 说明 |
|---|---|
| [`SKILL.md`](fansai-data-system_Skill_V2.1/SKILL.md) | V2.1 主规范：完整 V2 基线 + 全系统工作台与复合数据页入口与铁律 |
| [`references/system-workbench-patterns.md`](fansai-data-system_Skill_V2.1/references/system-workbench-patterns.md) | 全系统主从层级、双视图、局部时间轴、固定操作、菜单、弹窗与场景选择规则 |
| [`references/customer_workbench_reference.html`](fansai-data-system_Skill_V2.1/references/customer_workbench_reference.html) | 客户资料完整交互范例：展示双视图、时间轴、菜单、下拉、日历和弹窗的实际组合 |
| [`references/`](fansai-data-system_Skill_V2.1/references/) | V2 数字、图表、列表、表单及 V1.3 完整基线参考 |
| [`assets/avatars/`](fansai-data-system_Skill_V2.1/assets/avatars/) | 默认头像库（5 个抽象渐变头像） |
| [`agents/openai.yaml`](fansai-data-system_Skill_V2.1/agents/openai.yaml) | V2.1 Skill 列表显示名称、简介与默认调用提示 |
| [`fansai-data-system_Skill_V2.1.skill`](fansai-data-system_Skill_V2.1.skill) | V2.1 自包含打包版，可直接下载导入 |

## Skill 明细（V2）

V2 已把 V1.3 完整主规范、表单、header、参考页面和头像资源收进同一个目录，可独立安装，不依赖旧版本目录。若新旧规则冲突，仅以 V2 主规范中明确标注的「V2 修订 / 覆盖」为准。

| 文件 | 说明 |
|---|---|
| [`SKILL.md`](fansai-data-system_Skill_V2/SKILL.md) | V2 主规范：设计决策、页面结构、数据诚实、列表、图表、交互与交付自检 |
| [`references/v1.3-baseline.md`](fansai-data-system_Skill_V2/references/v1.3-baseline.md) | V1.3 完整主规范基线；保留 V2 未重述的全部细节 |
| [`references/v1.3-numbers-and-charts.md`](fansai-data-system_Skill_V2/references/v1.3-numbers-and-charts.md) | V1.3 原版数字与图表配方；供完整继承和历史对照 |
| [`references/numbers-and-charts.md`](fansai-data-system_Skill_V2/references/numbers-and-charts.md) | 数字 6 模式 + 图表选型决策表 + 9 类图表配方 |
| [`references/list-pages.md`](fansai-data-system_Skill_V2/references/list-pages.md) | 表格式 / 卡片式 / 主从双栏列表与操作列、行内组件配方 |
| [`references/charts_components_reference.html`](fansai-data-system_Skill_V2/references/charts_components_reference.html) | 可交互的 V2 图表组件总览与代码示例 |
| [`references/forms-and-modals.md`](fansai-data-system_Skill_V2/references/forms-and-modals.md) | 从 V1.3 继承的表单、弹窗与瓦片下拉配方 |
| [`references/`](fansai-data-system_Skill_V2/references/) | header、客户跟踪、内容资产弹窗等高保真参考页 |
| [`assets/avatars/`](fansai-data-system_Skill_V2/assets/avatars/) | 默认头像库（5 个抽象渐变头像） |
| [`agents/openai.yaml`](fansai-data-system_Skill_V2/agents/openai.yaml) | Skill 列表显示名称、简介与默认调用提示 |
| [`fansai-data-system_Skill_V2.skill`](fansai-data-system_Skill_V2.skill) | 自包含打包版，可直接下载导入 |

历史版本仍保留在 [`fansai-data-system_Skill_V1.3/`](fansai-data-system_Skill_V1.3/)。

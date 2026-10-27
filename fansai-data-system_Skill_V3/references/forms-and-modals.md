# 表单与弹窗 · V3 配方与代码

配合 `SKILL.md` 的「表单与弹窗」节。`content_asset_modal_reference.html` 是继承的历史结构范例；其选项描边、卡片用色与点击 span 配方不再是 V3 默认。审批特殊布局另见 [审批与交互](approval-and-interaction.md)。

## 目录
- [一、模态结构](#一模态结构)
- [二、字段、标签、焦点](#二字段标签焦点)
- [三、自定义瓦片下拉（替代原生 select）](#三自定义瓦片下拉替代原生-select)
- [四、标签 chips 输入](#四标签-chips-输入)
- [五、多指标录入网格 + 按状态锁定](#五多指标录入网格--按状态锁定)
- [六、校验态](#六校验态)

> 总原则:**不要用浏览器原生 `<select>`**(各系统样式不一、和玻璃风格冲突)→ 一律用第三节的自定义瓦片下拉。输入框走玻璃风;焦点 teal 蓝边 + 柔光环;必填给红框+抖动;入场给轻动画。正文中文字重500；业务主标题采用主规范V3的局部加粗规则。

---

## 一、模态结构

居中遮罩 + 弹窗三段结构（标题/关闭 · 可滚动主体 · 底部操作）。审批弹窗内容底层极浅灰蓝绿，其上白色前景；普通表单继续白色/玻璃容器。避免所有层都染色或反复套线框。

```css
.scrim{position:fixed;inset:0;display:grid;place-items:center;padding:24px;
  background:rgba(38,56,67,.20);backdrop-filter:blur(8px)}
.modal{width:min(984px,100%);max-height:calc(100dvh - 48px);display:flex;flex-direction:column;
  min-height:0;overflow:hidden;border-radius:28px;background:rgba(255,255,255,.94);
  backdrop-filter:blur(24px);box-shadow:0 32px 90px -30px rgba(25,44,58,.30)}
.mhead{flex:0 0 auto;padding:24px 30px 18px}
.mbody{flex:1;min-height:0;overflow-y:auto;padding:24px 30px}
.approval-modal .mbody{background:#F1F6F6}
.form-section,.approval-sheet{background:#fff;border:0;border-radius:20px;padding:24px}
.mfoot{flex:0 0 auto;display:flex;justify-content:flex-end;gap:12px;
  padding:16px 30px;background:#fff;border-top:1px solid var(--line)}
@media(max-width:600px){.scrim{padding:16px}.modal{max-height:calc(100dvh - 32px)}
  .mhead,.mbody,.mfoot{padding-left:20px;padding-right:20px}}
```

关闭按钮始终可见；开窗后焦点进入对话框，Tab不逃逸，Esc/关闭按既有业务规则退出，结束回到触发点。实现可使用原生`<dialog>`或等效可访问组件。弹窗内普通提交主操作墨色、取消次级；转交等局部确认遵循审批操作分层。

下拉挂到不受滚动裁切的浮层根节点，以视口定位并自动翻转。若使用原生`<dialog>`顶层，需要将 portal 放在该对话框内的非裁切浮层根节点，并核对焦点锁兼容；不能把浮层放到被浏览器标为 inert 的外部 body。

## 二、字段、标签、焦点

```css
.field{margin-bottom:20px} .grid2{display:grid;grid-template-columns:1fr 1fr;gap:20px}   /* 成对字段 */
label.lb{font-size:13px;font-weight:500;color:var(--muted);margin-bottom:9px;display:flex;gap:8px}
label.lb .req{color:#FF2741}                                   /* 必填星号 */
.inp,.ta{width:100%;font-family:var(--cn);font-weight:500;font-size:14px;color:var(--ink);
  background:rgba(255,255,255,.62);border:1px solid var(--line);border-radius:14px;padding:13px 16px;outline:none;transition:.18s}
.inp:focus,.ta:focus{border-color:var(--blue);box-shadow:0 0 0 4px rgba(73,182,216,.16);background:#fff}
.ta{resize:vertical;min-height:78px;line-height:1.55}
.field:focus-within>.lb,.grid2>div:focus-within>.lb{color:var(--teal)}   /* 聚焦时标签变 teal */
```
数值输入用 Outfit + `tabular-nums`。带语义提示的数字(如表现分)可在右侧放**实时分段色点**(≥85 绿 / 70–84 蓝 / <70 橙),输入时联动颜色与文案。

## 三、自定义瓦片下拉（替代原生 select）

触发器保留清楚边界、箭头与焦点；选项是**面性标签**，不用默认描边。下拉、展示tag的“无线框”不影响键盘焦点和错误校验。

样式直接引入 [dropdown.css](../assets/components/dropdown.css)。核心面性规则如下，键盘焦点和勾选细节以该样式文件为准：

```css
.dd-opt{border:0;min-height:40px;background:#F0F3F8}
.dd-opt:hover{background:#E8EEF5}
.dd-opt.on{background:#DFEEF7;color:var(--ink)}
.dd-opt:focus-visible{outline:2px solid #49B6D8;outline-offset:2px}
```

可用实现：[assets/components/dropdown.js](../assets/components/dropdown.js)。它以按钮触发、listbox/option、文字渲染、唯一ID、单开、方向键、Enter/Space、Home/End、Esc及焦点归还实现选择；浮层用fixed定位、自动翻转、边界限位并在滚动/resize后重定位。销毁组件时调用`destroy()`释放监听。

```js
const typePicker = dropdown(['全部审批类型','立项审批','合同审批'], '全部审批类型',
  {label:'审批类型', columns:2});
container.append(typePicker);
typePicker.addEventListener('change', event => applyFilter(event.detail));
// typePicker.getValue(); typePicker.destroy();
```

原生`dialog`内传`portalRoot: dialog.querySelector('.dropdown-portal')`，该节点位于对话框内、不被裁切，祖先避免transform/filter/contain。关闭dialog会收起选项；卸载组件仍需destroy。

示例选项仅用于演示API，真实页面从业务源读取完整类型。状态触发器可带真实语义色点。两列用于短分类；长名称、少量状态或空间不足时用一列，不刻意放宽造成大块空白。已有可访问的组件库可实现同一合同，无须强制重写为此脚本。

## 四、标签 chips 输入

容器内是可删胶囊 + 行内 input;回车/逗号添加,退格删最后一个。

```css
.tags{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-height:50px;background:rgba(255,255,255,.62);border:1px solid var(--line);border-radius:14px;padding:9px 12px}
.tags:focus-within{border-color:var(--blue);box-shadow:0 0 0 4px rgba(73,182,216,.16);background:#fff}
.chip{display:inline-flex;align-items:center;gap:7px;font-size:13px;color:var(--teal);background:rgba(0,138,168,.1);border-radius:10px;padding:6px 7px 6px 11px;animation:chipIn .2s ease}
.tags input{flex:1;min-width:140px;border:none;outline:none;background:transparent;font-weight:500;font-size:14px}
```

## 五、多指标录入网格 + 按状态锁定

**别留一排无标签的输入框**(用户看不懂)。每个渠道一行:logo+名 + 状态瓦片下拉(带色点) + **带列头的指标输入**(曝光/点击/互动/线索/转化…)。

```css
.chan-head,.chan-row{display:grid;grid-template-columns:150px 116px repeat(5,1fr);gap:10px;align-items:center}
.chan-head .ch{font-size:11.5px;color:var(--muted2);text-align:center}   /* 列头:曝光(万)/点击/互动(万)/线索/转化 */
.minp{font-family:var(--en);font-weight:600;text-align:center;border-radius:11px;padding:10px 6px;background:rgba(255,255,255,.6);border:1px solid var(--line)}
.minp:disabled{background:rgba(15,49,50,.035);color:#c2cdd0;cursor:not-allowed}   /* 锁定态 */
```
**按状态锁定**：不允许编辑的阶段禁用输入；保留既有值，未知数据保持缺失，不自动写0覆盖。只有业务明确定义为0的真实值才显示0。
```js
const LIVE=["分发中","已发布","优化中"];
dd.addEventListener('change',()=>{
  const editable=LIVE.includes(dd.getValue());
  mins.forEach(input=>{input.disabled=!editable;});
});
```

## 六、校验态

必填为空 → 红框 + 抖动 + 行内提示;输入即清除。
```css
.inp.err{border-color:#D6455B;box-shadow:0 0 0 4px rgba(214,69,91,.14);background:#fff}
.err-msg{font-size:12px;color:#D6455B;margin-top:7px;display:none}.err-msg.show{display:block}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.shake{animation:shake .3s}
```
```js
saveBtn.onclick=()=>{ if(!titleInp.value.trim()){titleInp.classList.add('err','shake');titleErr.classList.add('show');titleInp.focus();setTimeout(()=>titleInp.classList.remove('shake'),320);} };
titleInp.oninput=()=>{titleInp.classList.remove('err');titleErr.classList.remove('show');};
```

有入场、抖动等动效时尊重`prefers-reduced-motion`，不把像素图本身做动画。必填错误应以文字与颜色共同表达，抖动不能作为唯一反馈。

# 表单与弹窗 · 配方与代码

配合 `SKILL.md` 的「表单与弹窗」节。范例文件:`references/content_asset_modal_reference.html`(新增内容资产弹窗,含所有下述模式)。

## 目录
- [一、模态结构](#一模态结构)
- [二、字段、标签、焦点](#二字段标签焦点)
- [三、自定义瓦片下拉（替代原生 select）](#三自定义瓦片下拉替代原生-select)
- [四、标签 chips 输入](#四标签-chips-输入)
- [五、多指标录入网格 + 按状态锁定](#五多指标录入网格--按状态锁定)
- [六、校验态](#六校验态)

> 总原则:**不要用浏览器原生 `<select>`**(各系统样式不一、和玻璃风格冲突)→ 一律用第三节的自定义瓦片下拉。输入框走玻璃风;焦点 teal 蓝边 + 柔光环;必填给红框+抖动;入场给轻动画。中文字重 500(V1.0 规则)。

---

## 一、模态结构

scrim(弥散+模糊)+ 玻璃卡(`mhead` 标题/副标/× · `mbody` 可滚动 · `mfoot` 取消/主操作)。入场:scrim 渐显 + 模态上浮缩放弹入。

```css
.scrim{position:fixed;inset:0;background:rgba(231,240,238,.4);backdrop-filter:blur(2px);animation:scrimIn .35s ease both}
.modal{width:900px;max-height:calc(100vh - 56px);display:flex;flex-direction:column;overflow:hidden;border-radius:28px;
  background:linear-gradient(168deg,rgba(255,255,255,.9),rgba(255,255,255,.8));backdrop-filter:blur(34px) saturate(1.25);
  border:1px solid rgba(255,255,255,.78);box-shadow:0 44px 120px -34px rgba(15,49,50,.42),inset 0 1px 0 rgba(255,255,255,.65);
  animation:modalIn .52s cubic-bezier(.2,.7,.2,1) both}
.mhead{padding:30px 36px 20px}      /* 标题 19/500，副标 13 muted2 */
.mbody{flex:1;overflow-y:auto;padding:6px 36px 28px}   /* 左右 36px */
.mfoot{display:flex;justify-content:flex-end;gap:12px;padding:18px 36px;border-top:1px solid rgba(15,49,50,.08)}
@keyframes scrimIn{from{opacity:0}to{opacity:1}}
@keyframes modalIn{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}
```
- 关闭 `×`:`.xbtn` 圆角描边图标钮。主操作「保存」深色,次操作「取消」幽灵态,**右对齐**。
- `.mbody` 是滚动容器 → 下拉浮层若在底部会被裁切,**底部的下拉用向上展开**(见第三节 `.dd.up`)。

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

触发器(白底圆角 pill + CSS 箭头)+ 浮层(玻璃卡)+ 选项瓦片(**选中 = 蓝边 + 浅蓝底 + 深字**)。对齐 `header_and_system_reference.html` 的 `.chip/.pop/.rqo`。

```css
.dd{position:relative}
.dd-trig{display:flex;align-items:center;gap:9px;width:100%;font-family:var(--cn);font-weight:500;font-size:14px;color:var(--ink);
  background:rgba(255,255,255,.62);border:1px solid var(--line);border-radius:14px;padding:13px 16px;cursor:pointer;transition:.18s}
.dd.open .dd-trig{border-color:var(--blue);box-shadow:0 0 0 4px rgba(73,182,216,.16);background:#fff}
.dd-trig .cv{width:7px;height:7px;border-right:1.8px solid var(--muted2);border-bottom:1.8px solid var(--muted2);
  transform:rotate(45deg);margin-top:-3px;transition:transform .2s}                /* CSS 箭头 */
.dd.open .dd-trig .cv{transform:rotate(225deg);margin-top:2px}
.dd-trig .dd-dot{width:7px;height:7px;border-radius:50%}                            /* 状态色点(可选) */
.dd-pop{position:absolute;top:calc(100% + 8px);left:0;right:0;z-index:30;background:#fff;border:1px solid var(--line);
  border-radius:14px;box-shadow:0 20px 48px -18px rgba(15,49,50,.34);padding:10px;display:none;animation:ddIn .16s ease}
.dd.up .dd-pop{top:auto;bottom:calc(100% + 8px)}        /* 靠近容器底部时向上展开,避免被滚动区裁切 */
.dd.open .dd-pop{display:block}
.dd-grid{display:flex;flex-wrap:wrap;gap:7px}
.dd-opt{padding:9px 14px;border-radius:10px;border:1px solid var(--line);font-size:13px;font-weight:500;color:var(--muted);cursor:pointer;transition:.15s;background:#fff}
.dd-opt:hover{border-color:#cfe0e0}
.dd-opt.on{border-color:var(--blue);background:rgba(73,182,216,.1);color:var(--ink)}   /* 选中态 */
.dd.sm .dd-trig{padding:10px 12px;font-size:13px;border-radius:11px}                    /* 紧凑(表格内) */
@keyframes ddIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
```
```js
/* 返回元素,带 getValue() 与 'change' 事件;o={dot,colors,sm,up} */
function dropdown(opts, sel, o={}){
  const wrap=Object.assign(document.createElement('div'),{className:'dd'+(o.sm?' sm':'')+(o.up?' up':'')});
  const trig=document.createElement('button'); trig.type='button'; trig.className='dd-trig';
  const pop=document.createElement('div'); pop.className='dd-pop';
  const grid=document.createElement('div'); grid.className='dd-grid'; let cur=sel;
  const paint=()=>trig.innerHTML=(o.dot?`<span class="dd-dot" style="background:${(o.colors||{})[cur]||'#94A3B8'}"></span>`:'')+`<span class="dd-val">${cur}</span><i class="cv"></i>`;
  opts.forEach(op=>{ const t=document.createElement('span'); t.className='dd-opt'+(op===cur?' on':''); t.textContent=op;
    t.onclick=e=>{e.stopPropagation();cur=op;grid.querySelectorAll('.dd-opt').forEach(x=>x.classList.remove('on'));t.classList.add('on');paint();wrap.classList.remove('open');wrap.dispatchEvent(new CustomEvent('change',{detail:op}));};
    grid.appendChild(t); });
  pop.appendChild(grid); paint();
  trig.onclick=e=>{e.stopPropagation();const open=wrap.classList.contains('open');document.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open'));if(!open)wrap.classList.add('open');};
  wrap.append(trig,pop); wrap.getValue=()=>cur; return wrap;
}
document.addEventListener('click',()=>document.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open')));
```
状态类下拉用 `{dot:true, colors:STATUS}` 在触发器显状态色点。

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
**按状态锁定**:未发布的数据本就不存在 → 状态为「待排期/制作中」时指标输入 `disabled` 置灰且归 0;切到「分发中/已发布/优化中」才解锁。子标签处注明规则。
```js
const LIVE=["分发中","已发布","优化中"];
dd.addEventListener('change',()=>{ const live=LIVE.includes(dd.getValue());
  mins.forEach(m=>{m.disabled=!live; if(!live){m.value='0';m.classList.add('zero');}}); });
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

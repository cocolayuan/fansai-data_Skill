/* FansAI V3 — dependency-free tile dropdown.
 * options: strings, numbers, or { value, label, disabled? }.
 * colors: { [value]: CSSColor | { fg: CSSColor } }; used for optional dots.
 * Load dropdown.css before use.
 * CSS hooks: .dd .dd-trig .cv .dd-pop .dd-grid .dd-opt .dd-opt.on.
 * CSS variables: --dd-option-bg, --dd-selected-bg, --ink, --muted, --accent.
 * config.portalRoot: non-clipping element inside a native dialog; defaults to body.
 * change.detail is the original selected value (string or number).
 */
(function (scope) {
  'use strict';
  let active = null;
  let serial = 0;
  const prefix = 'fansai-dd-' + Date.now().toString(36) + '-';

  function dropdown(options, selected, config = {}) {
    if (!Array.isArray(options)) throw new TypeError('dropdown options must be an array');
    const doc = scope.document;
    if (!doc) throw new Error('dropdown requires a browser document');
    const win = doc.defaultView || scope;
    const columns = Math.max(1, Math.min(4, Math.floor(Number(config.columns) || 1)));
    const label = String(config.label || '请选择');
    const portalRoot = config.portalRoot || doc.body;
    if (!portalRoot || typeof portalRoot.append !== 'function') {
      throw new TypeError('dropdown portalRoot must be a DOM element');
    }
    const hostDialog = portalRoot.closest?.('dialog') || null;
    const items = options.map(item => {
      const object = item !== null && typeof item === 'object';
      return {
        value: object ? item.value : item,
        label: String(object ? (item.label ?? item.value ?? '') : item),
        disabled: Boolean(object && item.disabled)
      };
    });
    const enabled = items.map((item, i) => item.disabled ? -1 : i).filter(i => i >= 0);
    let chosen = items.findIndex(item => Object.is(item.value, selected));
    if (chosen < 0) chosen = enabled[0] ?? -1;
    let current = chosen;
    let opened = false;
    let destroyed = false;
    let frame = 0;
    let id;
    do { id = prefix + (++serial); } while (doc.getElementById(id) || doc.getElementById(id + '-trigger'));

    const wrap = doc.createElement('span');
    wrap.className = 'dd dd-wrap';
    const trigger = doc.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dd-trig dd-trigger';
    trigger.id = id + '-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', id);
    trigger.disabled = enabled.length === 0;
    const valueText = doc.createElement('span');
    valueText.className = 'dd-value';
    const triggerDot = makeDot();
    const chevron = doc.createElement('span');
    chevron.className = 'cv dd-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    if (config.dot) trigger.append(triggerDot);
    trigger.append(valueText, chevron);
    wrap.append(trigger);

    const popup = doc.createElement('div');
    popup.id = id;
    popup.className = 'dd-pop';
    popup.setAttribute('role', 'listbox');
    popup.setAttribute('aria-label', label);
    const grid = doc.createElement('div');
    grid.className = 'dd-grid';
    grid.style.setProperty('--dd-columns', String(columns));
    popup.append(grid);
    const optionIndex = new Map();
    const buttons = items.map((item, index) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.id = id + '-option-' + index;
      button.className = 'dd-opt';
      button.tabIndex = -1;
      button.disabled = item.disabled;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-disabled', String(item.disabled));
      if (config.dot) {
        const dot = makeDot();
        dot.style.backgroundColor = colorFor(item.value);
        button.append(dot);
      }
      const text = doc.createElement('span');
      text.className = 'dd-option-label';
      text.textContent = item.label;
      button.append(text);
      optionIndex.set(button, index);
      grid.append(button);
      return button;
    });

    function makeDot() {
      const dot = doc.createElement('span');
      dot.className = 'dd-dot';
      dot.setAttribute('aria-hidden', 'true');
      return dot;
    }
    function colorFor(value) {
      const color = config.colors && config.colors[value];
      return typeof color === 'string' ? color : color?.fg || '#94a3b8';
    }
    function paint() {
      const item = items[chosen];
      valueText.textContent = item ? item.label : label;
      trigger.setAttribute('aria-label', item ? label + '：' + item.label : label);
      triggerDot.style.backgroundColor = item ? colorFor(item.value) : '#94a3b8';
      buttons.forEach((button, index) => {
        const on = index === chosen;
        button.classList.toggle('on', on);
        button.setAttribute('aria-selected', String(on));
      });
    }
    function position() {
      frame = 0;
      if (!opened) return;
      if (!trigger.isConnected || !portalRoot.isConnected) { close(false); return; }
      const rect = trigger.getBoundingClientRect();
      const width = doc.documentElement.clientWidth || win.innerWidth;
      const height = doc.documentElement.clientHeight || win.innerHeight;
      const edge = 12, gap = 8;
      if (rect.bottom <= 0 || rect.top >= height || rect.right <= 0 || rect.left >= width) {
        close(false);
        return;
      }
      popup.style.width = Math.max(0, Math.min(width - edge * 2, Math.max(rect.width, columns * 150))) + 'px';
      popup.style.maxHeight = Math.max(0, height - edge * 2) + 'px';
      const wanted = Math.min(popup.scrollHeight, 320);
      const below = Math.max(0, height - rect.bottom - gap - edge);
      const above = Math.max(0, rect.top - gap - edge);
      const useBelow = below >= wanted || below >= above;
      popup.style.maxHeight = Math.max(0, Math.min(320, useBelow ? below : above)) + 'px';
      const box = popup.getBoundingClientRect();
      popup.style.left = Math.max(edge, Math.min(rect.left, width - box.width - edge)) + 'px';
      popup.style.top = Math.max(edge, Math.min(useBelow ? rect.bottom + gap : rect.top - gap - box.height, height - box.height - edge)) + 'px';
    }
    function schedulePosition() {
      if (!frame) frame = win.requestAnimationFrame(position);
    }
    function focusOption(index) {
      if (index < 0 || items[index]?.disabled) return;
      current = index;
      const button = buttons[index];
      button.focus({ preventScroll: true });
      const itemRect = button.getBoundingClientRect();
      const popupRect = popup.getBoundingClientRect();
      const top = popupRect.top + 6;
      const bottom = popupRect.top + popup.clientHeight - 6;
      if (itemRect.top < top) popup.scrollTop -= top - itemRect.top;
      else if (itemRect.bottom > bottom) popup.scrollTop += itemRect.bottom - bottom;
    }
    function outside(event) {
      if (!wrap.contains(event.target) && !popup.contains(event.target)) close(true);
    }
    function escape(event) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
    function open(index = chosen) {
      if (destroyed || trigger.disabled || !trigger.isConnected || !portalRoot.isConnected) return;
      if (opened) { focusOption(index); return; }
      if (active) active.close(false);
      active = api;
      opened = true;
      trigger.setAttribute('aria-expanded', 'true');
      portalRoot.append(popup);
      doc.addEventListener('pointerdown', outside, true);
      doc.addEventListener('keydown', escape, true);
      win.addEventListener('resize', schedulePosition);
      win.addEventListener('scroll', schedulePosition, true);
      hostDialog?.addEventListener('close', dialogClosed);
      position();
      if (opened) focusOption(index >= 0 && !items[index]?.disabled ? index : enabled[0]);
    }
    function close(returnFocus = true) {
      if (!opened) return;
      opened = false;
      if (active === api) active = null;
      if (frame) win.cancelAnimationFrame(frame);
      frame = 0;
      doc.removeEventListener('pointerdown', outside, true);
      doc.removeEventListener('keydown', escape, true);
      win.removeEventListener('resize', schedulePosition);
      win.removeEventListener('scroll', schedulePosition, true);
      hostDialog?.removeEventListener('close', dialogClosed);
      popup.remove();
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus && trigger.isConnected) trigger.focus({ preventScroll: true });
    }
    function dialogClosed() { close(false); }
    function choose(index) {
      if (items[index]?.disabled || !items[index]) return;
      const changed = chosen !== index;
      chosen = index;
      paint();
      close(true);
      if (changed) wrap.dispatchEvent(new win.CustomEvent('change', {
        bubbles: true, detail: items[index].value
      }));
    }
    function triggerClick() { opened ? close(true) : open(); }
    function triggerKey(event) {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      open(event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1) : chosen);
    }
    function optionClick(event) {
      const button = event.target.closest('[role="option"]');
      if (optionIndex.has(button)) choose(optionIndex.get(button));
    }
    function optionKey(event) {
      if (event.key === 'Tab') { close(true); return; }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        choose(current);
        return;
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        focusOption(event.key === 'Home' ? enabled[0] : enabled.at(-1));
        return;
      }
      const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns }[event.key];
      if (!delta) return;
      event.preventDefault();
      for (let next = current + delta; next >= 0 && next < items.length; next += delta) {
        if (!items[next].disabled) { focusOption(next); break; }
      }
    }
    function destroy() {
      if (destroyed) return;
      close(false);
      destroyed = true;
      trigger.removeEventListener('click', triggerClick);
      trigger.removeEventListener('keydown', triggerKey);
      popup.removeEventListener('click', optionClick);
      popup.removeEventListener('keydown', optionKey);
      optionIndex.clear();
      wrap.remove();
    }

    const api = { close };
    wrap.getValue = () => items[chosen]?.value;
    wrap.destroy = destroy;
    trigger.addEventListener('click', triggerClick);
    trigger.addEventListener('keydown', triggerKey);
    popup.addEventListener('click', optionClick);
    popup.addEventListener('keydown', optionKey);
    paint();
    return wrap;
  }
  scope.dropdown = dropdown;
  if (typeof module === 'object' && module.exports) module.exports = dropdown;
})(typeof globalThis === 'object' ? globalThis : this);

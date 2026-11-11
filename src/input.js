// Track each key and pointer independently so one finger cannot release another.
export function createHeldInput(update) {
  const sources = new Map();
  const actions = ['left', 'right', 'fire'];
  const publish = () => actions.forEach((action) => update(action, [...sources.values()].includes(action)));
  return {
    press(source, action) { if (actions.includes(action)) { sources.set(source, action); publish(); } },
    release(source) { sources.delete(source); publish(); },
    clear() { sources.clear(); publish(); },
  };
}

export function isEditing(target) {
  return Boolean(target?.isContentEditable || target?.closest?.('input, textarea, select, [contenteditable="true"]'));
}

export function renderSize(width, height, pixelRatio = 1, coarse = false) {
  width = Math.max(1, Math.round(Number(width) || 1));
  height = Math.max(1, Math.round(Number(height) || 1));
  // Bound fill rate on phones and high-resolution/ultrawide displays.
  const ratio = Math.min(Math.max(.1, Number(pixelRatio) || 1), coarse ? 1.25 : 1.5,
    Math.sqrt(2_100_000 / (width * height)));
  return { width, height, ratio };
}

export function framingScale(aspect, mode) {
  const reference = mode === 'home' ? 1.3 : mode === 'hoop' ? .9 : 1.1;
  return Math.min(3.5, Math.max(1, reference / Math.max(.1, aspect)));
}

export function isTap(start, end) {
  return Math.hypot(end.clientX - start.clientX, end.clientY - start.clientY) < 12;
}

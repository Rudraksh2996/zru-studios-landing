import { createHeldInput, isEditing } from './input.js';

export function mountLobbyControls({ game, state, setMode, showTV, gameStart, shoot }) {
  const panel = document.getElementById('lobby-controls');
  const container = document.getElementById('canvas-container');
  const input = createHeldInput((action, down) => { game.keys[action] = down; });
  let savedOverflow = '', entry = null;
  const reset = () => { input.clear(); state.dragStart = null; };
  const modeButtons = [...panel.querySelectorAll('[data-enter-mode]')];
  const exit = panel.querySelector('[data-exit]');
  const status = panel.querySelector('[role="status"]');
  const sync = (mode) => {
    reset();
    const previous = container.dataset.mode || 'home';
    container.dataset.mode = mode;
    if (mode !== 'home' && previous === 'home') {
      savedOverflow = document.documentElement.style.overflow;
      entry = document.activeElement;
      document.documentElement.style.overflow = 'hidden';
    } else if (mode === 'home') document.documentElement.style.overflow = savedOverflow;
    panel.querySelectorAll('[data-controls-for]').forEach((group) => {
      group.hidden = !group.dataset.controlsFor.split(' ').includes(mode);
    });
    modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.enterMode === mode)));
    status.textContent = { home: 'Choose an experience or scroll to explore the studio.', arcade: 'Arcade. Hold the arrows to move and Fire to start or shoot.', hoop: 'Basketball. Swipe upward on the scene or select Shoot.', tv: 'Project screens. Use Previous and Next to browse.' }[mode];
    if (mode !== 'home' && previous === 'home') document.getElementById('gl').focus({ preventScroll: true });
    if (mode === 'home' && previous !== 'home' && entry?.isConnected) entry.focus({ preventScroll: true });
  };
  modeButtons.forEach((button) => button.addEventListener('click', () => setMode(button.dataset.enterMode)));
  exit.addEventListener('click', () => setMode('home'));
  panel.querySelector('[data-shoot]').addEventListener('click', shoot);
  panel.querySelectorAll('[data-browse]').forEach((button) => button.addEventListener('click', () => showTV(state.tvIndex + Number(button.dataset.browse))));
  panel.querySelectorAll('[data-hold]').forEach((button) => {
    const press = (source) => {
      if (state.mode !== 'arcade') return;
      if (!game.running) gameStart();
      input.press(source, button.dataset.hold);
    };
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      button.focus({ preventScroll: true });
      button.setPointerCapture(event.pointerId);
      press(`pointer:${event.pointerId}`);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      button.addEventListener(type, (event) => input.release(`pointer:${event.pointerId}`));
    }
    button.addEventListener('keydown', (event) => {
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); press(`button:${event.code}`); }
    });
    button.addEventListener('keyup', (event) => input.release(`button:${event.code}`));
    button.addEventListener('blur', () => { input.release('button:Space'); input.release('button:Enter'); });
    // Assistive technologies can activate a button without pointer/key events.
    button.addEventListener('click', (event) => {
      if (event.detail !== 0 || game.keys[button.dataset.hold]) return;
      const source = `activate:${button.dataset.hold}`;
      press(source); setTimeout(() => input.release(source), 180);
    });
  });
  const actionForKey = (key) => ({ ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'fire', ArrowUp: 'fire' })[key];
  window.addEventListener('keydown', (event) => {
    if (isEditing(event.target) || event.ctrlKey || event.metaKey || event.altKey || document.body.classList.contains('menu-open') || document.body.classList.contains('machine')) return;
    if (event.key === 'Escape' && state.mode !== 'home') { event.preventDefault(); setMode('home'); return; }
    if ([' ', 'Enter'].includes(event.key) && event.target.closest?.('button, a')) return; // native button keyboard activation
    const action = actionForKey(event.key);
    if (state.mode === 'arcade' && action) {
      event.preventDefault(); if (action === 'fire' && !game.running) gameStart();
      input.press(`key:${event.code}`, action);
    }
    if (state.mode === 'hoop' && event.key === ' ') { event.preventDefault(); if (!event.repeat) shoot(); }
    if (state.mode === 'tv' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault(); showTV(state.tvIndex + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1));
    }
  });
  window.addEventListener('keyup', (event) => input.release(`key:${event.code}`));
  window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', reset);
  document.addEventListener('studio:overlay', reset);
  document.addEventListener('studio:fallback', () => { reset(); setMode('home'); });
  panel.hidden = false;
  sync('home');
  return { sync, reset };
}

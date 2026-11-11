import test from 'node:test';
import assert from 'node:assert/strict';
import { createHeldInput, isEditing, isTap, renderSize, framingScale } from '../src/input.js';
import { createDialog } from '../src/dialog.js';
import { mountLobbyControls } from '../src/controls.js';

test('multi-touch and keyboard holds remain independent', () => {
  const keys = {};
  const input = createHeldInput((action, down) => { keys[action] = down; });
  input.press('finger-1', 'left'); input.press('finger-2', 'fire'); input.press('ArrowLeft', 'left');
  input.release('finger-1');
  assert.equal(keys.left, true); assert.equal(keys.fire, true);
  input.release('ArrowLeft');
  assert.equal(keys.left, false); assert.equal(keys.fire, true);
  input.clear(); assert.deepEqual(keys, { left: false, right: false, fire: false });
});

test('scroll swipes do not activate a scene object', () => {
  assert(isTap({ clientX: 5, clientY: 20 }, { clientX: 7, clientY: 22 }));
  assert(!isTap({ clientX: 5, clientY: 20 }, { clientX: 7, clientY: 90 }));
});

test('render budget is bounded from tiny screens through 8K at high DPI', () => {
  for (const [width, height] of [[240,640],[320,568],[390,844],[768,1024],[844,390],[1024,768],[1440,900],[1920,1080],[2560,1440],[3840,2160],[7680,4320]]) {
    for (const coarse of [false, true]) for (const dpr of [1,2,3,4]) {
      const size = renderSize(width, height, dpr, coarse);
      assert(size.width * size.height * size.ratio ** 2 <= 2_100_001);
      assert(size.ratio <= (coarse ? 1.25 : 1.5));
      assert(size.ratio > 0);
    }
  }
  assert.equal(renderSize(0,0).width, 1);
});

test('portrait camera framing expands without moving landscape framing', () => {
  for (const mode of ['home','arcade','hoop','tv']) {
    assert.equal(framingScale(2,mode), 1);
    assert(framingScale(.4,mode) > 1);
    assert(framingScale(.01,mode) <= 3.5);
  }
});

test('editable controls reserve their keyboard input', () => {
  assert(isEditing({ isContentEditable: true }));
  assert(isEditing({ closest: () => ({ tagName: 'TEXTAREA' }) }));
  assert(!isEditing({ closest: () => null }));
});

class Element extends EventTarget {
  constructor(name, dataset = {}) {
    super(); this.name = name; this.dataset = dataset; this.attributes = new Map();
    this.hidden = false; this.isConnected = true; this.style = { overflow: '' };
    const classes = new Set();
    this.classList = { add: (key) => classes.add(key), remove: (key) => classes.delete(key), contains: (key) => classes.has(key) };
  }
  setAttribute(key,value) { this.attributes.set(key,String(value)); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  hasAttribute(key) { return this.attributes.has(key); }
  removeAttribute(key) { this.attributes.delete(key); }
  focus() { document.activeElement = this; }
  getClientRects() { return this.hidden ? [] : [{}]; }
  closest(selector) { return selector.includes(this.name) ? this : null; }
  setPointerCapture(id) { this.captured = id; }
  emit(type, properties = {}) {
    const event = new Event(type, { cancelable: true });
    for (const [key,value] of Object.entries(properties)) Object.defineProperty(event,key,{value});
    this.dispatchEvent(event); return event;
  }
}
function environment(t) {
  const previous = { document: globalThis.document, window: globalThis.window, CustomEvent: globalThis.CustomEvent };
  const doc = new EventTarget(); doc.body = new Element('body'); doc.documentElement = new Element('html');
  globalThis.document = doc; globalThis.window = new Element('window');
  globalThis.CustomEvent = class extends Event { constructor(type, options) { super(type); this.detail = options?.detail; } };
  t.after(() => Object.assign(globalThis, previous));
  return doc;
}

test('dialogs trap focus, preserve prior inert state and restore scroll/focus', (t) => {
  environment(t);
  const first = new Element('button'), last = new Element('a'), trigger = new Element('button');
  const background = new Element('main'); background.setAttribute('inert',''); background.setAttribute('aria-hidden','false');
  const panel = new Element('dialog'); panel.querySelectorAll = () => [first,last]; panel.hidden = true;
  document.activeElement = trigger; document.body.style.overflow = 'clip';
  const dialog = createDialog({panel,trigger,background:[background]});
  dialog.set(true);
  assert.equal(document.activeElement,first); assert.equal(background.getAttribute('aria-hidden'),'true');
  panel.emit('keydown',{ key:'Tab', shiftKey:true }); assert.equal(document.activeElement,last);
  panel.emit('keydown',{ key:'Tab', shiftKey:false }); assert.equal(document.activeElement,first);
  dialog.set(false);
  assert.equal(panel.hidden,true); assert.equal(document.activeElement,trigger);
  assert.equal(background.getAttribute('aria-hidden'),'false'); assert(background.hasAttribute('inert'));
  assert.equal(document.body.style.overflow,'clip');
});

test('lobby controls support multi-touch, cancellation, blur and mode exits', (t) => {
  const doc = environment(t);
  const container = new Element('div'), canvas = new Element('canvas'), exit = new Element('button'), shoot = new Element('button'), status = new Element('p');
  const entries = ['arcade','hoop','tv'].map((mode) => new Element('button',{enterMode:mode}));
  const holds = ['left','right','fire'].map((action) => new Element('button',{hold:action}));
  const browse = [-1,1].map((step) => new Element('button',{browse:String(step)}));
  const groups = ['home','arcade hoop tv','arcade','hoop','tv'].map((mode) => new Element('div',{controlsFor:mode}));
  const panel = new Element('div');
  panel.querySelectorAll = (selector) => ({ '[data-enter-mode]':entries, '[data-controls-for]':groups, '[data-hold]':holds, '[data-browse]':browse })[selector];
  panel.querySelector = (selector) => ({ '[data-exit]':exit, '[data-shoot]':shoot, '[role="status"]':status })[selector];
  const elements = { 'lobby-controls':panel, 'canvas-container':container, gl:canvas };
  doc.getElementById = (id) => elements[id]; doc.activeElement = entries[0];
  const game = {keys:{}, running:false}, state = {mode:'home',tvIndex:0}; let controls, shots = 0;
  controls = mountLobbyControls({game,state, setMode(mode) { state.mode = mode; controls.sync(mode); }, showTV(index) { state.tvIndex = index; }, gameStart() { game.running = true; }, shoot() { shots++; }});
  entries[0].emit('click');
  assert.equal(state.mode,'arcade'); assert.equal(doc.activeElement,canvas);
  holds[0].emit('pointerdown',{ button:0, pointerId:1 });
  holds[2].emit('pointerdown',{ button:0, pointerId:2 });
  assert(game.keys.left && game.keys.fire);
  holds[0].emit('pointercancel',{pointerId:1}); assert(!game.keys.left && game.keys.fire);
  window.emit('blur'); assert(!game.keys.fire);
  window.emit('keydown',{key:'ArrowRight',code:'ArrowRight'}); assert(game.keys.right);
  window.emit('keyup',{key:'ArrowRight',code:'ArrowRight'}); assert(!game.keys.right);
  exit.emit('click'); assert.equal(state.mode,'home'); assert.equal(doc.documentElement.style.overflow,'');
  entries[1].emit('click'); shoot.emit('click'); assert.equal(shots,1);
  entries[2].emit('click'); browse[1].emit('click'); assert.equal(state.tvIndex,1);
  // Text entry must not trigger a shot or movement even while an experience is active.
  const textarea = new Element('textarea');
  window.emit('keydown',{key:' ',code:'Space',target:textarea}); assert(!game.keys.fire);
});

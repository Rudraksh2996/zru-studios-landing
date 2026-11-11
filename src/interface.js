import { createDialog } from './dialog.js';

const menu = document.querySelector('.menu');
const burger = document.querySelector('.burger');
const background = ['topnav', 'layout', 'canvas-container'].map((id) => document.getElementById(id));
const navigation = createDialog({ panel: menu, trigger: burger, background,
  onChange: (open) => document.body.classList.toggle('menu-open', open) });
burger.addEventListener('click', () => navigation.set(!navigation.open));
menu.querySelector('.menu-close').addEventListener('click', () => navigation.set(false));
menu.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (!link) return;
  navigation.set(false, false);
  if (link.hash && link.origin === location.origin) {
    const target = document.getElementById(link.hash.slice(1));
    if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navigation.open) { event.preventDefault(); navigation.set(false); }
});
const machine = createDialog({ panel: document.getElementById('machine'),
  trigger: document.getElementById('termstatus'), background });
document.addEventListener('studio:machine', (event) => machine.set(event.detail.open));

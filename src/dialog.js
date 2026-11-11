export function createDialog({ panel, trigger, background = [], onChange = () => {} }) {
  let open = false, previousFocus, overflow, inertStates;
  const focusables = () => [...panel.querySelectorAll('a[href], button, input, textarea, [tabindex="0"]')]
    .filter((element) => !element.disabled && !element.hidden && element.getClientRects().length);
  function set(next, restoreFocus = true) {
    if (next === open) return;
    open = next;
    if (open) {
      previousFocus = document.activeElement;
      overflow = document.body.style.overflow;
      inertStates = background.map((element) => ({ inert: element.hasAttribute('inert'), hidden: element.getAttribute('aria-hidden') }));
      panel.hidden = false; panel.classList.add('open');
      panel.setAttribute('aria-modal', 'true');
      trigger.setAttribute('aria-expanded', 'true');
      background.forEach((element) => { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true'); });
      document.body.style.overflow = 'hidden';
      onChange(true);
      (focusables()[0] || panel).focus({ preventScroll: true });
    } else {
      panel.classList.remove('open'); panel.hidden = true;
      panel.setAttribute('aria-modal', 'false'); trigger.setAttribute('aria-expanded', 'false');
      background.forEach((element, index) => {
        if (!inertStates[index].inert) element.removeAttribute('inert');
        if (inertStates[index].hidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', inertStates[index].hidden);
      });
      document.body.style.overflow = overflow;
      onChange(false);
      if (restoreFocus) (previousFocus?.isConnected ? previousFocus : trigger).focus({ preventScroll: true });
    }
    document.dispatchEvent(new CustomEvent('studio:overlay', { detail: { open } }));
  }
  panel.addEventListener('keydown', (event) => {
    if (!open || event.key !== 'Tab') return;
    const items = focusables();
    const first = items[0], last = items.at(-1);
    if (!first) { event.preventDefault(); panel.focus(); return; }
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  return { set, get open() { return open; } };
}

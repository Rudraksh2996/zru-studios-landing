import './interface.js';

// Load the authored scene without blocking the HTML landing page on WebGL support.
function showPageFallback(error) {
  document.dispatchEvent(new Event('studio:fallback'));
  document.getElementById('canvas-container').hidden = true;
  document.getElementById('layout').style.marginTop = '0';
  console.warn('3D lobby unavailable; showing the studio landing page.', error);
}

document.getElementById('gl').addEventListener('webglcontextlost', () => {
  showPageFallback('WebGL context lost');
});

const graphicsToggle = document.getElementById('graphics-toggle');
const preferences = new URLSearchParams(location.search);
const lightweight = preferences.get('graphics') === 'off';
graphicsToggle.textContent = lightweight ? 'Enable 3D lobby' : 'Use lighter view';
graphicsToggle.addEventListener('click', () => {
  const url = new URL(location.href);
  if (lightweight) url.searchParams.delete('graphics');
  else url.searchParams.set('graphics', 'off');
  location.href = url.href;
});
if (lightweight) showPageFallback('Lightweight view selected');
else import('./lobby.js').then(() => document.dispatchEvent(new Event('studio:ready'))).catch(showPageFallback);

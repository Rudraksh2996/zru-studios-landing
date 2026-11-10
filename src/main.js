// Load the authored scene without blocking the HTML landing page on WebGL support.
function showPageFallback(error) {
  document.getElementById('canvas-container').hidden = true;
  document.getElementById('layout').style.marginTop = '0';
  console.warn('3D lobby unavailable; showing the studio landing page.', error);
}

document.getElementById('gl').addEventListener('webglcontextlost', () => {
  showPageFallback('WebGL context lost');
});

import('./lobby.js').catch(showPageFallback);

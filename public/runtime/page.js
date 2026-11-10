
(function () {
  const term = document.getElementById('termstatus'), txt = term.querySelector('.txt');
  const STATUS = ['online', 'rendering lobby', 'watching the hoop', 'idle', '2 jobs queued', 'online'];
  let si = 0, typing = null;
  function type(str) { clearInterval(typing); let k = 0; typing = setInterval(() => { txt.textContent = str.slice(0, ++k); if (k >= str.length) clearInterval(typing); }, 28); }
  setInterval(() => { if (!document.body.classList.contains('machine')) { si = (si + 1) % STATUS.length; type(STATUS[si]); } }, 4200);
  let crt = null; const seg = (t, c) => window.ThreeUICrt.segment(t, c);
  // the machine index (same text as before) as terminal lines: role p = orange, d = dim, a = accent, h = bright
  const STUDIO_LOG = [["ZRU STUDIOS :: STUDIO INDEX", "h"], ["", "p"], ["NAME .......... Zru Studios", "p"], ["CREATOR ....... Rudraksh Sharma", "p"], ["SERVICES ...... UI/UX Design, Web Design, Graphic Design,", "p"], ["                Template Designs, Website Building", "p"], ["", "p"], ["We design and build exceptional digital experiences for ambitious", "p"], ["brands worldwide.", "p"], ["", "p"], ["SELECTED WORK", "p"], ["- Luminary Dashboard / Web App", "p"], ["- Apex Brand Identity / Branding", "p"], ["- Orbit SaaS Platform / UI/UX", "p"], ["- Prism Design System / System Design", "p"], ["", "p"], ["LAB", "p"], ["- Zru Studios Defender: click the arcade cabinet.", "p"], ["- ZRU Shot: click the basketball backboard.", "p"], ["", "p"], ["PUBLIC PROFILE", "p"], ["https://github.com/Rudraksh2996", "p"]];
  const ORANGE = { p: { fill: '#ff5a10', glow: 'rgba(255,90,16,0.9)' }, d: { fill: '#a8400f', glow: 'rgba(255,90,16,0.4)' }, a: { fill: '#ffd2b8', glow: 'rgba(255,170,120,0.9)' }, h: { fill: '#fff1e8', glow: 'rgba(255,200,160,0.95)' } };
  const SOFT_CRT = { scanDepth: 0.16, grille: 0.18, chroma: 0.6, bar: 0.03, flicker: 0.018, grain: 0.02, vignette: 0.5, gain: 1.22, halo: 0.08, sheen: [1.0, 0.62, 0.38], room: [0.03, 0.015, 0.008], background: '#050200', curve: [0.10, 0.145] };
  function setMode(m) {
    const machine = m === 'machine';
    document.body.classList.toggle('machine', machine);
    window.VHS = machine
      ? { speed: .75, switching: .09, switchingHeight: .035, acBeat: 1.4, grain: .22, scanlines: .5, jitter: .4 }
      : { speed: .5, switching: .05, switchingHeight: .02, acBeat: 1, grain: .1, scanlines: .1, jitter: .25 };
    if (machine && !crt) { try { crt = window.ThreeUICrt.mountCrt(document.getElementById('crt-host'), { variant: 'terminal', speed: 1, typeSpeed: 14, motion: 1, hue: 0, saturation: 1, brightness: 1, opacity: 1, fixedFont: 17, colors: ORANGE, styleOverrides: SOFT_CRT }, STUDIO_LOG); } catch (e) { console.warn('CRT unavailable', e); } }
    if (!machine && crt) { crt.destroy(); crt = null; }
    term.setAttribute('aria-pressed', String(machine));
    type(machine ? 'machine view · esc' : STATUS[si]);
    window.scrollTo(0, 0);
  }
  term.addEventListener('click', () => setMode(document.body.classList.contains('machine') ? 'human' : 'machine'));
  document.getElementById('machine-close').addEventListener('click', () => setMode('human'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('machine')) setMode('human'); });
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); location.href = 'https://github.com/Rudraksh2996'; } });


  // VHS overlay for the DOM: grain, scanlines, head-switching band and AC beat as a screen-blended layer.
  (function () {
    const cv = document.getElementById('vhs-overlay'); const gl = cv.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
    if (!gl) return;
    const cfg = () => window.VHS || { speed: .5, switching: .05, switchingHeight: .02, acBeat: 1, grain: .1, scanlines: .1, jitter: .25 };
    const V = `#version 300 es
    precision highp float; layout(location=0) in vec2 aPos; out vec2 vUv; void main(){ vUv = aPos*0.5+0.5; gl_Position = vec4(aPos,0.,1.); }`;
    const F = `#version 300 es
    precision highp float; in vec2 vUv; out vec4 o; uniform vec2 uRes; uniform float uTime, uSwitching, uSwitchHeight, uAcBeat, uGrain, uScanlines, uJitter, uScroll;
    #define PI 3.14159265
    float hash(vec2 v){ return fract(sin(dot(v, vec2(89.44, 19.36))) * 22189.22); }
    float iHash(vec2 v, vec2 r){ float h00=hash(floor(v*r)/r); float h10=hash(floor(v*r+vec2(1.,0.))/r); float h01=hash(floor(v*r+vec2(0.,1.))/r); float h11=hash(floor(v*r+vec2(1.,1.))/r); vec2 ip=smoothstep(vec2(0.),vec2(1.),mod(v*r,1.)); return (h00*(1.-ip.x)+h10*ip.x)*(1.-ip.y)+(h01*(1.-ip.x)+h11*ip.x)*ip.y; }
    float noise(vec2 v){ float sum=0.; float s=2.; for(int i=1;i<7;i++){ sum+=iHash(v+vec2(float(i)),vec2(2.*s))/s; s*=2.; } return sum; }
    void main(){
      vec2 uv = vUv; float t = uTime;
      float lineNoise = noise(vec2(uv.y*100.0, t*10.0));
      float snPhase = smoothstep(max(uSwitchHeight,1e-4), 0.0, uv.y) * uSwitching;
      float beat = clamp(noise(vec2(0.0, uv.y + t*0.2))*0.6-0.25, 0.0, 0.1) * uAcBeat;
      float g = hash(uv*uRes + fract(t)*vec2(127.1,311.7)) - 0.5;
      float scan = sin(uv.y*uRes.y*PI)*0.5;
      vec3 col = vec3(0.5 + g) * uGrain * 1.6 + beat * 0.5;
      col += vec3(0.9, 0.95, 1.0) * snPhase * 6.0 * (0.4 + lineNoise * 0.6);
      float a = clamp(uGrain*0.9 + snPhase*6.0 + beat*0.6, 0.0, 1.0);
      col *= 1.0 - uScanlines*0.35*scan;
      o = vec4(col * a, a);
    }`;
    const sh = (t, src) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, V)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, F)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes','uTime','uSwitching','uSwitchHeight','uAcBeat','uGrain','uScanlines','uJitter','uScroll'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
    let time = 0, last = performance.now();
    function frame(now) {
      const dpr = Math.min(devicePixelRatio || 1, 2); const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      const c = cfg(); const dt = Math.min((now - last) / 1000, 1 / 30); last = now; time += dt * c.speed;
      gl.viewport(0, 0, w, h); gl.useProgram(prog);
      gl.uniform2f(U.uRes, w, h); gl.uniform1f(U.uTime, time); gl.uniform1f(U.uSwitching, c.switching); gl.uniform1f(U.uSwitchHeight, c.switchingHeight); gl.uniform1f(U.uAcBeat, c.acBeat); gl.uniform1f(U.uGrain, c.grain); gl.uniform1f(U.uScanlines, c.scanlines); gl.uniform1f(U.uJitter, c.jitter); gl.uniform1f(U.uScroll, scrollY);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  // Canvas UI Particle Scroll over the page content: text and images below the formation line dissolve
  // into orange/yellow grains and reassemble as they scroll up; the live DOM blurs in once a block has landed.
  if (window.ParticleScroll && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.__ps = window.ParticleScroll.mountParticleScroll('[data-ps]', { point: 0.68, band: 330, density: 2, size: 1.25, spread: 200, gravity: 0.35, drift: 0.9, swirl: 70, stagger: 0.55, fade: 0.42, settle: 0.7, hold: 1.15, smoothing: 0.26, tintA: [1.0, 0.3, 0.0], tintB: [1.0, 0.82, 0.2] });
  }
  // Keep briefs local; announce success only after the clipboard write succeeds.
  (function projectBrief() {
    const form = document.querySelector('footer .signup');
    const status = document.getElementById('brief-status');
    if (!form || !status) return;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = form.elements.brief;
      if (!input.value.trim()) { input.focus(); status.textContent = 'Add a short project brief first.'; return; }
      try {
        await navigator.clipboard.writeText('Project brief for Zru Studios\n\n' + input.value.trim());
        status.textContent = 'Brief copied. It is ready to share.';
      } catch {
        input.select();
        status.textContent = 'Select and copy your brief with Ctrl+C or Command+C.';
      }
    });
  })();

  // ThreeUI <TerrainPlumeCanvas variant="sunset-drive" /> behind the footer copy.
  if (window.ThreeUITerrainPlume) {
    window.__plume = window.ThreeUITerrainPlume.mountTerrainPlume(document.getElementById('blog'), {
      variant: 'sunset-drive',
      speed: 1.00, size: 1.00, thickness: 1.00, strength: 1.00, softness: 0.00,
      opacity: 1.00, hue: 0, saturation: 1.00, brightness: 1.00,
    });
  }

  // Scroll parallax on the marginalia: each drawing drifts at its own rate against
  // the copy. Gated on visibility and written only when the value actually moves,
  // since a transform write every scroll event is an easy way to lose frames.
  (function illParallax() {
    const els = [...document.querySelectorAll('.ill')];
    if (!els.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const SPEED = { 'ill-lantern': 0.20, 'ill-cat': -0.13, 'ill-joystick': 0.30, 'ill-crt': 0.14 };
    const items = els.map((el) => {
      const key = [...el.classList].find((c) => c.startsWith('ill-'));
      const it = { el, speed: SPEED[key] ?? 0.16, last: null, live: false };
      new IntersectionObserver(([e]) => { it.live = e.isIntersecting; }, { rootMargin: '25% 0px' }).observe(el);
      return it;
    });
    let queued = false;
    const frame = () => {
      queued = false;
      const mid = innerHeight / 2;
      for (const it of items) {
        if (!it.live) continue;
        const r = it.el.getBoundingClientRect();
        const v = Math.round(((r.top + r.height / 2) - mid) * it.speed * 10) / 10;
        if (v !== it.last) { it.last = v; it.el.style.transform = `translate3d(0,${v}px,0)`; }
      }
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame, { passive: true });
    frame();
  })();

  // Pin the menu to the sheet. The card reports its four projected corners, so a
  // projective transform from a flat reference box onto those corners puts real
  // anchors on the paper — they bend and turn with it and stay clickable.
  (function menuOnCard() {
    const links = document.querySelector('.menu-links');
    const menu = document.querySelector('.menu');
    if (!links || !menu) return;
    const W = 560, H = 790;
    // solve the 8 unknowns of a projective map from the reference box to the quad
    function homography(dst) {
      const src = [[0, 0], [W, 0], [W, H], [0, H]];
      const A = [], b = [];
      for (let i = 0; i < 4; i++) {
        const [x, y] = src[i], [X, Y] = dst[i];
        A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X);
        A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y);
      }
      for (let c = 0; c < 8; c++) {                       // gaussian elimination
        let piv = c;
        for (let r = c + 1; r < 8; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
        if (Math.abs(A[piv][c]) < 1e-9) return null;
        [A[c], A[piv]] = [A[piv], A[c]]; [b[c], b[piv]] = [b[piv], b[c]];
        for (let r = 0; r < 8; r++) {
          if (r === c) continue;
          const f = A[r][c] / A[c][c];
          for (let k = c; k < 8; k++) A[r][k] -= f * A[c][k];
          b[r] -= f * b[c];
        }
      }
      return b.map((v, i) => v / A[i][i]);
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const sheet = window.__sheet;
      if (!menu.classList.contains('open') || !sheet) return;
      const q = sheet.state().quad;
      if (!q) return;
      // the reported quad is expanded 1.07x for hit testing; step back to the real face
      const cx = (q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4;
      const cy = (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4;
      const face = q.map(([x, y]) => [cx + (x - cx) / 1.07, cy + (y - cy) / 1.07]);
      // A homography only holds while the face is toward us. Turn the sheet past
      // edge-on and the quad's winding inverts, which sent the card off as a stray
      // slab. The signed area tells us which way the face points: hide it once it
      // turns away, and fade it out as it goes edge-on rather than popping.
      let area = 0;
      for (let i = 0; i < 4; i++) {
        const [x1, y1] = face[i], [x2, y2] = face[(i + 1) % 4];
        area += x1 * y2 - x2 * y1;
      }
      area /= 2;
      if (area <= 0) { links.style.visibility = 'hidden'; return; }
      const faceOn = Math.min(1, Math.abs(area) / (W * H * 0.16));
      links.style.visibility = '';
      links.style.opacity = faceOn.toFixed(3);
      const h = homography(face);
      if (!h) return;
      const [a, bb, c, d, e, f, g, hh] = h;
      links.style.transform = `matrix3d(${a},${d},0,${g},${bb},${e},0,${hh},0,0,1,0,${c},${f},0,1)`;
      if (!links.classList.contains('on')) links.classList.add('on');
    };
    tick();
    menu.addEventListener('transitionend', () => { if (!menu.classList.contains('open')) links.classList.remove('on'); });
  })();

  // Hover flashlight across the header, rAF-throttled so a fast pointer cannot
  // queue more style writes than there are frames to paint them.
  (function headlight() {
    const bar = document.querySelector('#topnav .pillbar');
    if (!bar || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let px = 0, py = 0, queued = false;
    const apply = () => {
      queued = false;
      bar.style.setProperty('--mx', px.toFixed(1) + 'px');
      bar.style.setProperty('--my', py.toFixed(1) + 'px');
    };
    bar.addEventListener('pointermove', (e) => {
      const r = bar.getBoundingClientRect();
      px = e.clientX - r.left; py = e.clientY - r.top;
      if (!queued) { queued = true; requestAnimationFrame(apply); }
    }, { passive: true });
    bar.addEventListener('pointerenter', () => bar.style.setProperty('--lit', '1'));
    bar.addEventListener('pointerleave', () => bar.style.setProperty('--lit', '0'));
  })();

  // Hamburger menu
  (function burgerMenu() {
    const burger = document.querySelector('#topnav .burger');
    const menu = document.querySelector('.menu');
    if (!burger || !menu) return;
    const set = (open) => {
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => {
          menu.classList.add('open');
          // the panel was display:none, so the paper measured 0x0 until now
          window.dispatchEvent(new Event('resize'));
        });
      } else {
        menu.classList.remove('open');
        setTimeout(() => { if (!menu.classList.contains('open')) menu.hidden = true; }, 450);
      }
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      document.body.classList.toggle('menu-open', open);
    };
    menu.querySelector('.menu-close')?.addEventListener('click', () => set(false));
    burger.addEventListener('click', (e) => { e.stopPropagation(); set(!menu.classList.contains('open')); });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) set(false); });
  })();

  // Hairlines draw themselves in as they enter the viewport; the vertical container
  // lines unroll from the top once the page content is reached.
  (function lines() {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
    document.querySelectorAll('[data-line]').forEach(el => io.observe(el));
    const vr = document.querySelector('.vrules');
    if (vr) { const vio = new IntersectionObserver((en) => { if (en[0].isIntersecting) { vr.classList.add('in'); vio.disconnect(); } }, { threshold: 0 }); vio.observe(document.querySelector('main')); }
  })();

  // Featured project 1: animated dotted wave (2D canvas)
  const cv = document.querySelector('.art-wave canvas');
  if (cv) {
    const ctx = cv.getContext('2d'); let w = 0, h = 0, t0 = performance.now();
    function size() { const r = cv.getBoundingClientRect(); const d = Math.min(2, devicePixelRatio || 1); const nw = Math.round(r.width * d), nh = Math.round(r.height * d); if (nw !== w || nh !== h) { w = cv.width = nw; h = cv.height = nh; } }
    function frame(now) {
      const r = cv.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight && r.width > 0) {
        size(); const t = (now - t0) / 1000;
        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, w, h);
        const N = 90, M = 46; const f = w * 0.9;
        for (let j = 0; j < M; j++) for (let i = 0; i < N; i++) {
          const u = (i / (N - 1) - 0.5) * 2.2, v = (j / (M - 1)) * 2.4 + 0.4;
          const y = Math.sin(u * 2.6 + t * 0.9) * 0.16 * Math.exp(-Math.abs(u) * 0.6) + Math.sin(v * 3.1 - t * 0.7) * 0.07 + Math.sin((u + v) * 1.7 + t * 0.5) * 0.05 - 0.22;
          const z = v + 0.35, sx = w / 2 + (u * f) / z, sy = h * 0.66 - ((y + 0.15) * f) / z;
          const a = Math.min(1, 1.6 / z) * (0.35 + 0.65 * (0.5 + y * 2));
          ctx.fillStyle = `rgba(230,230,230,${Math.max(0.05, a)})`; const s = Math.max(1, 2.2 * w / 1600 / z * 1.4); ctx.fillRect(sx, sy, s, s);
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();

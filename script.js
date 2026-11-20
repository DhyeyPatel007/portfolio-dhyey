// View switching (Home / Projects / About Me)
const navLinks = document.querySelectorAll('.nav-link');
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  navLinks.forEach(b => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'instant' });
  requestAnimationFrame(observeReveals);
}
document.querySelectorAll('[data-view]').forEach(el => {
  el.addEventListener('click', () => showView(el.dataset.view));
});

// Tabs (home + projects page)
document.querySelectorAll('[data-tabs]').forEach(group => {
  const scope = group.dataset.tabs; // "home" or "page"
  group.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      group.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const key = scope + '-' + tab.dataset.tab;
      document.querySelectorAll('[data-panel^="' + scope + '-"]').forEach(p => {
        p.classList.toggle('hidden', p.dataset.panel !== key);
      });
    });
  });
});

// Scroll reveal
let observer;
function observeReveals() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.view.active .reveal, .view.active .reveal-slide').forEach(el => observer.observe(el));
}
observeReveals();

// Scroll motion — elements drift at different speeds as you scroll (like the reference site)
const paraGroups = [
  { sel: '.giant-name', speeds: [0.05] },
  { sel: '.hl-back', speeds: [0.14] },
  { sel: '.hl-person', speeds: [0.07] },
  { sel: '.hl-front', speeds: [0.20] },
  { sel: '.watermark', speeds: [0.07] },
  { sel: '.folder', speeds: [0.10, -0.08, 0.12, -0.06] },
  { sel: '.arch-folder', speeds: [0.13, -0.10, 0.16] },
  { sel: '.proj-giant', speeds: [0.06] },
  { sel: '.about-giant-white', speeds: [0.05] },
  { sel: '.footer-giant', speeds: [0.04] },
];
const paraEls = [];
paraGroups.forEach(g => {
  document.querySelectorAll(g.sel).forEach((el, i) => {
    paraEls.push({ el, speed: g.speeds[i % g.speeds.length] });
  });
});
let paraTick = false;
function updateParallax() {
  const vh = window.innerHeight;
  paraEls.forEach(({ el, speed }) => {
    if (!el.closest('.view.active')) return;
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > vh + 200) return;
    const offset = (r.top + r.height / 2 - vh / 2) * speed;
    el.style.translate = '0 ' + offset.toFixed(1) + 'px';
  });
  paraTick = false;
}
window.addEventListener('scroll', () => {
  if (!paraTick) { paraTick = true; requestAnimationFrame(updateParallax); }
}, { passive: true });
updateParallax();

// Motion-FX style scrub — cards drift, rotate and scale tied to scroll position (like the reference site's Elementor Motion FX)
const fxSvc = [...document.querySelectorAll('.svc-card')];
const fxArch = [...document.querySelectorAll('.arch-card')];
function progressOf(el) {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight;
  return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
}
let fxTick = false;
function updateFx() {
  if (window.innerWidth > 900) {
    fxSvc.forEach(el => {
      if (!el.closest('.view.active')) return;
      const p = progressOf(el);
      el.style.translate = '0 ' + ((0.5 - p) * 70).toFixed(1) + 'px';
      el.style.rotate = ((0.5 - p) * 7).toFixed(2) + 'deg';
    });
  }
  fxArch.forEach((el, i) => {
    if (!el.closest('.view.active')) return;
    const p = progressOf(el);
    const dir = i % 2 === 0 ? 1 : -1;
    el.style.translate = '0 ' + ((0.5 - p) * 110 * dir).toFixed(1) + 'px';
    el.style.rotate = ((0.5 - p) * 6 * dir).toFixed(2) + 'deg';
    el.style.scale = (0.94 + 0.06 * p).toFixed(3);
  });
  fxTick = false;
}
window.addEventListener('scroll', () => {
  if (!fxTick) { fxTick = true; requestAnimationFrame(updateFx); }
}, { passive: true });
updateFx();

// charsUp headings — split into chars, stagger up on reveal (like the reference)
document.querySelectorAll('.chars').forEach(h => {
  let idx = 0;
  [...h.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      const frag = document.createDocumentFragment();
      [...node.textContent].forEach(ch => {
        if (ch === ' ') { frag.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.className = 'char';
        s.textContent = ch;
        s.style.transitionDelay = (idx++ * 35) + 'ms';
        frag.appendChild(s);
      });
      h.replaceChild(frag, node);
    }
  });
});
const charObs = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); charObs.unobserve(e.target); } });
}, { threshold: 0.3 });
document.querySelectorAll('.chars').forEach(h => charObs.observe(h));

// Custom cursor — instant dot + smooth trailing ring (difference blend)
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = -100, my = -100, rx = -100, ry = -100;
window.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
});
(function ringLoop() {
  rx += (mx - rx) * 0.16;
  ry += (my - ry) * 0.16;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(ringLoop);
})();
document.querySelectorAll('a, button, [data-hover], .tab, li').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('grow'));
  el.addEventListener('mouseleave', () => ring.classList.remove('grow'));
});

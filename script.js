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
  { sel: '.hero .flower', speeds: [0.16, 0.10, 0.20, 0.13] },
  { sel: '.watermark', speeds: [0.07] },
  { sel: '.arch-card', speeds: [0.05, -0.045, 0.07, -0.05, 0.04] },
  { sel: '.svc-card', speeds: [0.030, -0.022, 0.022, -0.030] },
  { sel: '.folder', speeds: [0.10, -0.08, 0.12, -0.06] },
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

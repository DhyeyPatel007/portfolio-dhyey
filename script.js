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

// Parallax on giant words
const pxEls = document.querySelectorAll('.parallax');
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    pxEls.forEach(el => {
      if (!el.closest('.view.active')) return;
      const speed = parseFloat(el.dataset.speed || '0.2');
      const base = el.classList.contains('giant-name') || el.classList.contains('watermark') ? 'translateX(-50%)' : '';
      el.style.transform = base + ' translateY(' + (y * speed) + 'px)';
    });
    ticking = false;
  });
}, { passive: true });

// Custom cursor
const cursor = document.getElementById('cursor');
window.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, button, [data-hover], .tab, li').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

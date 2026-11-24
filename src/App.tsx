import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { ViewName } from './data/portfolioData';
import { SvgDefs } from './components/SvgDefs';
import { Cursor } from './components/Cursor';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Intro } from './components/Intro';
import { Services } from './components/Services';
import { Archive } from './components/Archive';
import { Toolkit } from './components/Toolkit';
import { ProjectsHome } from './components/ProjectsHome';
import { VideoSection } from './components/VideoSection';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ProjectsView } from './components/ProjectsView';
import { AboutView } from './components/AboutView';
import { WorkshopEntry } from './workshop/WorkshopEntry';

// Lazy: three.js must not ship in the homepage bundle — the 3D world loads
// only when the user asks for it.
const Workshop = lazy(() => import('./workshop/Workshop').then((m) => ({ default: m.Workshop })));

gsap.registerPlugin(ScrollTrigger);

function splitChars(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('.chars').forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    let idx = 0;
    [...h.childNodes].forEach((node) => {
      if (node.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...(node.textContent || '')].forEach((ch) => {
          if (ch === ' ') {
            frag.appendChild(document.createTextNode(' '));
            return;
          }
          const s = document.createElement('span');
          s.className = 'char';
          s.textContent = ch;
          s.style.transitionDelay = idx++ * 35 + 'ms';
          frag.appendChild(s);
        });
        h.replaceChild(frag, node);
      }
    });
  });
}

export default function App() {
  const [view, setView] = useState<ViewName>(() =>
    window.location.hash === '#/workshop' ? 'workshop' : 'home'
  );
  const lenisRef = useRef<Lenis | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const go = useCallback((v: ViewName) => {
    setView(v);
    if (v === 'workshop') {
      window.location.hash = '#/workshop';
    } else if (window.location.hash === '#/workshop') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#/workshop') setView('workshop');
      else setView((v) => (v === 'workshop' ? 'home' : v));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // the 3D workshop owns its own input — freeze smooth-scroll underneath it
  useEffect(() => {
    if (view === 'workshop') lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, [view]);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    splitChars(root);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    root.querySelectorAll('.reveal, .chars').forEach((el) => io.observe(el));

    const ctx = gsap.context(() => {
      // gentle parallax for elements with small data-speed values (hero layers, giant words)
      gsap.utils.toArray<HTMLElement>('[data-speed]').forEach((el) => {
        const s = parseFloat(el.dataset.speed || '0');
        if (Math.abs(s) >= 1) return; // polaroids handled below (px speeds)
        gsap.fromTo(
          el,
          { y: -s * 220 },
          {
            y: s * 220,
            ease: 'none',
            scrollTrigger: { trigger: el.closest('section') || el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      });

      // toolkit polaroids drift at their own px speeds
      gsap.utils.toArray<HTMLElement>('.polaroid').forEach((el) => {
        const s = parseFloat(el.dataset.speed || '-70');
        gsap.fromTo(
          el,
          { y: -s / 2 },
          {
            y: s / 2,
            ease: 'none',
            scrollTrigger: { trigger: '.toolkit', start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      });

      // service cards: Motion-FX style scrub (drift + rotate tied to scroll)
      if (window.innerWidth > 900) {
        gsap.utils.toArray<HTMLElement>('.svc-card').forEach((el) => {
          const ty = parseFloat(el.dataset.ty || '0');
          const rot = parseFloat(el.dataset.rot || '0');
          gsap.fromTo(
            el,
            { y: ty + 38, rotation: rot - 3.5 },
            {
              y: ty - 38,
              rotation: rot + 3.5,
              ease: 'none',
              scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
            }
          );
        });
      }

      // archive cards drift/rotate/scale as they pass through
      gsap.utils.toArray<HTMLElement>('.arch-card').forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          el,
          { y: 55 * dir, rotation: 2.5 * dir, scale: 0.95 },
          {
            y: -55 * dir,
            rotation: -2.5 * dir,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          }
        );
      });

      // contact orange wipe
      gsap.utils.toArray<HTMLElement>('.contact').forEach((sec) => {
        const bg = sec.querySelector('.contact-bg');
        if (!bg) return;
        gsap.fromTo(
          bg,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: sec, start: 'top 92%', end: 'top 30%', scrub: true },
          }
        );
      });

      // projects-page folders drift
      gsap.utils.toArray<HTMLElement>('.folder').forEach((el, i) => {
        gsap.to(el, {
          y: i % 2 ? -34 : 34,
          ease: 'none',
          scrollTrigger: { trigger: '.proj-hero', start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const t = setTimeout(refresh, 350);
    window.addEventListener('load', refresh);
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', refresh);
      io.disconnect();
      ctx.revert();
    };
  }, [view]);

  return (
    <div ref={mainRef} className="relative min-h-screen w-full overflow-x-clip bg-[#F3EDE2]">
      <SvgDefs />
      <Cursor />
      {view !== 'workshop' && <Navbar view={view} go={go} />}
      <main>
        {view === 'workshop' && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0b0d0e]">
                <p className="text-sm tracking-[0.3em] text-[#8a93a0] uppercase">Warming up the workshop…</p>
              </div>
            }
          >
            <Workshop go={go} />
          </Suspense>
        )}
        {view === 'home' && (
          <>
            <Hero />
            <Intro go={go} />
            <Services />
            <Archive />
            <Toolkit />
            <ProjectsHome go={go} />
            <VideoSection />
            <WorkshopEntry go={go} />
            <Contact />
            <Footer go={go} />
          </>
        )}
        {view === 'projects' && <ProjectsView go={go} />}
        {view === 'about' && <AboutView go={go} />}
      </main>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { WorkshopEngine, type RoomMode } from './engine';
import { STATIONS, type StationId } from './stations';
import { PROFILE } from '../data/portfolioData';
import type { ViewName } from '../data/portfolioData';

export function Workshop({ go }: { go: (v: ViewName) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WorkshopEngine | null>(null);
  const [mode, setMode] = useState<RoomMode | null>(null);
  const [booted, setBooted] = useState(false);
  const [active, setActive] = useState<StationId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<StationId | null>(null);
  const [failed, setFailed] = useState(false);
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let engine: WorkshopEngine | null = null;
    try {
      engine = new WorkshopEngine(canvas, {
        onStation: (id) => {
          setActive(id);
          setMenuOpen(false);
        },
        onMenu: () => setMenuOpen((v) => !v),
        onBoot: () => setBooted(true),
        onReady: (m) => setMode(m),
        onHover: (id) => setHovered(id),
      });
      engineRef.current = engine;
      engine.init().catch(() => setFailed(true));
    } catch {
      setFailed(true);
    }
    return () => {
      engine?.dispose();
      engineRef.current = null;
    };
  }, []);

  const openStation = (id: StationId) => {
    engineRef.current?.goToStation(id);
    setActive(id);
    setMenuOpen(false);
  };

  const activeStation = STATIONS.find((s) => s.id === active) ?? null;
  const hoveredStation = STATIONS.find((s) => s.id === hovered) ?? null;

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden bg-[#0b0d0e] font-[Poppins,system-ui,sans-serif] text-[#FAF6EC]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{ cursor: hovered ? 'pointer' : 'grab' }}
        aria-label="The Concrete Drafting Lab — Dhyey's workshop in 3D"
      />

      {/* loading */}
      {!mode && !failed && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0b0d0e]">
          <p className="text-sm tracking-[0.3em] text-[#8a93a0] uppercase">Warming up the workshop…</p>
        </div>
      )}

      {/* WebGL failure */}
      {failed && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#0b0d0e] px-6 text-center">
          <p className="text-xl font-bold">The 3D room couldn&apos;t start on this device.</p>
          <p className="max-w-md text-sm text-[#8a93a0]">WebGL is unavailable here — every project is still listed on the 2D site.</p>
          <button
            onClick={() => go('home')}
            className="rounded-full bg-[#FAF6EC] px-6 py-3 text-sm font-semibold text-[#14181A]"
          >
            Back to the 2D site
          </button>
        </div>
      )}

      {mode && !failed && (
        <>
          {/* top strip */}
          <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 px-3 py-3 sm:px-5">
            <button
              onClick={() => engineRef.current?.goToCentre()}
              className="flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-sm font-bold backdrop-blur"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-[13px]">D</span>
              <span className="hidden sm:inline">The Concrete Drafting Lab</span>
              <span className="sm:hidden">Workshop</span>
            </button>
            <nav className="flex items-center gap-1 rounded-full bg-black/55 px-2 py-1.5 text-[13px] font-medium backdrop-blur">
              <a href={PROFILE.github} target="_blank" rel="noreferrer" className="rounded-full px-2.5 py-1.5 hover:bg-white/10">GitHub</a>
              <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" className="rounded-full px-2.5 py-1.5 hover:bg-white/10">LinkedIn</a>
              <a href="/resume.pdf" target="_blank" rel="noreferrer" className="hidden rounded-full px-2.5 py-1.5 hover:bg-white/10 sm:inline">Resume</a>
              <a href={`mailto:${PROFILE.email}`} className="hidden rounded-full px-2.5 py-1.5 hover:bg-white/10 sm:inline">Email</a>
              <button onClick={() => go('home')} className="rounded-full bg-[#FAF6EC] px-3 py-1.5 font-semibold text-[#14181A]">2D Mode</button>
            </nav>
          </header>

          {/* hover label */}
          {hoveredStation && !activeStation && (
            <div className="pointer-events-none absolute left-1/2 top-[72px] z-20 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm font-semibold backdrop-blur">
              {hoveredStation.num} · {hoveredStation.name}
            </div>
          )}

          {/* boot overlay */}
          {!booted && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-black/45 px-6 text-center">
              <p className="text-[11px] font-semibold tracking-[0.35em] text-[#10E59A] uppercase">The Concrete Drafting Lab</p>
              <h1 className="max-w-lg text-3xl font-extrabold leading-tight sm:text-5xl">
                The room is dark.
                <br />
                Walk in and wake it up.
              </h1>
              <p className="max-w-md text-sm leading-relaxed text-white/70">
                {isTouch
                  ? 'Drag to look around. The lamps wake station by station as you move — tap a station to open it.'
                  : 'Press W to walk in — the lamps wake station by station, and the glowing D spins up in the middle. Click any station to open it.'}
              </p>
              <button
                onClick={() => engineRef.current?.triggerBoot()}
                className="rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_36px_rgba(37,99,235,0.55)]"
              >
                {isTouch ? 'Tap to enter' : 'Enter the workshop'}
              </button>
              <p className="text-xs text-white/45">
                {isTouch ? 'Drag to look · Station dock below to jump' : 'WASD to move · Drag to look · 01–05 dock below to jump'}
              </p>
            </div>
          )}

          {/* station card */}
          {activeStation && (
            <article className="absolute bottom-[86px] left-3 z-20 w-[calc(100%-24px)] max-w-md rounded-2xl border border-white/10 bg-[#14181A] p-5 shadow-2xl sm:left-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.3em] text-[#10E59A]">{activeStation.num}</p>
                  <h2 className="mt-1 text-2xl font-extrabold">{activeStation.name}</h2>
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="rounded-full bg-white/10 px-3 py-1 text-sm"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{activeStation.line}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {activeStation.badges.map((b) => (
                  <span key={b} className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-white/70">
                    {b}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <a
                  href={activeStation.live}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[#2563EB] px-4 py-2 text-sm font-bold text-white"
                >
                  Live demo ↗
                </a>
                <a
                  href={activeStation.github}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
                >
                  GitHub ↗
                </a>
              </div>
            </article>
          )}

          {/* D menu */}
          {menuOpen && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 px-4" onClick={() => setMenuOpen(false)}>
              <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14181A] p-5" onClick={(e) => e.stopPropagation()}>
                <p className="text-[11px] font-bold tracking-[0.3em] text-[#2563EB]">QUICK NAV</p>
                <h2 className="mt-1 text-2xl font-extrabold">Where to?</h2>
                <div className="mt-4 flex flex-col gap-1">
                  {STATIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openStation(s.id)}
                      className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
                    >
                      <span>{s.num} · {s.name}</span>
                      <span className="text-white/40">→</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      engineRef.current?.goToCentre();
                      setMenuOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold hover:bg-white/10"
                  >
                    <span>Back to the centre</span>
                    <span className="text-white/40">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* station dock */}
          <nav className="absolute inset-x-0 bottom-3 z-20 flex justify-center px-2">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-black/60 p-1.5 backdrop-blur">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-sm font-extrabold text-white"
                aria-label="Quick nav menu"
              >
                D
              </button>
              {STATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => openStation(s.id)}
                  className={`shrink-0 rounded-full px-3 py-2.5 text-[13px] font-semibold whitespace-nowrap ${
                    active === s.id ? 'bg-[#FAF6EC] text-[#14181A]' : 'text-white/85 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[#10E59A]">{s.num}</span>{' '}
                  <span className="hidden md:inline">{s.name}</span>
                  <span className="md:hidden">{s.name.slice(0, 4)}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* honest label */}
          <p className="pointer-events-none absolute bottom-[70px] right-3 z-10 hidden text-[11px] text-white/35 sm:block">
            {mode === 'splat'
              ? 'A 3D reconstruction of my Genie world — static, no live steering.'
              : 'Built in Three.js from my Genie workshop — a recreation, not a scan.'}
          </p>
        </>
      )}
    </div>
  );
}

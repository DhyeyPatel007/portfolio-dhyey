import type { ViewName } from '../data/portfolioData';
import { STATIONS } from './stations';

/** Opt-in entry point on the 2D homepage: the 3D world loads only on click. */
export function WorkshopEntry({ go }: { go: (v: ViewName) => void }) {
  return (
    <section className="workshop-entry" style={{ background: '#14181A', color: '#FAF6EC', padding: '110px 24px 120px', textAlign: 'center' }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.35em', color: '#10E59A', textTransform: 'uppercase' }}>
        The Concrete Drafting Lab
      </p>
      <h2 style={{ marginTop: 18, fontSize: 'clamp(38px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.05 }}>
        Step inside my workshop.
      </h2>
      <p style={{ maxWidth: 620, margin: '18px auto 0', fontSize: 17, lineHeight: 1.6, color: 'rgba(250,246,236,0.72)' }}>
        Five projects, one room — DrawAnything, AuraPPH, SpecBalloon, Vajra and PHALANX
        as workstations on the bench. It starts dark; your first step wakes the lamps
        and spins up the glowing D.
      </p>
      <button
        onClick={() => go('workshop')}
        className="pill-btn"
        style={{ marginTop: 34, background: '#2563EB', color: '#fff', padding: '16px 34px', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 40px rgba(37,99,235,0.45)' }}
        data-hover
      >
        Explore my workshop in 3D →
      </button>
      <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(250,246,236,0.45)' }}>
        Loads only when you ask — the 2D site stays fast. Everything is also listed below, no WebGL needed.
      </p>
      <div style={{ marginTop: 34, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {STATIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => go('workshop')}
            style={{ border: '1px solid rgba(250,246,236,0.18)', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 600, color: 'rgba(250,246,236,0.85)', cursor: 'pointer' }}
            data-hover
          >
            <span style={{ color: '#10E59A' }}>{s.num}</span> {s.name}
          </button>
        ))}
      </div>
    </section>
  );
}

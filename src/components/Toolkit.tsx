import { TOOLS } from '../data/portfolioData';

export function Toolkit() {
  return (
    <section className="toolkit">
      <h2 className="toolkit-title reveal">My Creative Toolkit</h2>
      <div className="polaroid-field">
        {TOOLS.map((t) => (
          <div
            key={t.name}
            className="polaroid"
            data-speed={t.speed}
            style={{ left: t.left, top: t.top, transform: `rotate(${t.rotate}deg)` }}
            data-hover
          >
            <div className="sq" style={{ background: t.color }}>
              {t.short}
            </div>
            <p className="pname">{t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

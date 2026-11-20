function Sphere({ color, shape }: { color: string; shape: 'circle' | 'square' | 'triangle' | 'diamond' }) {
  return (
    <svg className="sphere" viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="1.6">
        <circle cx="60" cy="60" r="46" />
        <ellipse cx="60" cy="60" rx="30" ry="46" />
        <ellipse cx="60" cy="60" rx="13" ry="46" />
        <ellipse cx="60" cy="60" rx="46" ry="30" />
        <ellipse cx="60" cy="60" rx="46" ry="13" />
        <line x1="14" y1="60" x2="106" y2="60" />
      </g>
      {shape === 'circle' && <circle cx="60" cy="60" r="17" fill="#111" stroke={color} strokeWidth="2.5" />}
      {shape === 'square' && <rect x="44" y="44" width="32" height="32" fill="#111" stroke={color} strokeWidth="2.5" />}
      {shape === 'triangle' && <path d="M60 42 L78 76 L42 76 Z" fill="#111" stroke={color} strokeWidth="2.5" />}
      {shape === 'diamond' && <path d="M60 42 L78 60 L60 78 L42 60 Z" fill="#111" stroke={color} strokeWidth="2.5" />}
    </svg>
  );
}

const CARDS = [
  { color: '#2B5CFF', band: '#2B5CFF', shape: 'circle' as const, label: 'Mobile App\nDevelopment', ty: 16, rot: -6, ml: 0, z: 1 },
  { color: '#1FA9A0', band: '#1FA9A0', shape: 'square' as const, label: 'Web Apps\n& SaaS', ty: 0, rot: -2, ml: -26, z: 2 },
  { color: '#F24E9B', band: '#F24E9B', shape: 'triangle' as const, label: 'AI Tools &\nAutomation', ty: 0, rot: 2, ml: -26, z: 3 },
  { color: '#FFB020', band: '#FF8A1A', shape: 'diamond' as const, label: 'UI/UX &\nFigma Design', ty: 16, rot: 6, ml: -26, z: 4 },
];

export function Services() {
  return (
    <section className="services">
      <h2 className="section-title taupe chars">
        What I can
        <br />
        Help you with?
      </h2>
      <div className="fan reveal">
        {CARDS.map((c) => (
          <article
            key={c.label}
            className="svc-card"
            data-ty={c.ty}
            data-rot={c.rot}
            style={{ transform: `rotate(${c.rot}deg) translateY(${c.ty}px)`, marginLeft: c.ml, zIndex: c.z }}
          >
            <Sphere color={c.color} shape={c.shape} />
            <div className="svc-band" style={{ background: c.band }}>
              {c.label.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

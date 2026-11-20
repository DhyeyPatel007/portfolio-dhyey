import { useState } from 'react';
import type { Category, ViewName } from '../data/portfolioData';
import { CATEGORY_TABS, PROJECTS } from '../data/portfolioData';

export function ProjectsHome({ go }: { go: (v: ViewName) => void }) {
  const [tab, setTab] = useState<Category | 'all'>('ai');
  const shown = tab === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cats.includes(tab));

  return (
    <section className="projects-home">
      <h2 className="beyond-title reveal">Beyond the Visuals</h2>
      <div className="tabs on-dark">
        {CATEGORY_TABS.map((t) => (
          <button
            key={t.key}
            className={'tab' + (tab === t.key ? ' active' : '')}
            onClick={() => setTab(t.key)}
            data-hover
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="beyond-grid">
        {shown.map((p) => (
          <a key={p.id} className="beyond-card" href={p.link} target="_blank" rel="noopener" data-hover>
            <img className="poster-img" src={p.poster} alt={`${p.name} poster`} loading="lazy" />
            <span className="beyond-meta">
              <strong>{p.name}</strong>
              <em>{p.desc}</em>
              <i>{p.catLabel}</i>
            </span>
          </a>
        ))}
      </div>
      <div className="projects-cta">
        <button className="pill-btn white small" onClick={() => go('projects')} data-hover>
          View All Projects <span className="arr">↗</span>
        </button>
      </div>
    </section>
  );
}

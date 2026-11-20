import { useState } from 'react';
import type { Category } from '../data/portfolioData';
import { CATEGORY_TABS, PROJECTS } from '../data/portfolioData';
import { Contact } from './Contact';
import { Footer } from './Footer';
import type { ViewName } from '../data/portfolioData';

const FOLDERS = [
  { cls: 'f1', rot: -14 },
  { cls: 'f2', rot: 10 },
  { cls: 'f3', rot: 16 },
  { cls: 'f4', rot: -8 },
];

export function ProjectsView({ go }: { go: (v: ViewName) => void }) {
  const [tab, setTab] = useState<Category | 'all'>('ai');
  const shown = tab === 'all' ? PROJECTS : PROJECTS.filter((p) => p.cats.includes(tab));

  return (
    <>
      <section className="proj-hero">
        <h1 className="proj-giant" data-speed="0.06">Projects</h1>
        {FOLDERS.map((f) => (
          <svg key={f.cls} className={`folder ${f.cls}`} style={{ transform: `rotate(${f.rot}deg)` }} viewBox="0 0 134 104" aria-hidden="true">
            <use href="#folder" />
          </svg>
        ))}
      </section>
      <section className="projects-page">
        <div className="tabs">
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
        <div className="grid">
          {shown.map((p) => (
            <a key={p.id} className="proj-card" href={p.link} target="_blank" rel="noopener" data-hover>
              <img className="poster-img" src={p.poster} alt={`${p.name} poster`} loading="lazy" />
              <span className="proj-meta">
                <strong>{p.name}</strong>
                <em>{p.desc}</em>
                <i>{p.catLabel}</i>
              </span>
            </a>
          ))}
        </div>
      </section>
      <Contact />
      <Footer go={go} />
    </>
  );
}

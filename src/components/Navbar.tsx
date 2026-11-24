import type { ViewName } from '../data/portfolioData';
import { PROFILE } from '../data/portfolioData';

const LINKS: { key: ViewName; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'projects', label: 'Projects' },
  { key: 'about', label: 'About Me' },
  { key: 'workshop', label: '3D World' },
];

export function Navbar({ view, go }: { view: ViewName; go: (v: ViewName) => void }) {
  return (
    <>
      <header className="nav-wrap">
        <nav className="pill-nav" aria-label="Main">
          {LINKS.map((l) => (
            <button
              key={l.key}
              className={'nav-link' + (view === l.key ? ' active' : '')}
              onClick={() => go(l.key)}
              data-hover
            >
              {l.label}
            </button>
          ))}
        </nav>
      </header>
      <a className="nav-connect" href={`mailto:${PROFILE.email}`} data-hover>
        Let&apos;s Connect <span className="arr">↗</span>
      </a>
    </>
  );
}

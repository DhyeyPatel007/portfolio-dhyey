import type { ViewName } from '../data/portfolioData';

export function Intro({ go }: { go: (v: ViewName) => void }) {
  return (
    <section className="intro">
      <p className="intro-text reveal">
        I Combine Development Skill With Design Sense To Build Mobile Apps, AI Tools And SaaS
        Products That Are Clean, Structured And Made To Work In The Real World. My Work Focuses On
        Clarity, Consistency, And Shipping — Ensuring Every Product Is Both Well-Built And
        Effective In Its Intent.
      </p>
      <button className="pill-btn olive reveal" onClick={() => go('about')} data-hover>
        More About Me <span className="arr">↗</span>
      </button>
    </section>
  );
}

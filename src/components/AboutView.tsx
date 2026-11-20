import type { ViewName } from '../data/portfolioData';
import { Contact } from './Contact';
import { Footer } from './Footer';

export function AboutView({ go }: { go: (v: ViewName) => void }) {
  return (
    <>
      <section className="about-hero">
        <h1 className="about-giant">Dhyey</h1>
        <span className="about-pill">About Me ↓</span>
      </section>
      <section className="about-grey">
        <h2 className="about-giant-white" data-speed="0.05">Dhyey</h2>
        <div className="about-portrait-card reveal">
          <svg className="leaf l1" viewBox="0 0 90 40" aria-hidden="true">
            <use href="#leaf" />
          </svg>
          <img className="flower a-f1" src="/assets/sunflower.png" alt="" style={{ rotate: '20deg' }} />
          <img className="main" src="/assets/about-main.png" alt="Dhyey Patel" />
          <img className="flower a-f2" src="/assets/sunflower.png" alt="" style={{ rotate: '-26deg' }} />
        </div>
      </section>
      <section className="about-body">
        <div className="about-block reveal">
          <p style={{ fontSize: 20, color: '#8a8378', fontWeight: 500 }}>Hello, I&apos;m</p>
          <h2 style={{ fontSize: 'clamp(40px,5.5vw,64px)' }}>Dhyey</h2>
          <p style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#111', lineHeight: 1.35 }}>
            I Build to Get Noticed.
            <br />
            And Ship to be Chosen.
          </p>
          <p style={{ marginTop: 18 }}>
            I&apos;m Dhyey Patel, a developer and founder from India who blends building with
            design to craft products that don&apos;t just look good — they ship, and they work in
            the real world.
          </p>
        </div>
        <div className="about-block reveal">
          <h2>Education</h2>
          <ul className="edu-list">
            <li>
              <strong>B.Tech, Computer Science &amp; Engineering</strong> — VIT Bhopal
              <br />
              <span style={{ color: '#777' }}>2025 – 2029</span>
            </li>
          </ul>
        </div>
        <div className="about-block reveal">
          <h2>Experience</h2>
          <ul className="edu-list">
            <li>
              <strong>Founder &amp; Developer</strong> — Auditify{' '}
              <span style={{ color: '#777' }}>(Sep 2026 – Present)</span>
            </li>
            <li>
              <strong>Freelance Developer</strong>{' '}
              <span style={{ color: '#777' }}>(Jan 2026 – Present)</span>
            </li>
            <li>
              <strong>Editor</strong> — GSoC Innovators Club, VIT Bhopal
            </li>
          </ul>
        </div>
      </section>
      <Contact />
      <Footer go={go} />
    </>
  );
}

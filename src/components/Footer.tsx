import type { ViewName } from '../data/portfolioData';
import { PROFILE } from '../data/portfolioData';

export function Footer({ go }: { go: (v: ViewName) => void }) {
  return (
    <footer className="footer">
      <div className="footer-cols">
        <p className="footer-tag">
          Builder Mindset.
          <br />
          Design Skillset.
          <br />
          Product Vision.
        </p>
        <nav className="footer-col">
          <h3>Quick Links</h3>
          <button onClick={() => go('home')} data-hover>Home</button>
          <button onClick={() => go('projects')} data-hover>Projects</button>
          <button onClick={() => go('about')} data-hover>About Me</button>
        </nav>
        <div className="footer-col">
          <h3>Connect Me On</h3>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener" data-hover>LinkedIn</a>
          <a href={PROFILE.github} target="_blank" rel="noopener" data-hover>GitHub</a>
        </div>
      </div>
      <div className="footer-giant" data-speed="0.04">Dhyey</div>
      <div className="footer-bar">
        <span>Proudly Crafted in India</span>
        <span>©2026 Dhyey Patel</span>
        <span>All Rights Reserved</span>
      </div>
    </footer>
  );
}

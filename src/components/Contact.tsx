import { PROFILE } from '../data/portfolioData';

export function Contact() {
  return (
    <section className="contact">
      <div className="contact-bg" />
      <div className="contact-inner">
        <h2 className="contact-big">
          Great Things
          <br />
          Begin Together.
        </h2>
        <p className="contact-sub">
          From Product Builds to New Opportunities, Let&apos;s make Something Meaningful happen.
        </p>
        <p className="contact-mail">{PROFILE.email}</p>
        <a className="pill-btn white" href={`mailto:${PROFILE.email}`} data-hover>
          Let&apos;s Connect <span className="arr">↗</span>
        </a>
      </div>
    </section>
  );
}

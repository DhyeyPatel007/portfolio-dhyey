import { VIDEOS } from '../data/portfolioData';

export function VideoSection() {
  return (
    <section className="video-sec">
      <div className="video-watermark" aria-hidden="true">Video Editing</div>
      <h2 className="video-title reveal">V I D E O &nbsp; E D I T I N G</h2>
      <div className="video-row">
        {VIDEOS.map((v) => (
          <div key={v.title} className="video-card reveal" style={{ marginTop: v.offset }} data-hover>
            <p className="video-big">{v.title}</p>
            <p className="video-small">{v.desc}</p>
            <span className="video-link">{v.kind}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

import { ARCHIVE_TILES } from '../data/portfolioData';
import { FolderSvg } from './SvgDefs';

export function Archive() {
  return (
    <section className="archive">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />
      <FolderSvg className="arch-folder af-1" color="#5B8DEF" />
      <FolderSvg className="arch-folder af-2" color="#F2A93B" />
      <FolderSvg className="arch-folder af-3" color="#7FB069" />
      <h2 className="watermark chars" data-speed="0.07">
        Visual
        <br />
        Archive
      </h2>
      <p className="archive-sub reveal">B E Y O N D &nbsp; T H E &nbsp; V I S U A L S</p>
      <div className="archive-masonry">
        {ARCHIVE_TILES.map((t, i) => (
          <a
            key={i}
            className={`arch-card ${t.shape}`}
            href={t.project.link}
            target="_blank"
            rel="noopener"
            data-hover
          >
            <img className="poster-img" src={t.project.poster} alt={`${t.project.name} poster`} loading="lazy" />
            <span className="arch-label">
              {t.project.name.toUpperCase()} <i>↗</i>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

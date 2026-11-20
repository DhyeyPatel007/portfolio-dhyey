export function Hero() {
  return (
    <section className="hero">
      <h1 className="giant-name" data-speed="0.05">Dhyey</h1>
      <div className="hero-stage">
        <div className="hero-comp" aria-label="Dhyey Patel portrait with sunflowers">
          <img className="hl hl-back" data-speed="0.14" src="/assets/hero-flowers-back.webp" alt="" />
          <img className="hl hl-person" data-speed="0.07" src="/assets/hero-person.webp" alt="Dhyey Patel portrait" />
          <img className="hl hl-front" data-speed="0.2" src="/assets/hero-flowers-front.webp" alt="" />
        </div>
        <div className="hero-intro reveal">
          <p className="hello">Hello I&apos;m</p>
          <p className="name">Dhyey</p>
          <p className="tagline">
            I Build Apps &amp; AI Tools.
            <br />
            And Ship Them For Real.
          </p>
        </div>
      </div>
    </section>
  );
}

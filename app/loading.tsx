// Shown while the server resolves AniList data. Mirrors the real layout so the
// swap is a fill, not a reflow.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading">
      <section className="hero">
        <div className="hero-body">
          <span className="hero-eyebrow">Kitsune · anime discovery</span>
          <h1 className="hero-title" style={{ opacity: 0.25 }}>
            Find the one you&apos;ll binge next.
          </h1>
          <div className="sk sk-line sk-shim" style={{ height: 30, maxWidth: 620, marginTop: 24 }} />
        </div>
      </section>
      {[0, 1].map((i) => (
        <section className="section shell" key={i}>
          <div className="sk sk-line sk-shim" style={{ width: 180, height: 22, marginBottom: 24 }} />
          <div className="rail">
            {Array.from({ length: 6 }).map((_, n) => (
              <div className="sk" key={n} style={{ width: 176 }}>
                <div className="sk-img sk-shim" />
                <div className="sk-line sk-shim" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}

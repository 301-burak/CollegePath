import './App.css'

function App() {
  return (
    <div className="page">
      <header className="site-header">
        <a className="brand" href="#" aria-label="CollegePath home">CollegePath</a>
        <nav aria-label="Main navigation">
          <a href="#career-recommendations">Career Recommendations</a>
          <a href="#my-checklist">My Checklist</a>
        </nav>
      </header>

      <main>
        <section className="welcome">
          <p className="eyebrow">Your next step starts here</p>
          <h1>Plan a future that feels like yours.</h1>
          <p className="intro">
            Explore your path to college and career, one step at a time.
          </p>
        </section>

        <section className="placeholders" aria-label="Coming soon">
          <article id="career-recommendations" className="placeholder-card">
            <p className="eyebrow">Coming soon</p>
            <h2>Career Recommendations</h2>
            <p>Discover career paths to explore in a future update.</p>
          </article>
          <article id="my-checklist" className="placeholder-card">
            <p className="eyebrow">Coming soon</p>
            <h2>My Checklist</h2>
            <p>Keep track of your college planning steps in a future update.</p>
          </article>
        </section>
      </main>
      <footer>CollegePath · Built for your next chapter</footer>
    </div>
  )
}

export default App

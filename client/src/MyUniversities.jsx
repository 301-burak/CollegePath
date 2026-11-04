import { useEffect, useMemo, useState } from 'react'

async function readJson(response, fallbackMessage) {
  let result
  try {
    result = await response.json()
  } catch {
    throw new Error(fallbackMessage)
  }
  if (!response.ok) throw new Error(result.error || fallbackMessage)
  return result
}

function UniversityFact({ fact }) {
  return (
    <article className="university-fact">
      <h4>{fact.title}</h4>
      <p>{fact.text}</p>
      <p className="university-source">
        <span>{fact.status === 'verified' ? 'Verified source' : 'Not verified'}</span>
        {' · '}Last verified {fact.lastVerified}.{' '}
        <a href={fact.sourceUrl} target="_blank" rel="noreferrer">{fact.sourceUrl}</a>
      </p>
    </article>
  )
}

function UniversityCard({ university, goal, busy, onToggleGoal }) {
  return (
    <article className="university-card">
      <div className="university-card-heading">
        <div>
          <h3>{university.name}</h3>
          <p>{university.location}</p>
        </div>
        <button
          className={goal ? 'university-remove' : 'career-submit'}
          type="button"
          disabled={busy}
          onClick={() => onToggleGoal(university)}
        >
          {busy ? 'Saving...' : goal ? 'Remove goal' : 'Add to my goals'}
        </button>
      </div>
      <a className="university-admissions-link" href={university.admissionsUrl} target="_blank" rel="noreferrer">
        Official admissions website
      </a>
      <details className="university-details">
        <summary>Admissions information and deadlines</summary>
        <div className="university-facts">
          {university.facts.map((fact) => <UniversityFact fact={fact} key={fact.type} />)}
        </div>
      </details>
      <div className="university-preparation">
        <h4>Optional preparation ideas</h4>
        <p>These are general planning suggestions, not university requirements:</p>
        <ul>
          <li>Explore classes and activities that genuinely interest you.</li>
          <li>Try a personal project, meaningful community involvement, or a school club.</li>
          <li>Talk with a school counselor and keep a personal application timeline.</li>
        </ul>
      </div>
    </article>
  )
}

function MyUniversities() {
  const [universities, setUniversities] = useState([])
  const [goals, setGoals] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [busyGoal, setBusyGoal] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    async function fetchData() {
      try {
        const [catalogResponse, goalsResponse] = await Promise.all([
          fetch('/api/universities'),
          fetch('/api/university-goals'),
        ])
        const [catalog, savedGoals] = await Promise.all([
          readJson(catalogResponse, 'Unable to load the university catalog.'),
          readJson(goalsResponse, 'Unable to load your university goals.'),
        ])
        if (!Array.isArray(catalog) || !Array.isArray(savedGoals)) {
          throw new Error('The university information was not in the expected format.')
        }
        if (active) {
          setUniversities(catalog)
          setGoals(savedGoals)
        }
      } catch (requestError) {
        if (active) {
          setLoadError(requestError.message || 'Unable to load universities. Please try again.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [retryCount])

  function retryLoading() {
    setLoadError('')
    setLoading(true)
    setRetryCount((count) => count + 1)
  }

  const matchingUniversities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return universities
    return universities.filter((university) => (
      university.id.toLocaleLowerCase().includes(query)
      ||
      university.name.toLocaleLowerCase().includes(query)
      || university.location.toLocaleLowerCase().includes(query)
    ))
  }, [search, universities])

  async function toggleGoal(university) {
    const existingGoal = goals.find((goal) => goal.universityId === university.id)
    setBusyGoal(university.id)
    setError('')
    try {
      if (existingGoal) {
        const response = await fetch(`/api/university-goals/${existingGoal.id}`, { method: 'DELETE' })
        if (!response.ok) {
          await readJson(response, 'Unable to remove this university goal.')
        }
        setGoals((currentGoals) => currentGoals.filter((goal) => goal.id !== existingGoal.id))
      } else {
        const response = await fetch('/api/university-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ universityId: university.id }),
        })
        const savedGoal = await readJson(response, 'Unable to save this university goal.')
        setGoals((currentGoals) => [savedGoal, ...currentGoals])
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to update your university goals. Please try again.')
    } finally {
      setBusyGoal(null)
    }
  }

  const goalUniversities = goals
    .map((goal) => universities.find((university) => university.id === goal.universityId))
    .filter(Boolean)

  return (
    <article className="universities-card" aria-labelledby="universities-heading">
      <p className="eyebrow">Explore your options</p>
      <h2 id="universities-heading">My Universities</h2>
      <p className="universities-intro">
        Save schools you may want to explore. Published score ranges are context, not minimums;
        saved goals do not predict or guarantee admission.
      </p>

      {error && <p className="checklist-error" role="alert">{error}</p>}
      {loading ? (
        <p className="checklist-status" role="status">Loading universities...</p>
      ) : loadError ? (
        <div className="university-load-error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="career-submit" onClick={retryLoading}>Try again</button>
        </div>
      ) : (
        <>
          <section className="university-goals" aria-labelledby="saved-universities-heading">
            <h3 id="saved-universities-heading">Saved goals</h3>
            {goalUniversities.length === 0 ? (
              <p className="checklist-empty">
                You have not saved any universities yet. Search the catalog below and add schools to explore.
              </p>
            ) : (
              <ul className="university-goal-list">
                {goalUniversities.map((university) => {
                  return (
                    <li key={university.id}>
                      <span>{university.name}</span>
                      <button
                        type="button"
                        className="university-remove"
                        disabled={busyGoal === university.id}
                        onClick={() => toggleGoal(university)}
                      >
                        {busyGoal === university.id ? 'Saving...' : 'Remove'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <div className="university-search">
            <label htmlFor="university-search">Search universities</label>
            <input
              id="university-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by university or location"
              maxLength={80}
            />
          </div>

          {matchingUniversities.length === 0 ? (
            <p className="checklist-empty">No universities match that search. Try another name or location.</p>
          ) : (
            <div className="university-list">
              {matchingUniversities.map((university) => {
                const goal = goals.find((entry) => entry.universityId === university.id)
                return (
                  <UniversityCard
                    key={university.id}
                    university={university}
                    goal={goal}
                    busy={busyGoal === university.id}
                    onToggleGoal={toggleGoal}
                  />
                )
              })}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export default MyUniversities

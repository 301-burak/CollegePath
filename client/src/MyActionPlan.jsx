import { useEffect, useMemo, useState } from 'react'
import {
  actionPlanCategories,
  fetchActionPlanData,
  generateActionPlan,
} from './actionPlan.js'
import { careerPathways } from './careerPathways.js'

async function readJson(response, fallback) {
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(fallback)
  }
  if (!response.ok) {
    const error = new Error(data.error || fallback)
    error.status = response.status
    error.details = data
    throw error
  }
  return data
}

function ActionPlanCard({ recommendation, onAdd, saving }) {
  return (
    <article className="action-plan-item">
      <div className="action-plan-item-header">
        <h4>{recommendation.title}</h4>
        <span className={`action-plan-priority priority-${recommendation.priority.toLowerCase()}`}>
          {recommendation.priority} priority
        </span>
      </div>
      <p>{recommendation.description}</p>
      <p className="action-plan-reason"><strong>Why this fits:</strong> {recommendation.reason}</p>
      {recommendation.sourceLinks.length > 0 && (
        <ul className="action-plan-sources" aria-label="Official university sources">
          {recommendation.sourceLinks.map((source) => (
            <li key={`${source.url}:${source.label}`}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
              {!source.verified && <span> (detail not verified)</span>}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className="action-plan-add"
        disabled={saving || recommendation.alreadyInChecklist}
        onClick={() => onAdd(recommendation)}
      >
        {saving
          ? 'Adding...'
          : recommendation.alreadyInChecklist
            ? recommendation.checklistItem?.completed ? 'Already completed' : 'In My Checklist'
            : 'Add to My Checklist'}
      </button>
    </article>
  )
}

function MyActionPlan({ pathwayId, onPathwayChange, checklistItems, onChecklistItemAdded }) {
  const [profileData, setProfileData] = useState(null)
  const [universities, setUniversities] = useState([])
  const [universityGoals, setUniversityGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requestError, setRequestError] = useState('')
  const [status, setStatus] = useState('')
  const [savingRecommendation, setSavingRecommendation] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadPlanData() {
      try {
        const { profileData: savedProfile, universityGoals: savedGoals, universities: catalog } =
          await fetchActionPlanData()
        if (active) {
          setProfileData(savedProfile)
          setUniversityGoals(savedGoals)
          setUniversities(catalog)
        }
      } catch (error) {
        if (active) setLoadError(error.message || 'Unable to build your action plan.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPlanData()
    return () => {
      active = false
    }
  }, [retryCount])

  const pathway = careerPathways.find((item) => item.id === pathwayId) ?? null
  const recommendations = useMemo(() => {
    if (!profileData) return []
    return generateActionPlan({
      ...profileData,
      pathway,
      universities,
      universityGoals,
      checklistItems,
    })
  }, [checklistItems, pathway, profileData, universities, universityGoals])

  const categories = useMemo(() => {
    const grouped = new Map()
    for (const recommendation of recommendations) {
      if (!grouped.has(recommendation.category)) grouped.set(recommendation.category, [])
      grouped.get(recommendation.category).push(recommendation)
    }
    return grouped
  }, [recommendations])
  const orderedCategories = useMemo(() => actionPlanCategories
    .filter((category) => categories.has(category))
    .map((category) => [category, categories.get(category)]), [categories])

  async function addRecommendation(recommendation) {
    setSavingRecommendation(recommendation.id)
    setRequestError('')
    setStatus('')
    try {
      const response = await fetch('/api/checklist/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: recommendation.title }),
      })
      if (response.status === 409) {
        const result = await response.json()
        if (result.item) onChecklistItemAdded(result.item)
        setStatus(result.error || 'This recommendation is already in My Checklist.')
        return
      }
      const savedItem = await readJson(response, 'Unable to add this recommendation to My Checklist.')
      onChecklistItemAdded(savedItem)
      setStatus(`Added “${savedItem.title}” to My Checklist.`)
    } catch (error) {
      setRequestError(error.message || 'Unable to add this recommendation. Please try again.')
    } finally {
      setSavingRecommendation('')
    }
  }

  function retryLoading() {
    setLoading(true)
    setLoadError('')
    setRetryCount((count) => count + 1)
  }

  return (
    <article className="action-plan-card" aria-labelledby="action-plan-heading">
      <p className="eyebrow">Small steps, tailored to you</p>
      <h2 id="action-plan-heading">My Action Plan</h2>
      <p className="action-plan-intro">
        Practical, optional next steps based on your saved profile and goals. Suggestions are not
        admissions requirements or guarantees.
      </p>
      <a className="action-plan-checklist-link" href="#my-checklist">
        Track added actions in My Checklist
      </a>

      <button
        type="button"
        className="action-plan-refresh"
        disabled={loading}
        onClick={retryLoading}
      >
        {loading ? 'Refreshing...' : 'Refresh saved information'}
      </button>

      <div className="action-plan-pathway">
        <label htmlFor="action-plan-pathway">Career pathway to explore</label>
        <select
          id="action-plan-pathway"
          value={pathwayId ?? ''}
          onChange={(event) => onPathwayChange(event.target.value || null)}
        >
          <option value="">Choose a pathway (optional)</option>
          {careerPathways.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
        </select>
        {!pathway && (
          <p className="action-plan-hint">
            Choose a pathway to include related course, activity, and project suggestions.
          </p>
        )}
      </div>

      {requestError && <p className="checklist-error" role="alert">{requestError}</p>}
      {status && <p className="action-plan-status" role="status">{status}</p>}

      {loading ? (
        <p className="checklist-status" role="status">Building your action plan from saved information...</p>
      ) : loadError ? (
        <div className="university-load-error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="career-submit" onClick={retryLoading}>Try again</button>
        </div>
      ) : (
        <>
          <div className="action-plan-overview" aria-label="Saved planning information">
            <div><strong>{profileData.profile.gradeLevel ?? '—'}</strong><span>Grade</span></div>
            <div><strong>{profileData.courses.length}</strong><span>Saved courses</span></div>
            <div><strong>{profileData.testScores.length}</strong><span>Test records</span></div>
            <div><strong>{universityGoals.length}</strong><span>University goals</span></div>
          </div>

          {(profileData.profile.gradeLevel === null || profileData.courses.length === 0
            || (profileData.profile.weightedGpa === null && profileData.profile.unweightedGpa === null)
            || profileData.testScores.length === 0) && (
            <div className="action-plan-profile-note">
              <h3>Profile details to know about</h3>
              <p>
                {profileData.profile.gradeLevel === null && 'Grade level is not saved. '}
                {profileData.courses.length === 0 && 'No completed courses are saved. '}
                {profileData.profile.weightedGpa === null && profileData.profile.unweightedGpa === null
                  && 'GPA is not saved. '}
                {profileData.testScores.length === 0 && 'No SAT/ACT scores are saved. '}
                The plan avoids assuming missing information; GPA scales vary and no admission cutoffs are inferred.
              </p>
            </div>
          )}

          {recommendations.length === 0 ? (
            <p className="checklist-empty">
              Your saved information is ready. Choose a pathway or add profile details to see suggested next steps.
            </p>
          ) : (
            <div className="action-plan-groups">
              {orderedCategories.map(([category, items]) => (
                <section className="action-plan-group" key={category} aria-label={category}>
                  <h3>{category} <span>{items.length}</span></h3>
                  <div className="action-plan-items">
                    {items.map((recommendation) => (
                      <ActionPlanCard
                        key={recommendation.id}
                        recommendation={recommendation}
                        saving={savingRecommendation === recommendation.id}
                        onAdd={addRecommendation}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </article>
  )
}

export default MyActionPlan

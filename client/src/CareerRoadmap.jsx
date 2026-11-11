import { useEffect, useState } from 'react'
import { fetchRoadmapCourses, getRoadmapViewModel } from './careerPathways.js'
import './CareerRoadmap.css'

export function CareerRoadmapDetails({ pathway, courses }) {
  const roadmap = getRoadmapViewModel(pathway, courses)

  return (
    <article className="roadmap-detail" aria-labelledby="roadmap-title">
      <header className="roadmap-heading">
        <div>
          <p className="eyebrow">Career pathway roadmap</p>
          <h3 id="roadmap-title">{roadmap.title}</h3>
          <p className="roadmap-description">{roadmap.description}</p>
          <p className="roadmap-careers">
            Careers to explore: {roadmap.careers.join(' · ')}
          </p>
        </div>
      </header>

      <p className="roadmap-personalization" role="status">
        {roadmap.personalizationMessage}
      </p>

      {roadmap.takenCourses.length > 0 && (
        <section className="roadmap-section" aria-labelledby="coursework-heading">
          <div className="roadmap-section-heading">
            <p className="eyebrow">Your starting point</p>
            <h4 id="coursework-heading">Coursework that connects</h4>
          </div>
          <ul className="roadmap-course-list">
            {roadmap.takenCourses.map((suggestion) => (
              <li className="roadmap-course is-taken" key={suggestion.name}>
                <div>
                  <h5>{suggestion.name}</h5>
                  <p>
                    In your profile: {suggestion.matchingCourses
                      .map((course) => `${course.courseName}${course.level ? ` (${course.level})` : ''}`)
                      .join(', ')}
                  </p>
                  <p>{suggestion.reason}</p>
                </div>
                <span className="roadmap-badge">In your profile</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="roadmap-section" aria-labelledby="courses-to-explore-heading">
        <div className="roadmap-section-heading">
          <p className="eyebrow">Suggestions, not requirements</p>
          <h4 id="courses-to-explore-heading">
            {roadmap.hasAcademicHistory ? 'Courses you could explore next' : 'High school courses to explore'}
          </h4>
          <p>Course availability and advanced options vary by school. Choose what fits your interests and preparation.</p>
        </div>
        <ul className="roadmap-course-list">
          {roadmap.suggestedCourses.map((suggestion) => (
            <li className="roadmap-course" key={suggestion.name}>
              <div>
                <h5>{suggestion.name}</h5>
                <p>{suggestion.reason}</p>
                <p><strong>Possible advanced options:</strong> {suggestion.advancedOptions.join(' · ')}</p>
              </div>
              <span className="roadmap-badge suggestion">Suggested</span>
            </li>
          ))}
          {roadmap.suggestedCourses.length === 0 && (
            <li className="roadmap-course">
              <p>Your saved coursework connects to all of the course areas listed in this roadmap. Explore a project or activity below if you would like another next step.</p>
            </li>
          )}
        </ul>
      </section>

      <div className="roadmap-two-column">
        <section className="roadmap-section" aria-labelledby="skills-heading">
          <div className="roadmap-section-heading">
            <p className="eyebrow">Keep building over time</p>
            <h4 id="skills-heading">Skills to develop</h4>
          </div>
          <div className="roadmap-skill-groups">
            <div>
              <h5>Technical skills</h5>
              <ul>{roadmap.technicalSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </div>
            <div>
              <h5>People and learning skills</h5>
              <ul>{roadmap.softSkills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="roadmap-section" aria-labelledby="activities-heading">
          <div className="roadmap-section-heading">
            <p className="eyebrow">Optional ways to explore</p>
            <h4 id="activities-heading">Activities and competitions</h4>
            <p>These are ideas to explore, not admissions requirements.</p>
          </div>
          <ul className="roadmap-bullet-list">
            {roadmap.extracurriculars.map((activity) => <li key={activity}>{activity}</li>)}
          </ul>
        </section>
      </div>

      <div className="roadmap-two-column">
        <section className="roadmap-section" aria-labelledby="projects-heading">
          <div className="roadmap-section-heading">
            <p className="eyebrow">Learn by making</p>
            <h4 id="projects-heading">Personal project ideas</h4>
          </div>
          <ul className="roadmap-bullet-list">
            {roadmap.projects.map((project) => <li key={project}>{project}</li>)}
          </ul>
        </section>

        <section className="roadmap-section" aria-labelledby="grade-roadmap-heading">
          <div className="roadmap-section-heading">
            <p className="eyebrow">Flexible ideas for each year</p>
            <h4 id="grade-roadmap-heading">Grade-by-grade roadmap</h4>
            <p>Adjust these suggestions to your school schedule, interests, and circumstances.</p>
          </div>
          <ol className="roadmap-grade-list">
            {roadmap.gradeRoadmap.map(({ grade, focus, actions }) => (
              <li key={grade}>
                <div className="roadmap-grade-label">
                  <span>Grade {grade}</span>
                  <strong>{focus}</strong>
                </div>
                <ul>{actions.map((action) => <li key={action}>{action}</li>)}</ul>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  )
}

function CareerRoadmap({ pathway, onClose }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCourses() {
    setLoading(true)
    setError('')
    try {
      setCourses(await fetchRoadmapCourses())
    } catch (loadError) {
      setError(loadError.message || 'Unable to load your saved courses. You can try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchRoadmapCourses()
      .then((savedCourses) => {
        if (active) setCourses(savedCourses)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || 'Unable to load your saved courses. You can try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="roadmap-panel" aria-label={`${pathway.title} roadmap`}>
      <div className="roadmap-panel-actions">
        <button className="roadmap-back" type="button" onClick={onClose}>
          <span aria-hidden="true">←</span> Back to career recommendations
        </button>
      </div>
      {loading ? (
        <p className="roadmap-feedback" role="status">Personalizing your roadmap from your Academic Profile...</p>
      ) : error ? (
        <div className="roadmap-feedback error" role="alert">
          <p>{error}</p>
          <button className="roadmap-retry" type="button" onClick={loadCourses}>Try again</button>
          <button
            className="roadmap-retry secondary"
            type="button"
            onClick={() => {
              setCourses([])
              setError('')
            }}
          >
            View general roadmap instead
          </button>
        </div>
      ) : (
        <CareerRoadmapDetails pathway={pathway} courses={courses} />
      )}
    </section>
  )
}

export default CareerRoadmap

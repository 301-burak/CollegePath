import { useEffect, useState } from 'react'
import './AcademicProfile.css'

const courseLevels = ['Regular', 'Honors', 'AP', 'IB', 'Dual Credit']
const testTypes = [
  { value: 'sat_math', label: 'SAT Math', min: 200, max: 800 },
  { value: 'sat_reading_writing', label: 'SAT Reading and Writing', min: 200, max: 800 },
  { value: 'act_composite', label: 'ACT Composite', min: 1, max: 36 },
]

const emptyCourse = {
  courseName: '',
  level: 'Regular',
  grade: '',
  schoolYear: '',
}

const emptyTestScore = {
  testType: 'sat_math',
  score: '',
  testDate: '',
}

async function requestJson(url, options) {
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error('Unable to reach the CollegePath server. Check that it is running and try again.')
  }

  if (!response.ok) {
    let body
    try {
      body = await response.json()
    } catch {
      throw new Error('The request could not be completed. Please try again.')
    }
    throw new Error(body.error || 'The request could not be completed.')
  }

  if (response.status === 204) return null
  return response.json()
}

function toCoursePayload(course) {
  return {
    ...course,
    courseName: course.courseName.trim(),
    grade: course.grade.trim(),
    schoolYear: course.schoolYear.trim(),
  }
}

function formatTestType(testType) {
  return testTypes.find((type) => type.value === testType)?.label ?? testType
}

function populateAcademicData(data, setProfile, setCourses, setTestScores) {
  setProfile({
    gradeLevel: data.profile.gradeLevel ?? '',
    weightedGpa: data.profile.weightedGpa ?? '',
    unweightedGpa: data.profile.unweightedGpa ?? '',
  })
  setCourses(data.courses)
  setTestScores(data.testScores)
}

function AcademicProfile() {
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [testScores, setTestScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [courseForm, setCourseForm] = useState(emptyCourse)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [savingCourse, setSavingCourse] = useState(false)
  const [testForm, setTestForm] = useState(emptyTestScore)
  const [editingTestId, setEditingTestId] = useState(null)
  const [savingTest, setSavingTest] = useState(false)

  async function loadProfile() {
    setLoading(true)
    setLoadError('')
    setError('')
    try {
      const data = await requestJson('/api/profile')
      populateAcademicData(data, setProfile, setCourses, setTestScores)
    } catch (loadRequestError) {
      setLoadError(loadRequestError.message || 'Unable to load your academic profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    requestJson('/api/profile')
      .then((data) => {
        if (active) populateAcademicData(data, setProfile, setCourses, setTestScores)
      })
      .catch((loadRequestError) => {
        if (active) {
          setLoadError(loadRequestError.message || 'Unable to load your academic profile.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  function clearFeedback() {
    setError('')
    setStatus('')
  }

  async function handleSaveProfile(event) {
    event.preventDefault()
    clearFeedback()
    setSavingProfile(true)
    try {
      const savedProfile = await requestJson('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: profile.gradeLevel === '' ? null : Number(profile.gradeLevel),
          weightedGpa: profile.weightedGpa === '' ? null : Number(profile.weightedGpa),
          unweightedGpa: profile.unweightedGpa === '' ? null : Number(profile.unweightedGpa),
        }),
      })
      setProfile({
        gradeLevel: savedProfile.gradeLevel ?? '',
        weightedGpa: savedProfile.weightedGpa ?? '',
        unweightedGpa: savedProfile.unweightedGpa ?? '',
      })
      setStatus('Your academic profile has been saved.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your academic profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  function handleCourseChange(event) {
    setCourseForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleEditCourse(course) {
    clearFeedback()
    setEditingCourseId(course.id)
    setCourseForm({
      courseName: course.courseName,
      level: course.level,
      grade: course.grade,
      schoolYear: course.schoolYear,
    })
  }

  function resetCourseForm() {
    setEditingCourseId(null)
    setCourseForm(emptyCourse)
  }

  async function handleSaveCourse(event) {
    event.preventDefault()
    clearFeedback()
    setSavingCourse(true)
    const url = editingCourseId === null ? '/api/courses' : `/api/courses/${editingCourseId}`
    try {
      const savedCourse = await requestJson(url, {
        method: editingCourseId === null ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toCoursePayload(courseForm)),
      })
      setCourses((items) => editingCourseId === null
        ? [...items, savedCourse].sort((a, b) => b.schoolYear.localeCompare(a.schoolYear)
          || a.courseName.localeCompare(b.courseName))
        : items.map((item) => item.id === savedCourse.id ? savedCourse : item)
          .sort((a, b) => b.schoolYear.localeCompare(a.schoolYear)
            || a.courseName.localeCompare(b.courseName)))
      resetCourseForm()
      setStatus(editingCourseId === null ? 'Course added.' : 'Course updated.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this course.')
    } finally {
      setSavingCourse(false)
    }
  }

  async function handleDeleteCourse(course) {
    if (!window.confirm(`Delete ${course.courseName} from your profile?`)) return
    clearFeedback()
    try {
      await requestJson(`/api/courses/${course.id}`, { method: 'DELETE' })
      setCourses((items) => items.filter((item) => item.id !== course.id))
      if (editingCourseId === course.id) resetCourseForm()
      setStatus('Course deleted.')
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete this course.')
    }
  }

  function handleTestChange(event) {
    setTestForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function handleEditTest(testScore) {
    clearFeedback()
    setEditingTestId(testScore.id)
    setTestForm({
      testType: testScore.testType,
      score: String(testScore.score),
      testDate: testScore.testDate ?? '',
    })
  }

  function resetTestForm() {
    setEditingTestId(null)
    setTestForm(emptyTestScore)
  }

  async function handleSaveTest(event) {
    event.preventDefault()
    clearFeedback()
    setSavingTest(true)
    const url = editingTestId === null ? '/api/test-scores' : `/api/test-scores/${editingTestId}`
    try {
      const savedTestScore = await requestJson(url, {
        method: editingTestId === null ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testType: testForm.testType,
          score: Number(testForm.score),
          testDate: testForm.testDate || null,
        }),
      })
      setTestScores((items) => editingTestId === null
        ? [savedTestScore, ...items]
        : items.map((item) => item.id === savedTestScore.id ? savedTestScore : item))
      resetTestForm()
      setStatus(editingTestId === null ? 'Test score added.' : 'Test score updated.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to save this test score.')
    } finally {
      setSavingTest(false)
    }
  }

  async function handleDeleteTest(testScore) {
    if (!window.confirm(`Delete this ${formatTestType(testScore.testType)} score?`)) return
    clearFeedback()
    try {
      await requestJson(`/api/test-scores/${testScore.id}`, { method: 'DELETE' })
      setTestScores((items) => items.filter((item) => item.id !== testScore.id))
      if (editingTestId === testScore.id) resetTestForm()
      setStatus('Test score deleted.')
    } catch (deleteError) {
      setError(deleteError.message || 'Unable to delete this test score.')
    }
  }

  if (loading) {
    return <p className="academic-message" role="status">Loading your academic profile...</p>
  }

  if (loadError) {
    return (
      <div className="academic-error" role="alert">
        <p>{loadError}</p>
        <button className="academic-button secondary" type="button" onClick={loadProfile}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="academic-profile">
      <div className="academic-profile-heading">
        <div>
          <p className="eyebrow">A helpful place to start</p>
          <h2 id="academic-profile-heading">My Academic Profile</h2>
          <p className="academic-intro">
            Keep your classes, grades, and test scores together. You can update or remove entries whenever you need.
          </p>
        </div>
        <div className="academic-summary" aria-label="Profile summary">
          <span className="academic-summary-value">{courses.length}</span>
          <span>{courses.length === 1 ? 'course saved' : 'courses saved'}</span>
          <span className="academic-summary-divider" aria-hidden="true" />
          <span className="academic-summary-value">{testScores.length}</span>
          <span>{testScores.length === 1 ? 'score saved' : 'scores saved'}</span>
        </div>
      </div>

      {error && <p className="academic-error" role="alert">{error}</p>}
      {status && <p className="academic-message" role="status">{status}</p>}

      <section className="academic-card" aria-labelledby="academic-overview-heading">
        <div className="academic-card-heading">
          <div>
            <p className="eyebrow">Your school snapshot</p>
            <h3 id="academic-overview-heading">Grade level &amp; GPA</h3>
          </div>
        </div>
        <p className="academic-note">
          GPA scales and weighting vary by school. Enter the values from your school; this form accepts GPAs from 0 to 10 as a broad entry range, not as a universal scale or admissions cutoff.
        </p>
        <form className="academic-form" onSubmit={handleSaveProfile}>
          <div className="academic-form-grid">
            <label>
              Grade level
              <select
                value={profile.gradeLevel}
                onChange={(event) => setProfile((current) => ({ ...current, gradeLevel: event.target.value }))}
              >
                <option value="">Select grade</option>
                {[9, 10, 11, 12].map((grade) => (
                  <option value={grade} key={grade}>Grade {grade}</option>
                ))}
              </select>
            </label>
            <label>
              Unweighted GPA
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={profile.unweightedGpa}
                onChange={(event) => setProfile((current) => ({ ...current, unweightedGpa: event.target.value }))}
                placeholder="For example, 3.8"
              />
            </label>
            <label>
              Weighted GPA
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={profile.weightedGpa}
                onChange={(event) => setProfile((current) => ({ ...current, weightedGpa: event.target.value }))}
                placeholder="For example, 4.2"
              />
            </label>
          </div>
          <button className="academic-button" type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save academic details'}
          </button>
        </form>
      </section>

      <div className="academic-detail-grid">
        <section className="academic-card" aria-labelledby="courses-heading">
          <div className="academic-card-heading">
            <div>
              <p className="eyebrow">Classes and progress</p>
              <h3 id="courses-heading">High school courses</h3>
            </div>
          </div>
          <form className="academic-form" onSubmit={handleSaveCourse}>
            <div className="academic-form-grid">
              <label className="academic-field-wide">
                Course name
                <input
                  name="courseName"
                  type="text"
                  maxLength={120}
                  required
                  value={courseForm.courseName}
                  onChange={handleCourseChange}
                  placeholder="For example, Algebra II"
                />
              </label>
              <label>
                Course level
                <select name="level" value={courseForm.level} onChange={handleCourseChange}>
                  {courseLevels.map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label>
                Grade
                <input
                  name="grade"
                  type="text"
                  maxLength={6}
                  required
                  value={courseForm.grade}
                  onChange={handleCourseChange}
                  placeholder="A-, B+, or 92"
                />
              </label>
              <label>
                School year
                <input
                  name="schoolYear"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4}-[0-9]{4}"
                  title="Use consecutive years, for example 2025-2026."
                  required
                  value={courseForm.schoolYear}
                  onChange={handleCourseChange}
                  placeholder="2025-2026"
                />
              </label>
            </div>
            <div className="academic-form-actions">
              <button className="academic-button" type="submit" disabled={savingCourse}>
                {savingCourse ? 'Saving...' : editingCourseId === null ? 'Add course' : 'Save course'}
              </button>
              {editingCourseId !== null && (
                <button className="academic-button secondary" type="button" onClick={resetCourseForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          {courses.length === 0 ? (
            <p className="academic-empty">No courses saved yet. Add a class above to start building your academic history.</p>
          ) : (
            <ul className="academic-entry-list">
              {courses.map((course) => (
                <li className="academic-entry" key={course.id}>
                  <div>
                    <h4>{course.courseName}</h4>
                    <p>{course.level} · {course.grade} · {course.schoolYear}</p>
                  </div>
                  <div className="academic-entry-actions">
                    <button className="academic-text-button" type="button" onClick={() => handleEditCourse(course)}>
                      Edit
                    </button>
                    <button className="academic-text-button danger" type="button" onClick={() => handleDeleteCourse(course)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="academic-card" aria-labelledby="tests-heading">
          <div className="academic-card-heading">
            <div>
              <p className="eyebrow">Optional testing information</p>
              <h3 id="tests-heading">SAT &amp; ACT scores</h3>
            </div>
          </div>
          <form className="academic-form" onSubmit={handleSaveTest}>
            <div className="academic-form-grid">
              <label className="academic-field-wide">
                Test and section
                <select name="testType" value={testForm.testType} onChange={handleTestChange}>
                  {testTypes.map((type) => <option value={type.value} key={type.value}>{type.label}</option>)}
                </select>
              </label>
              <label>
                Score
                <input
                  name="score"
                  type="number"
                  min={testTypes.find((type) => type.value === testForm.testType).min}
                  max={testTypes.find((type) => type.value === testForm.testType).max}
                  step="1"
                  required
                  value={testForm.score}
                  onChange={handleTestChange}
                />
              </label>
              <label>
                Test date <span className="academic-optional">(optional)</span>
                <input name="testDate" type="date" value={testForm.testDate} onChange={handleTestChange} />
              </label>
            </div>
            <p className="academic-field-hint">
              SAT sections: 200–800. ACT Composite: 1–36. Add each section or test date as a separate entry.
            </p>
            <div className="academic-form-actions">
              <button className="academic-button" type="submit" disabled={savingTest}>
                {savingTest ? 'Saving...' : editingTestId === null ? 'Add test score' : 'Save test score'}
              </button>
              {editingTestId !== null && (
                <button className="academic-button secondary" type="button" onClick={resetTestForm}>
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          {testScores.length === 0 ? (
            <p className="academic-empty">No test scores saved yet. Add a score when you’re ready; it’s okay to leave this section blank.</p>
          ) : (
            <ul className="academic-entry-list">
              {testScores.map((testScore) => (
                <li className="academic-entry" key={testScore.id}>
                  <div>
                    <h4>{formatTestType(testScore.testType)}: {testScore.score}</h4>
                    <p>{testScore.testDate ? `Test date: ${testScore.testDate}` : 'No test date entered'}</p>
                  </div>
                  <div className="academic-entry-actions">
                    <button className="academic-text-button" type="button" onClick={() => handleEditTest(testScore)}>
                      Edit
                    </button>
                    <button className="academic-text-button danger" type="button" onClick={() => handleDeleteTest(testScore)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default AcademicProfile

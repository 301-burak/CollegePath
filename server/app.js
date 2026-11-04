import express from 'express'

const COURSE_LEVELS = ['Regular', 'Honors', 'AP', 'IB', 'Dual Credit']
const TEST_TYPES = ['sat_math', 'sat_reading_writing', 'act_composite']

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isValidGpa(value) {
  return value === null || (
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10
  )
}

function isValidTestDate(value) {
  if (value === null) return true
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsedDate = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsedDate.valueOf()) && parsedDate.toISOString().slice(0, 10) === value
}

function validateProfile(body) {
  if (!isObject(body)) return 'Profile data must be an object.'
  if (!Object.hasOwn(body, 'gradeLevel') || !Object.hasOwn(body, 'weightedGpa')
    || !Object.hasOwn(body, 'unweightedGpa')) {
    return 'Grade level, weighted GPA, and unweighted GPA fields are required.'
  }
  if (body.gradeLevel !== null
    && (!Number.isInteger(body.gradeLevel) || body.gradeLevel < 9 || body.gradeLevel > 12)) {
    return 'Grade level must be 9, 10, 11, or 12.'
  }
  if (!isValidGpa(body.weightedGpa) || !isValidGpa(body.unweightedGpa)) {
    return 'GPA values must be numbers from 0 to 10, or left blank.'
  }
  return null
}

function validateCourse(body) {
  if (!isObject(body)) return 'Course data must be an object.'
  if (typeof body.courseName !== 'string'
    || body.courseName.trim().length === 0 || body.courseName.trim().length > 120) {
    return 'Course name must be a non-empty string of at most 120 characters.'
  }
  if (!COURSE_LEVELS.includes(body.level)) {
    return `Course level must be one of: ${COURSE_LEVELS.join(', ')}.`
  }

  const grade = typeof body.grade === 'string' ? body.grade.trim() : ''
  const letterGrade = /^(?:A[+-]?|B[+-]?|C[+-]?|D[+-]?|F)$/i.test(grade)
  const numericGrade = /^\d{1,3}(?:\.\d{1,2})?$/.test(grade)
    && Number(grade) >= 0 && Number(grade) <= 100
  if (!letterGrade && !numericGrade) {
    return 'Grade must be a letter grade (A–F, with optional +/-) or a percentage from 0 to 100.'
  }

  if (typeof body.schoolYear !== 'string') {
    return 'School year must use the format YYYY-YYYY.'
  }
  const yearMatch = /^(\d{4})-(\d{4})$/.exec(body.schoolYear.trim())
  if (!yearMatch || Number(yearMatch[2]) !== Number(yearMatch[1]) + 1) {
    return 'School year must use consecutive years, for example 2025-2026.'
  }
  return null
}

function validateTestScore(body) {
  if (!isObject(body)) return 'Test score data must be an object.'
  if (!TEST_TYPES.includes(body.testType)) {
    return 'Choose SAT Math, SAT Reading and Writing, or ACT Composite.'
  }
  if (!Number.isInteger(body.score)) return 'Test score must be a whole number.'
  if (body.testType === 'act_composite' && (body.score < 1 || body.score > 36)) {
    return 'ACT Composite scores must be from 1 to 36.'
  }
  if (body.testType !== 'act_composite' && (body.score < 200 || body.score > 800)) {
    return 'SAT section scores must be from 200 to 800.'
  }
  if (!Object.hasOwn(body, 'testDate') || !isValidTestDate(body.testDate)) {
    return 'Test date must be a valid date, or left blank.'
  }
  return null
}

function parseId(request, response) {
  const id = Number(request.params.id)
  if (!Number.isSafeInteger(id) || id < 1) {
    response.status(400).json({ error: 'ID must be a positive integer.' })
    return null
  }
  return id
}

function validateUniversityGoal(body) {
  if (!isObject(body) || typeof body.universityId !== 'string'
    || !/^[a-z0-9-]{1,60}$/.test(body.universityId)) {
    return 'University ID must be a valid catalog ID.'
  }
  return null
}

function handle(handler) {
  return (request, response, next) => {
    try {
      handler(request, response, next)
    } catch (error) {
      next(error)
    }
  }
}

export function createApp(store) {
  if (!store) throw new Error('A database store is required to create the CollegePath API.')

  const app = express()
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' })
  })

  app.get('/api/universities', handle((request, response) => {
    const search = request.query.search ?? ''
    if (typeof search !== 'string' || search.length > 80) {
      response.status(400).json({ error: 'Search must be 80 characters or fewer.' })
      return
    }
    const normalizedSearch = search.trim().toLocaleLowerCase()
    const universities = store.getUniversities().filter((university) => (
      !normalizedSearch
      || university.id.toLocaleLowerCase().includes(normalizedSearch)
      || university.name.toLocaleLowerCase().includes(normalizedSearch)
      || university.location.toLocaleLowerCase().includes(normalizedSearch)
    ))
    response.json(universities)
  }))

  app.get('/api/university-goals', handle((_request, response) => {
    response.json(store.getUniversityGoals())
  }))

  app.post('/api/university-goals', handle((request, response) => {
    const validationError = validateUniversityGoal(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    const { universityId } = request.body
    if (!store.hasUniversity(universityId)) {
      response.status(404).json({ error: 'University was not found in the catalog.' })
      return
    }
    const goal = store.createUniversityGoal(universityId)
    if (!goal) {
      response.status(409).json({ error: 'This university is already in your goals.' })
      return
    }
    response.status(201).json(goal)
  }))

  app.delete('/api/university-goals/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    if (!store.deleteUniversityGoal(id)) {
      response.status(404).json({ error: 'University goal not found.' })
      return
    }
    response.status(204).end()
  }))

  app.get('/api/checklist', handle((_request, response) => {
    response.json(store.getChecklistItems())
  }))

  app.post('/api/checklist', handle((request, response) => {
    const { title, completed = false } = request.body ?? {}

    if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
      response.status(400).json({ error: 'Title must be a non-empty string of at most 200 characters.' })
      return
    }
    if (typeof completed !== 'boolean') {
      response.status(400).json({ error: 'Completed must be a boolean.' })
      return
    }

    response.status(201).json(store.createChecklistItem(title.trim(), completed))
  }))

  app.patch('/api/checklist/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    const { completed } = request.body ?? {}
    if (typeof completed !== 'boolean') {
      response.status(400).json({ error: 'Completed must be a boolean.' })
      return
    }

    const item = store.updateChecklistItemCompletion(id, completed)
    if (!item) {
      response.status(404).json({ error: 'Checklist item not found.' })
      return
    }
    response.json(item)
  }))

  app.get('/api/profile', handle((_request, response) => {
    response.json({
      profile: store.getProfile(),
      courses: store.getCourses(),
      testScores: store.getTestScores(),
    })
  }))

  app.put('/api/profile', handle((request, response) => {
    const validationError = validateProfile(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    response.json(store.updateProfile(request.body))
  }))

  app.get('/api/courses', handle((_request, response) => {
    response.json(store.getCourses())
  }))

  app.post('/api/courses', handle((request, response) => {
    const validationError = validateCourse(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    response.status(201).json(store.createCourse({
      ...request.body,
      courseName: request.body.courseName.trim(),
      grade: request.body.grade.trim(),
      schoolYear: request.body.schoolYear.trim(),
    }))
  }))

  app.put('/api/courses/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    const validationError = validateCourse(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    const course = store.updateCourse(id, {
      ...request.body,
      courseName: request.body.courseName.trim(),
      grade: request.body.grade.trim(),
      schoolYear: request.body.schoolYear.trim(),
    })
    if (!course) {
      response.status(404).json({ error: 'Course not found.' })
      return
    }
    response.json(course)
  }))

  app.delete('/api/courses/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    if (!store.deleteCourse(id)) {
      response.status(404).json({ error: 'Course not found.' })
      return
    }
    response.status(204).end()
  }))

  app.get('/api/test-scores', handle((_request, response) => {
    response.json(store.getTestScores())
  }))

  app.post('/api/test-scores', handle((request, response) => {
    const validationError = validateTestScore(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    response.status(201).json(store.createTestScore(request.body))
  }))

  app.put('/api/test-scores/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    const validationError = validateTestScore(request.body)
    if (validationError) {
      response.status(400).json({ error: validationError })
      return
    }
    const testScore = store.updateTestScore(id, request.body)
    if (!testScore) {
      response.status(404).json({ error: 'Test score not found.' })
      return
    }
    response.json(testScore)
  }))

  app.delete('/api/test-scores/:id', handle((request, response) => {
    const id = parseId(request, response)
    if (id === null) return
    if (!store.deleteTestScore(id)) {
      response.status(404).json({ error: 'Test score not found.' })
      return
    }
    response.status(204).end()
  }))

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.parse.failed') {
      response.status(400).json({ error: 'Request body must contain valid JSON.' })
      return
    }

    console.error(error)
    response.status(500).json({ error: 'An unexpected server error occurred.' })
  })

  return app
}

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { after, before, test } from 'node:test'
import Database from 'better-sqlite3'
import { createApp } from '../app.js'
import { createDatabase } from '../src/database.js'

let temporaryDirectory

before(() => {
  temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'collegepath-profile-test-'))
})

after(() => {
  fs.rmSync(temporaryDirectory, { recursive: true, force: true })
})

test('academic profile routes validate, persist, and preserve existing checklist data', async (t) => {
  const databasePath = path.join(temporaryDirectory, 'test.sqlite')
  const seedDatabase = new Database(databasePath)
  seedDatabase.exec(`
    CREATE TABLE checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  seedDatabase.prepare('INSERT INTO checklist_items (title, completed) VALUES (?, ?)')
    .run('Existing checklist record', 1)
  seedDatabase.close()

  let store = createDatabase(databasePath)
  let server = createApp(store).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  let baseUrl = `http://127.0.0.1:${server.address().port}`

  t.after(async () => {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
      })
    }
    store.close()
  })

  async function jsonRequest(route, options) {
    const response = await fetch(`${baseUrl}${route}`, options)
    const body = response.status === 204 ? null : await response.json()
    return { response, body }
  }

  const initialProfile = await jsonRequest('/api/profile')
  assert.equal(initialProfile.response.status, 200)
  assert.deepEqual(initialProfile.body.profile, {
    gradeLevel: null,
    weightedGpa: null,
    unweightedGpa: null,
    updatedAt: initialProfile.body.profile.updatedAt,
  })
  assert.deepEqual(initialProfile.body.courses, [])
  assert.deepEqual(initialProfile.body.testScores, [])

  const checklistCreated = await jsonRequest('/api/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Temporary test checklist task' }),
  })
  assert.equal(checklistCreated.response.status, 201)
  const checklistUpdated = await jsonRequest(`/api/checklist/${checklistCreated.body.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true }),
  })
  assert.equal(checklistUpdated.response.status, 200)
  assert.equal(checklistUpdated.body.completed, true)

  const savedProfile = await jsonRequest('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gradeLevel: 11, weightedGpa: 4.35, unweightedGpa: 3.82 }),
  })
  assert.equal(savedProfile.response.status, 200)
  assert.equal(savedProfile.body.gradeLevel, 11)
  assert.equal(savedProfile.body.weightedGpa, 4.35)
  assert.equal(savedProfile.body.unweightedGpa, 3.82)

  for (const invalidProfile of [
    { gradeLevel: 8, weightedGpa: 4, unweightedGpa: 3.5 },
    { gradeLevel: 10, weightedGpa: 10.01, unweightedGpa: 3.5 },
    { gradeLevel: 10, weightedGpa: '4.0', unweightedGpa: 3.5 },
  ]) {
    const result = await jsonRequest('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidProfile),
    })
    assert.equal(result.response.status, 400)
    assert.equal(typeof result.body.error, 'string')
  }

  const createdCourse = await jsonRequest('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseName: '  Algebra II  ',
      level: 'Honors',
      grade: 'A-',
      schoolYear: '2025-2026',
    }),
  })
  assert.equal(createdCourse.response.status, 201)
  assert.equal(createdCourse.body.courseName, 'Algebra II')
  assert.equal(createdCourse.body.level, 'Honors')

  const updatedCourse = await jsonRequest(`/api/courses/${createdCourse.body.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      courseName: 'Algebra II',
      level: 'AP',
      grade: '94',
      schoolYear: '2025-2026',
    }),
  })
  assert.equal(updatedCourse.response.status, 200)
  assert.equal(updatedCourse.body.level, 'AP')
  assert.equal(updatedCourse.body.grade, '94')

  for (const invalidCourse of [
    { courseName: 'Biology', level: 'College', grade: 'A', schoolYear: '2025-2026' },
    { courseName: 'Biology', level: 'Regular', grade: '101', schoolYear: '2025-2026' },
    { courseName: 'Biology', level: 'Regular', grade: 'A', schoolYear: '2025-2027' },
  ]) {
    const result = await jsonRequest('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidCourse),
    })
    assert.equal(result.response.status, 400)
    assert.equal(typeof result.body.error, 'string')
  }

  const createdScore = await jsonRequest('/api/test-scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testType: 'sat_math',
      score: 720,
      testDate: '2026-03-14',
    }),
  })
  assert.equal(createdScore.response.status, 201)
  assert.equal(createdScore.body.score, 720)

  const updatedScore = await jsonRequest(`/api/test-scores/${createdScore.body.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      testType: 'act_composite',
      score: 32,
      testDate: null,
    }),
  })
  assert.equal(updatedScore.response.status, 200)
  assert.equal(updatedScore.body.testType, 'act_composite')
  assert.equal(updatedScore.body.score, 32)

  for (const invalidScore of [
    { testType: 'sat_math', score: 199, testDate: null },
    { testType: 'sat_reading_writing', score: 801, testDate: null },
    { testType: 'act_composite', score: 37, testDate: null },
    { testType: 'act_composite', score: 30, testDate: '2026-02-30' },
  ]) {
    const result = await jsonRequest('/api/test-scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidScore),
    })
    assert.equal(result.response.status, 400)
    assert.equal(typeof result.body.error, 'string')
  }

  const checklistBeforeRestart = await jsonRequest('/api/checklist')
  assert.equal(checklistBeforeRestart.response.status, 200)
  assert.deepEqual(checklistBeforeRestart.body.map(({ id, title, completed }) => ({
    id,
    title,
    completed,
  })), [
    { id: checklistCreated.body.id, title: 'Temporary test checklist task', completed: true },
    { id: 1, title: 'Existing checklist record', completed: true },
  ])

  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  store.close()
  store = createDatabase(databasePath)
  server = createApp(store).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`

  const persistedProfile = await jsonRequest('/api/profile')
  assert.equal(persistedProfile.body.profile.gradeLevel, 11)
  assert.equal(persistedProfile.body.profile.weightedGpa, 4.35)
  assert.equal(persistedProfile.body.courses.length, 1)
  assert.equal(persistedProfile.body.courses[0].level, 'AP')
  assert.equal(persistedProfile.body.testScores.length, 1)
  assert.equal(persistedProfile.body.testScores[0].score, 32)

  const deletedCourse = await jsonRequest(`/api/courses/${createdCourse.body.id}`, {
    method: 'DELETE',
  })
  assert.equal(deletedCourse.response.status, 204)
  const deletedScore = await jsonRequest(`/api/test-scores/${createdScore.body.id}`, {
    method: 'DELETE',
  })
  assert.equal(deletedScore.response.status, 204)
  assert.equal((await jsonRequest(`/api/courses/${createdCourse.body.id}`, { method: 'DELETE' }))
    .response.status, 404)
  assert.equal((await jsonRequest(`/api/test-scores/${createdScore.body.id}`, { method: 'DELETE' }))
    .response.status, 404)

  const checklistAfterProfileChanges = await jsonRequest('/api/checklist')
  assert.deepEqual(checklistAfterProfileChanges.body, checklistBeforeRestart.body)

  const migrations = new Database(databasePath, { readonly: true })
  assert.equal(
    migrations.prepare('SELECT COUNT(*) AS count FROM schema_migrations').get().count,
    2,
  )
  assert.equal(
    migrations.prepare('SELECT COUNT(*) AS count FROM checklist_items').get().count,
    2,
  )
  migrations.close()
})

test('university catalog search and goals validate, persist, and expose sourced facts', async (t) => {
  const databasePath = path.join(temporaryDirectory, 'university-goals.sqlite')
  let store = createDatabase(databasePath)
  let server = createApp(store).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  let baseUrl = `http://127.0.0.1:${server.address().port}`

  t.after(async () => {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
      })
    }
    store.close()
  })

  async function jsonRequest(route, options) {
    const response = await fetch(`${baseUrl}${route}`, options)
    const body = response.status === 204 ? null : await response.json()
    return { response, body }
  }

  const catalog = await jsonRequest('/api/universities')
  assert.equal(catalog.response.status, 200)
  assert.equal(catalog.body.length, 5)
  for (const university of catalog.body) {
    assert.ok(university.name)
    assert.ok(university.location)
    assert.ok(university.admissionsUrl.startsWith('https://'))
    assert.equal(university.facts.length, 4)
    for (const fact of university.facts) {
      assert.ok(fact.sourceUrl.startsWith('https://'))
      assert.match(fact.lastVerified, /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(['verified', 'unverified'].includes(fact.status))
    }
  }

  const mitSearch = await jsonRequest('/api/universities?search=MIT')
  assert.equal(mitSearch.response.status, 200)
  assert.deepEqual(mitSearch.body.map(({ id }) => id), ['mit'])
  assert.equal((await jsonRequest(`/api/universities?search=${'x'.repeat(81)}`))
    .response.status, 400)
  assert.equal(Object.hasOwn(catalog.body[0], 'courses'), false)

  for (const body of [null, {}, { universityId: '../mit' }, { universityId: 10 }]) {
    const invalidGoal = await jsonRequest('/api/university-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    assert.equal(invalidGoal.response.status, 400)
    assert.equal(typeof invalidGoal.body.error, 'string')
  }

  const unknownGoal = await jsonRequest('/api/university-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityId: 'not-in-catalog' }),
  })
  assert.equal(unknownGoal.response.status, 404)

  const createdGoal = await jsonRequest('/api/university-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityId: 'mit' }),
  })
  assert.equal(createdGoal.response.status, 201)
  assert.equal(createdGoal.body.universityId, 'mit')
  assert.equal((await jsonRequest('/api/university-goals')).body.length, 1)

  const duplicateGoal = await jsonRequest('/api/university-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universityId: 'mit' }),
  })
  assert.equal(duplicateGoal.response.status, 409)

  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
  store.close()
  store = createDatabase(databasePath)
  server = createApp(store).listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`

  const persistedGoals = await jsonRequest('/api/university-goals')
  assert.equal(persistedGoals.response.status, 200)
  assert.equal(persistedGoals.body.length, 1)
  assert.equal(persistedGoals.body[0].universityId, 'mit')

  const deletedGoal = await jsonRequest(`/api/university-goals/${createdGoal.body.id}`, {
    method: 'DELETE',
  })
  assert.equal(deletedGoal.response.status, 204)
  assert.equal((await jsonRequest('/api/university-goals')).body.length, 0)
  assert.equal((await jsonRequest(`/api/university-goals/${createdGoal.body.id}`, {
    method: 'DELETE',
  })).response.status, 404)
  assert.equal((await jsonRequest('/api/university-goals/0', { method: 'DELETE' }))
    .response.status, 400)
})

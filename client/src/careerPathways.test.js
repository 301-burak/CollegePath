import assert from 'node:assert/strict'
import test from 'node:test'
import {
  careerPathways,
  fetchRoadmapCourses,
  getCareerRecommendations,
  getRoadmapViewModel,
} from './careerPathways.js'

const careerOptions = [
  { title: 'Cybersecurity Analyst', interests: ['Technology'], pathwayId: 'cybersecurity' },
  { title: 'Software Developer', interests: ['Technology', 'Science'], pathwayId: 'software-engineering' },
  { title: 'Mechanical Engineer', interests: ['Engineering'], pathwayId: 'mechanical-engineering' },
  { title: 'Registered Nurse', interests: ['Healthcare'], pathwayId: 'medicine-healthcare' },
  { title: 'Financial Analyst', interests: ['Business'], pathwayId: 'business-finance' },
  { title: 'Lawyer', interests: ['Law'], pathwayId: 'law' },
]

test('career selection returns relevant recommendations and handles empty interests', () => {
  assert.deepEqual(getCareerRecommendations(careerOptions, []), [])
  assert.deepEqual(
    getCareerRecommendations(careerOptions, ['Technology']).map(({ title }) => title),
    ['Cybersecurity Analyst', 'Software Developer'],
  )
  assert.equal(
    getCareerRecommendations(careerOptions, ['Technology', 'Science'])[0].title,
    'Software Developer',
  )
  assert.deepEqual(
    getCareerRecommendations(careerOptions, ['Law']).map(({ pathwayId }) => pathwayId),
    ['law'],
  )
})

test('roadmap view model contains the content rendered for each pathway', () => {
  const expectedPathways = [
    'cybersecurity',
    'software-engineering',
    'mechanical-engineering',
    'medicine-healthcare',
    'business-finance',
    'law',
  ]

  assert.deepEqual(careerPathways.map(({ id }) => id), expectedPathways)
  for (const pathway of careerPathways) {
    const roadmap = getRoadmapViewModel(pathway, [])
    assert.ok(roadmap.title)
    assert.ok(roadmap.description)
    assert.ok(roadmap.suggestedCourses.length > 0)
    assert.ok(roadmap.technicalSkills.length > 0)
    assert.ok(roadmap.softSkills.length > 0)
    assert.ok(roadmap.extracurriculars.length > 0)
    assert.ok(roadmap.projects.length > 0)
    assert.deepEqual(roadmap.gradeRoadmap.map(({ grade }) => grade), [9, 10, 11, 12])
  }
})

test('roadmap personalization recognizes completed computer science coursework', () => {
  const pathway = careerPathways.find(({ id }) => id === 'cybersecurity')
  const roadmap = getRoadmapViewModel(pathway, [{
    courseName: 'AP Computer Science A',
    level: 'AP',
    grade: 'A',
    schoolYear: '2025-2026',
  }])

  assert.match(roadmap.personalizationMessage, /AP Computer Science A/)
  assert.deepEqual(
    roadmap.takenCourses.map(({ name }) => name),
    ['Computer science or programming'],
  )
  assert.ok(roadmap.suggestedCourses.some(({ name }) => name === 'Networking or information technology'))
  assert.ok(roadmap.suggestedCourses.some(({ name }) => name === 'Mathematics and statistics'))
})

test('empty academic profile keeps general course suggestions and explains the empty state', () => {
  const pathway = careerPathways.find(({ id }) => id === 'software-engineering')
  const roadmap = getRoadmapViewModel(pathway, [])

  assert.equal(roadmap.hasAcademicHistory, false)
  assert.equal(roadmap.takenCourses.length, 0)
  assert.ok(roadmap.suggestedCourses.length > 0)
  assert.match(roadmap.personalizationMessage, /No courses are saved/)
})

test('course loading reports network, server, and malformed-response errors clearly', async () => {
  await assert.rejects(
    fetchRoadmapCourses(async () => { throw new Error('offline') }),
    /Unable to connect to your Academic Profile/,
  )
  await assert.rejects(
    fetchRoadmapCourses(async () => ({
      ok: false,
      json: async () => ({ error: 'Profile temporarily unavailable.' }),
    })),
    /Profile temporarily unavailable/,
  )
  await assert.rejects(
    fetchRoadmapCourses(async () => ({
      ok: false,
      json: async () => { throw new Error('not JSON') },
    })),
    /Unable to load your saved courses/,
  )
  await assert.rejects(
    fetchRoadmapCourses(async () => ({
      ok: true,
      json: async () => ({ courses: 'not a list' }),
    })),
    /did not include a valid course list/,
  )
})

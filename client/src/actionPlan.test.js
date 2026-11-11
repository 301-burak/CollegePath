import assert from 'node:assert/strict'
import test from 'node:test'
import {
  fetchActionPlanData,
  generateActionPlan,
  getActionPlanCompletion,
} from './actionPlan.js'
import { careerPathways } from './careerPathways.js'

const profile = {
  gradeLevel: 11,
  weightedGpa: null,
  unweightedGpa: null,
}

function planFor(pathwayId, options = {}) {
  return generateActionPlan({
    profile,
    courses: [],
    testScores: [],
    pathway: careerPathways.find((pathway) => pathway.id === pathwayId),
    universities: [],
    universityGoals: [],
    checklistItems: [],
    ...options,
  })
}

test('action plan uses each curated pathway for course, activity, and project ideas', () => {
  for (const pathway of careerPathways) {
    const plan = planFor(pathway.id)
    const courseRecommendations = plan.filter(({ category }) => category === 'Recommended courses')
    const activityRecommendations = plan.filter(({ category }) => category === 'Extracurricular activities')
    const projectRecommendations = plan.filter(({ category }) => category === 'Career-related projects')

    assert.ok(courseRecommendations.length > 0, `${pathway.id} should suggest courses`)
    assert.ok(activityRecommendations[0].title)
    assert.ok(projectRecommendations[0].title)
    assert.ok(plan.every(({ priority }) => ['High', 'Medium', 'Low'].includes(priority)))
    assert.ok(plan.every(({ reason }) => reason.length > 0))
  }
})

test('cybersecurity plan acknowledges saved coursework and recommends next subjects', () => {
  const plan = planFor('cybersecurity', {
    courses: [{
      courseName: 'AP Computer Science A',
      level: 'AP',
      grade: 'A',
      schoolYear: '2025-2026',
    }],
  })

  assert.ok(plan.some(({ title }) => title.includes('Build on your Cybersecurity coursework')))
  assert.ok(plan.some(({ title }) => title === 'Explore Networking or information technology'))
  assert.ok(plan.every(({ title }) => !title.includes('Explore Computer science or programming')))
})

test('incomplete academic profiles are explained and pathway/course access stays optional', () => {
  const plan = planFor('law', {
    profile: { gradeLevel: null, weightedGpa: null, unweightedGpa: null },
    courses: [],
  })

  assert.ok(plan.some(({ title }) => title === 'Add your current grade level to your Academic Profile'))
  assert.ok(plan.some(({ title }) => title === 'Add completed courses to your Academic Profile'))
  assert.ok(plan.some(({ description }) => /school does not offer/i.test(description)))
  assert.ok(plan.every(({ title }) => !/minimum|required|guarantee/i.test(title)))
})

test('no saved university goals produce a gentle prompt without university-specific claims', () => {
  const plan = generateActionPlan({
    profile,
    courses: [],
    testScores: [],
    pathway: null,
    universities: [{ id: 'harvard', name: 'Harvard University', facts: [] }],
    universityGoals: [],
    checklistItems: [],
  })

  const prompt = plan.find(({ title }) => title.startsWith('Choose a university goal'))
  assert.ok(prompt)
  assert.deepEqual(prompt.sourceLinks, [])
})

test('university reminders link verified facts and label unverified source information', () => {
  const verifiedUniversity = {
    id: 'mit',
    name: 'MIT',
    admissionsUrl: 'https://mitadmissions.org/',
    facts: [
      {
        type: 'requirements',
        title: 'Application requirements',
        status: 'verified',
        sourceUrl: 'https://mitadmissions.org/apply/',
        lastVerified: '2026-11-04',
      },
      {
        type: 'deadlines',
        title: 'Deadlines',
        status: 'verified',
        sourceUrl: 'https://mitadmissions.org/apply/deadlines/',
        lastVerified: '2026-11-04',
      },
      {
        type: 'testing_policy',
        title: 'Testing policy',
        status: 'unverified',
        sourceUrl: 'https://mitadmissions.org/',
        lastVerified: '2026-11-04',
      },
    ],
  }
  const plan = generateActionPlan({
    profile,
    courses: [],
    testScores: [],
    pathway: null,
    universities: [verifiedUniversity],
    universityGoals: [{ universityId: 'mit' }],
    checklistItems: [],
  })
  const requirements = plan.find(({ title }) => title === 'Review current application materials for MIT')
  const testing = plan.find(({ title }) => title === 'Confirm the current testing policy for MIT')

  assert.deepEqual(requirements.sourceLinks, [{
    label: 'Application requirements · last verified 2026-11-04',
    url: 'https://mitadmissions.org/apply/',
    verified: true,
  }])
  assert.equal(testing.sourceLinks[0].verified, false)
  assert.equal(testing.sourceLinks[0].url, 'https://mitadmissions.org/')
  assert.match(testing.sourceLinks[0].label, /checked 2026-11-04/)
  assert.match(testing.description, /not verified/i)
})

test('saved GPA and test scores are acknowledged without applying admission cutoffs', () => {
  const plan = planFor('business-finance', {
    profile: { gradeLevel: 11, weightedGpa: 4.1, unweightedGpa: 3.8 },
    testScores: [
      { testType: 'sat_math', score: 690 },
      { testType: 'act_composite', score: 29 },
    ],
  })

  const scoreReview = plan.find(({ category }) => category === 'SAT/ACT preparation')
  const gpaReview = plan.find(({ title }) => title === 'Keep your GPA in your school’s context')
  assert.match(scoreReview.description, /SAT Math 690/)
  assert.match(scoreReview.description, /ACT Composite 29/)
  assert.match(scoreReview.description, /no score target or admissions comparison/)
  assert.ok(gpaReview)
  assert.match(gpaReview.description, /Schools calculate and weight GPA differently/)
})

test('existing checklist recommendations are flagged instead of being duplicated', () => {
  const checklistItems = [{
    id: 8,
    title: 'Explore Networking or information technology',
    completed: true,
  }]
  const plan = planFor('cybersecurity', { checklistItems })
  const existing = plan.find(({ title }) => title === checklistItems[0].title)

  assert.equal(existing.alreadyInChecklist, true)
  assert.equal(existing.checklistItem.completed, true)
  assert.deepEqual(getActionPlanCompletion(plan, checklistItems), { tracked: 1, completed: 1 })
})

test('action plan data loading reports network, API, and malformed-response errors', async () => {
  await assert.rejects(
    fetchActionPlanData(async () => { throw new Error('offline') }),
    /Unable to connect to the local CollegePath server/,
  )

  await assert.rejects(
    fetchActionPlanData(async (url) => ({
      ok: url !== '/api/profile',
      json: async () => ({ error: 'Profile temporarily unavailable.' }),
    })),
    /Profile temporarily unavailable/,
  )

  await assert.rejects(
    fetchActionPlanData(async () => ({ ok: true, json: async () => ({}) })),
    /could not be read/,
  )
})

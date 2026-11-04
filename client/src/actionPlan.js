import { getRoadmapViewModel } from './careerPathways.js'

export const actionPlanCategories = [
  'Recommended courses',
  'SAT/ACT preparation',
  'Extracurricular activities',
  'Career-related projects',
  'College application preparation',
  'Academic & personal development',
]

const priorityOrder = { High: 0, Medium: 1, Low: 2 }

async function responseJson(response, message) {
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(message)
  }
  if (!response.ok) throw new Error(data.error || message)
  return data
}

export async function fetchActionPlanData(fetcher = fetch) {
  let responses
  try {
    responses = await Promise.all([
      fetcher('/api/profile'),
      fetcher('/api/university-goals'),
      fetcher('/api/universities'),
    ])
  } catch {
    throw new Error('Unable to connect to the local CollegePath server. Check that it is running and try again.')
  }

  const [profileData, universityGoals, universities] = await Promise.all([
    responseJson(responses[0], 'Unable to load your Academic Profile.'),
    responseJson(responses[1], 'Unable to load your saved university goals.'),
    responseJson(responses[2], 'Unable to load the university catalog.'),
  ])
  if (!profileData?.profile || !Array.isArray(profileData.courses)
    || !Array.isArray(profileData.testScores)
    || !Array.isArray(universityGoals) || !Array.isArray(universities)) {
    throw new Error('Some saved information could not be read. Check your Academic Profile and university goals, then try again.')
  }
  return { profileData, universityGoals, universities }
}

function normalizedTitle(title) {
  return title.trim().toLocaleLowerCase().replace(/\s+/g, ' ')
}

function universitySources(university, factType) {
  const fact = university.facts.find((entry) => entry.type === factType)
  if (!fact || fact.status !== 'verified') {
    return [{
      label: `${university.name} official admissions website${fact
        ? ` · checked ${fact.lastVerified}`
        : ''}`,
      url: university.admissionsUrl,
      verified: false,
    }]
  }
  return [{
    label: `${fact.title} · last verified ${fact.lastVerified}`,
    url: fact.sourceUrl,
    verified: true,
  }]
}

function action(recommendation) {
  return {
    ...recommendation,
    sourceLinks: recommendation.sourceLinks ?? [],
  }
}

export function generateActionPlan({
  profile,
  courses = [],
  testScores = [],
  pathway,
  universities = [],
  universityGoals = [],
  checklistItems = [],
}) {
  if (!profile || !Array.isArray(courses) || !Array.isArray(testScores)
    || !Array.isArray(universities) || !Array.isArray(universityGoals)
    || !Array.isArray(checklistItems)) {
    throw new Error('Action plan inputs are incomplete or invalid.')
  }

  const currentGrade = Number.isInteger(profile.gradeLevel) ? profile.gradeLevel : null
  const savedTitles = new Map(
    checklistItems.map((item) => [normalizedTitle(item.title), item]),
  )
  const recommendations = []

  function addRecommendation(recommendation) {
    const titleMatch = savedTitles.get(normalizedTitle(recommendation.title))
    recommendations.push(action({
      ...recommendation,
      id: recommendation.id ?? `${recommendation.category}:${recommendations.length}`,
      alreadyInChecklist: Boolean(titleMatch),
      checklistItem: titleMatch ?? null,
    }))
  }

  if (pathway) {
    const roadmap = getRoadmapViewModel(pathway, courses)
    const coursePriority = currentGrade === 11 || currentGrade === 10 ? 'High' : 'Medium'
    for (const suggestion of roadmap.suggestedCourses) {
      addRecommendation({
        category: 'Recommended courses',
        title: `Explore ${suggestion.name}`,
        description: `If your school offers it and it fits your preparation, consider ${suggestion.advancedOptions.join(', ')}.`,
        reason: suggestion.reason,
        priority: coursePriority,
      })
    }

    if (roadmap.takenCourses.length > 0) {
      addRecommendation({
        category: 'Academic & personal development',
        title: `Build on your ${pathway.title} coursework`,
        description: `Your saved ${roadmap.takenCourses.map(({ matchingCourses }) => (
          matchingCourses.map(({ courseName }) => courseName).join(', ')
        )).join('; ')} course history is a useful starting point.`,
        reason: 'Recommendations acknowledge saved coursework and focus on possible next steps rather than repeating completed subjects.',
        priority: 'Medium',
      })
    }

    const activityIndex = currentGrade === 12 ? 1 : 0
    const activity = pathway.extracurriculars[activityIndex] ?? pathway.extracurriculars[0]
    if (activity) {
      addRecommendation({
        category: 'Extracurricular activities',
        title: activity,
        description: 'This is an optional idea, not an admissions requirement. Choose activities that are available and meaningful to you.',
        reason: `It offers a way to explore interests related to ${pathway.title}.`,
        priority: currentGrade && currentGrade >= 11 ? 'Medium' : 'Low',
      })
    }

    const projectIndex = currentGrade === 12 ? 1 : 0
    const project = pathway.projects[projectIndex] ?? pathway.projects[0]
    if (project) {
      addRecommendation({
        category: 'Career-related projects',
        title: project,
        description: 'Start with the time and materials you have; document what you learn and any changes you make.',
        reason: `This project idea comes from the curated ${pathway.title} roadmap.`,
        priority: 'Medium',
      })
    }
  }

  if (testScores.length === 0) {
    addRecommendation({
      category: 'SAT/ACT preparation',
      title: 'Explore SAT/ACT format and preparation options',
      description: 'If testing is relevant to your plans, learn about the test formats and consider a practice session. No target score is assumed.',
      reason: currentGrade && currentGrade >= 11
        ? 'You are in an upper high-school grade and no test scores are saved; exploring options can help you plan your next steps.'
        : 'No SAT or ACT scores are saved. This is an optional planning step, not a required test recommendation.',
      priority: currentGrade && currentGrade >= 11 ? 'High' : 'Medium',
    })
  } else {
    const scoreTypeLabels = {
      sat_math: 'SAT Math',
      sat_reading_writing: 'SAT Reading and Writing',
      act_composite: 'ACT Composite',
    }
    const scoreSummary = testScores.map((score) => (
      `${scoreTypeLabels[score.testType] ?? score.testType} ${score.score}`
    )).join('; ')
    addRecommendation({
      category: 'SAT/ACT preparation',
      title: 'Review your saved SAT/ACT results',
      description: `Your saved results: ${scoreSummary}. Review them with a school counselor if useful; no score target or admissions comparison is assumed.`,
      reason: 'Your Academic Profile already includes test information; no score target or retake is presumed.',
      priority: 'Low',
    })
  }

  if (profile.weightedGpa !== null || profile.unweightedGpa !== null) {
    addRecommendation({
      category: 'Academic & personal development',
      title: 'Keep your GPA in your school’s context',
      description: 'Your GPA is saved in your Academic Profile. Schools calculate and weight GPA differently, so use your school transcript and counselor for context.',
      reason: 'This acknowledges the GPA information you entered without applying a universal scale or cutoff.',
      priority: 'Low',
    })
  }

  const goalUniversities = universityGoals
    .map((goal) => universities.find((university) => university.id === goal.universityId))
    .filter(Boolean)

  for (const university of goalUniversities) {
    const timelyPriority = currentGrade === 12 ? 'High' : currentGrade === 11 ? 'Medium' : 'Low'
    for (const [factType, category, label, priority] of [
      ['requirements', 'College application preparation', 'Review current application materials', timelyPriority],
      ['deadlines', 'College application preparation', 'Check current application deadlines', timelyPriority],
      ['testing_policy', 'College application preparation', 'Confirm the current testing policy', currentGrade === 12 ? 'Medium' : 'Low'],
    ]) {
      const verified = university.facts.find((fact) => fact.type === factType)?.status === 'verified'
      addRecommendation({
        category,
        title: `${label} for ${university.name}`,
        description: verified
          ? 'Review the current official information for the application cycle you plan to enter.'
          : 'This catalog detail is not verified. Check the university’s official admissions website for current information.',
        reason: 'You saved this university as a goal. Policies and dates can change, so confirm them directly with the university.',
        priority,
        sourceLinks: universitySources(university, factType),
      })
    }
  }

  if (currentGrade === null) {
    addRecommendation({
      category: 'Academic & personal development',
      title: 'Add your current grade level to your Academic Profile',
      description: 'Your grade level helps organize suggestions by timing. You can still use the plan without entering it.',
      reason: 'Grade level is not currently saved, so timing-based priorities are general.',
      priority: 'High',
    })
  }

  if (courses.length === 0) {
    addRecommendation({
      category: 'Academic & personal development',
      title: 'Add completed courses to your Academic Profile',
      description: 'Record courses you have taken when convenient. Leave classes out if you have not taken them or your school does not offer them.',
      reason: 'No completed courses are saved, so the plan cannot distinguish completed coursework from new ideas.',
      priority: 'Medium',
    })
  }

  if (profile.weightedGpa === null && profile.unweightedGpa === null) {
    addRecommendation({
      category: 'Academic & personal development',
      title: 'Add GPA information if you have it',
      description: 'Enter the GPA values reported by your school if you want them in your profile. GPA scales and weighting differ by school.',
      reason: 'GPA information is not saved. This plan does not infer a GPA or use admissions cutoffs.',
      priority: 'Low',
    })
  }

  if (universities.length > 0 && goalUniversities.length === 0) {
    addRecommendation({
      category: 'College application preparation',
      title: 'Choose a university goal to personalize application reminders',
      description: 'Save a university in My Universities to see official-source reminders for its application materials, deadlines, and testing policy.',
      reason: 'There are no saved university goals to use for school-specific reminders.',
      priority: 'Low',
    })
  }

  return recommendations
    .map((recommendation) => ({
      ...recommendation,
      priority: recommendation.priority in priorityOrder ? recommendation.priority : 'Medium',
    }))
    .sort((first, second) => priorityOrder[first.priority] - priorityOrder[second.priority])
}

export function getActionPlanCompletion(recommendations, checklistItems) {
  const completeTitles = new Set(
    checklistItems.filter((item) => item.completed).map((item) => normalizedTitle(item.title)),
  )
  const tracked = recommendations.filter((recommendation) => recommendation.alreadyInChecklist)
  return {
    tracked: tracked.length,
    completed: tracked.filter((recommendation) => (
      completeTitles.has(normalizedTitle(recommendation.title))
    )).length,
  }
}

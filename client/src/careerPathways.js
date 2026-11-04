export const careerPathways = [
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Help protect computers, networks, and information by finding risks and building safer systems.',
    careers: ['Cybersecurity Analyst'],
    courseSuggestions: [
      {
        name: 'Computer science or programming',
        advancedOptions: ['AP Computer Science A', 'IB Computer Science', 'Dual Credit programming'],
        keywords: ['computer science', 'programming', 'computer programming', 'coding'],
        reason: 'Builds a foundation for understanding how software and systems work.',
      },
      {
        name: 'Networking or information technology',
        advancedOptions: ['Honors networking', 'Dual Credit networking or information technology'],
        keywords: ['networking', 'network security', 'information technology'],
        reason: 'Introduces the devices and connections that security professionals help protect.',
      },
      {
        name: 'Mathematics and statistics',
        advancedOptions: ['Honors or AP Statistics', 'Dual Credit statistics'],
        keywords: ['statistics', 'algebra', 'precalculus', 'calculus', 'math'],
        reason: 'Supports careful reasoning, pattern-finding, and analysis of security data.',
      },
      {
        name: 'Writing and communication',
        advancedOptions: ['Honors English', 'Dual Credit composition'],
        keywords: ['english', 'composition', 'writing', 'communication'],
        reason: 'Helps explain technical findings and security recommendations clearly.',
      },
    ],
    technicalSkills: ['Python fundamentals', 'Networking concepts', 'Linux command line', 'Safe security testing and digital ethics'],
    softSkills: ['Analytical thinking', 'Clear communication', 'Attention to detail', 'Teamwork'],
    extracurriculars: [
      'Explore a school coding, technology, or cybersecurity club.',
      'Try age-appropriate cybersecurity puzzles or capture-the-flag events with adult or teacher guidance.',
      'Help with a school technology project and document safe practices.',
    ],
    projects: [
      'Build a small Python tool that checks password strength using sample data only.',
      'Create a home-network safety guide; do not scan networks or systems without explicit permission.',
      'Set up a Linux practice environment and write down commands and lessons learned.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Explore', actions: ['Build confidence in algebra and writing.', 'Try a beginner coding activity and learn basic computer safety.'] },
      { grade: 10, focus: 'Learn foundations', actions: ['Explore computer science and networking classes if available.', 'Practice Python basics and join a technology club or event.'] },
      { grade: 11, focus: 'Practice safely', actions: ['Consider an advanced computer science or networking course.', 'Try a supervised cybersecurity challenge and document a small project.'] },
      { grade: 12, focus: 'Reflect and prepare', actions: ['Continue advanced coursework that fits your interests and school options.', 'Organize project notes and reflect on which parts of security interest you most.'] },
    ],
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering / Computer Science',
    description: 'Use programming, design, and collaboration to create software that solves problems for people.',
    careers: ['Software Developer', 'Software Engineer', 'UX Designer', 'Data Scientist'],
    courseSuggestions: [
      {
        name: 'Computer science and programming',
        advancedOptions: ['AP Computer Science A', 'AP Computer Science Principles', 'IB Computer Science', 'Dual Credit computer science'],
        keywords: ['computer science', 'programming', 'computer programming', 'coding'],
        reason: 'Introduces algorithms, computational thinking, and the process of building software.',
      },
      {
        name: 'Mathematics',
        advancedOptions: ['Honors or AP Calculus', 'AP Statistics', 'Dual Credit mathematics'],
        keywords: ['algebra', 'geometry', 'precalculus', 'calculus', 'statistics', 'math'],
        reason: 'Strengthens logical reasoning and quantitative problem-solving.',
      },
      {
        name: 'Physics or design',
        advancedOptions: ['Honors or AP Physics', 'IB Physics', 'Dual Credit physics'],
        keywords: ['physics', 'engineering', 'design'],
        reason: 'Can connect software to physical systems, simulation, and thoughtful product design.',
      },
      {
        name: 'English and communication',
        advancedOptions: ['Honors English', 'Dual Credit composition'],
        keywords: ['english', 'writing', 'composition', 'communication'],
        reason: 'Helps explain decisions, collaborate, and write clear project documentation.',
      },
    ],
    technicalSkills: ['Programming fundamentals', 'Algorithms and data structures', 'Version control', 'Testing and debugging'],
    softSkills: ['Creative problem-solving', 'Collaboration', 'Persistence', 'User-focused communication'],
    extracurriculars: [
      'Join a coding, robotics, game-development, or technology club.',
      'Participate in a school hackathon or beginner programming contest.',
      'Collaborate on an open-ended project with classmates or a teacher.',
    ],
    projects: [
      'Build a simple website or app that helps with a real school or community need.',
      'Create a small game or interactive story and ask peers for feedback.',
      'Keep a project journal describing your design choices, tests, and improvements.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Explore ideas', actions: ['Practice math and clear writing.', 'Try a beginner coding, robotics, or web project.'] },
      { grade: 10, focus: 'Build foundations', actions: ['Take computer science or programming if available.', 'Complete a small project and learn to test your work.'] },
      { grade: 11, focus: 'Go deeper', actions: ['Consider AP, Honors, IB, or Dual Credit courses that fit your preparation and school offerings.', 'Collaborate on a larger project or coding event.'] },
      { grade: 12, focus: 'Show your process', actions: ['Continue relevant advanced classes where available.', 'Polish a project, document what you learned, and explore different software roles.'] },
    ],
  },
  {
    id: 'mechanical-engineering',
    title: 'Mechanical Engineering',
    description: 'Apply math, science, and design to understand, build, and improve machines and physical systems.',
    careers: ['Mechanical Engineer', 'Civil Engineer', 'Biomedical Engineer'],
    courseSuggestions: [
      {
        name: 'Mathematics',
        advancedOptions: ['Honors or AP Precalculus and Calculus', 'Dual Credit mathematics'],
        keywords: ['algebra', 'geometry', 'precalculus', 'calculus', 'math'],
        reason: 'Supports modeling, measurement, and engineering calculations.',
      },
      {
        name: 'Physics',
        advancedOptions: ['Honors or AP Physics', 'IB Physics', 'Dual Credit physics'],
        keywords: ['physics', 'physical science'],
        reason: 'Introduces forces, motion, energy, and other ideas used in mechanical design.',
      },
      {
        name: 'Engineering, robotics, or design',
        advancedOptions: ['Honors engineering design', 'Dual Credit engineering or CAD'],
        keywords: ['engineering', 'robotics', 'design', 'cad'],
        reason: 'Offers practice turning an idea into a design that can be tested and improved.',
      },
      {
        name: 'Computer science',
        advancedOptions: ['AP Computer Science A', 'IB Computer Science', 'Dual Credit programming'],
        keywords: ['computer science', 'programming', 'coding'],
        reason: 'Can support automation, simulation, and computational design.',
      },
    ],
    technicalSkills: ['Measurement and data analysis', 'CAD and technical drawing', 'Prototyping', 'Testing and iteration'],
    softSkills: ['Curiosity', 'Planning', 'Teamwork', 'Explaining design choices'],
    extracurriculars: [
      'Explore robotics, engineering, maker, or science clubs.',
      'Join a school science fair, engineering design event, or robotics competition.',
      'Look for supervised opportunities to learn about local engineering work.',
    ],
    projects: [
      'Design and test a small bridge or mechanism using safe, inexpensive materials.',
      'Build a simple machine or robot and record how design changes affect its performance.',
      'Create a basic CAD model and explain the constraints you considered.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Explore making', actions: ['Strengthen math and science foundations.', 'Try a hands-on build, science activity, or maker club.'] },
      { grade: 10, focus: 'Learn design basics', actions: ['Explore physics, engineering, or design courses if offered.', 'Keep notes and measurements for a small build or experiment.'] },
      { grade: 11, focus: 'Apply and test', actions: ['Consider advanced math, physics, or engineering options suited to your preparation.', 'Join a supervised design challenge or robotics project.'] },
      { grade: 12, focus: 'Reflect and refine', actions: ['Continue relevant classes available at your school.', 'Document a design project and what you changed after testing.'] },
    ],
  },
  {
    id: 'medicine-healthcare',
    title: 'Medicine / Healthcare',
    description: 'Support health and well-being through patient care, health science, research, and collaboration.',
    careers: ['Registered Nurse', 'Physical Therapist', 'Health Informatics Specialist', 'Biomedical Engineer'],
    courseSuggestions: [
      {
        name: 'Biology and life science',
        advancedOptions: ['Honors or AP Biology', 'IB Biology', 'Dual Credit biology'],
        keywords: ['biology', 'life science', 'anatomy', 'health science'],
        reason: 'Introduces living systems and questions explored across many health fields.',
      },
      {
        name: 'Chemistry',
        advancedOptions: ['Honors or AP Chemistry', 'IB Chemistry', 'Dual Credit chemistry'],
        keywords: ['chemistry'],
        reason: 'Builds a science foundation for understanding matter and biological processes.',
      },
      {
        name: 'Mathematics and statistics',
        advancedOptions: ['Honors or AP Statistics', 'AP Calculus', 'Dual Credit mathematics'],
        keywords: ['math', 'statistics', 'algebra', 'calculus'],
        reason: 'Supports interpreting measurements, data, and scientific evidence.',
      },
      {
        name: 'Psychology or communication',
        advancedOptions: ['AP Psychology', 'IB Psychology', 'Dual Credit psychology'],
        keywords: ['psychology', 'communication', 'english', 'writing'],
        reason: 'Can build understanding of people and the communication central to many care roles.',
      },
    ],
    technicalSkills: ['Scientific reasoning', 'Health and data literacy', 'Careful recordkeeping', 'Understanding privacy and safety'],
    softSkills: ['Empathy', 'Listening', 'Clear communication', 'Working with a team'],
    extracurriculars: [
      'Explore health science, biology, first aid, or service clubs at school.',
      'Consider age-appropriate community volunteering with appropriate supervision.',
      'Attend a public health or science event and keep questions for a counselor or professional.',
    ],
    projects: [
      'Create an evidence-based health information poster using reputable public sources.',
      'Compare how different forms of exercise affect a simple, safe observation such as step counts.',
      'Interview a willing health professional about their role; do not collect private patient information.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Build curiosity', actions: ['Explore biology and health topics through class or clubs.', 'Practice clear writing and respectful communication.'] },
      { grade: 10, focus: 'Learn science foundations', actions: ['Take science courses available in your school sequence.', 'Try a supervised health or science activity.'] },
      { grade: 11, focus: 'Explore different roles', actions: ['Consider advanced science or psychology options if suitable and available.', 'Learn about varied health careers rather than assuming one path fits all.'] },
      { grade: 12, focus: 'Reflect and plan', actions: ['Continue science and math coursework aligned with your interests and school guidance.', 'Talk with a counselor about possible postsecondary routes for different health roles.'] },
    ],
  },
  {
    id: 'business-finance',
    title: 'Business / Finance',
    description: 'Use planning, communication, and analysis to help organizations and people make informed decisions.',
    careers: ['Financial Analyst', 'Marketing Manager', 'Entrepreneur'],
    courseSuggestions: [
      {
        name: 'Economics and personal finance',
        advancedOptions: ['AP Macroeconomics or Microeconomics', 'IB Economics', 'Dual Credit economics'],
        keywords: ['economics', 'finance', 'business', 'personal finance'],
        reason: 'Introduces how choices, markets, and financial plans affect people and organizations.',
      },
      {
        name: 'Mathematics, statistics, or data',
        advancedOptions: ['AP Statistics', 'Honors or AP Calculus', 'Dual Credit statistics'],
        keywords: ['math', 'statistics', 'algebra', 'calculus', 'data'],
        reason: 'Helps with interpreting data, comparing options, and understanding budgets.',
      },
      {
        name: 'Business or accounting',
        advancedOptions: ['Honors accounting', 'AP or Dual Credit business courses when offered'],
        keywords: ['business', 'accounting', 'finance', 'entrepreneurship'],
        reason: 'Provides an introduction to how organizations plan, track, and communicate their work.',
      },
      {
        name: 'English and communication',
        advancedOptions: ['Honors English', 'Dual Credit composition or public speaking'],
        keywords: ['english', 'writing', 'communication', 'speech'],
        reason: 'Supports presentations, teamwork, and explaining recommendations.',
      },
    ],
    technicalSkills: ['Spreadsheet literacy', 'Budgeting and basic accounting', 'Interpreting data', 'Researching markets and ideas'],
    softSkills: ['Ethical judgment', 'Communication', 'Organization', 'Negotiation and collaboration'],
    extracurriculars: [
      'Explore a business, entrepreneurship, investing-education, or financial-literacy club.',
      'Consider school business competitions such as DECA or Future Business Leaders of America (FBLA), if available.',
      'Help plan a school event budget or support a community organization project.',
    ],
    projects: [
      'Create a sample budget for a club event using fictional or non-sensitive information.',
      'Research a community need and outline a small business idea that could address it.',
      'Compare public company information from official reports and summarize your questions, not investment advice.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Explore ideas', actions: ['Practice math, writing, and presentation skills.', 'Try a simple personal budget or help organize a school activity.'] },
      { grade: 10, focus: 'Learn foundations', actions: ['Explore economics, accounting, or business classes if offered.', 'Join a business or financial-literacy club.'] },
      { grade: 11, focus: 'Apply skills', actions: ['Consider advanced math, economics, or business options that fit your interests.', 'Try a supervised business competition or team project.'] },
      { grade: 12, focus: 'Communicate your learning', actions: ['Continue relevant classes available through your school.', 'Reflect on whether analysis, entrepreneurship, accounting, or another area interests you most.'] },
    ],
  },
  {
    id: 'law',
    title: 'Law',
    description: 'Study rules, evidence, and arguments to help people and communities understand legal questions.',
    careers: ['Lawyer', 'Legal Researcher', 'Policy Analyst'],
    courseSuggestions: [
      {
        name: 'English, writing, and literature',
        advancedOptions: ['Honors or AP English Language and Composition', 'IB Language and Literature', 'Dual Credit composition'],
        keywords: ['english', 'writing', 'composition', 'literature'],
        reason: 'Builds close reading, research, and clear written argument.',
      },
      {
        name: 'History, civics, and government',
        advancedOptions: ['AP U.S. Government and Politics', 'AP U.S. History', 'IB History', 'Dual Credit political science'],
        keywords: ['history', 'civics', 'government', 'political science'],
        reason: 'Introduces institutions, historical context, and civic questions.',
      },
      {
        name: 'Debate or public speaking',
        advancedOptions: ['Honors speech', 'Dual Credit communications'],
        keywords: ['debate', 'speech', 'public speaking', 'communication'],
        reason: 'Offers practice presenting a reasoned position and listening to different views.',
      },
      {
        name: 'Research and social science',
        advancedOptions: ['AP Psychology', 'AP Statistics', 'IB social science courses'],
        keywords: ['psychology', 'statistics', 'research', 'social science'],
        reason: 'Strengthens evidence evaluation and understanding of people and society.',
      },
    ],
    technicalSkills: ['Careful reading and research', 'Evaluating sources and evidence', 'Building logical arguments', 'Understanding civic institutions'],
    softSkills: ['Listening', 'Writing clearly', 'Respectful disagreement', 'Ethical judgment'],
    extracurriculars: [
      'Explore debate, mock trial, student government, or Model United Nations.',
      'Volunteer for a community organization or civic education activity.',
      'Attend a public court or community meeting where observation is permitted.',
    ],
    projects: [
      'Write a balanced explainer on a public civic topic using multiple credible sources.',
      'Prepare a mock-trial argument based on a fictional case and identify evidence on both sides.',
      'Create a guide to how a local government process works, citing official public sources.',
    ],
    gradeRoadmap: [
      { grade: 9, focus: 'Practice clear expression', actions: ['Build reading, writing, and history foundations.', 'Try student government, public speaking, or a discussion club.'] },
      { grade: 10, focus: 'Explore civic systems', actions: ['Learn about civics and government through classes or public resources.', 'Practice research and source evaluation on a topic you care about.'] },
      { grade: 11, focus: 'Develop argument skills', actions: ['Consider advanced history, English, or government courses if appropriate and available.', 'Explore debate or mock trial with a teacher or club.'] },
      { grade: 12, focus: 'Reflect on legal interests', actions: ['Continue coursework that strengthens reading, writing, and reasoning.', 'Talk with a counselor about a range of education paths related to law and public service.'] },
    ],
  },
]

export function getCareerRecommendations(careerOptions, selectedInterests) {
  if (selectedInterests.length === 0) return []

  return careerOptions
    .map((career) => ({
      career,
      matchCount: career.interests.filter((interest) => selectedInterests.includes(interest)).length,
    }))
    .filter(({ matchCount }) => matchCount > 0)
    .sort((first, second) => {
      const matchDifference = second.matchCount - first.matchCount
      if (matchDifference !== 0) return matchDifference

      const firstLeadInterestMatches = selectedInterests.includes(first.career.interests[0])
      const secondLeadInterestMatches = selectedInterests.includes(second.career.interests[0])
      return Number(secondLeadInterestMatches) - Number(firstLeadInterestMatches)
    })
    .slice(0, 3)
    .map(({ career }) => career)
}

function normalizedCourseName(courseName) {
  return courseName.toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function personalizeRoadmap(pathway, courses) {
  const takenCourses = []
  const suggestedCourses = []

  for (const suggestion of pathway.courseSuggestions) {
    const matchingCourses = courses.filter((course) => {
      const courseName = normalizedCourseName(course.courseName)
      return suggestion.keywords.some((keyword) =>
        courseName.includes(normalizedCourseName(keyword)),
      )
    })

    if (matchingCourses.length > 0) {
      takenCourses.push({ ...suggestion, matchingCourses })
    } else {
      suggestedCourses.push(suggestion)
    }
  }

  return {
    takenCourses,
    suggestedCourses,
    hasAcademicHistory: courses.length > 0,
    personalizationMessage: takenCourses.length > 0
      ? `Your ${takenCourses.map(({ matchingCourses }) => matchingCourses
        .map((course) => course.courseName).join(', ')).join(' and ')} coursework is a useful starting point.`
      : courses.length > 0
        ? 'Your saved courses are a helpful start. These are additional subjects you could explore next.'
        : 'No courses are saved in your Academic Profile yet. This roadmap is still useful to explore; suggested classes are optional ideas.',
  }
}

export function getRoadmapViewModel(pathway, courses) {
  return {
    title: pathway.title,
    description: pathway.description,
    careers: pathway.careers,
    ...personalizeRoadmap(pathway, courses),
    technicalSkills: pathway.technicalSkills,
    softSkills: pathway.softSkills,
    extracurriculars: pathway.extracurriculars,
    projects: pathway.projects,
    gradeRoadmap: pathway.gradeRoadmap,
  }
}

export async function fetchRoadmapCourses(fetcher = fetch) {
  let response
  try {
    response = await fetcher('/api/profile')
  } catch {
    throw new Error('Unable to connect to your Academic Profile. Check that the local CollegePath server is running.')
  }

  if (!response.ok) {
    let message = 'Unable to load your saved courses. You can try again.'
    try {
      const body = await response.json()
      if (typeof body.error === 'string') message = body.error
    } catch {
      // Retain the friendly fallback when a server returns a non-JSON error.
    }
    throw new Error(message)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The Academic Profile response was not readable. Please try again.')
  }

  if (!data || !Array.isArray(data.courses)) {
    throw new Error('The Academic Profile response did not include a valid course list.')
  }
  return data.courses
}

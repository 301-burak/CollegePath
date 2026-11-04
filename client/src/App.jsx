import { useEffect, useState } from 'react'
import AcademicProfile from './AcademicProfile.jsx'
import CareerRoadmap from './CareerRoadmap.jsx'
import MyUniversities from './MyUniversities.jsx'
import { careerPathways, getCareerRecommendations } from './careerPathways.js'
import './App.css'

const interestCategories = [
  'Technology',
  'Engineering',
  'Business',
  'Healthcare',
  'Arts',
  'Science',
  'Law',
]

const careerOptions = [
  {
    title: 'Software Developer',
    pathwayId: 'software-engineering',
    interests: ['Technology', 'Science'],
    description: 'Build apps and tools that help people solve everyday problems.',
    skills: ['Problem-solving', 'Logical thinking', 'Teamwork'],
    nextStep: 'Try a beginner coding project or join a school coding club.',
  },
  {
    title: 'Cybersecurity Analyst',
    pathwayId: 'cybersecurity',
    interests: ['Technology', 'Business'],
    description: 'Help organizations protect their computers, information, and people.',
    skills: ['Attention to detail', 'Critical thinking', 'Communication'],
    nextStep: 'Explore a beginner-friendly cybersecurity activity or computer club.',
  },
  {
    title: 'UX Designer',
    pathwayId: 'software-engineering',
    interests: ['Technology', 'Arts'],
    description: 'Make websites and apps easier and more enjoyable for people to use.',
    skills: ['Creativity', 'Empathy', 'Visual communication'],
    nextStep: 'Redesign a page you use often and ask classmates to try it.',
  },
  {
    title: 'Civil Engineer',
    pathwayId: 'mechanical-engineering',
    interests: ['Engineering', 'Science'],
    description: 'Plan and improve structures and systems such as roads, bridges, and water networks.',
    skills: ['Math', 'Planning', 'Problem-solving'],
    nextStep: 'Look for a school engineering or robotics project to join.',
  },
  {
    title: 'Mechanical Engineer',
    pathwayId: 'mechanical-engineering',
    interests: ['Engineering', 'Technology'],
    description: 'Design and test machines and devices that make work safer or easier.',
    skills: ['Math', 'Design', 'Hands-on problem-solving'],
    nextStep: 'Build a simple mechanism or take part in a robotics challenge.',
  },
  {
    title: 'Biomedical Engineer',
    pathwayId: 'medicine-healthcare',
    interests: ['Engineering', 'Healthcare'],
    description: 'Create equipment and technology that support patient care and health research.',
    skills: ['Science', 'Design', 'Collaboration'],
    nextStep: 'Explore a biology or engineering project focused on helping people.',
  },
  {
    title: 'Marketing Manager',
    pathwayId: 'business-finance',
    interests: ['Business', 'Arts'],
    description: 'Help organizations share what they offer through thoughtful campaigns and stories.',
    skills: ['Writing', 'Creativity', 'Communication'],
    nextStep: 'Help promote a school club event and see which messages reach people.',
  },
  {
    title: 'Financial Analyst',
    pathwayId: 'business-finance',
    interests: ['Business', 'Technology'],
    description: 'Use data to help organizations understand budgets, investments, and plans.',
    skills: ['Math', 'Data analysis', 'Attention to detail'],
    nextStep: 'Practice making a simple budget for a club activity or personal goal.',
  },
  {
    title: 'Entrepreneur',
    pathwayId: 'business-finance',
    interests: ['Business', 'Technology', 'Arts'],
    description: 'Turn an idea into a product or service that meets a real need.',
    skills: ['Initiative', 'Planning', 'Communication'],
    nextStep: 'Ask people about a problem they face and brainstorm a small solution.',
  },
  {
    title: 'Registered Nurse',
    pathwayId: 'medicine-healthcare',
    interests: ['Healthcare', 'Science'],
    description: 'Support patients by providing care, sharing health information, and working with care teams.',
    skills: ['Empathy', 'Communication', 'Science'],
    nextStep: 'Learn about first aid or interview a healthcare professional about their work.',
  },
  {
    title: 'Health Informatics Specialist',
    pathwayId: 'medicine-healthcare',
    interests: ['Healthcare', 'Technology'],
    description: 'Help care teams use health information systems to organize and improve patient care.',
    skills: ['Technology', 'Organization', 'Communication'],
    nextStep: 'Explore how health apps help people track information and protect privacy.',
  },
  {
    title: 'Physical Therapist',
    pathwayId: 'medicine-healthcare',
    interests: ['Healthcare', 'Science'],
    description: 'Help people improve movement and recover strength after an injury or illness.',
    skills: ['Empathy', 'Biology', 'Motivation'],
    nextStep: 'Learn how movement and exercise support health through a class or club.',
  },
  {
    title: 'Graphic Designer',
    pathwayId: 'software-engineering',
    interests: ['Arts', 'Technology'],
    description: 'Create visual designs that help people understand ideas and connect with organizations.',
    skills: ['Visual communication', 'Creativity', 'Digital tools'],
    nextStep: 'Design a poster for a school activity using a free design tool.',
  },
  {
    title: 'Animator',
    pathwayId: 'software-engineering',
    interests: ['Arts', 'Technology', 'Science'],
    description: 'Bring characters and ideas to life through motion, storytelling, and digital tools.',
    skills: ['Drawing', 'Storytelling', 'Patience'],
    nextStep: 'Make a short flipbook or simple animation to practice movement and timing.',
  },
  {
    title: 'Technical Writer',
    pathwayId: 'law',
    interests: ['Arts', 'Technology', 'Business'],
    description: 'Explain products and processes clearly through guides, instructions, and online content.',
    skills: ['Writing', 'Research', 'Organization'],
    nextStep: 'Write a clear how-to guide for a tool or activity you know well.',
  },
  {
    title: 'Environmental Scientist',
    pathwayId: 'medicine-healthcare',
    interests: ['Science', 'Engineering'],
    description: 'Study the environment and help communities make informed decisions about natural resources.',
    skills: ['Research', 'Data collection', 'Critical thinking'],
    nextStep: 'Join a local cleanup or record observations for a school science project.',
  },
  {
    title: 'Laboratory Researcher',
    pathwayId: 'medicine-healthcare',
    interests: ['Science', 'Healthcare'],
    description: 'Run experiments and analyze samples to help answer questions about health and the natural world.',
    skills: ['Curiosity', 'Careful observation', 'Data analysis'],
    nextStep: 'Try a school science fair project and practice keeping careful notes.',
  },
  {
    title: 'Data Scientist',
    pathwayId: 'software-engineering',
    interests: ['Science', 'Technology', 'Business'],
    description: 'Find patterns in data and explain what they can teach us about real-world questions.',
    skills: ['Math', 'Curiosity', 'Clear communication'],
    nextStep: 'Choose a question you care about and chart a small set of data.',
  },
  {
    title: 'Software Engineer',
    pathwayId: 'software-engineering',
    interests: ['Technology', 'Science'],
    description: 'Design, build, and improve software by combining programming with teamwork and testing.',
    skills: ['Programming', 'Problem-solving', 'Collaboration'],
    nextStep: 'Build a small tool or website and ask someone to try it.',
  },
  {
    title: 'Lawyer',
    pathwayId: 'law',
    interests: ['Law', 'Business'],
    description: 'Research legal questions and help people or organizations understand their rights and responsibilities.',
    skills: ['Reading', 'Writing', 'Reasoning'],
    nextStep: 'Explore a civics, debate, or mock-trial activity at school.',
  },
]

async function getChecklistItems() {
  const response = await fetch('/api/checklist')
  if (!response.ok) {
    throw await getApiError(response, 'Unable to load your checklist.')
  }

  const items = await response.json()
  if (!Array.isArray(items)) {
    throw new Error('The checklist response was not in the expected format.')
  }
  return items
}

async function getApiError(response, fallback) {
  try {
    const body = await response.json()
    return new Error(body.error || fallback)
  } catch {
    return new Error(fallback)
  }
}

function App() {
  const [selectedInterests, setSelectedInterests] = useState([])
  const [careerRecommendations, setCareerRecommendations] = useState([])
  const [careerMessage, setCareerMessage] = useState('')
  const [selectedPathwayId, setSelectedPathwayId] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])
  const [checklistLoading, setChecklistLoading] = useState(true)
  const [checklistLoadFailed, setChecklistLoadFailed] = useState(false)
  const [checklistError, setChecklistError] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [updatingItems, setUpdatingItems] = useState(() => new Set())

  useEffect(() => {
    let active = true

    getChecklistItems()
      .then((items) => {
        if (active) {
          setChecklistItems(items)
          setChecklistLoadFailed(false)
        }
      })
      .catch((error) => {
        if (active) {
          setChecklistLoadFailed(true)
          setChecklistError(error.message || 'Unable to load your checklist.')
        }
      })
      .finally(() => {
        if (active) setChecklistLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function handleAddTask(event) {
    event.preventDefault()
    const title = taskTitle.trim()
    if (!title) {
      setChecklistError('Enter a task before adding it.')
      return
    }
    if (title.length > 200) {
      setChecklistError('Task titles must be 200 characters or fewer.')
      return
    }

    setAddingTask(true)
    setChecklistError('')
    try {
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) {
        throw await getApiError(response, 'Unable to add this task.')
      }

      const item = await response.json()
      setChecklistItems((items) => [item, ...items])
      setChecklistLoadFailed(false)
      setTaskTitle('')
    } catch (error) {
      setChecklistError(error.message || 'Unable to add this task. Please try again.')
    } finally {
      setAddingTask(false)
    }
  }

  async function handleChecklistToggle(item) {
    setChecklistError('')
    setUpdatingItems((items) => new Set(items).add(item.id))
    try {
      const response = await fetch(`/api/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !item.completed }),
      })
      if (!response.ok) {
        throw await getApiError(response, 'Unable to update this task.')
      }

      const updatedItem = await response.json()
      setChecklistItems((items) =>
        items.map((currentItem) => currentItem.id === updatedItem.id ? updatedItem : currentItem),
      )
    } catch (error) {
      setChecklistError(error.message || 'Unable to update this task. Please try again.')
    } finally {
      setUpdatingItems((items) => {
        const nextItems = new Set(items)
        nextItems.delete(item.id)
        return nextItems
      })
    }
  }

  const incompleteItems = checklistItems.filter((item) => !item.completed)
  const completedItems = checklistItems.filter((item) => item.completed)

  function handleInterestChange(interest) {
    setSelectedInterests((interests) =>
      interests.includes(interest)
        ? interests.filter((selectedInterest) => selectedInterest !== interest)
        : [...interests, interest],
    )
    setCareerRecommendations([])
    setCareerMessage('')
    setSelectedPathwayId(null)
  }

  function handleFindCareers(event) {
    event.preventDefault()
    if (selectedInterests.length === 0) {
      setCareerRecommendations([])
      setCareerMessage('Choose at least one interest to find careers that may fit you.')
      setSelectedPathwayId(null)
      return
    }

    setCareerRecommendations(getCareerRecommendations(careerOptions, selectedInterests))
    setCareerMessage('')
    setSelectedPathwayId(null)
  }

  function renderChecklistItems(items) {
    return (
      <ul className="checklist-items">
        {items.map((item) => (
          <li className={`checklist-item${item.completed ? ' is-complete' : ''}`} key={item.id}>
            <label className="checklist-label">
              <input
                type="checkbox"
                checked={item.completed}
                disabled={updatingItems.has(item.id)}
                onChange={() => handleChecklistToggle(item)}
                aria-label={`${item.completed ? 'Mark incomplete' : 'Mark complete'}: ${item.title}`}
              />
              <span>{item.title}</span>
            </label>
            {updatingItems.has(item.id) && <span className="task-saving">Saving...</span>}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="page">
      <header className="site-header">
        <a className="brand" href="#" aria-label="CollegePath home">CollegePath</a>
        <nav aria-label="Main navigation">
          <a href="#academic-profile">Academic Profile</a>
          <a href="#career-recommendations">Career Recommendations</a>
          <a href="#my-universities">My Universities</a>
          <a href="#my-checklist">My Checklist</a>
        </nav>
      </header>

      <main>
        <section className="welcome">
          <p className="eyebrow">Your next step starts here</p>
          <h1>Plan a future that feels like yours.</h1>
          <p className="intro">
            Explore your path to college and career, one step at a time.
          </p>
        </section>

        <section
          id="academic-profile"
          className="academic-section"
          aria-labelledby="academic-profile-heading"
        >
          <AcademicProfile />
        </section>

        <section id="my-universities" className="academic-section" aria-label="University goal tracker">
          <MyUniversities />
        </section>

        <section className="placeholders" aria-label="CollegePath features">
          <article id="career-recommendations" className="career-card" aria-labelledby="career-heading">
            <p className="eyebrow">Explore what interests you</p>
            <h2 id="career-heading">Career Recommendations</h2>
            <p className="career-intro">Choose a few topics you enjoy and discover careers to explore.</p>

            <form className="career-form" onSubmit={handleFindCareers}>
              <fieldset className="interest-fieldset">
                <legend>Your interests</legend>
                <div className="interest-options">
                  {interestCategories.map((interest) => (
                    <label className="interest-option" key={interest}>
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                      />
                      <span>{interest}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <button className="career-submit" type="submit">Find My Careers</button>
            </form>

            {careerMessage && <p className="career-message" role="status">{careerMessage}</p>}

            {careerRecommendations.length > 0 && (
              <section className="career-results" aria-live="polite" aria-labelledby="career-results-heading">
                <h3 id="career-results-heading">Careers to explore</h3>
                <div className="career-results-list">
                  {careerRecommendations.map((career) => (
                    <article className="career-result" key={career.title}>
                      <h4>{career.title}</h4>
                      <p>{career.description}</p>
                      <p><strong>Useful skills:</strong> {career.skills.join(', ')}</p>
                      <p><strong>Try this next:</strong> {career.nextStep}</p>
                      <button
                        className="career-submit roadmap-open-button"
                        type="button"
                        onClick={() => setSelectedPathwayId(career.pathwayId)}
                      >
                        View Roadmap
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {selectedPathwayId && (
              <CareerRoadmap
                pathway={careerPathways.find((pathway) => pathway.id === selectedPathwayId)}
                onClose={() => setSelectedPathwayId(null)}
              />
            )}
          </article>
          <article id="my-checklist" className="checklist-card" aria-labelledby="checklist-heading">
            <p className="eyebrow">One step at a time</p>
            <h2 id="checklist-heading">My Checklist</h2>
            <p className="checklist-intro">Keep your college planning tasks organized and celebrate each step forward.</p>

            <form className="checklist-form" onSubmit={handleAddTask}>
              <label htmlFor="task-title">Add a task</label>
              <div className="checklist-form-controls">
                <input
                  id="task-title"
                  name="title"
                  type="text"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="For example, research application deadlines"
                  maxLength={200}
                  required
                />
                <button type="submit" disabled={addingTask}>
                  {addingTask ? 'Adding...' : 'Add task'}
                </button>
              </div>
              <span className="input-hint">Up to 200 characters</span>
            </form>

            {checklistError && <p className="checklist-error" role="alert">{checklistError}</p>}

            {checklistLoading ? (
              <p className="checklist-status" role="status">Loading your checklist...</p>
            ) : checklistItems.length === 0 && !checklistLoadFailed ? (
              <p className="checklist-empty">Your checklist is ready when you are. Add your first task above to get started.</p>
            ) : (
              <div className="checklist-groups" aria-live="polite">
                {incompleteItems.length > 0 && (
                  <section className="checklist-group" aria-labelledby="up-next-heading">
                    <h3 id="up-next-heading">Up next <span>{incompleteItems.length}</span></h3>
                    {renderChecklistItems(incompleteItems)}
                  </section>
                )}
                {completedItems.length > 0 && (
                  <section className="checklist-group completed-group" aria-labelledby="completed-heading">
                    <h3 id="completed-heading">Completed <span>{completedItems.length}</span></h3>
                    {renderChecklistItems(completedItems)}
                  </section>
                )}
              </div>
            )}
          </article>
        </section>
      </main>
      <footer>CollegePath · Built for your next chapter</footer>
    </div>
  )
}

export default App

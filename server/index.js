import express from 'express'
import {
  getChecklistItems,
  createChecklistItem,
  updateChecklistItemCompletion,
} from './src/database.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/checklist', (_request, response, next) => {
  try {
    response.json(getChecklistItems())
  } catch (error) {
    next(error)
  }
})

app.post('/api/checklist', (request, response, next) => {
  const { title, completed = false } = request.body ?? {}

  if (typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
    response.status(400).json({ error: 'Title must be a non-empty string of at most 200 characters.' })
    return
  }

  if (typeof completed !== 'boolean') {
    response.status(400).json({ error: 'Completed must be a boolean.' })
    return
  }

  try {
    const item = createChecklistItem(title.trim(), completed)
    response.status(201).json(item)
  } catch (error) {
    next(error)
  }
})

app.patch('/api/checklist/:id', (request, response, next) => {
  const id = Number(request.params.id)
  const { completed } = request.body ?? {}

  if (!Number.isSafeInteger(id) || id < 1) {
    response.status(400).json({ error: 'Checklist item ID must be a positive integer.' })
    return
  }

  if (typeof completed !== 'boolean') {
    response.status(400).json({ error: 'Completed must be a boolean.' })
    return
  }

  try {
    const item = updateChecklistItemCompletion(id, completed)
    if (!item) {
      response.status(404).json({ error: 'Checklist item not found.' })
      return
    }

    response.json(item)
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ error: 'Request body must contain valid JSON.' })
    return
  }

  console.error(error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
})

app.listen(port, () => {
  console.log(`CollegePath API listening on http://localhost:${port}`)
})

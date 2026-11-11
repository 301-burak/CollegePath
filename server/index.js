import { createApp } from './app.js'
import { createDatabase } from './src/database.js'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT) || 3001
const databasePath = process.env.COLLEGEPATH_DATABASE_PATH
  || fileURLToPath(new URL('./data/collegepath.db', import.meta.url))
const database = createDatabase(databasePath)
const app = createApp(database)

app.listen(port, '127.0.0.1', () => {
  console.log(`CollegePath API listening on http://127.0.0.1:${port}`)
})

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const dataDirectory = path.resolve(currentDirectory, '../data')
fs.mkdirSync(dataDirectory, { recursive: true })

const database = new Database(path.join(dataDirectory, 'collegepath.db'))

database.exec(`
  CREATE TABLE IF NOT EXISTS checklist_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`)

const listItems = database.prepare(`
  SELECT id, title, completed, created_at
  FROM checklist_items
  ORDER BY id DESC
`)

const insertItem = database.prepare(`
  INSERT INTO checklist_items (title, completed)
  VALUES (?, ?)
`)

const getItem = database.prepare(`
  SELECT id, title, completed, created_at
  FROM checklist_items
  WHERE id = ?
`)

function toChecklistItem(row) {
  return { ...row, completed: Boolean(row.completed) }
}

export function getChecklistItems() {
  return listItems.all().map(toChecklistItem)
}

export function createChecklistItem(title, completed) {
  const result = insertItem.run(title, completed ? 1 : 0)
  return toChecklistItem(getItem.get(result.lastInsertRowid))
}

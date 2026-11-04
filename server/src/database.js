import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'
import { universityCatalog } from './universityCatalog.js'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const migrationsDirectory = path.join(currentDirectory, 'migrations')

function toChecklistItem(row) {
  return { ...row, completed: Boolean(row.completed) }
}

function toCourse(row) {
  return {
    id: row.id,
    courseName: row.course_name,
    level: row.level,
    grade: row.grade,
    schoolYear: row.school_year,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toTestScore(row) {
  return {
    id: row.id,
    testType: row.test_type,
    score: row.score,
    testDate: row.test_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toProfile(row) {
  return {
    gradeLevel: row.grade_level,
    weightedGpa: row.weighted_gpa,
    unweightedGpa: row.unweighted_gpa,
    updatedAt: row.updated_at,
  }
}

export function createDatabase(databasePath) {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(databasePath), { recursive: true })
  }

  const database = new Database(databasePath)
  database.pragma('foreign_keys = ON')
  database.exec(`
    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const migrationFiles = fs.readdirSync(migrationsDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()

  for (const fileName of migrationFiles) {
    const alreadyApplied = database.prepare(
      'SELECT 1 FROM schema_migrations WHERE version = ?',
    ).get(fileName)
    if (alreadyApplied) continue

    const migration = fs.readFileSync(path.join(migrationsDirectory, fileName), 'utf8')
    database.transaction(() => {
      database.exec(migration)
      database.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(fileName)
    })()
  }

  const upsertUniversity = database.prepare(`
    INSERT INTO universities (id, name, location, admissions_url)
    VALUES (@id, @name, @location, @admissionsUrl)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      location = excluded.location,
      admissions_url = excluded.admissions_url
  `)
  const upsertUniversityFact = database.prepare(`
    INSERT INTO university_facts (
      university_id, fact_type, title, fact_text, status, source_url, last_verified
    )
    VALUES (
      @universityId, @type, @title, @text, @status, @sourceUrl, @lastVerified
    )
    ON CONFLICT(university_id, fact_type) DO UPDATE SET
      title = excluded.title,
      fact_text = excluded.fact_text,
      status = excluded.status,
      source_url = excluded.source_url,
      last_verified = excluded.last_verified
  `)
  database.transaction(() => {
    for (const university of universityCatalog) {
      upsertUniversity.run(university)
      for (const fact of university.facts) {
        upsertUniversityFact.run({ ...fact, universityId: university.id })
      }
    }
  })()

  const listChecklistItems = database.prepare(`
    SELECT id, title, completed, created_at
    FROM checklist_items
    ORDER BY id DESC
  `)
  const insertChecklistItem = database.prepare(`
    INSERT INTO checklist_items (title, completed)
    VALUES (?, ?)
  `)
  const insertChecklistItemIfAbsent = database.prepare(`
    INSERT INTO checklist_items (title, completed)
    SELECT ?, 0
    WHERE NOT EXISTS (
      SELECT 1
      FROM checklist_items
      WHERE lower(trim(title)) = lower(trim(?))
    )
  `)
  const getChecklistItemByTitle = database.prepare(`
    SELECT id, title, completed, created_at
    FROM checklist_items
    WHERE lower(trim(title)) = lower(trim(?))
    ORDER BY id
    LIMIT 1
  `)
  const getChecklistItem = database.prepare(`
    SELECT id, title, completed, created_at
    FROM checklist_items
    WHERE id = ?
  `)
  const updateChecklistItem = database.prepare(`
    UPDATE checklist_items
    SET completed = ?
    WHERE id = ?
  `)

  const getProfileRow = database.prepare(`
    SELECT grade_level, weighted_gpa, unweighted_gpa, updated_at
    FROM student_profile
    WHERE id = 1
  `)
  const updateProfileRow = database.prepare(`
    UPDATE student_profile
    SET grade_level = ?, weighted_gpa = ?, unweighted_gpa = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = 1
  `)

  const listCourses = database.prepare(`
    SELECT id, course_name, level, grade, school_year, created_at, updated_at
    FROM student_courses
    ORDER BY school_year DESC, course_name COLLATE NOCASE
  `)
  const getCourse = database.prepare(`
    SELECT id, course_name, level, grade, school_year, created_at, updated_at
    FROM student_courses
    WHERE id = ?
  `)
  const insertCourse = database.prepare(`
    INSERT INTO student_courses (course_name, level, grade, school_year)
    VALUES (@courseName, @level, @grade, @schoolYear)
  `)
  const updateCourse = database.prepare(`
    UPDATE student_courses
    SET course_name = @courseName, level = @level, grade = @grade,
        school_year = @schoolYear, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `)

  const listTestScores = database.prepare(`
    SELECT id, test_type, score, test_date, created_at, updated_at
    FROM student_test_scores
    ORDER BY test_date DESC, id DESC
  `)
  const getTestScore = database.prepare(`
    SELECT id, test_type, score, test_date, created_at, updated_at
    FROM student_test_scores
    WHERE id = ?
  `)
  const insertTestScore = database.prepare(`
    INSERT INTO student_test_scores (test_type, score, test_date)
    VALUES (@testType, @score, @testDate)
  `)
  const updateTestScore = database.prepare(`
    UPDATE student_test_scores
    SET test_type = @testType, score = @score, test_date = @testDate,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `)

  const listUniversities = database.prepare(`
    SELECT id, name, location, admissions_url
    FROM universities
    ORDER BY name COLLATE NOCASE
  `)
  const listUniversityFacts = database.prepare(`
    SELECT fact_type, title, fact_text, status, source_url, last_verified
    FROM university_facts
    WHERE university_id = ?
    ORDER BY CASE fact_type
      WHEN 'requirements' THEN 1
      WHEN 'testing_policy' THEN 2
      WHEN 'score_ranges' THEN 3
      WHEN 'deadlines' THEN 4
    END
  `)
  const listUniversityGoals = database.prepare(`
    SELECT id, university_id, created_at
    FROM student_university_goals
    ORDER BY id DESC
  `)
  const getUniversityGoal = database.prepare(`
    SELECT id, university_id, created_at
    FROM student_university_goals
    WHERE id = ?
  `)
  const insertUniversityGoal = database.prepare(`
    INSERT INTO student_university_goals (university_id)
    VALUES (?)
    ON CONFLICT(university_id) DO NOTHING
  `)

  function toUniversity(row) {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      admissionsUrl: row.admissions_url,
      facts: listUniversityFacts.all(row.id).map((fact) => ({
        type: fact.fact_type,
        title: fact.title,
        text: fact.fact_text,
        status: fact.status,
        sourceUrl: fact.source_url,
        lastVerified: fact.last_verified,
      })),
    }
  }

  function toUniversityGoal(row) {
    return {
      id: row.id,
      universityId: row.university_id,
      createdAt: row.created_at,
    }
  }

  return {
    close: () => database.close(),
    getChecklistItems: () => listChecklistItems.all().map(toChecklistItem),
    createChecklistItem(title, completed) {
      const result = insertChecklistItem.run(title, completed ? 1 : 0)
      return toChecklistItem(getChecklistItem.get(result.lastInsertRowid))
    },
    createChecklistRecommendation(title) {
      const result = insertChecklistItemIfAbsent.run(title, title)
      if (result.changes === 0) {
        return { created: false, item: toChecklistItem(getChecklistItemByTitle.get(title)) }
      }
      return {
        created: true,
        item: toChecklistItem(getChecklistItem.get(result.lastInsertRowid)),
      }
    },
    updateChecklistItemCompletion(id, completed) {
      const result = updateChecklistItem.run(completed ? 1 : 0, id)
      return result.changes === 0 ? null : toChecklistItem(getChecklistItem.get(id))
    },
    getProfile: () => toProfile(getProfileRow.get()),
    updateProfile(profile) {
      updateProfileRow.run(profile.gradeLevel, profile.weightedGpa, profile.unweightedGpa)
      return toProfile(getProfileRow.get())
    },
    getCourses: () => listCourses.all().map(toCourse),
    createCourse(course) {
      const result = insertCourse.run(course)
      return toCourse(getCourse.get(result.lastInsertRowid))
    },
    updateCourse(id, course) {
      const result = updateCourse.run({ ...course, id })
      return result.changes === 0 ? null : toCourse(getCourse.get(id))
    },
    deleteCourse(id) {
      return database.prepare('DELETE FROM student_courses WHERE id = ?').run(id).changes > 0
    },
    getTestScores: () => listTestScores.all().map(toTestScore),
    createTestScore(testScore) {
      const result = insertTestScore.run(testScore)
      return toTestScore(getTestScore.get(result.lastInsertRowid))
    },
    updateTestScore(id, testScore) {
      const result = updateTestScore.run({ ...testScore, id })
      return result.changes === 0 ? null : toTestScore(getTestScore.get(id))
    },
    deleteTestScore(id) {
      return database.prepare('DELETE FROM student_test_scores WHERE id = ?').run(id).changes > 0
    },
    getUniversities() {
      return listUniversities.all().map(toUniversity)
    },
    hasUniversity(id) {
      return database.prepare('SELECT 1 FROM universities WHERE id = ?').get(id) !== undefined
    },
    getUniversityGoals: () => listUniversityGoals.all().map(toUniversityGoal),
    createUniversityGoal(universityId) {
      const result = insertUniversityGoal.run(universityId)
      if (result.changes === 0) return null
      return toUniversityGoal(getUniversityGoal.get(result.lastInsertRowid))
    },
    deleteUniversityGoal(id) {
      return database.prepare('DELETE FROM student_university_goals WHERE id = ?').run(id)
        .changes > 0
    },
  }
}

CREATE TABLE universities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  admissions_url TEXT NOT NULL
);

CREATE TABLE university_facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL CHECK (
    fact_type IN ('requirements', 'testing_policy', 'score_ranges', 'deadlines')
  ),
  title TEXT NOT NULL,
  fact_text TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('verified', 'unverified')),
  source_url TEXT NOT NULL,
  last_verified TEXT NOT NULL,
  UNIQUE (university_id, fact_type)
);

CREATE TABLE student_university_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  university_id TEXT NOT NULL REFERENCES universities(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (university_id)
);

CREATE INDEX university_facts_university_id_idx
  ON university_facts (university_id);

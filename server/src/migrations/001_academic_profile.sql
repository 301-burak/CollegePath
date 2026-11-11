CREATE TABLE student_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  grade_level INTEGER CHECK (grade_level IS NULL OR grade_level BETWEEN 9 AND 12),
  weighted_gpa REAL CHECK (weighted_gpa IS NULL OR weighted_gpa BETWEEN 0 AND 10),
  unweighted_gpa REAL CHECK (unweighted_gpa IS NULL OR unweighted_gpa BETWEEN 0 AND 10),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO student_profile (id) VALUES (1);

CREATE TABLE student_courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('Regular', 'Honors', 'AP', 'IB', 'Dual Credit')),
  grade TEXT NOT NULL,
  school_year TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_test_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_type TEXT NOT NULL CHECK (test_type IN ('sat_math', 'sat_reading_writing', 'act_composite')),
  score INTEGER NOT NULL,
  test_date TEXT CHECK (test_date IS NULL OR length(test_date) = 10),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (test_type IN ('sat_math', 'sat_reading_writing') AND score BETWEEN 200 AND 800)
    OR (test_type = 'act_composite' AND score BETWEEN 1 AND 36)
  )
);

CREATE INDEX student_courses_school_year_idx ON student_courses (school_year);
CREATE INDEX student_test_scores_date_idx ON student_test_scores (test_date);

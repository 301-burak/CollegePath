# AI Usage Log

## Asked
Set up the Lesson 13 (C1) CollegePath foundation with React + Vite, Express, and SQLite, including a homepage and basic checklist API.

## Got
- A React + Vite homepage with navigation links to placeholder career-recommendation and checklist sections.
- An Express API with health and checklist endpoints, input validation, and a Vite `/api` development proxy.
- A `better-sqlite3` data layer that creates and reads the `checklist_items` table.
- Client/server package manifests and lockfiles, plus Git ignore rules for generated and local files.

## Fixed
The Lesson 13 foundation was added to the repository; the record does not identify a separate pre-existing bug fix. The committed implementation includes the client, Express server, SQLite data model, and project configuration. The checklist table stores an ID, title, completion state, and creation timestamp. The homepage checklist section is a placeholder, not a connected checklist UI.

## How I Verified
- `npm run build` and `npm run lint` in `client/` completed successfully.
- Live `GET /api/health` and `GET /api/checklist` requests returned successfully, both directly and through the Vite `/api` proxy.
- Empty-title and malformed-JSON checklist POST requests returned HTTP 400.
- The SQLite database contains the custom `checklist_items` table. Checklist item ID 1 was present before and after restarting the Express server, confirming persistence.
- The Vite homepage returned HTTP 200 and displayed the CollegePath page. The root ignore rule excludes the SQLite database file.

## Lesson 14 (C2): My Checklist

### Asked
Replace the My Checklist placeholder with a functional React checklist backed by the existing Express API and SQLite database. Students should be able to load and add tasks, mark tasks complete or incomplete, see clear loading, empty, validation, and error states, and retain data after refreshes and server restarts. Career Recommendations, authentication, and external AI APIs were out of scope.

### Got
- A React checklist interface that loads with `GET /api/checklist`, adds tasks with `POST /api/checklist`, and toggles completion with `PATCH /api/checklist/:id`.
- A SQLite update query for task completion using the existing `checklist_items` table; no new database or schema migration was introduced.
- Separate incomplete and completed task groups, an empty state, a 200-character title limit, loading indicators, and accessible error messages.

### Fixed
The My Checklist section was previously a “Coming soon” placeholder. It now supports loading, adding, and toggling SQLite-backed checklist tasks. During verification, a backend restart briefly caused the Vite proxy to return 502; the interface was corrected so a failed initial load shows an error rather than also presenting a misleading empty state. The Career Recommendations placeholder remains unchanged.

### How I Verified
- `npm run build` and `npm run lint` in `client/` completed successfully; `node --check` passed for both server JavaScript files.
- Live API requests verified `GET /api/health`, checklist GET and POST, completion and incomplete PATCH updates, repeat updates, HTTP 400 for invalid IDs and completion values, and HTTP 404 for a missing checklist item.
- Browser interaction verified adding a task, changing its completion state, and retaining the state after a page refresh. Browser checks also verified native blank-input validation, the empty state with a mocked empty response, and the visible API error message with a mocked 503 response.
- After restarting Express, GET requests confirmed that a completed task and an incomplete task both retained their states in SQLite; reloading the frontend showed those persisted states. The Vite `/api` proxy also returned the checklist after restart.
- The temporary checklist rows created for these checks were removed afterward; the pre-existing checklist row was left intact.

## Lesson 14 (C2): Career Recommendations

### Asked
Replace the Career Recommendations placeholder with a responsive interface for choosing interests and viewing three rule-based career recommendations. Each result should include a title, description, useful skills, and a suggested high-school next step. Keep My Checklist unchanged and do not add external AI, authentication, or unrelated features.

### Got
- Six selectable interest categories: Technology, Engineering, Business, Healthcare, Arts, and Science.
- A predefined catalog of 18 careers with descriptions, useful skills, suggested next steps, and related interest categories.
- A local matching rule that ranks careers by the number of selected-interest matches and favors a career's lead category to break ties, displaying the top three.
- An accessible friendly message when no interests are selected and responsive styling consistent with the existing CollegePath palette.

### Fixed
The Career Recommendations section was a “Coming soon” placeholder. It now provides the selection form and recommendation results without calling an external AI service or changing the checklist API or SQLite schema. Initial browser testing exposed a weak tie-break for Science; the ranking was refined to favor the career's lead category when match counts tie. The My Checklist section and its handlers were left unchanged.

### How I Verified
- `npm run build` and `npm run lint` in `client/` completed successfully after the career recommendation changes.
- Browser tests selected each of the six individual interest categories and verified exactly three unique recommendations, a relevant expected career for each category, and the skills and next-step details.
- A multiple-interest Arts + Science selection returned three recommendations. Submitting with no interests displayed the friendly prompt.
- A 390-pixel-wide browser viewport had no horizontal overflow. The existing My Checklist heading and task remained visible.

### Final Lesson 14 Verification
- The student manually verified Technology, Engineering, mixed Technology + Engineering, the empty-interest message, and checklist task creation and completion.
- `npm run build` and `npm run lint` in `client/` completed successfully.
- A live `GET /api/checklist` response exactly matched a read-only query of `server/data/collegepath.db`, including the manually completed checklist item.
- `git check-ignore` confirmed that `node_modules`, `.env`/`.env.local`, and SQLite database files are ignored. `.env.example` has an explicit exception so an example environment template can be tracked.

## Lesson 15 (C3): Feature Freeze

### Asked
Verify the existing Lesson 12 acceptance criteria and freeze features: audit React, Express, and SQLite; run build/lint; exercise checklist routes, persistence, career selections, empty and failed states, invalid inputs, and browser Console/Network behavior; document only actual results. Do not commit or push.

### Got
The existing application satisfied the career recommendation, checklist creation and completion, and SQLite persistence flows. Empty-checklist and failed-request UI states could be tested without deleting the student's saved checklist by mocking API responses in the browser. No feature additions were made.

### Fixed
A simulated HTML 502 response from `GET /api/checklist` exposed an existing error-handling issue: parsing the non-JSON response displayed a JSON parser exception instead of the checklist load fallback. The existing checklist error helper now falls back to “Unable to load your checklist.” when an error response is not valid JSON. No other application code or feature was changed for the feature-freeze review.

### How I Verified
- Ran `npm run build` and `npm run lint` in `client/`.
- Started the existing server scripts (`npm start` in `server/` and `npm run dev -- --host 127.0.0.1 --port 5174` in `client/`); the frontend returned HTTP 200 and `/api/health` returned `{"status":"ok"}`.
- Tested checklist `GET`, valid `POST`, `PATCH` to complete and incomplete, and retrieval after each update. Invalid blank and overlong titles, invalid completion values, malformed JSON, and invalid IDs returned HTTP 400; a missing checklist item returned HTTP 404.
- Created temporary checklist rows through the API and browser, completed them, refreshed the page, restarted Express, and confirmed the rows and completion states remained in SQLite and matched the live API response. Removed only the temporary test rows afterward; preserved the pre-existing checklist rows.
- Browser-tested Technology, Engineering, Technology + Engineering, and no selected interests; each selected case returned three relevant careers and no-selection displayed its prompt.
- Mocked an empty checklist response and confirmed the empty-state message. Mocked an HTML 502 and confirmed the friendly load error with no misleading empty state. Mocked POST and PATCH 503 responses and confirmed errors were shown and failed updates did not alter saved checklist state.
- Inspected browser resource timing for successful checklist GET responses (HTTP 200). The normal page reload had no reported console/page errors; intentionally mocked 502/503 responses produced expected failed-resource Console messages. No failed API responses occurred on the normal demo path.

### Lesson 12 Acceptance Criteria Results
1. **Relevant career recommendations for selected interests — PASS.** Browser tests selected Technology, Engineering, and Technology + Engineering; each produced three recommendations including a relevant career for the selection.
2. **Created checklist items appear — PASS.** A checklist item created through the browser appeared in the rendered checklist; a separate API-created item appeared in `GET /api/checklist`.
3. **Completion status updates — PASS.** Browser and API checks changed items to completed and incomplete and verified the returned/rendered status.
4. **Checklist and completion status survive refresh and backend restart — PASS.** Browser-created and API-created test items retained their completed status after page refresh and an Express restart; the post-restart API response matched the SQLite rows.
5. **Empty checklist message — PASS.** With a mocked empty `GET /api/checklist` response, the app displayed “Your checklist is ready when you are. Add your first task above to get started.” and did not display task groups.

## Lesson 16: Polish and Presentation Prep

### Asked
Prepare the existing feature-frozen CollegePath app for Demo Day without adding features. Update the project README, create a 4–6 minute presentation script, review this log for accuracy, preserve existing checklist data while adding safe demo data, check navigation and both features, and run the existing build and lint checks. Do not commit or push.

### Got
- Expanded `README.md` with the intended users, existing features, technology stack, VS Code and Codespaces setup, API endpoints, React → Express → SQLite architecture, persistence test steps, demo data notes, and known limitations.
- Created `DEMO-SCRIPT.md` with a timed presentation outline, a live demo path, an AI usage explanation, possible next steps, and a fallback plan.
- Added two labeled demo checklist items to the existing local SQLite database: “Demo: Compare college application deadlines” (incomplete) and “Demo: Write questions for a school counselor” (complete). Existing rows were preserved.
- No application features or application source code were added or changed.

### Fixed
No application bug or feature was fixed for Lesson 16. The documentation was created or updated as requested; existing user checklist rows were not deleted or modified.

### How I Verified
- `npm run build` and `npm run lint` in `client/` completed successfully.
- The running Express health endpoint returned `ok`. `GET /api/checklist` returned four items and matched the SQLite data.
- The browser displayed both feature sections and the demo checklist rows. Both navigation links point to existing section IDs, and no “Coming soon” text was found in the app.
- Browser keyboard interaction selected Technology and Engineering and submitted the form: Technology returned three results (`Software Developer`, `Cybersecurity Analyst`, and `UX Designer`); Engineering returned three (`Civil Engineer`, `Mechanical Engineer`, and `Biomedical Engineer`); Technology + Engineering returned three results; and submitting with no interests displayed the friendly prompt.
- Browser pointer-click automation on the Technology checkbox timed out because the parent career article was reported as intercepting the pointer event. The keyboard interaction did verify the recommendation flow, but this automation attempt does not establish a successful mouse interaction check or demonstrate an application defect. No application code was changed.
- No server restart or page-refresh persistence test was performed specifically for the newly added Lesson 16 demo rows.
